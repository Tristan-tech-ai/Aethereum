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

const extractPayload = (res, key) => {
    const data = res?.data?.data ?? res?.data;
    if (key && data && typeof data === 'object' && !Array.isArray(data) && key in data) {
        return data[key];
    }
    return data;
};

export const useSocialStore = create((set, get) => ({
    // ─── Study Raid State ────────────────────
    myRaids: [],
    currentRaid: null,
    raidLoading: false,

    // ─── Focus Duel State ────────────────────
    myDuels: [],
    currentDuel: null,
    pendingDuels: [],
    duelLoading: false,

    // ─── Quiz Arena State ────────────────────
    myArenas: [],
    currentArena: null,
    arenaLiveScore: [],
    arenaLoading: false,

    // ─── Learning Relay State ────────────────
    myRelays: [],
    currentRelay: null,
    relayLoading: false,

    lastFetchedRaids: null,
    lastFetchedDuels: null,
    lastFetchedArenas: null,
    lastFetchedRelays: null,

    error: null,

    // ─── Study Raid Actions ──────────────────
    fetchMyRaids: async (force = false) => {
        const { lastFetchedRaids, myRaids } = get();
        const isFresh = lastFetchedRaids && Date.now() - lastFetchedRaids < 60000;
        let background = false;
        
        if (!force && myRaids.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ raidLoading: true, error: null });
        try {
            const res = await api.get('/v1/raids/my');
            set({ myRaids: extractPayload(res, 'raids') ?? [], raidLoading: false, lastFetchedRaids: Date.now() });
        } catch (err) {
            if (!background) set({ error: parseError(err), raidLoading: false });
        }
    },

    createRaid: async (data) => {
        set({ raidLoading: true, error: null });
        try {
            const res = await api.post('/v1/raids', data);
            const raid = extractPayload(res, 'raid');
            set({ currentRaid: raid, raidLoading: false });
            return raid;
        } catch (err) {
            set({ error: parseError(err), raidLoading: false });
            return null;
        }
    },

    joinRaid: async (inviteCode) => {
        set({ raidLoading: true, error: null });
        try {
            const res = await api.post('/v1/raids/join', { invite_code: inviteCode });
            const raid = extractPayload(res, 'raid');
            set({ currentRaid: raid, raidLoading: false });
            return raid;
        } catch (err) {
            set({ error: parseError(err), raidLoading: false });
            return null;
        }
    },

    fetchRaid: async (id) => {
        set({ raidLoading: true, error: null });
        try {
            const res = await api.get(`/v1/raids/${id}`);
            const raid = extractPayload(res, 'raid');
            set({ currentRaid: raid, raidLoading: false });
            return raid;
        } catch (err) {
            set({ error: parseError(err), raidLoading: false });
            return null;
        }
    },

    startRaid: async (id) => {
        try {
            const res = await api.post(`/v1/raids/${id}/start`);
            set({ currentRaid: extractPayload(res, 'raid') });
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    updateRaidProgress: async (id, progress) => {
        try {
            await api.post(`/v1/raids/${id}/progress`, { progress_percentage: progress });
        } catch (err) {
            set({ error: parseError(err) });
        }
    },

    completeRaid: async (id, quizScore, focusIntegrity) => {
        try {
            const res = await api.post(`/v1/raids/${id}/complete`, {
                quiz_score: quizScore,
                focus_integrity: focusIntegrity,
            });
            const raid = extractPayload(res, 'raid');
            set({ currentRaid: raid });
            return raid;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    fetchRaidResults: async (id) => {
        try {
            const res = await api.get(`/v1/raids/${id}/results`);
            return res.data.data ?? res.data;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    sendRaidChat: async (id, message) => {
        try {
            const res = await api.post(`/v1/raids/${id}/chat`, { message });
            return (res.data?.data ?? res.data)?.message ?? null;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    // ─── Focus Duel Actions ──────────────────
    fetchMyDuels: async (force = false) => {
        const { lastFetchedDuels, myDuels } = get();
        const isFresh = lastFetchedDuels && Date.now() - lastFetchedDuels < 60000;
        let background = false;

        if (!force && myDuels.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ duelLoading: true, error: null });
        try {
            const res = await api.get('/v1/duels/my');
            const data = extractPayload(res, 'duels') ?? [];
            set({
                myDuels: data,
                pendingDuels: data.filter(d => d.status === 'pending'),
                duelLoading: false,
                lastFetchedDuels: Date.now(),
            });
        } catch (err) {
            if (!background) set({ error: parseError(err), duelLoading: false });
        }
    },

    challengeFriend: async (opponentId, durationMinutes) => {
        set({ duelLoading: true, error: null });
        try {
            const res = await api.post('/v1/duels/challenge', {
                opponent_id: opponentId,
                duration_minutes: durationMinutes,
            });
            const duel = extractPayload(res, 'duel');
            set({ currentDuel: duel, duelLoading: false });
            return duel;
        } catch (err) {
            set({ error: parseError(err), duelLoading: false });
            return null;
        }
    },

    acceptDuel: async (id) => {
        try {
            const res = await api.post(`/v1/duels/${id}/accept`);
            set({ currentDuel: extractPayload(res, 'duel') });
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    declineDuel: async (id) => {
        try {
            await api.post(`/v1/duels/${id}/decline`);
            set(s => ({ pendingDuels: s.pendingDuels.filter(d => d.id !== id) }));
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    startDuel: async (id) => {
        try {
            const res = await api.post(`/v1/duels/${id}/start`);
            set({ currentDuel: extractPayload(res, 'duel') });
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    sendFocusEvent: async (id, eventType, distractionCount) => {
        try {
            await api.post(`/v1/duels/${id}/focus-event`, {
                event_type: eventType,
                distraction_count: distractionCount,
            });
        } catch (err) {
            // Non-critical — skip error
        }
    },

    completeDuel: async (id, focusIntegrity) => {
        try {
            const res = await api.post(`/v1/duels/${id}/complete`, {
                focus_integrity: focusIntegrity,
            });
            const duel = extractPayload(res, 'duel');
            set({ currentDuel: duel });
            return duel;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    // ─── Quiz Arena Actions ──────────────────
    fetchMyArenas: async (force = false) => {
        const { lastFetchedArenas, myArenas } = get();
        const isFresh = lastFetchedArenas && Date.now() - lastFetchedArenas < 60000;
        let background = false;

        if (!force && myArenas.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ arenaLoading: true, error: null });
        try {
            const res = await api.get('/v1/arena/my');
            set({ myArenas: extractPayload(res), arenaLoading: false, lastFetchedArenas: Date.now() });
        } catch (err) {
            if (!background) set({ error: parseError(err), arenaLoading: false });
        }
    },

    createArena: async (data) => {
        set({ arenaLoading: true, error: null });
        try {
            const res = await api.post('/v1/arena', data);
            const arena = extractPayload(res, 'arena');
            set({ currentArena: arena, arenaLoading: false });
            return arena;
        } catch (err) {
            set({ error: parseError(err), arenaLoading: false });
            return null;
        }
    },

    joinArena: async (roomCode) => {
        set({ arenaLoading: true, error: null });
        try {
            const res = await api.post('/v1/arena/join', { room_code: roomCode });
            const arena = extractPayload(res, 'arena');
            set({ currentArena: arena, arenaLoading: false });
            return arena;
        } catch (err) {
            set({ error: parseError(err), arenaLoading: false });
            return null;
        }
    },

    startArena: async (id) => {
        try {
            const res = await api.post(`/v1/arena/${id}/start`);
            set({ currentArena: extractPayload(res, 'arena') });
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    submitAnswer: async (id, questionIndex, answer, timeSpent) => {
        try {
            const res = await api.post(`/v1/arena/${id}/answer`, {
                question_index: questionIndex,
                answer,
                time_spent_ms: timeSpent,
            });
            return res.data.data ?? res.data;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    fetchArenaResults: async (id) => {
        try {
            const res = await api.get(`/v1/arena/${id}/results`);
            return res.data.data ?? res.data;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    // ─── Learning Relay Actions ──────────────
    fetchMyRelays: async (force = false) => {
        const { lastFetchedRelays, myRelays } = get();
        const isFresh = lastFetchedRelays && Date.now() - lastFetchedRelays < 60000;
        let background = false;

        if (!force && myRelays.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ relayLoading: true, error: null });
        try {
            const res = await api.get('/v1/relay/my');
            set({ myRelays: extractPayload(res), relayLoading: false, lastFetchedRelays: Date.now() });
        } catch (err) {
            if (!background) set({ error: parseError(err), relayLoading: false });
        }
    },

    createRelay: async (data) => {
        set({ relayLoading: true, error: null });
        try {
            const res = await api.post('/v1/relay', data);
            const relay = extractPayload(res, 'relay');
            set({ currentRelay: relay, relayLoading: false });
            return relay;
        } catch (err) {
            set({ error: parseError(err), relayLoading: false });
            return null;
        }
    },

    joinRelay: async (inviteCode) => {
        set({ relayLoading: true, error: null });
        try {
            const res = await api.post('/v1/relay/join', { invite_code: inviteCode });
            const relay = extractPayload(res, 'relay');
            set({ currentRelay: relay, relayLoading: false });
            return relay;
        } catch (err) {
            set({ error: parseError(err), relayLoading: false });
            return null;
        }
    },

    startRelay: async (id) => {
        try {
            const res = await api.post(`/v1/relay/${id}/start`);
            set({ currentRelay: extractPayload(res, 'relay') });
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    submitRelaySummary: async (id, summary) => {
        try {
            const res = await api.post(`/v1/relay/${id}/summary`, { summary });
            set({ currentRelay: res.data.data ?? res.data });
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    submitRelayQuiz: async (id, answers) => {
        try {
            const res = await api.post(`/v1/relay/${id}/quiz`, { answers });
            return res.data.data ?? res.data;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    fetchRelayResults: async (id) => {
        try {
            const res = await api.get(`/v1/relay/${id}/results`);
            return res.data.data ?? res.data;
        } catch (err) {
            set({ error: parseError(err) });
            return null;
        }
    },

    // ─── Setters (for WebSocket updates) ─────
    setCurrentRaid: (raidOrUpdater) => set((state) => ({
        currentRaid: typeof raidOrUpdater === 'function'
            ? raidOrUpdater(state.currentRaid)
            : raidOrUpdater,
    })),
    setCurrentDuel: (duel) => set({ currentDuel: duel }),
    setCurrentArena: (arena) => set({ currentArena: arena }),
    setArenaLiveScore: (scores) => set({ arenaLiveScore: scores }),
    setCurrentRelay: (relay) => set({ currentRelay: relay }),
    clearError: () => set({ error: null }),
}));
