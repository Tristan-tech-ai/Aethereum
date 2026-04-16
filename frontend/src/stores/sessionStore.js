import { create } from "zustand";
import api from "../services/api";
import { useContentStore } from "./contentStore";
import { useAuthStore } from "./authStore";
import { useTaskStore } from "./taskStore";

/**
 * Session Store — manages Document Dungeon learning session state.
 *
 * API endpoints (Laravel backend — Phase 4.1):
 *   POST   /api/v1/sessions/start              — create session, return content + sections
 *   PATCH  /api/v1/sessions/:id/progress        — update section progress + focus events
 *   POST   /api/v1/sessions/:id/quiz-attempt     — submit & grade quiz
 *   POST   /api/v1/sessions/:id/validate-summary — AI validate user summary
 *   POST   /api/v1/sessions/:id/complete          — finish session, trigger rewards
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

export const useSessionStore = create((set, get) => ({
    // ─── State ───────────────────────────────
    session: null, // { id, content_id, flow_type, status, current_section, total_sections, ... }
    content: null, // { id, title, content_type, structured_sections, ai_analysis, ... }
    sections: [], // Array of { title, content (markdown), word_count, ... }
    currentSectionIndex: 0,
    sectionStates: [], // Array of 'locked' | 'current' | 'completed'

    // Focus tracking
    focusTimer: 0, // seconds elapsed in current section
    totalFocusTime: 0, // seconds total across session
    lives: 3, // focus hearts (max 3)
    tabSwitches: 0,
    distractionCount: 0,
    focusIntegrity: 100,
    isTabVisible: true,

    // Quiz state
    quizQuestions: [],
    quizAttempts: 0,
    quizScore: null,
    quizPassed: false,
    quizCooldownUntil: null, // timestamp when retry is allowed

    // Summary state
    summaryText: "",
    summaryScore: null,
    summaryFeedback: null,
    summaryApproved: false,

    // Session completion
    rewards: null, // { xp_breakdown, coins_earned, card, achievements, streak }
    knowledgeCard: null,

    // UI state
    view: "quest-map", // 'quest-map' | 'reading' | 'quiz' | 'summary' | 'complete'
    loading: false,
    error: null,
    readingDone: false,
    minReadTime: 30, // seconds minimum before "Done Reading" appears

    // ─── Actions ───────────────────────────────

    startSession: async (contentId, quizId = null) => {
        // ── Optimistic load ──
        const cachedContent = useContentStore.getState().currentContent;
        if (cachedContent?.id === contentId && cachedContent?.structured_sections?.length > 0) {
            const sections = cachedContent.structured_sections;
            set({
                session: { id: `pending-${Date.now()}`, status: "active", content_id: contentId },
                content: cachedContent,
                sections,
                currentSectionIndex: 0,
                sectionStates: sections.map((_, i) => i === 0 ? "current" : "locked"),
                view: quizId ? "quiz" : "quest-map", // Skip to quiz if quizId is provided
                loading: false,
                focusTimer: 0, totalFocusTime: 0, lives: 3,
                tabSwitches: 0, distractionCount: 0, focusIntegrity: 100,
                quizQuestions: [], quizAttempts: 0, quizScore: null,
                quizPassed: false, quizCooldownUntil: null,
                summaryText: "", summaryScore: null, summaryFeedback: null,
                summaryApproved: false, rewards: null, knowledgeCard: null, readingDone: false,
            });
            
            // If quizId is provided, fetch it specifically
            if (quizId) {
                setTimeout(() => get().fetchQuiz(quizId), 500);
            }

            api.post("/v1/sessions/start", { content_id: contentId })
                .then((res) => {
                    const data = res.data.data ?? res.data;
                    if (data.session) {
                        const s = data.session;
                        const secs = data.content?.structured_sections || sections;
                        set({
                            session: s,
                            currentSectionIndex: s.current_section ?? 0,
                            sectionStates: buildSectionStates(secs, s),
                            totalFocusTime: s.total_focus_time ?? 0,
                            focusIntegrity: s.focus_integrity ?? 100,
                            tabSwitches: s.tab_switches ?? 0,
                        });
                    }
                });
            return;
        }

        set({ loading: true, error: null });
        try {
            const res = await api.post("/v1/sessions/start", { content_id: contentId });
            const data = res.data.data ?? res.data;
            const sections = data.content?.structured_sections || data.sections || [];
            const s = data.session || { id: data.session_id, status: "active" };
            
            set({
                session: s,
                content: data.content || null,
                sections,
                currentSectionIndex: s.current_section ?? 0,
                sectionStates: buildSectionStates(sections, s),
                view: quizId ? "quiz" : "quest-map",
                loading: false,
                focusTimer: 0,
                totalFocusTime: s.total_focus_time ?? 0,
                lives: 3,
                tabSwitches: s.tab_switches ?? 0,
                distractionCount: 0,
                focusIntegrity: s.focus_integrity ?? 100,
                quizQuestions: [],
                quizAttempts: 0,
                quizScore: null,
                quizPassed: false,
                quizCooldownUntil: null,
                summaryText: "",
                summaryScore: null,
                summaryFeedback: null,
                summaryApproved: false,
                rewards: null,
                knowledgeCard: null,
                readingDone: false,
            });

            if (quizId) {
                get().fetchQuiz(quizId);
            }
        } catch (err) {
            set({ error: parseError(err), loading: false });
        }
    },

    /** Enter a section — start reading mode */
    enterSection: (index) => {
        const { sectionStates } = get();
        if (sectionStates[index] === "locked") return;

        set({
            currentSectionIndex: index,
            view: "reading",
            focusTimer: 0,
            readingDone: false,
            quizQuestions: [],
            quizScore: null,
            quizPassed: false,
            quizCooldownUntil: null,
            summaryText: "",
            summaryScore: null,
            summaryFeedback: null,
            summaryApproved: false,
        });
    },

    /** Update focus timer (called every second) */
    tickFocusTimer: () => {
        set((s) => ({
            focusTimer: s.focusTimer + 1,
            totalFocusTime: s.totalFocusTime + 1,
            readingDone: s.focusTimer + 1 >= s.minReadTime,
        }));
    },

    /** Record tab visibility change */
    recordTabSwitch: () => {
        const { lives, tabSwitches, distractionCount } = get();
        const newSwitches = tabSwitches + 1;
        const newDistractions = distractionCount + 1;
        const newLives = Math.max(0, lives - 1);
        // Focus integrity = max(0, 100 - (switches * 8))
        const newIntegrity = Math.max(0, 100 - newSwitches * 8);

        set({
            tabSwitches: newSwitches,
            distractionCount: newDistractions,
            lives: newLives,
            focusIntegrity: newIntegrity,
            isTabVisible: false,
        });
    },

    /** Record tab becoming visible again */
    recordTabReturn: () => {
        set({ isTabVisible: true });
    },

    /** Report progress to backend */
    reportProgress: async () => {
        const {
            session,
            currentSectionIndex,
            focusTimer,
            tabSwitches,
            focusIntegrity,
        } = get();
        if (!session?.id || session.id.startsWith("local-") || session.id.startsWith("pending-")) return;

        try {
            await api.patch(`/v1/sessions/${session.id}/progress`, {
                current_section: currentSectionIndex,
                focus_time: focusTimer,
                tab_switches: tabSwitches,
                focus_integrity: focusIntegrity,
            });
        } catch {
            // Silently fail — non-critical
        }
    },

    /** Done reading → go to quiz */
    finishReading: () => {
        set({ view: "quiz" });
        // Try to get quiz questions from backend
        get().fetchQuiz();
    },

    /** Fetch quiz questions for current section */
    fetchQuiz: async (quizId = null) => {
        const { session, currentSectionIndex, sections } = get();

        // Try fetching specifically by quizId if provided
        if (quizId && session?.id && !session.id.startsWith("local-") && !session.id.startsWith("pending-")) {
            try {
                const res = await api.get(`/v1/sessions/${session.id}/quiz`, {
                    params: { quiz_id: quizId },
                });
                const data = res.data.data ?? res.data;
                set({ quizQuestions: data.questions || data });
                return;
            } catch { /* fallback to section base */ }
        }

        // If section has embedded quiz questions, use them
        const section = sections[currentSectionIndex];
        if (section?.quiz_questions && section.quiz_questions.length > 0) {
            set({ quizQuestions: section.quiz_questions });
            return;
        }

        // Try fetching from backend
        if (session?.id && !session.id.startsWith("local-") && !session.id.startsWith("pending-")) {
            try {
                const res = await api.get(`/v1/sessions/${session.id}/quiz`, {
                    params: { section: currentSectionIndex },
                });
                const data = res.data.data ?? res.data;
                set({ quizQuestions: data.questions || data });
                return;
            } catch {
                // Fall through to generated quiz
            }
        }

        // Fallback: generate simple quiz from section content
        const sectionContent = section?.content || section?.body || "";
        set({
            quizQuestions: generateFallbackQuiz(
                sectionContent,
                section?.title || `Section ${currentSectionIndex + 1}`,
            ),
        });
    },

    /** Submit quiz answers */
    submitQuiz: async (answers) => {
        const { session, currentSectionIndex, quizQuestions, quizAttempts } =
            get();

        // Grade locally first
        let correctCount = 0;
        const results = answers.map((answer, i) => {
            const q = quizQuestions[i];
            const isCorrect =
                answer === q.correct || answer === q.correct_index;
            if (isCorrect) correctCount++;
            return {
                questionIndex: i,
                selected: answer,
                correct: q.correct ?? q.correct_index,
                isCorrect,
            };
        });

        const score = Math.round((correctCount / quizQuestions.length) * 100);
        const passed = score >= 70;
        const newAttempts = quizAttempts + 1;

        // Try submitting to backend
        if (session?.id && !session.id.startsWith("local-") && !session.id.startsWith("pending-")) {
            try {
                const res = await api.post(
                    `/v1/sessions/${session.id}/quiz-attempt`,
                    {
                        section_index: currentSectionIndex,
                        answers: answers.map((selected, i) => ({
                            question_index: i,
                            selected_index: selected,
                        })),
                    },
                );
                const data = res.data.data ?? res.data;
                set({
                    quizScore: data.score ?? score,
                    quizPassed: data.passed ?? passed,
                    quizAttempts: newAttempts,
                    quizCooldownUntil: passed
                        ? null
                        : Date.now() + 30 * 1000,
                });
                return {
                    score: data.score ?? score,
                    passed: data.passed ?? passed,
                    results,
                };
            } catch {
                // Fall through to local grading
            }
        }

        set({
            quizScore: score,
            quizPassed: passed,
            quizAttempts: newAttempts,
            quizCooldownUntil: passed ? null : Date.now() + 30 * 1000,
        });
        return { score, passed, results };
    },

    /** Retry quiz (reset quiz state, keep cooldown) */
    retryQuiz: () => {
        set({
            quizScore: null,
            quizPassed: false,
            view: "quiz",
        });
    },

    /** After quiz passed → go to summary (for last section) or next section */
    proceedAfterQuiz: () => {
        const { currentSectionIndex, sections, sectionStates } = get();
        const isLast = currentSectionIndex === sections.length - 1;
        const nextIndex = currentSectionIndex + 1;

        if (isLast) {
            set({ view: "summary" });
        } else {
            const newStates = [...sectionStates];
            newStates[currentSectionIndex] = "completed";
            if (nextIndex < newStates.length) {
                newStates[nextIndex] = "current";
            }
            set({
                sectionStates: newStates,
                currentSectionIndex: nextIndex,
                view: "quest-map",
            });
            // Auto-save: backend marks old section as completed when current_section advances
            setTimeout(() => get().reportProgress(), 100);
        }
    },

    /** Mark current section completed + move to next or summary */
    completeCurrentSection: () => {
        const { currentSectionIndex, sections, sectionStates } = get();
        const newStates = [...sectionStates];
        newStates[currentSectionIndex] = "completed";

        const isLast = currentSectionIndex === sections.length - 1;
        const nextIndex = currentSectionIndex + 1;
        if (!isLast && nextIndex < newStates.length) {
            newStates[nextIndex] = "current";
        }

        if (isLast) {
            set({ sectionStates: newStates, view: "summary" });
        } else {
            set({ sectionStates: newStates, currentSectionIndex: nextIndex, view: "quest-map" });
            // Auto-save: backend marks old section as completed when current_section advances
            setTimeout(() => get().reportProgress(), 100);
        }
    },

    /** Update summary text */
    setSummaryText: (text) => set({ summaryText: text }),

    /** Validate summary with AI */
    validateSummary: async () => {
        const { session, summaryText } = get();
        set({ loading: true });

        if (session?.id && !session.id.startsWith("local-") && !session.id.startsWith("pending-")) {
            try {
                const res = await api.post(
                    `/v1/sessions/${session.id}/validate-summary`,
                    {
                        summary: summaryText,
                    },
                );
                const data = res.data.data ?? res.data;

                set({
                    summaryScore: data.score ?? null,
                    summaryFeedback: data.feedback ?? data,
                    summaryApproved: data.approved ?? data.score >= 60,
                    loading: false,
                });
                return;
            } catch {
                // Fallback
            }
        }

        // Fallback: local validation
        const wordCount = summaryText.trim().split(/\s+/).length;
        const approved = summaryText.length >= 100 && wordCount >= 15;
        set({
            summaryScore: approved ? 78 : 45,
            summaryFeedback: {
                completeness: approved
                    ? "Good coverage of key concepts."
                    : "Try to cover more key points.",
                accuracy: "Seems reasonable based on the content.",
                clarity:
                    wordCount > 30
                        ? "Well-structured summary."
                        : "Could be more detailed.",
                missing_concepts: approved
                    ? []
                    : ["Consider mentioning the main takeaways"],
                approved,
            },
            summaryApproved: approved,
            loading: false,
        });
    },

    /** Complete session */
    completeSession: async () => {
        const {
            session,
            summaryText,
            totalFocusTime,
            quizScore,
            focusIntegrity,
            content,
        } = get();

        const cleanedSummary = (summaryText || "").trim();
        if (cleanedSummary.length < 50) {
            set({
                summaryApproved: false,
                summaryScore: null,
                summaryFeedback: {
                    completeness: "Summary too short.",
                    accuracy: "Write a fuller summary based on the section content.",
                    clarity: "Use at least a few complete sentences.",
                    missing_concepts: ["Tambahkan minimal 50 karakter agar bisa direview AI."],
                },
            });
            return { success: false, reason: "summary_too_short" };
        }

        // Auto-validate on submit if not approved yet.
        // We still proceed to complete even if score is low — AI check is advisory.
        if (!get().summaryApproved) {
            await get().validateSummary();
        }

        set({ loading: true });

        if (session?.id && !session.id.startsWith("local-") && !session.id.startsWith("pending-")) {
            try {
                const res = await api.post(
                    `/v1/sessions/${session.id}/complete`,
                    {
                        summary: cleanedSummary,
                        actual_duration: Math.floor(totalFocusTime / 60),
                    },
                );
                const data = res.data.data ?? res.data;

                set({
                    rewards: data.rewards || data,
                    knowledgeCard: data.card || data.knowledge_card || null,
                    view: "complete",
                    loading: false,
                });

                // Refresh global user XP/coins and sidebar task counters
                await Promise.allSettled([
                    useAuthStore.getState().syncUser(),
                    useTaskStore.getState().fetchSummary(),
                ]);

                return;
            } catch {
                // Fallback
            }
        }

        // Fallback: generate local rewards
        const mastery = Math.round(
            (quizScore || 80) * 0.4 +
                focusIntegrity * 0.3 +
                (summaryText.length >= 100 ? 80 : 50) * 0.3,
        );
        const tier =
            mastery >= 100
                ? "diamond"
                : mastery >= 90
                  ? "gold"
                  : mastery >= 80
                    ? "silver"
                    : "bronze";

        const xpBreakdown = [
            {
                label: "Sections Complete",
                xp: 20 * (get().sections.length || 1),
            },
            { label: "Quiz Score", xp: (quizScore || 0) >= 70 ? 30 : 0 },
            {
                label: "Perfect Quiz Bonus",
                xp: (quizScore || 0) === 100 ? 20 : 0,
            },
            { label: "Summary Approved", xp: 25 },
            {
                label: "Focus Integrity ≥90%",
                xp: focusIntegrity >= 90 ? 15 : 0,
            },
        ];
        const totalXP = xpBreakdown.reduce((sum, x) => sum + x.xp, 0);
        const coins =
            10 +
            Math.floor(focusIntegrity / 10) +
            Math.floor((quizScore || 0) / 10);

        set({
            rewards: {
                xp_breakdown: xpBreakdown,
                total_xp: totalXP,
                coins_earned: coins,
                streak_update: { current: 1, is_new_day: true },
                achievements: [],
            },
            knowledgeCard: {
                title: content?.title || "Learning Complete",
                subject: content?.subject_category || "General",
                mastery,
                tier,
                quiz_score: quizScore || 80,
                focus_score: focusIntegrity,
                time_spent: Math.floor(totalFocusTime / 60),
            },
            view: "complete",
            loading: false,
        });
    },

    /** Reset session state */
    resetSession: () => {
        set({
            session: null,
            content: null,
            sections: [],
            currentSectionIndex: 0,
            sectionStates: [],
            focusTimer: 0,
            totalFocusTime: 0,
            lives: 3,
            tabSwitches: 0,
            distractionCount: 0,
            focusIntegrity: 100,
            isTabVisible: true,
            quizQuestions: [],
            quizAttempts: 0,
            quizScore: null,
            quizPassed: false,
            quizCooldownUntil: null,
            summaryText: "",
            summaryScore: null,
            summaryFeedback: null,
            summaryApproved: false,
            rewards: null,
            knowledgeCard: null,
            view: "quest-map",
            loading: false,
            error: null,
            readingDone: false,
        });
    },
}));

// ─── Helper: Reconstruct sectionStates from backend session data ──────────
/**
 * Build the sectionStates array from backend session data.
 * Correctly marks sections as 'completed', 'current', or 'locked'
 * so resumed sessions start from the right position.
 */
function buildSectionStates(sections, sessionData) {
    const completedSet = new Set(sessionData?.progress_data?.sections_completed ?? []);
    const currentIdx = sessionData?.current_section ?? 0;
    return sections.map((_, i) => {
        if (completedSet.has(i)) return "completed";
        if (i === currentIdx) return "current";
        if (i < currentIdx) return "completed"; // fallback for any missed completions
        return "locked";
    });
}

// ─── Helper: Generate fallback quiz from content ─────────────
function generateFallbackQuiz(content, sectionTitle) {
    // Basic fallback quiz when backend is unavailable
    return [
        {
            question: `What is the main topic covered in "${sectionTitle}"?`,
            options: [
                "The fundamental concepts and definitions",
                "Advanced implementation details",
                "Historical background only",
                "Unrelated subject matter",
            ],
            correct: 0,
            explanation:
                "The section covers fundamental concepts and definitions.",
        },
        {
            question:
                "Which of the following best describes a key concept from this section?",
            options: [
                "A theoretical framework for understanding the topic",
                "A cooking recipe",
                "A sports technique",
                "A musical composition",
            ],
            correct: 0,
            explanation:
                "The section describes theoretical frameworks related to the topic.",
        },
        {
            question: "What is an important takeaway from this material?",
            options: [
                "Understanding is not needed",
                "The concepts have no practical application",
                "Mastering these concepts builds a strong foundation",
                "This material is purely entertainment",
            ],
            correct: 2,
            explanation:
                "Mastering foundational concepts is key to building expertise.",
        },
        {
            question: "How should you approach reviewing this material?",
            options: [
                "Skim through quickly without focus",
                "Read carefully and take notes on key points",
                "Ignore all examples and diagrams",
                "Only look at the title",
            ],
            correct: 1,
            explanation:
                "Careful reading with note-taking maximizes comprehension.",
        },
        {
            question:
                "What connects the concepts in this section to the broader material?",
            options: [
                "They are completely unrelated",
                "They share nothing in common",
                "They build upon each other progressively",
                "They are meant to confuse the reader",
            ],
            correct: 2,
            explanation:
                "Concepts in structured learning materials build progressively.",
        },
    ];
}

export default useSessionStore;
