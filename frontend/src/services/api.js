import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 120000, // 120s — generous for file upload + AI processing
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

// ── Token management ──
// On hard refresh, supabase.auth.getSession() reads from MEMORY (empty).
// We keep a local cache that is populated by onAuthStateChange which reads
// from localStorage. This avoids calling getSession() in the interceptor
// (which would return null on first load).
let currentAccessToken = null;
let refreshPromise = null;
let tokenReady = null;            // resolves when first auth event fires
let tokenReadyResolve = null;

// Create a one-shot promise that resolves when the first token arrives.
const resetTokenReady = () => {
    tokenReady = new Promise((resolve) => { tokenReadyResolve = resolve; });
};
resetTokenReady();

// Listen to ALL auth state changes and cache the access token.
supabase.auth.onAuthStateChange((event, session) => {
    currentAccessToken = session?.access_token ?? null;
    // Resolve the tokenReady promise so queued requests can proceed.
    if (tokenReadyResolve) {
        tokenReadyResolve();
        tokenReadyResolve = null;
    }
});

const refreshAccessToken = async () => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = supabase.auth.refreshSession()
        .then(({ data, error }) => {
            if (error) return null;
            const token = data?.session?.access_token ?? null;
            currentAccessToken = token;
            return token;
        })
        .catch(() => null)
        .finally(() => { refreshPromise = null; });

    return refreshPromise;
};

// Request interceptor — attach Supabase JWT as Bearer token
export const getAuthToken = () => currentAccessToken;
api.interceptors.request.use(async (config) => {
    try {
        // Wait for the first auth event (INITIAL_SESSION) so we have a token.
        // This only blocks on the very first request after hard refresh.
        // Timeout after 4s so we don't block forever if user is unauthenticated.
        if (!currentAccessToken && tokenReady) {
            await Promise.race([
                tokenReady,
                new Promise((r) => setTimeout(r, 1500)),
            ]);
        }
        if (currentAccessToken) {
            config.headers.Authorization = `Bearer ${currentAccessToken}`;
        }
    } catch {
        // proceed without auth
    }
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor — retry once on 401 after refreshing session
api.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
            return api(originalRequest);
        }
    }

    return Promise.reject(error);
});

export default api;
