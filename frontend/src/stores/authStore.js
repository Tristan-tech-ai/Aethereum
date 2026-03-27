import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

const saveOAuthError = (message) => {
    if (!message) return;
    try {
        localStorage.setItem('oauth_error', message);
    } catch {
        // ignore storage errors
    }
};

let authInitPromise = null;
let syncUserPromise = null;

export const useAuthStore = create(
    persist(
        (set, get) => ({
    user: null,
    session: null,
    _authSubscription: null,
    loading: false,
    error: null,
    fieldErrors: {},
    initialized: false,
    initializing: false,

    /**
     * Initialize auth state — call once on app mount.
     *
     * IMPORTANT: On hard-refresh with @supabase/supabase-js v2.60+,
     * getSession() reads from MEMORY (which is empty after reload) and
     * returns null. The real session comes through the INITIAL_SESSION
     * event from onAuthStateChange(). Therefore we MUST wait for that
     * event before marking initialization complete.
     */
    initialize: async () => {
        if (get().initialized) return;
        if (authInitPromise) return authInitPromise;

        set({ initializing: true });

        authInitPromise = new Promise((resolveInit) => {

        // Clean up any previous subscription.
        if (get()._authSubscription) {
            get()._authSubscription.unsubscribe();
        }

        let resolved = false;
        const markReady = (session) => {
            if (resolved) return;
            resolved = true;
            set({
                session,
                initialized: true,
                initializing: false,
            });
            if (session) {
                get().syncUser(); // background
            }
            resolveInit();
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // Whichever session-bearing event arrives first, use it to
                // initialize. On some Supabase versions SIGNED_IN fires
                // before INITIAL_SESSION (when token is auto-refreshed on
                // page load). Handle both.
                if (event === 'INITIAL_SESSION' || (event === 'SIGNED_IN' && !resolved)) {
                    markReady(session);
                    return;
                }

                if (event === 'TOKEN_REFRESHED' && session) {
                    set({ session });
                    return;
                }

                // SIGNED_IN after already initialized (e.g. fresh login)
                if (event === 'SIGNED_IN' && session) {
                    set({ session });
                    get().syncUser();
                    return;
                }

                if (event === 'SIGNED_OUT') {
                    set({ user: null, session: null });
                    return;
                }
            }
        );

        set({ _authSubscription: subscription });

        // Safety net
        setTimeout(() => {
            if (!resolved) {
                console.warn('[Auth] Timeout — forcing initialized');
                markReady(null);
            }
        }, 3000);

        }).finally(() => {
            authInitPromise = null;
        });

        return authInitPromise;
    },

    /**
     * Sync Supabase user to Laravel backend.
     * The backend auto-creates the local user + wallet on first call.
     */
    syncUser: async () => {
        if (syncUserPromise) return syncUserPromise;

        syncUserPromise = (async () => {
        try {
            const response = await api.get('/v1/auth/user');
            const payload = response.data.data ?? response.data;
            set({ user: payload.user });
        } catch (err) {
            console.error('[Auth] syncUser: FAIL', err?.response?.status, err?.message);
            // Retry once after a short delay.
            try {
                await new Promise(r => setTimeout(r, 500));
                const retry = await api.get('/v1/auth/user');
                const payload = retry.data.data ?? retry.data;
                set({ user: payload.user });
            } catch (retryErr) {
                console.error('[Auth] syncUser: retry FAIL', retryErr?.response?.status, retryErr?.message);
            }
        }
        })().finally(() => {
            syncUserPromise = null;
        });

        return syncUserPromise;
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
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;

            // Supabase returns empty identities array when email already exists
            // (with "Confirm email" enabled). Detect and inform the user.
            if (data?.user?.identities?.length === 0) {
                set({ loading: false, error: 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.' });
                return { success: false };
            }

            // If Supabase requires email confirmation the session will be null
            const needsVerification = !data.session;
            if (data.session) {
                set({ session: data.session });
                await get().syncUser();
            }
            set({ loading: false });
            return { success: true, needsVerification };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // ─── Send OTP code to email (for verification) ───
    sendVerificationOtp: async ({ email }) => {
        set({ loading: true, error: null });
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: false },
            });
            if (error) throw error;
            set({ loading: false });
            return { success: true };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // ─── Verify OTP code from email ───
    verifyEmailOtp: async ({ email, token }) => {
        set({ loading: true, error: null });
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: 'email',
            });
            if (error) throw error;
            // OTP verification logs the user in — sign them out so they
            // land on the login page after verification (consistent UX)
            if (data.session) {
                await supabase.auth.signOut();
            }
            set({ loading: false });
            return { success: true };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // ─── Login with email + password ───
    login: async ({ email, password }) => {
        set({ loading: true, error: null, fieldErrors: {} });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // Set session immediately so syncUser can use it
            set({ session: data.session });
            await get().syncUser();
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
            return { success: true };
        } catch (err) {
            const errorMsg = parseError(err);
            set({ error: errorMsg, loading: false });
            console.error('Google OAuth error:', err);
            saveOAuthError(errorMsg);
            return { success: false, error: errorMsg };
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
        }),
        {
            name: 'aethereum-auth',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
