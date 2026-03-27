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

const dedupeById = (items) => {
    const seen = new Set();
    return items.filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
};

export const usePostStore = create((set, get) => ({
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    submitting: false,
    error: null,
    sort: 'latest', // 'latest' | 'top' | 'following'

    setSort: (sort) => {
        set({ sort, posts: [], page: 1, hasMore: true });
        get().fetchPosts(1, sort);
    },

    // ── Fetch paginated posts ────────────────────────────────────
    fetchPosts: async (page = 1, sortOverride) => {
        const sort = sortOverride ?? get().sort ?? 'latest';
        set({ loading: true, error: null });
        try {
            const res = await api.get('/v1/posts', { params: { page, per_page: 15, sort } });
            const root  = res?.data?.data ?? res?.data ?? {};
            const paged = root?.posts ?? root;
            const items = Array.isArray(paged) ? paged : (paged?.data ?? []);
            const meta  = Array.isArray(paged) ? null : paged;

            if (page === 1) {
                set({
                    posts: dedupeById(items),
                    page: 1,
                    hasMore: meta ? (meta.current_page ?? 1) < (meta.last_page ?? 1) : false,
                    loading: false,
                });
            } else {
                set((s) => ({
                    posts: dedupeById([...s.posts, ...items]),
                    page,
                    hasMore: meta ? (meta.current_page ?? page) < (meta.last_page ?? page) : false,
                    loading: false,
                }));
            }
        } catch (err) {
            set({ error: parseError(err), loading: false });
        }
    },

    loadMore: () => {
        const { page, hasMore, loading } = get();
        if (!hasMore || loading) return;
        get().fetchPosts(page + 1);
    },

    // ── Create a text or invite post ────────────────────────────
    createPost: async (payload) => {
        set({ submitting: true, error: null });
        try {
            const res = await api.post('/v1/posts', payload);
            const post = res?.data?.data?.post ?? res?.data?.post;
            if (post) {
                set((s) => ({ posts: [post, ...s.posts], submitting: false }));
            }
            return { ok: true, post };
        } catch (err) {
            const msg = parseError(err);
            set({ submitting: false, error: msg });
            return { ok: false, error: msg };
        }
    },

    // ── Upload image and create image post ──────────────────────
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/v1/posts/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return res?.data?.data ?? res?.data;
    },

    // ── Delete a post ────────────────────────────────────────────
    deletePost: async (postId) => {
        set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
        try {
            await api.delete(`/v1/posts/${postId}`);
        } catch {
            // revert not needed — UI already refreshes
        }
    },

    // ── Toggle like ───────────────────────────────────────────────
    toggleLike: async (postId) => {
        // Optimistic
        set((s) => ({
            posts: s.posts.map((p) => {
                if (p.id !== postId) return p;
                const newLiked = !p.liked_by_me;
                return {
                    ...p,
                    liked_by_me: newLiked,
                    likes_count: newLiked
                        ? (p.likes_count ?? 0) + 1
                        : Math.max(0, (p.likes_count ?? 0) - 1),
                };
            }),
        }));
        try {
            await api.post(`/v1/posts/${postId}/like`);
        } catch {
            // revert on fail
            set((s) => ({
                posts: s.posts.map((p) => {
                    if (p.id !== postId) return p;
                    const reverted = !p.liked_by_me;
                    return {
                        ...p,
                        liked_by_me: reverted,
                        likes_count: reverted
                            ? (p.likes_count ?? 0) + 1
                            : Math.max(0, (p.likes_count ?? 0) - 1),
                    };
                }),
            }));
        }
    },

    // ── Comments ─────────────────────────────────────────────────
    fetchComments: async (postId) => {
        const res = await api.get(`/v1/posts/${postId}/comments`);
        return res?.data?.data?.comments ?? [];
    },

    addComment: async (postId, body) => {
        const res = await api.post(`/v1/posts/${postId}/comments`, { body });
        const comment = res?.data?.data?.comment;
        // Increment comments_count in store
        if (comment) {
            set((s) => ({
                posts: s.posts.map((p) =>
                    p.id === postId
                        ? { ...p, comments_count: (p.comments_count ?? 0) + 1 }
                        : p
                ),
            }));
        }
        return comment;
    },

    deleteComment: async (postId, commentId) => {
        await api.delete(`/v1/posts/${postId}/comments/${commentId}`);
        set((s) => ({
            posts: s.posts.map((p) =>
                p.id === postId
                    ? { ...p, comments_count: Math.max(0, (p.comments_count ?? 0) - 1) }
                    : p
            ),
        }));
    },
}));
