import { create } from 'zustand';
import api from '../services/api';

// Extracts a useful error message from a Laravel API error response
const parseError = (err) => {
    console.error('API Error:', err.response?.status, err.response?.data, err.message);
    const data = err.response?.data;
    if (!data) return `Network error: ${err.message}`;
    // Laravel validation errors: { errors: { field: ["message"] } }
    if (data.errors) {
        const firstField = Object.keys(data.errors)[0];
        return data.errors[firstField][0];
    }
    return data.message || 'An error occurred';
};

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,

    register: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/v1/auth/register', credentials);
            console.log('Register response:', response.data);
            // The ApiResponse trait nests data inside response.data.data
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

    login: async (credentials) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/v1/auth/login', credentials);
            console.log('Login response:', response.data);
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
        } finally {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    },

    fetchUser: async () => {
        try {
            const response = await api.get('/user');
            set({ user: response.data });
        } catch {
            localStorage.removeItem('token');
            set({ user: null, token: null });
        }
    },

    clearError: () => set({ error: null }),
}));
