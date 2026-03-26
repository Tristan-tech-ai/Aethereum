import { create } from 'zustand';
import api from '../services/api';

const parseError = (err) => {
    const data = err?.response?.data;
    if (!data) return err?.message || 'Network error';
    if (data.errors) {
        const first = Object.keys(data.errors)[0];
        return data.errors[first][0];
    }
    return data.message || 'An error occurred';
};

export const useChallengeStore = create((set, get) => ({
    currentChallenge: null,
    myContribution: null,
    challengeHistory: [],
    loading: false,
    error: null,
    lastFetchedCurrent: null,
    lastFetchedHistory: null,

    fetchCurrentChallenge: async (force = false) => {
        const { lastFetchedCurrent, currentChallenge } = get();
        const isFresh = lastFetchedCurrent && Date.now() - lastFetchedCurrent < 60000;
        let background = false;

        if (!force && currentChallenge) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/challenges/current');
            const data = res.data.data ?? res.data;
            set({
                currentChallenge: data.challenge ?? data,
                myContribution: data.my_contribution ?? null,
                loading: false,
                lastFetchedCurrent: Date.now(),
            });
        } catch (err) {
            if (!background) set({ error: parseError(err), loading: false });
        }
    },

    fetchChallengeHistory: async (force = false) => {
        const { lastFetchedHistory, challengeHistory } = get();
        const isFresh = lastFetchedHistory && Date.now() - lastFetchedHistory < 60000;
        let background = false;

        if (!force && challengeHistory.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/challenges/history');
            set({ challengeHistory: res.data.data ?? res.data, loading: false, lastFetchedHistory: Date.now() });
        } catch (err) {
            if (!background) set({ error: parseError(err), loading: false });
        }
    },

    fetchChallengeProgress: async (id) => {
        try {
            const res = await api.get(`/v1/challenges/${id}/progress`);
            return res.data.data ?? res.data;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    clearError: () => set({ error: null }),
}));
