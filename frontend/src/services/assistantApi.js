import api from './api';

export const assistantApi = {
    // ── Conversations ─────────────────────────────────────────
    getConversations: () =>
        api.get('/v1/assistant/conversations'),

    getConversation: (id) =>
        api.get(`/v1/assistant/conversations/${id}`),

    deleteConversation: (id) =>
        api.delete(`/v1/assistant/conversations/${id}`),

    // ── Chat ──────────────────────────────────────────────────
    chat: ({ message, conversationId = null, contextType = 'general', contextId = null }) =>
        api.post('/v1/assistant/chat', {
            message,
            conversation_id: conversationId,
            context_type: contextType,
            context_id: contextId,
        }),

    // ── Study Plan ────────────────────────────────────────────
    generateStudyPlan: ({ goal, durationDays, dailyMinutes }) =>
        api.post('/v1/assistant/study-plan/generate', {
            goal,
            duration_days: durationDays,
            daily_minutes: dailyMinutes,
        }),

    // ── Reflection ────────────────────────────────────────────
    getReflection: () =>
        api.post('/v1/assistant/reflection'),

    // ── Preferences ───────────────────────────────────────────
    getPreferences: () =>
        api.get('/v1/assistant/preferences'),

    updatePreferences: (data) =>
        api.patch('/v1/assistant/preferences', data),
};
