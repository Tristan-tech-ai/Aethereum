import { create } from "zustand";
import api from "../services/api";

/**
 * Content Store — manages learning content CRUD, upload, polling, and filtering.
 *
 * API endpoints (Laravel backend):
 *   POST   /api/v1/content/upload   — multipart file upload
 *   POST   /api/v1/content/url      — YouTube / article URL
 *   GET    /api/v1/content          — list (paginated, filterable)
 *   GET    /api/v1/content/:id      — single content (polling)
 *   DELETE /api/v1/content/:id      — delete
 */

const parseError = (err) => {
    const data = err?.response?.data;
    if (!data) return err?.message || "Network error";
    if (data.errors) {
        const first = Object.keys(data.errors)[0];
        return data.errors[first][0];
    }
    return data.message || "An error occurred";
};

export const useContentStore = create((set, get) => ({
    // ─── State ───────────────────────────────
    contents: [],
    currentContent: null,
    loading: false,
    uploading: false,
    uploadProgress: 0,
    error: null,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    filters: {
        status: "",
        content_type: "",
        subject_category: "",
        sort: "recent",
    },
    pollingIds: new Set(), // content IDs currently being polled
    _pollingTimers: {}, // internal timer refs

    // ─── Filters ─────────────────────────────
    setFilter: (key, value) => {
        set((s) => ({ filters: { ...s.filters, [key]: value } }));
    },

    resetFilters: () => {
        set({
            filters: {
                status: "",
                content_type: "",
                subject_category: "",
                sort: "recent",
            },
        });
    },

    // ─── Fetch list ──────────────────────────
    fetchContents: async (page = 1) => {
        set({ loading: true, error: null });
        try {
            const { filters } = get();
            const params = { page };
            if (filters.status) params.status = filters.status;
            if (filters.content_type)
                params.content_type = filters.content_type;
            if (filters.subject_category)
                params.subject_category = filters.subject_category;
            if (filters.sort) params.sort = filters.sort;

            const res = await api.get("/v1/content", { params });
            const payload = res.data.data ?? res.data;
            const items = Array.isArray(payload)
                ? payload
                : (payload.data ?? []);
            const meta = payload.meta ?? payload;

            set({
                contents: items,
                pagination: {
                    current_page: meta.current_page ?? 1,
                    last_page: meta.last_page ?? 1,
                    total: meta.total ?? items.length,
                },
                loading: false,
            });

            // Auto-start polling for any "processing" items
            items
                .filter((c) => c.status === "processing")
                .forEach((c) => get().startPolling(c.id));

            return items;
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return [];
        }
    },

    // ─── Fetch single ────────────────────────
    fetchContent: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await api.get(`/v1/content/${id}`);
            const content = res.data.data ?? res.data;
            set({ currentContent: content, loading: false });
            return content;
        } catch (err) {
            set({ error: parseError(err), loading: false });
            return null;
        }
    },

    // ─── Upload file ─────────────────────────
    uploadFile: async (file, title = "") => {
        set({ uploading: true, uploadProgress: 0, error: null });
        try {
            const formData = new FormData();
            formData.append("file", file);
            if (title) formData.append("title", title);

            const res = await api.post("/v1/content/upload", formData, {
                onUploadProgress: (e) => {
                    const pct = e.total
                        ? Math.round((e.loaded / e.total) * 100)
                        : 0;
                    set({ uploadProgress: pct });
                },
            });

            const content = res.data.data ?? res.data;
            set((s) => ({
                contents: [content, ...s.contents],
                uploading: false,
                uploadProgress: 100,
            }));

            // Start polling for processing status
            if (content.status === "processing") {
                get().startPolling(content.id);
            }

            return { success: true, content };
        } catch (err) {
            set({
                error: parseError(err),
                uploading: false,
                uploadProgress: 0,
            });
            return { success: false, error: parseError(err) };
        }
    },

    // ─── Upload URL ──────────────────────────
    uploadUrl: async (url, title = "") => {
        set({ uploading: true, uploadProgress: 0, error: null });
        try {
            const res = await api.post("/v1/content/url", {
                url,
                title: title || undefined,
            });
            const content = res.data.data ?? res.data;
            set((s) => ({
                contents: [content, ...s.contents],
                uploading: false,
                uploadProgress: 100,
            }));

            if (content.status === "processing") {
                get().startPolling(content.id);
            }

            return { success: true, content };
        } catch (err) {
            set({
                error: parseError(err),
                uploading: false,
                uploadProgress: 0,
            });
            return { success: false, error: parseError(err) };
        }
    },

    // ─── Delete ──────────────────────────────
    deleteContent: async (id) => {
        try {
            await api.delete(`/v1/content/${id}`);
            get().stopPolling(id);
            set((s) => ({
                contents: s.contents.filter((c) => c.id !== id),
                currentContent:
                    s.currentContent?.id === id ? null : s.currentContent,
            }));
            return { success: true };
        } catch (err) {
            return { success: false, error: parseError(err) };
        }
    },

    // ─── Polling (3 sec interval) ────────────
    startPolling: (id) => {
        const state = get();
        if (state.pollingIds.has(id)) return; // already polling

        const newSet = new Set(state.pollingIds);
        newSet.add(id);
        set({ pollingIds: newSet });

        const timer = setInterval(async () => {
            try {
                const res = await api.get(`/v1/content/${id}`);
                const updated = res.data.data ?? res.data;

                set((s) => ({
                    contents: s.contents.map((c) =>
                        c.id === id ? updated : c,
                    ),
                    currentContent:
                        s.currentContent?.id === id
                            ? updated
                            : s.currentContent,
                }));

                if (updated.status !== "processing") {
                    get().stopPolling(id);
                }
            } catch {
                // silently continue polling — content may become available later
            }
        }, 3000);

        set((s) => ({ _pollingTimers: { ...s._pollingTimers, [id]: timer } }));
    },

    stopPolling: (id) => {
        const state = get();
        const timer = state._pollingTimers[id];
        if (timer) clearInterval(timer);

        const newSet = new Set(state.pollingIds);
        newSet.delete(id);

        const newTimers = { ...state._pollingTimers };
        delete newTimers[id];

        set({ pollingIds: newSet, _pollingTimers: newTimers });
    },

    stopAllPolling: () => {
        const timers = get()._pollingTimers;
        Object.values(timers).forEach((t) => clearInterval(t));
        set({ pollingIds: new Set(), _pollingTimers: {} });
    },
}));
