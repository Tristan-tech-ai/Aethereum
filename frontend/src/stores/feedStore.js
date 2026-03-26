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

const extractFeedPayload = (res) => {
    const root = res?.data?.data ?? res?.data ?? {};
    const feed = root?.feed ?? root;
    const items = Array.isArray(feed) ? feed : (feed?.data ?? []);
    const meta = Array.isArray(feed) ? null : feed;

    return { items, meta };
};

const dedupeById = (items) => {
    const seen = new Set();
    const result = [];
    for (const item of items) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        result.push(item);
    }
    return result;
};

export const useFeedStore = create((set, get) => ({
    feedEvents: [],
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
    lastFetched: null,

    fetchFeed: async (page = 1, force = false) => {
        const { feedEvents, lastFetched } = get();
        
        const isFresh = lastFetched && Date.now() - lastFetched < 60000;
        let background = false;

        if (page === 1 && feedEvents.length > 0 && !force) {
            if (isFresh) return feedEvents;
            background = true;
        }

        if (!background) set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/feed', {
                params: { page, per_page: 10 },
            });
            const { items, meta } = extractFeedPayload(res);

            if (page === 1) {
                set({
                    feedEvents: dedupeById(items),
                    page: 1,
                    hasMore: Boolean(meta?.next_page_url) || (meta?.current_page ?? 1) < (meta?.last_page ?? 1),
                    lastFetched: Date.now(),
                    loading: false,
                });
            } else {
                set((s) => ({
                    feedEvents: dedupeById([...s.feedEvents, ...items]),
                    page,
                    hasMore: Boolean(meta?.next_page_url) || (meta?.current_page ?? page) < (meta?.last_page ?? page),
                    loading: false,
                }));
            }

            return items;
        } catch (err) {
            if (!background) set({ error: parseError(err), loading: false });
            return [];
        }
    },

    refreshFeed: async () => {
        return get().fetchFeed(1);
    },

    loadMore: async () => {
        const { page, hasMore, loading } = get();
        if (!hasMore || loading) return;
        return get().fetchFeed(page + 1);
    },

    likeFeedEvent: async (eventId, nextLiked) => {
        const before = get().feedEvents;

        // Optimistic update
        set((s) => ({
            feedEvents: s.feedEvents.map((e) => {
                if (e.id !== eventId) return e;

                const currentLiked = Boolean(e.liked_by_me ?? e.is_liked);
                const targetLiked = typeof nextLiked === 'boolean' ? nextLiked : !currentLiked;
                const delta = targetLiked ? 1 : -1;

                return {
                    ...e,
                    liked_by_me: targetLiked,
                    is_liked: targetLiked,
                    likes: Math.max(0, (e.likes ?? 0) + delta),
                };
            }),
        }));

        try {
            const res = await api.post(`/v1/feed/${eventId}/like`);
            const payload = res?.data?.data ?? res?.data ?? {};
            const liked = payload?.action === 'liked';
            const likes = typeof payload?.likes === 'number' ? payload.likes : undefined;

            set((s) => ({
                feedEvents: s.feedEvents.map((e) =>
                e.id === eventId
                        ? {
                            ...e,
                            liked_by_me: liked,
                            is_liked: liked,
                            likes: likes ?? e.likes,
                        }
                    : e
                ),
            }));
        } catch (err) {
            // Revert optimistic update
            set({ feedEvents: before, error: parseError(err) });
        }
    },

    prependEvent: (event) => {
        if (!event?.id) return;
        set((s) => {
            const exists = s.feedEvents.some((item) => item.id === event.id);
            if (exists) {
                return {
                    feedEvents: s.feedEvents.map((item) =>
                        item.id === event.id ? { ...item, ...event } : item
                    ),
                    lastFetched: Date.now(),
                };
            }

            return {
                feedEvents: [event, ...s.feedEvents],
                lastFetched: Date.now(),
            };
        });
    },

    clearError: () => set({ error: null }),
}));
