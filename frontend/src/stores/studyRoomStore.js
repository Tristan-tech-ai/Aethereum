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

export const useStudyRoomStore = create((set, get) => ({
    publicRooms: [],
    currentRoom: null,
    roomMembers: [],
    pomodoroPhase: null,
    pomodoroTimer: null,
    loading: false,
    error: null,
    lastFetchedPublicRooms: null,

    fetchPublicRooms: async (force = false) => {
        const { lastFetchedPublicRooms, publicRooms } = get();
        const isFresh = lastFetchedPublicRooms && Date.now() - lastFetchedPublicRooms < 60000;
        let background = false;

        if (!force && publicRooms.length > 0) {
            if (isFresh) return;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/rooms/public');
            const payload = extractPayload(res, 'rooms');
            const rooms = Array.isArray(payload) ? payload : (payload?.data ?? []);
            set({ publicRooms: rooms, loading: false, lastFetchedPublicRooms: Date.now() });
        } catch (err) {
            if (!background) set({ error: parseError(err), loading: false });
        }
    },

    createRoom: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/v1/rooms', data);
            const room = extractPayload(res, 'room');
            set({ currentRoom: room, roomMembers: room?.members ?? [], loading: false });
            return room;
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return null;
        }
    },

    joinRoom: async (roomCode) => {
        set({ loading: true, error: null });
        try {
            const res = await api.post('/v1/rooms/join', { room_code: roomCode });
            const room = extractPayload(res, 'room');
            set({ currentRoom: room, roomMembers: room?.members ?? [], loading: false });
            return room;
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return null;
        }
    },

    updatePresence: async (id, material) => {
        try {
            await api.post(`/v1/rooms/${id}/presence`, { material });
        } catch (err) {
            // Non-critical
        }
    },

    sendReaction: async (id, emoji) => {
        try {
            await api.post(`/v1/rooms/${id}/react`, { emoji });
        } catch (err) {
            // Non-critical
        }
    },

    leaveRoom: async (id) => {
        try {
            await api.post(`/v1/rooms/${id}/leave`);
            set({ currentRoom: null, roomMembers: [] });
        } catch (err) {
            set({ error: parseError(err) });
        }
    },

    closeRoom: async (id) => {
        try {
            await api.post(`/v1/rooms/${id}/close`);
            set({ currentRoom: null, roomMembers: [] });
        } catch (err) {
            set({ error: parseError(err) });
        }
    },

    // ─── Setters (for WebSocket updates) ─────
    setRoomMembers: (members) => set({ roomMembers: members }),
    updateMember: (memberId, action, material) => {
        set(s => {
            let members = [...s.roomMembers];
            if (action === 'joined') {
                if (!members.find(m => m.id === memberId)) {
                    members.push({ id: memberId, current_material: material, is_online: true });
                }
            } else if (action === 'left' || action === 'inactive') {
                members = members.filter(m => m.id !== memberId);
            } else if (action === 'updated') {
                members = members.map(m =>
                    m.id === memberId ? { ...m, current_material: material } : m
                );
            }
            return { roomMembers: members };
        });
    },
    setPomodoroPhase: (phase, timer) => set({ pomodoroPhase: phase, pomodoroTimer: timer }),
    clearError: () => set({ error: null }),
}));
