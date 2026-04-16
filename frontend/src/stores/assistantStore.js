import { create } from 'zustand';
import { assistantApi } from '../services/assistantApi';

const parseError = (err) => {
    const data = err?.response?.data;
    if (!data) return err?.message || 'Network error';
    if (data.errors) {
        const first = Object.keys(data.errors)[0];
        return data.errors[first][0];
    }
    return data.message || 'An error occurred';
};

export const useAssistantStore = create((set, get) => ({
    // ── Panel state ──────────────────────────────────────────
    isOpen: false,
    activeTab: 'chat', // 'chat' | 'plan' | 'reflect'

    // ── Conversations list ───────────────────────────────────
    conversations: [],
    conversationsLoading: false,

    // ── Current conversation ─────────────────────────────────
    currentConversationId: null,
    messages: [],

    // ── Sending state ────────────────────────────────────────
    sending: false,
    error: null,

    // ── Study plan ───────────────────────────────────────────
    studyPlan: null,
    studyPlanLoading: false,
    studyPlanError: null,

    // ── Reflection ───────────────────────────────────────────
    reflectionError: null,
    
    // ── Quiz Ready Modal ──────────────────────────────────────
    quizReady: null, // { quizId, materialId }

    // ── Actions ──────────────────────────────────────────────

    openPanel: (tab = 'chat') =>
        set({ isOpen: true, activeTab: tab }),

    closePanel: () =>
        set({ isOpen: false }),

    togglePanel: () =>
        set((s) => ({ isOpen: !s.isOpen })),

    setActiveTab: (tab) =>
        set({ activeTab: tab }),

    /**
     * Send a chat message. Appends optimistic user bubble, then waits for reply.
     */
    sendMessage: async (text, contextType = 'general', contextId = null) => {
        if (!text.trim()) return;

        // Optimistic: add user message immediately
        const tempUserMsg = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: text,
            created_at: new Date().toISOString(),
        };

        set((s) => ({
            messages: [...s.messages, tempUserMsg],
            sending: true,
            error: null,
        }));

        try {
            const res = await assistantApi.chat({
                message: text,
                conversationId: get().currentConversationId,
                contextType,
                contextId,
            });

            const { conversation_id, title, reply, latency_ms } = res.data.data;

            const assistantMsg = {
                id: `reply-${Date.now()}`,
                role: 'assistant',
                content: reply,
                latency_ms,
                created_at: new Date().toISOString(),
            };

            set((s) => ({
                currentConversationId: conversation_id,
                messages: [...s.messages, assistantMsg],
                sending: false,
            }));

            // 🚗 Handle Automated Redirections (e.g. Starting a Quiz)
            console.log("Assistant Reply Phase:", reply?.phase);
            if (reply?.phase === 'quiz_active') {
                const quizId = reply?.payload?.quiz_id;
                const materialId = reply?.payload?.content_id;
                
                if (quizId && materialId) {
                    set({
                        quizReady: { quizId, materialId }
                    });
                }
            }



            // Update conversation list title if it changed
            if (title) {
                set((s) => ({
                    conversations: s.conversations.map((c) =>
                        c.id === conversation_id ? { ...c, title } : c
                    ),
                }));
            }

            // If this was a new conversation, add it to the list
            if (!get().conversations.find((c) => c.id === conversation_id)) {
                set((s) => ({
                    conversations: [{ id: conversation_id, title, context_type: contextType, updated_at: new Date().toISOString() }, ...s.conversations],
                }));
            }

        } catch (err) {
            set({ sending: false, error: parseError(err) });
        }
    },

    /**
     * Start a fresh conversation (clear current context).
     */
    newConversation: () =>
        set({ currentConversationId: null, messages: [], error: null }),

    /**
     * Load an existing conversation's messages.
     */
    loadConversation: async (id) => {
        set({ sending: true, error: null });
        try {
            const res = await assistantApi.getConversation(id);
            const conv = res.data.data;
            set({
                currentConversationId: id,
                messages: conv.messages || [],
                sending: false,
            });
        } catch (err) {
            set({ sending: false, error: parseError(err) });
        }
    },

    /**
     * Fetch all conversations list.
     */
    fetchConversations: async () => {
        set({ conversationsLoading: true });
        try {
            const res = await assistantApi.getConversations();
            set({ conversations: res.data.data || [], conversationsLoading: false });
        } catch {
            set({ conversationsLoading: false });
        }
    },

    /**
     * Delete a conversation.
     */
    deleteConversation: async (id) => {
        try {
            await assistantApi.deleteConversation(id);
            set((s) => ({
                conversations: s.conversations.filter((c) => c.id !== id),
                currentConversationId: s.currentConversationId === id ? null : s.currentConversationId,
                messages: s.currentConversationId === id ? [] : s.messages,
            }));
        } catch (err) {
            set({ error: parseError(err) });
        }
    },

    /**
     * Generate a study plan.
     */
    generateStudyPlan: async (goal, durationDays, dailyMinutes) => {
        set({ studyPlanLoading: true, studyPlanError: null, studyPlan: null });
        try {
            const res = await assistantApi.generateStudyPlan({ goal, durationDays, dailyMinutes });
            set({ studyPlan: res.data.data.plan, studyPlanLoading: false });
        } catch (err) {
            set({ studyPlanError: parseError(err), studyPlanLoading: false });
        }
    },

    /**
     * Get progress reflection.
     */
    getReflection: async () => {
        set({ reflectionLoading: true, reflectionError: null, reflection: null });
        try {
            const res = await assistantApi.getReflection();
            set({ reflection: res.data.data.reflection, reflectionLoading: false });
        } catch (err) {
            set({ reflectionError: parseError(err), reflectionLoading: false });
        }
    },
    clearQuizReady: () =>
        set({ quizReady: null }),
}));

