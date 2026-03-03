import { create } from 'zustand';
import { supabase } from '../services/supabase';
import api from '../services/api';

// Extracts a useful error message from various error shapes
const parseError = (err) => {
    // Supabase Auth errors
    if (err?.message) return err.message;
    // Axios / Laravel errors
    const data = err.response?.data;
    if (!data) return `Network error: ${err.message || 'Unknown'}`;
    if (data.errors) {
        const firstField = Object.keys(data.errors)[0];
        return data.errors[firstField][0];
    }
    return data.message || 'An error occurred';
};

// Extract validation errors as field map: { field: "message" }
const parseFieldErrors = (err) => {
    const data = err.response?.data;
    if (!data?.errors) return {};
    const fieldErrors = {};
    for (const [field, messages] of Object.entries(data.errors)) {
        fieldErrors[field] = messages[0];
    }
    return fieldErrors;
};

export const useAuthStore = create((set, get) => ({
    user: null,
    session: null,
    loading: false,
    error: null,
    fieldErrors: {},
    initialized: false,

    /**
     * Initialize auth state — call once on app mount.
     * Reads the current Supabase session, syncs with backend, and
     * subscribes to auth state changes.
     */
    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                set({ session });
                await get().syncUser();
            }
        } catch (err) {
            console.error('Auth initialization error:', err);
        } finally {
            set({ initialized: true });
        }

        // Listen for future auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                set({ session });

                if (event === 'SIGNED_IN' && session) {
                    await get().syncUser();
                } else if (event === 'SIGNED_OUT') {
                    set({ user: null, session: null });
                } else if (event === 'TOKEN_REFRESHED' && session) {
                    // session already set above
                }
            }
        );

        // Store unsubscribe so we can clean up if needed
        set({ _authSubscription: subscription });
    },

    /**
     * Sync Supabase user to Laravel backend.
     * The backend auto-creates the local user + wallet on first call.
     */
    syncUser: async () => {
        try {
            const response = await api.get('/v1/auth/user');
            const payload = response.data.data ?? response.data;
            set({ user: payload.user });
        } catch (err) {
            console.error('Failed to sync user with backend:', err);
            await supabase.auth.signOut();
            set({ user: null, session: null });
        }
    },

    // ─── Register with email + password ───
    register: async ({ name, email, password }) => {
        set({ loading: true, error: null, fieldErrors: {} });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name },
                },
            });
            if (error) throw error;

            // If Supabase requires email confirmation the session will be null
            const needsVerification = !data.session;
            set({ loading: false });
            return { success: true, needsVerification };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // ─── Login with email + password ───
    login: async ({ email, password }) => {
        set({ loading: true, error: null, fieldErrors: {} });
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // onAuthStateChange will fire SIGNED_IN → syncUser
            set({ loading: false });
            return { success: true };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // ─── Login with Google (OAuth via Supabase) ───
    loginWithGoogle: async () => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            // Browser will redirect to Google — no further code runs here
        } catch (err) {
            set({ error: parseError(err), loading: false });
        }
    },

    // ─── Logout ───
    logout: async () => {
        try {
            await supabase.auth.signOut();
        } catch {
            // Ignore
        } finally {
            set({ user: null, session: null });
        }
    },

    // ─── Profile update (Laravel API) ───
    updateProfile: async (data) => {
        set({ loading: true, error: null, fieldErrors: {} });
        try {
            const response = await api.put('/v1/auth/profile', data);
            const payload = response.data.data ?? response.data;
            set((state) => ({
                user: { ...state.user, ...payload.user },
                loading: false,
            }));
            return { success: true };
        } catch (err) {
            set({
                error: parseError(err),
                fieldErrors: parseFieldErrors(err),
                loading: false,
            });
            return { success: false };
        }
    },

    // ─── Avatar upload (Laravel API) ───
    uploadAvatar: async (file) => {
        set({ loading: true, error: null });
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const response = await api.post('/v1/auth/avatar', formData);
            const payload = response.data.data ?? response.data;
            set((state) => ({
                user: { ...state.user, avatar_url: payload.avatar_url },
                loading: false,
            }));
            return { success: true, avatar_url: payload.full_url };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // ─── Settings update (Laravel API) ───
    updateSettings: async (settings) => {
        set({ loading: true, error: null });
        try {
            const response = await api.patch('/v1/auth/settings', settings);
            const payload = response.data.data ?? response.data;
            set((state) => ({
                user: { ...state.user, ...payload.settings },
                loading: false,
            }));
            return { success: true };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    clearError: () => set({ error: null, fieldErrors: {} }),
}));
