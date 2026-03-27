import { create } from "zustand";
import api from "../services/api";

/**
 * Marketplace Store — browse, filter, and purchase public courses.
 *
 * API endpoints:
 *   GET  /api/v1/marketplace              — list public courses (filterable)
 *   GET  /api/v1/marketplace/purchased    — user's purchased courses
 *   GET  /api/v1/marketplace/:id          — single course detail
 *   POST /api/v1/marketplace/:id/purchase — buy a course with coins
 */

export const useMarketplaceStore = create((set, get) => ({
    // ─── State ───────────────────────────────
    courses: [],
    purchasedCourses: [],
    loading: false,
    purchasedLoading: false,
    purchasing: false,
    error: null,
    purchaseError: null,
    pagination: { current_page: 1, last_page: 1, total: 0 },
    userBalance: null,
    filters: {
        q: "",
        type: "",          // "free" | "paid" | "pro" | ""
        subject: "",
        difficulty: "",
        sort: "recent",    // "recent" | "popular" | "price_asc" | "price_desc"
    },

    // ─── Set single filter ────────────────────
    setFilter: (key, value) => {
        set((s) => ({ filters: { ...s.filters, [key]: value } }));
    },

    resetFilters: () => {
        set({
            filters: { q: "", type: "", subject: "", difficulty: "", sort: "recent" },
        });
    },

    // ─── Fetch public courses ─────────────────
    fetchCourses: async (page = 1) => {
        const { filters } = get();
        set({ loading: true, error: null });

        try {
            const params = { page, per_page: 18 };
            if (filters.q) params.q = filters.q;
            if (filters.type) params.type = filters.type;
            if (filters.subject) params.subject = filters.subject;
            if (filters.difficulty) params.difficulty = filters.difficulty;
            if (filters.sort) params.sort = filters.sort;

            const res = await api.get("/v1/marketplace", { params });
            const data = res.data;

            set({
                courses: data.data ?? [],
                pagination: data.meta ?? { current_page: 1, last_page: 1, total: 0 },
                loading: false,
            });
        } catch (err) {
            set({
                error: err?.response?.data?.message ?? "Failed to load courses.",
                loading: false,
            });
        }
    },

    // ─── Fetch user's purchased courses ───────
    fetchPurchased: async () => {
        set({ purchasedLoading: true });
        try {
            const res = await api.get("/v1/marketplace/purchased");
            set({ purchasedCourses: res.data?.data ?? [], purchasedLoading: false });
        } catch {
            set({ purchasedLoading: false });
        }
    },

    // ─── Purchase a course ────────────────────
    purchaseCourse: async (courseId) => {
        set({ purchasing: true, purchaseError: null });
        try {
            const res = await api.post(`/v1/marketplace/${courseId}/purchase`);
            const { new_balance, coins_spent } = res.data;

            // Update balance in store
            if (new_balance !== undefined) set({ userBalance: new_balance });

            // Mark course as purchased in list
            set((s) => ({
                courses: s.courses.map((c) =>
                    c.id === courseId
                        ? { ...c, is_purchased: true, can_access: true }
                        : c
                ),
                purchasing: false,
            }));

            return { success: true, coins_spent, new_balance };
        } catch (err) {
            const msg = err?.response?.data?.message ?? "Purchase failed.";
            set({ purchaseError: msg, purchasing: false });
            return { success: false, error: msg };
        }
    },

    // ─── Fetch user wallet balance ─────────────
    fetchWalletBalance: async () => {
        try {
            const res = await api.get("/v1/marketplace/wallet-balance");
            set({ userBalance: res.data?.balance ?? 0 });
        } catch {
            // silent — balance will show as null
        }
    },

    // ─── Update user balance in store ─────────
    setUserBalance: (balance) => set({ userBalance: balance }),

    // ─── Optimistic update after library toggle ─
    updateCourseVisibility: (courseId, isPublic, coinPrice) => {
        set((s) => ({
            courses: s.courses.map((c) =>
                c.id === courseId
                    ? { ...c, is_public: isPublic, coin_price: coinPrice }
                    : c
            ),
        }));
    },
}));
