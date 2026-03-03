import { create } from 'zustand';
import api from '../services/api';

// Extracts a useful error message from a Laravel API error response
const parseError = (err) => {
    const data = err.response?.data;
    if (!data) return `Network error: ${err.message}`;
    // Laravel validation errors: { errors: { field: ["message"] } }
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
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    fieldErrors: {},
    initialized: false,

    register: async (credentials) => {
        set({ loading: true, error: null, fieldErrors: {} });
        try {
            const response = await api.post('/v1/auth/register', credentials);
            const payload = response.data.data ?? response.data;
            const user = payload.user;
            const token = payload.token;
            if (!token) throw new Error('No token received from server');
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
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

    login: async (credentials) => {
        set({ loading: true, error: null, fieldErrors: {} });
        try {
            const response = await api.post('/v1/auth/login', credentials);
            const payload = response.data.data ?? response.data;
            const user = payload.user;
            const token = payload.token;
            if (!token) throw new Error('No token received from server');
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
            return { success: true };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    logout: async () => {
        try {
            await api.post('/v1/auth/logout');
        } catch {
            // Ignore errors — still clear local state
        } finally {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    },

    fetchUser: async () => {
        const token = get().token || localStorage.getItem('token');
        if (!token) {
            set({ initialized: true });
            return;
        }
        try {
            const response = await api.get('/v1/auth/user');
            const payload = response.data.data ?? response.data;
            set({ user: payload.user, initialized: true });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null, initialized: true });
        }
    },

    // Google OAuth: get redirect URL
    getGoogleRedirectUrl: async () => {
        try {
            const response = await api.get('/v1/auth/google/redirect');
            const payload = response.data.data ?? response.data;
            return payload.url;
        } catch {
            return null;
        }
    },

    // Google OAuth: handle callback (exchange code for token)
    handleGoogleCallback: async (params) => {
        set({ loading: true, error: null });
        try {
            const response = await api.get('/v1/auth/google/callback', { params });
            const payload = response.data.data ?? response.data;
            const user = payload.user;
            const token = payload.token;
            if (!token) throw new Error('No token received from server');
            localStorage.setItem('token', token);
            set({ user, token, loading: false });
            return { success: true };
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return { success: false };
        }
    },

    // Profile update
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

    // Avatar upload
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

    // Settings update (privacy, leaderboard, weekly_goal)
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
