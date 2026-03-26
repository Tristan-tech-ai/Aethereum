import { useEffect } from 'react';
import { create } from 'zustand';
import api from '../services/api';

const CACHE_TTL = 60 * 1000; // 1 minute

export const useDashboardStore = create((set, get) => ({
    data: null,
    loading: false,
    error: null,
    lastFetched: null,

    fetch: async (force = false) => {
        const { data, lastFetched } = get();
        
        // Smart Caching: if fresh, return instantly
        if (!force && data && lastFetched && Date.now() - lastFetched < CACHE_TTL) {
            return data;
        }

        // Stale-while-revalidate: don't show loading spinner if we already have stale data
        const isBackground = !force && !!data;
        if (!isBackground) set({ loading: true, error: null });

        try {
            const res = await api.get('/v1/dashboard');
            const resData = res.data?.data ?? res.data;
            set({ data: resData, loading: false, lastFetched: Date.now() });
            return resData;
        } catch (err) {
            if (!isBackground) {
                set({
                    error: err?.response?.data?.message ?? err?.message ?? 'Failed to load dashboard',
                    loading: false
                });
            }
        }
    },
    
    refresh: () => get().fetch(true),
}));

/**
 * Hook wrapper around Zustand store for drop-in compatibility.
 */
export function useDashboard() {
    const { data, loading, error, fetch, refresh } = useDashboardStore();

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { data, loading, error, refresh };
}
