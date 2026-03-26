import { create } from "zustand";
import api from "../services/api";

const parseError = (err) => {
    const data = err?.response?.data;
    if (!data) return err?.message || "Network error";
    if (data.errors) {
        const first = Object.keys(data.errors)[0];
        return data.errors[first][0];
    }
    return data.message || "An error occurred";
};

export const useTaskStore = create((set, get) => ({
    // ─── State ───────────────────────────────
    activeSessions: [],
    activeDuels: [],
    activeRaids: [],
    currentChallenge: null,
    summary: {
        active_sessions: 0,
        pending_duels: 0,
        active_raids: 0,
        active_challenge: 0,
        total: 0,
    },
    loading: false,
    error: null,
    lastFetchedAll: null,

    // ─── Actions ─────────────────────────────

    normalizeListPayload: (res, key = null) => {
        const root = res?.data?.data ?? res?.data;
        const scoped = key && root && typeof root === "object" && !Array.isArray(root)
            ? (root[key] ?? root)
            : root;

        if (Array.isArray(scoped)) return scoped;
        if (scoped && Array.isArray(scoped.data)) return scoped.data;
        return [];
    },

    /**
     * Fetch badge counts for sidebar.
     */
    fetchSummary: async () => {
        try {
            const res = await api.get("/v1/my-tasks/summary");
            set({ summary: res.data.data });
        } catch (err) {
            // Silent fail — badges just show 0
        }
    },

    /**
     * Fetch active/paused learning sessions.
     */
    fetchActiveSessions: async () => {
        try {
            const res = await api.get("/v1/sessions/active");
            set({ activeSessions: res.data.data || [] });
        } catch {
            set({ activeSessions: [] });
        }
    },

    /**
     * Fetch duels where user is involved (pending/accepted/active).
     */
    fetchActiveDuels: async () => {
        try {
            const res = await api.get("/v1/duels/my");
            const duels = get().normalizeListPayload(res, "duels");
            const active = duels.filter((d) =>
                ["pending", "accepted", "active"].includes(d.status)
            );
            set({ activeDuels: active });
        } catch {
            set({ activeDuels: [] });
        }
    },

    /**
     * Fetch raids where user is participant and raid is active.
     */
    fetchActiveRaids: async () => {
        try {
            const res = await api.get("/v1/raids/my");
            const raids = get().normalizeListPayload(res, "raids");
            const active = raids.filter((r) =>
                ["lobby", "active"].includes(r.status)
            );
            set({ activeRaids: active });
        } catch {
            set({ activeRaids: [] });
        }
    },

    /**
     * Fetch current weekly challenge with user contribution.
     */
    fetchCurrentChallenge: async () => {
        try {
            const res = await api.get("/v1/challenges/current");
            const payload = res?.data?.data ?? res?.data ?? null;
            set({ currentChallenge: payload?.challenge ?? payload ?? null });
        } catch {
            set({ currentChallenge: null });
        }
    },

    /**
     * Load all task data at once.
     * Loading state is managed here (not per-fetch) to avoid race conditions.
     */
    fetchAll: async (force = false) => {
        const { lastFetchedAll, summary } = get();
        const isFresh = lastFetchedAll && Date.now() - lastFetchedAll < 60000;
        
        let background = false;
        if (!force && summary.total > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const { fetchActiveSessions, fetchActiveDuels, fetchActiveRaids, fetchCurrentChallenge, fetchSummary } = get();
            await Promise.allSettled([
                fetchActiveSessions(),
                fetchActiveDuels(),
                fetchActiveRaids(),
                fetchCurrentChallenge(),
                fetchSummary(),
            ]);
            set({ lastFetchedAll: Date.now() });
        } finally {
            set({ loading: false });
        }
    },
}));
