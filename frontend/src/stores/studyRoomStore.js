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
    syncingRoom: false,
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
            set((s) => ({
                roomMembers: s.roomMembers.map((m) => m.isMe ? { ...m, current_material: material, last_active_at: new Date().toISOString() } : m),
            }));
        } catch (err) {
            // Non-critical
        }
    },

    sendReaction: async (id, emoji) => {
        try {
            await api.post(`/v1/rooms/${id}/react`, { emoji });
            return true;
        } catch (err) {
            // Non-critical
            return false;
        }
    },

    fetchRoom: async (id) => {
        if (!id) return null;
        set({ syncingRoom: true });
        try {
            const res = await api.get(`/v1/rooms/${id}`);
            const room = extractPayload(res, 'room');
            set({ currentRoom: room, roomMembers: room?.members ?? [], syncingRoom: false });
            return room;
        } catch (err) {
            set({ syncingRoom: false, error: parseError(err) });
            return null;
        }
    },

    togglePomodoro: async (id, phase) => {
        try {
            const res = await api.post(`/v1/rooms/${id}/pomodoro`, { phase });
            const payload = extractPayload(res);
            set((s) => ({
                currentRoom: s.currentRoom
                    ? {
                        ...s.currentRoom,
                        current_pomodoro_phase: payload?.phase ?? phase,
                        pomodoro_started_at: payload?.started_at ?? new Date().toISOString(),
                    }
                    : s.currentRoom,
                pomodoroPhase: payload?.phase ?? phase,
                pomodoroTimer: payload?.duration ?? (phase === 'study' ? 1500 : 300),
            }));
            return true;
        } catch (err) {
            set({ error: parseError(err) });
            return false;
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
    setRoomMembers: (members) => set((s) => {
        const incoming = members ?? [];
        const merged = incoming.map((m) => {
            const existing = s.roomMembers.find((x) => String(x.id) === String(m.id));
            return {
                ...existing,
                ...m,
                is_online: true,
                last_active_at: new Date().toISOString(),
            };
        });

        const onlineCount = merged.filter((m) => m.is_online).length;

        return {
            roomMembers: merged,
            currentRoom: s.currentRoom
                ? {
                    ...s.currentRoom,
                    members: merged,
                    members_count: merged.length,
                    online_members_count: onlineCount,
                    online_members_preview: merged.slice(0, 5),
                }
                : s.currentRoom,
        };
    }),
    hydrateRoom: (room) => set({ currentRoom: room ?? null, roomMembers: room?.members ?? [] }),
    updateMember: (memberDataOrId, action, material) => {
        set(s => {
            let members = [...s.roomMembers];
            const memberData = typeof memberDataOrId === 'object' ? memberDataOrId : null;
            const memberId = memberData?.id ?? memberDataOrId;

            if (action === 'joined') {
                if (!members.find(m => m.id === memberId)) {
                    members.push({
                        id: memberId,
                        name: memberData?.name ?? memberData?.username ?? 'Member',
                        username: memberData?.username,
                        avatar_url: memberData?.avatar_url,
                        current_material: material ?? memberData?.current_material ?? null,
                        is_online: true,
                        joined_at: memberData?.joined_at ?? new Date().toISOString(),
                        last_active_at: new Date().toISOString(),
                    });
                } else {
                    members = members.map(m =>
                        m.id === memberId
                            ? { ...m, ...memberData, current_material: material ?? memberData?.current_material ?? m.current_material, is_online: true, last_active_at: new Date().toISOString() }
                            : m
                    );
                }
            } else if (action === 'left' || action === 'inactive') {
                members = members.map(m =>
                    m.id === memberId ? { ...m, is_online: false, last_active_at: new Date().toISOString() } : m
                );
            } else if (action === 'updated') {
                members = members.map(m =>
                    m.id === memberId
                        ? { ...m, ...memberData, current_material: material ?? memberData?.current_material ?? m.current_material, is_online: true, last_active_at: new Date().toISOString() }
                        : m
                );
            }
            const onlineCount = members.filter((m) => m.is_online).length;
            return {
                roomMembers: members,
                currentRoom: s.currentRoom
                    ? {
                        ...s.currentRoom,
                        members,
                        members_count: members.length,
                        online_members_count: onlineCount,
                        online_members_preview: members.filter((m) => m.is_online).slice(0, 5),
                    }
                    : s.currentRoom,
            };
        });
    },
    setPomodoroPhase: (phase, timer) => set({ pomodoroPhase: phase, pomodoroTimer: timer }),
    clearError: () => set({ error: null }),
}));
