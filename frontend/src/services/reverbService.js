import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { supabase } from './supabase';

// Pusher must be available globally for Laravel Echo
window.Pusher = Pusher;

let echoInstance = null;
let warnedMissingConfig = false;

/**
 * Get or create the Laravel Echo instance connected to Reverb.
 * Uses Supabase JWT for auth on private/presence channels.
 */
export const getEcho = () => {
    if (echoInstance) return echoInstance;

    const appKey = import.meta.env.VITE_REVERB_APP_KEY;
    if (!appKey) {
        if (!warnedMissingConfig) {
            warnedMissingConfig = true;
            console.warn('Realtime disabled: VITE_REVERB_APP_KEY is not configured.');
        }
        return null;
    }

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: appKey,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        auth: {
            headers: {},
        },
    });

    return echoInstance;
};

/**
 * Refresh the Bearer token on the Echo instance before subscribing to
 * private / presence channels.
 */
export const refreshEchoAuth = async () => {
    const echo = getEcho();
    if (!echo) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        echo.connector.pusher.config.auth.headers['Authorization'] =
            `Bearer ${session.access_token}`;
    }
    return echo;
};

/**
 * Disconnect and destroy the Echo instance (e.g. on logout).
 */
export const disconnectEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};
