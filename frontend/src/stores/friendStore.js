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

const normalizeListPayload = (res, key = null) => {
    const data = res?.data?.data ?? res?.data;
    const scoped = key && data && typeof data === 'object' && !Array.isArray(data)
        ? (data[key] ?? data)
        : data;

    if (Array.isArray(scoped)) return scoped;
    if (scoped && Array.isArray(scoped.data)) return scoped.data;
    return [];
};

export const useFriendStore = create((set, get) => ({
    friends: [],
    friendRequests: [],
    outgoingRequests: [],
    searchResults: [],
    loading: false,
    error: null,
    lastFetchedFriends: null,
    lastFetchedRequests: null,

    fetchFriends: async (force = false) => {
        const { lastFetchedFriends, friends } = get();
        const isFresh = lastFetchedFriends && Date.now() - lastFetchedFriends < 60000;
        let background = false;

        if (!force && friends.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/friends');
            set({ friends: normalizeListPayload(res, 'friends'), loading: false, lastFetchedFriends: Date.now() });
        } catch (err) {
            if (!background) set({ error: parseError(err), loading: false });
        }
    },

    fetchRequests: async (force = false) => {
        const { lastFetchedRequests, friendRequests, outgoingRequests } = get();
        const isFresh = lastFetchedRequests && Date.now() - lastFetchedRequests < 60000;
        let background = false;

        if (!force && (friendRequests.length > 0 || outgoingRequests.length > 0)) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/friends/requests');
            const data = res?.data?.data ?? res?.data ?? {};
            const incomingRaw = Array.isArray(data?.incoming) ? data.incoming : [];
            const outgoingRaw = Array.isArray(data?.outgoing) ? data.outgoing : [];

            const incoming = incomingRaw.map((req) => ({
                id: req.id,
                requester_id: req.requester_id,
                addressee_id: req.addressee_id,
                status: req.status,
                created_at: req.created_at,
                user: req.requester ?? null,
            }));

            const outgoing = outgoingRaw.map((req) => ({
                id: req.id,
                requester_id: req.requester_id,
                addressee_id: req.addressee_id,
                status: req.status,
                created_at: req.created_at,
                user: req.addressee ?? null,
            }));

            set({
                friendRequests: incoming,
                outgoingRequests: outgoing,
                loading: false,
                lastFetchedRequests: Date.now(),
            });
        } catch (err) {
            if (!background) set({ error: parseError(err), loading: false });
        }
    },

    sendFriendRequest: async (username) => {
        set({ error: null });
        try {
            await api.post(`/v1/friends/request/${username}`);
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    acceptRequest: async (id) => {
        try {
            await api.post(`/v1/friends/accept/${id}`);
            // Refresh both lists
            await Promise.all([get().fetchFriends(), get().fetchRequests()]);
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    declineRequest: async (id) => {
        try {
            await api.post(`/v1/friends/decline/${id}`);
            set(s => ({
                friendRequests: s.friendRequests.filter(r => r.id !== id),
            }));
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    unfriend: async (id) => {
        try {
            await api.delete(`/v1/friends/${id}`);
            set(s => ({
                friends: s.friends.filter(f => f.id !== id),
            }));
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
        }
    },

    searchUsers: async (query) => {
        if (!query || query.length < 2) {
            set({ searchResults: [] });
            return;
        }
        try {
            const res = await api.get('/v1/users/search', { params: { q: query } });
            set({ searchResults: normalizeListPayload(res, 'users') });
        } catch (err) {
            set({ error: parseError(err) });
        }
    },

    clearSearchResults: () => set({ searchResults: [] }),
    clearError: () => set({ error: null }),
}));
