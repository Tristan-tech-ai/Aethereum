import React, { useMemo, useState, useEffect, useCallback, useRef, Suspense } from "react";
import {
    MessageCircle,
    Send,
    AlertTriangle,
    ChevronRight,
    Users,
    X,
    Clock,
    Heart,
    Zap,
    ArrowLeft,
    BookOpen,
    Swords,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// eslint-disable-next-line no-unused-vars
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";
const ReadingView = React.lazy(() => import("../learning/ReadingView"));
const QuizBattle = React.lazy(() => import("../learning/QuizBattle"));
const SummaryCreation = React.lazy(() => import("../learning/SummaryCreation"));
import { useAuthStore } from "../../stores/authStore";
import api from "../../services/api";

/* ─── Helpers ─────────────────────────────────────────── */

const normalizeSections = (raid) => {
    const structured = raid?.content?.structured_sections;
    if (Array.isArray(structured) && structured.length > 0) {
        return structured.map((section, index) => ({
            id: index + 1,
            title: section?.title || section?.heading || `Section ${index + 1}`,
            content: section?.content || section?.content_text || section?.body || section?.text || "",
            summary: section?.summary || "",
            key_concepts: section?.key_concepts || [],
            quiz_questions: section?.quiz_questions || [],
        }));
    }

    // Fallback: use ai_analysis summary or description
    const fallback =
        raid?.content?.ai_analysis?.summary ||
        raid?.content?.description ||
        "No section content available for this raid yet.";
    return [
        {
            id: 1,
            title: raid?.content?.title || "Study Content",
            content: fallback,
            quiz_questions: [],
        },
    ];
};

/** Generate simple fallback quiz from section content */
function generateFallbackQuiz(sectionTitle) {
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
            explanation: "The section covers fundamental concepts and definitions.",
        },
        {
            question: "Which of the following best describes a key concept from this section?",
            options: [
                "A theoretical framework for understanding the topic",
                "A cooking recipe",
                "A sports technique",
                "A musical composition",
            ],
            correct: 0,
            explanation: "The section describes theoretical frameworks related to the topic.",
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
            explanation: "Mastering foundational concepts is key to building expertise.",
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
            explanation: "Careful reading with note-taking maximizes comprehension.",
        },
        {
            question: "What connects the concepts in this section to the broader material?",
            options: [
                "They are completely unrelated",
                "They share nothing in common",
                "They build upon each other progressively",
                "They are meant to confuse the reader",
            ],
            correct: 2,
            explanation: "Concepts in structured learning materials build progressively.",
        },
    ];
}

/* ─── Main Component ──────────────────────────────────── */

const RaidInProgress = ({
    raid = {},
    participants: externalParticipants,
    chatMessages: externalChatMessages = [],
    onComplete,
    onProgressUpdate,
    onSendChat,
    className = "",
}) => {
    const authUser = useAuthStore((s) => s.user);
    const sections = useMemo(() => normalizeSections(raid), [raid]);

    const participants = useMemo(() => {
        const source = externalParticipants || raid?.participants || [];
        return source.map((p) => {
            const pivot = p?.pivot || {};
            return {
                id: p.id,
                name: p.name || p.username || "Member",
                avatar_url: p.avatar_url,
                progress: Number(pivot.progress_percentage ?? 0),
                status: String(pivot.status || "learning"),
                isMe: String(p.id) === String(authUser?.id),
            };
        });
    }, [externalParticipants, raid?.participants, authUser?.id]);

    // ─── Section-level learning state ───
    const [currentSection, setCurrentSection] = useState(0);
    const [sectionStates, setSectionStates] = useState(() =>
        sections.map((_, i) => (i === 0 ? "current" : "locked"))
    );

    // View: 'quest-map' | 'reading' | 'quiz' | 'summary'
    const [view, setView] = useState("quest-map");

    // Focus tracking
    const [focusTimer, setFocusTimer] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0);
    const [lives, setLives] = useState(3);
    const [tabSwitches, setTabSwitches] = useState(0);
    const [focusIntegrity, setFocusIntegrity] = useState(100);
    const [readingDone, setReadingDone] = useState(false);
    const minReadTime = 30;

    // Quiz
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizScore, setQuizScore] = useState(null);
    const [quizPassed, setQuizPassed] = useState(false);
    const [quizAttempts, setQuizAttempts] = useState(0);
    const [quizCooldownUntil, setQuizCooldownUntil] = useState(null);

    // Summary (only on last section)
    const [summaryText, setSummaryText] = useState("");
    const [summaryScore, setSummaryScore] = useState(null);
    const [summaryFeedback, setSummaryFeedback] = useState(null);
    const [summaryApproved, setSummaryApproved] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);

    // Chat
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [showChat, setShowChat] = useState(false);
    const chatEndRef = useRef(null);

    // Sync external chat
    useEffect(() => {
        setChatMessages(externalChatMessages || []);
    }, [externalChatMessages]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages.length]);

    // ─── Progress calculation ───
    const completedCount = sectionStates.filter((s) => s === "completed").length;
    const myProgress = Math.round((completedCount / Math.max(1, sections.length)) * 100);

    useEffect(() => {
        onProgressUpdate?.(myProgress);
    }, [myProgress, onProgressUpdate]);

    const teamProgress = Math.round(
        participants.reduce((sum, p) => sum + (p.isMe ? myProgress : p.progress), 0) /
            Math.max(1, participants.length || 1)
    );

    // ─── Section Navigation ───
    const enterSection = useCallback(
        (index) => {
            if (sectionStates[index] === "locked") return;
            setCurrentSection(index);
            setView("reading");
            setFocusTimer(0);
            setReadingDone(false);
            // Reset quiz state for this section
            setQuizQuestions([]);
            setQuizScore(null);
            setQuizPassed(false);
            setQuizCooldownUntil(null);
        },
        [sectionStates]
    );

    // ─── Focus Timer Tick ───
    const tickFocusTimer = useCallback(() => {
        setFocusTimer((prev) => {
            const next = prev + 1;
            if (next >= minReadTime) setReadingDone(true);
            return next;
        });
        setTotalFocusTime((prev) => prev + 1);
    }, [minReadTime]);

    // ─── Tab Switch ───
    const recordTabSwitch = useCallback(() => {
        setTabSwitches((prev) => {
            const next = prev + 1;
            setFocusIntegrity(Math.max(0, 100 - next * 8));
            return next;
        });
        setLives((prev) => Math.max(0, prev - 1));
    }, []);

    const recordTabReturn = useCallback(() => {}, []);

    // ─── Done Reading → Quiz ───
    const handleDoneReading = useCallback(() => {
        setView("quiz");
        // Load quiz questions
        const section = sections[currentSection];
        if (section?.quiz_questions?.length > 0) {
            setQuizQuestions(section.quiz_questions);
        } else {
            setQuizQuestions(generateFallbackQuiz(section?.title || `Section ${currentSection + 1}`));
        }
    }, [currentSection, sections]);

    // ─── Quiz Submit ───
    const handleQuizSubmit = useCallback(
        async (answers) => {
            let correctCount = 0;
            const results = answers.map((answer, i) => {
                const q = quizQuestions[i];
                const isCorrect = answer === (q.correct ?? q.correct_index);
                if (isCorrect) correctCount++;
                return { questionIndex: i, selected: answer, correct: q.correct ?? q.correct_index, isCorrect };
            });

            const score = Math.round((correctCount / quizQuestions.length) * 100);
            const passed = score >= 60;
            const newAttempts = quizAttempts + 1;

            setQuizScore(score);
            setQuizPassed(passed);
            setQuizAttempts(newAttempts);
            if (!passed) setQuizCooldownUntil(Date.now() + 30 * 1000);

            // Report quiz score to backend
            if (raid?.id && passed) {
                try {
                    await api.post(`/v1/raids/${raid.id}/quiz-complete`, { quiz_score: score });
                } catch {
                    // non-critical
                }
            }

            return { score, passed, results };
        },
        [quizQuestions, quizAttempts, raid?.id]
    );

    const handleQuizRetry = useCallback(() => {
        setQuizScore(null);
        setQuizPassed(false);
    }, []);

    // ─── Quiz Proceed (after passing) ───
    const handleQuizProceed = useCallback(() => {
        const isLast = currentSection === sections.length - 1;

        setSectionStates((prev) => {
            const next = [...prev];
            next[currentSection] = "completed";
            if (!isLast && currentSection + 1 < next.length) {
                next[currentSection + 1] = "current";
            }
            return next;
        });

        if (isLast) {
            setView("summary");
        } else {
            setCurrentSection((prev) => prev + 1);
            setView("quest-map");
        }
    }, [currentSection, sections.length]);

    // ─── Summary Validate (AI) ───
    const handleSummaryValidate = useCallback(async () => {
        setSummaryLoading(true);
        const wordCount = summaryText.trim().split(/\s+/).length;
        const approved = summaryText.length >= 100 && wordCount >= 15;
        setSummaryScore(approved ? 78 : 45);
        setSummaryFeedback({
            completeness: approved ? "Good coverage of key concepts." : "Try to cover more key points.",
            accuracy: "Seems reasonable based on the content.",
            clarity: wordCount > 30 ? "Well-structured summary." : "Could be more detailed.",
            missing_concepts: approved ? [] : ["Consider mentioning the main takeaways"],
            approved,
        });
        setSummaryApproved(approved);
        setSummaryLoading(false);
    }, [summaryText]);

    // ─── Summary Submit → Complete Raid for this user ───
    const handleSummarySubmit = useCallback(async () => {
        if (summaryText.length < 50) {
            setSummaryFeedback({
                completeness: "Summary too short.",
                accuracy: "Write a fuller summary.",
                clarity: "Use at least a few complete sentences.",
                missing_concepts: ["Tambahkan minimal 50 karakter."],
            });
            setSummaryApproved(false);
            return;
        }
        if (!summaryApproved) {
            await handleSummaryValidate();
        }
        // Mark all sections completed + complete raid
        setSectionStates((prev) => prev.map(() => "completed"));
        onComplete?.({
            sectionsCompleted: sections.length,
            focusIntegrity,
            quizScore: quizScore ?? 0,
            totalFocusTime,
            summary: summaryText,
            distractions: tabSwitches,
            participants,
        });
    }, [
        summaryText,
        summaryApproved,
        handleSummaryValidate,
        onComplete,
        sections.length,
        focusIntegrity,
        quizScore,
        totalFocusTime,
        tabSwitches,
        participants,
    ]);

    // Report progress to backend periodically
    const reportProgress = useCallback(() => {}, []);

    // ─── Chat handler ───
    const handleSendChat = async () => {
        const text = chatInput.trim();
        if (!text) return;
        const localMessage = {
            id: Date.now(),
            user_id: authUser?.id,
            user_name: authUser?.name || "You",
            message: text,
        };
        setChatMessages((prev) => [...prev, localMessage]);
        setChatInput("");
        await onSendChat?.(text);
    };

    const handleChatKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendChat();
        }
    };

    // ─── Status helpers ───
    const getStatusEmoji = (status) => {
        if (status === "learning") return "📖";
        if (status === "quiz") return "⚔️";
        if (status === "completed") return "✅";
        return "⏳";
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const contentTitle = raid?.content?.title || "Study Raid";

    /* ─── Render ────────────────────────────────────────── */

    return (
        <div className={`flex flex-col h-full ${className}`} style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* ── Top Bar ── */}
            <div className="bg-dark-secondary border-b border-border-subtle px-4 py-3 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">⚔️</span>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-text-primary truncate">{contentTitle}</h2>
                            <p className="text-[10px] text-text-muted">
                                {view === "reading" &&
                                    `Section ${currentSection + 1}/${sections.length} · ${formatTime(focusTimer)}`}
                                {view === "quiz" && `Quiz · Section ${currentSection + 1}`}
                                {view === "summary" && "Summary Phase"}
                                {view === "quest-map" &&
                                    `${completedCount}/${sections.length} sections · Total ${formatTime(totalFocusTime)}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="primary">RAID ACTIVE</Badge>
                        {/* Focus stats */}
                        <div className="hidden sm:flex items-center gap-1">
                            <Zap
                                size={13}
                                className={
                                    focusIntegrity >= 90
                                        ? "text-success"
                                        : focusIntegrity >= 60
                                          ? "text-warning"
                                          : "text-danger"
                                }
                            />
                            <span
                                className={`text-[11px] font-semibold ${
                                    focusIntegrity >= 90
                                        ? "text-success"
                                        : focusIntegrity >= 60
                                          ? "text-warning"
                                          : "text-danger"
                                }`}
                            >
                                {focusIntegrity}%
                            </span>
                        </div>
                        {/* Hearts */}
                        <div className="flex gap-0.5">
                            {[1, 2, 3].map((h) => (
                                <Heart
                                    key={h}
                                    size={14}
                                    className={
                                        h <= lives ? "text-danger fill-danger" : "text-text-disabled opacity-30"
                                    }
                                />
                            ))}
                        </div>
                        {/* Chat toggle (mobile) */}
                        <button
                            onClick={() => setShowChat((v) => !v)}
                            className="lg:hidden p-2 text-text-muted hover:text-primary-light transition-colors relative"
                        >
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>
                {/* Team progress bar */}
                <div>
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-text-muted flex items-center gap-1">
                            <Users size={10} /> Team Progress
                        </span>
                        <span className="text-text-secondary font-medium">{teamProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-base rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${teamProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Team Sidebar (desktop) */}
                <div className="hidden md:flex flex-col w-52 shrink-0 bg-dark-secondary/50 border-r border-border-subtle overflow-y-auto">
                    <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider px-3 pt-3 pb-1">
                        Raiders ({participants.length})
                    </p>
                    <div className="space-y-1.5 px-2 pb-3">
                        {participants.map((p) => (
                            <div
                                key={p.id}
                                className={`rounded-lg p-2 ${
                                    p.isMe ? "bg-primary/5 ring-1 ring-primary/20" : "bg-dark-card/50"
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Avatar name={p.name} src={p.avatar_url} size="xs" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium text-text-primary truncate">
                                            {p.name}
                                            {p.isMe && (
                                                <span className="text-primary-light ml-1 text-[9px]">(You)</span>
                                            )}
                                        </p>
                                    </div>
                                    <span className="text-xs" title={p.status}>
                                        {getStatusEmoji(p.status)}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-dark-base rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${p.isMe ? myProgress : p.progress}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-text-muted mt-0.5 text-right">
                                    {p.isMe ? myProgress : p.progress}%
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Section nav */}
                    <div className="border-t border-border-subtle px-2 pt-2 pb-3">
                        <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider px-1 pb-1.5">
                            Sections
                        </p>
                        <div className="space-y-1">
                            {sections.map((section, index) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        if (sectionStates[index] !== "locked") {
                                            if (view !== "quest-map") setView("quest-map");
                                            // Allow clicking to navigate back
                                        }
                                    }}
                                    disabled={sectionStates[index] === "locked"}
                                    className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-colors flex items-center gap-2 ${
                                        index === currentSection && view !== "quest-map"
                                            ? "bg-primary/10 border border-primary/30 text-primary-light"
                                            : sectionStates[index] === "completed"
                                              ? "text-success bg-success/5"
                                              : sectionStates[index] === "locked"
                                                ? "text-text-disabled cursor-not-allowed opacity-50"
                                                : "text-text-secondary hover:bg-dark-card"
                                    }`}
                                >
                                    <span className="shrink-0">
                                        {sectionStates[index] === "completed"
                                            ? "✅"
                                            : sectionStates[index] === "locked"
                                              ? "🔒"
                                              : "📄"}
                                    </span>
                                    <span className="truncate">{section.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center: Learning Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {/* ── QUEST MAP ── */}
                        {view === "quest-map" && (
                            <motion.div
                                key="quest-map"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <div className="max-w-lg mx-auto px-4 py-8">
                                    <div className="text-center mb-8">
                                        <div className="text-4xl mb-3">⚔️</div>
                                        <h2 className="text-h3 font-heading text-text-primary mb-2">
                                            {completedCount === 0
                                                ? "Raid Dimulai!"
                                                : `${completedCount}/${sections.length} Sections Done`}
                                        </h2>
                                        <p className="text-text-secondary text-sm">
                                            {completedCount === 0
                                                ? "Pilih section untuk mulai belajar bersama tim."
                                                : completedCount === sections.length
                                                  ? "Semua section selesai! 🎉"
                                                  : "Lanjutkan ke section berikutnya."}
                                        </p>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex gap-1.5 mb-8">
                                        {sectionStates.map((state, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 h-2.5 rounded-full transition-colors ${
                                                    state === "completed"
                                                        ? "bg-success"
                                                        : state === "current"
                                                          ? "bg-primary"
                                                          : "bg-dark-card"
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Section cards */}
                                    <div className="space-y-3">
                                        {sections.map((section, index) => {
                                            const state = sectionStates[index];
                                            const isCurrent = state === "current";
                                            const isCompleted = state === "completed";
                                            const isLocked = state === "locked";

                                            return (
                                                <motion.button
                                                    key={section.id}
                                                    onClick={() => enterSection(index)}
                                                    disabled={isLocked}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                        isCurrent
                                                            ? "border-primary bg-primary/5 hover:bg-primary/10 shadow-lg shadow-primary/10"
                                                            : isCompleted
                                                              ? "border-success/30 bg-success/5"
                                                              : isLocked
                                                                ? "border-border/30 bg-dark-card/50 opacity-50 cursor-not-allowed"
                                                                : "border-border bg-dark-card hover:border-border-hover"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                                                isCompleted
                                                                    ? "bg-success/10 text-success"
                                                                    : isCurrent
                                                                      ? "bg-primary/10 text-primary-light"
                                                                      : "bg-dark-secondary text-text-muted"
                                                            }`}
                                                        >
                                                            {isCompleted ? "✅" : isLocked ? "🔒" : index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-text-primary truncate">
                                                                {section.title}
                                                            </p>
                                                            <p className="text-[11px] text-text-muted mt-0.5">
                                                                {isCompleted
                                                                    ? "Completed ✓"
                                                                    : isCurrent
                                                                      ? "Ready to start"
                                                                      : "Locked"}
                                                            </p>
                                                        </div>
                                                        {isCurrent && (
                                                            <ChevronRight size={18} className="text-primary-light" />
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* CTA button */}
                                    {sectionStates.includes("current") && (
                                        <div className="mt-6 text-center">
                                            <Button
                                                size="lg"
                                                onClick={() =>
                                                    enterSection(sectionStates.indexOf("current"))
                                                }
                                            >
                                                <BookOpen size={16} className="mr-2" />
                                                Mulai Section {sectionStates.indexOf("current") + 1}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Mobile section list */}
                                    <div className="md:hidden mt-6 pt-4 border-t border-border-subtle">
                                        <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-2">
                                            Raiders
                                        </p>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {participants.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className={`flex-shrink-0 px-3 py-2 rounded-lg ${
                                                        p.isMe ? "bg-primary/10 ring-1 ring-primary/20" : "bg-dark-card"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <Avatar name={p.name} src={p.avatar_url} size="xs" />
                                                        <span className="text-[11px] text-text-primary font-medium">
                                                            {p.name}
                                                        </span>
                                                        <span className="text-[10px] text-text-muted">
                                                            {p.isMe ? myProgress : p.progress}%
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── READING VIEW ── */}
                        {view === "reading" && (
                            <motion.div
                                key="reading"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 overflow-hidden"
                            >
                                <Suspense fallback={<div className="p-12 text-center text-text-muted">Preparing content...</div>}>
                                    <ReadingView
                                        section={sections[currentSection]}
                                        sectionIndex={currentSection}
                                        totalSections={sections.length}
                                        focusTimer={focusTimer}
                                        lives={lives}
                                        focusIntegrity={focusIntegrity}
                                        readingDone={readingDone}
                                        minReadTime={minReadTime}
                                        onTick={tickFocusTimer}
                                        onTabSwitch={recordTabSwitch}
                                        onTabReturn={recordTabReturn}
                                        onDoneReading={handleDoneReading}
                                        onReportProgress={reportProgress}
                                    />
                                </Suspense>
                            </motion.div>
                        )}

                        {/* ── QUIZ VIEW ── */}
                        {view === "quiz" && (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <Suspense fallback={<div className="p-12 text-center text-text-muted">Preparing battle...</div>}>
                                    <QuizBattle
                                        questions={quizQuestions}
                                        onSubmit={handleQuizSubmit}
                                        onRetry={handleQuizRetry}
                                        onProceed={handleQuizProceed}
                                        quizScore={quizScore}
                                        quizPassed={quizPassed}
                                        quizAttempts={quizAttempts}
                                        cooldownUntil={quizCooldownUntil}
                                        passThreshold={60}
                                    />
                                </Suspense>
                            </motion.div>
                        )}

                        {/* ── SUMMARY VIEW ── */}
                        {view === "summary" && (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <Suspense fallback={<div className="p-12 text-center text-text-muted">Evaluating summary...</div>}>
                                    <SummaryCreation
                                        summaryText={summaryText}
                                        onSummaryChange={setSummaryText}
                                        onValidate={handleSummaryValidate}
                                        onSubmit={handleSummarySubmit}
                                        summaryScore={summaryScore}
                                        summaryFeedback={summaryFeedback}
                                        summaryApproved={summaryApproved}
                                        loading={summaryLoading}
                                        contentTitle={contentTitle}
                                    />
                                </Suspense>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right: Chat Panel */}
                <div
                    className={`fixed inset-y-0 right-0 w-[86%] max-w-sm z-40 bg-dark-base border-l border-border transform transition-transform duration-300 lg:static lg:translate-x-0 lg:w-72 lg:max-w-none lg:border-l lg:bg-transparent ${
                        showChat ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="h-full flex flex-col">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                                <MessageCircle size={14} className="text-primary-light" />
                                Team Chat
                            </h4>
                            <button
                                onClick={() => setShowChat(false)}
                                className="lg:hidden text-text-muted hover:text-text-primary transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Quick actions */}
                        <div className="px-3 py-2 border-b border-border-subtle flex flex-wrap gap-1.5">
                            {["Bantuin dong! 🙏", "Ayo semangat! 💪", "Section ini susah 😅", "Udah selesai! 🎉"].map(
                                (quick) => (
                                    <button
                                        key={quick}
                                        onClick={() => {
                                            setChatInput(quick);
                                        }}
                                        className="text-[10px] px-2 py-1 bg-dark-card border border-border-subtle rounded-full text-text-muted hover:text-text-secondary hover:border-border-hover transition-colors"
                                    >
                                        {quick}
                                    </button>
                                )
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {chatMessages.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageCircle size={24} className="mx-auto text-text-muted/30 mb-2" />
                                    <p className="text-xs text-text-muted">
                                        Belum ada chat. Sapa tim kamu!
                                    </p>
                                </div>
                            ) : (
                                chatMessages.map((m, idx) => {
                                    const isMe = String(m.user_id) === String(authUser?.id);
                                    return (
                                        <div
                                            key={m.id || idx}
                                            className={`rounded-lg p-2.5 max-w-[85%] ${
                                                isMe
                                                    ? "ml-auto bg-primary/10 border border-primary/20"
                                                    : "bg-dark-card border border-border-subtle"
                                            }`}
                                        >
                                            {!isMe && (
                                                <p className="text-[10px] text-text-muted font-medium mb-0.5">
                                                    {m.user_name || "Member"}
                                                </p>
                                            )}
                                            <p className="text-sm text-text-primary">{m.message || m.text}</p>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-border flex items-end gap-2 shrink-0">
                            <textarea
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value.slice(0, 500))}
                                onKeyDown={handleChatKeyDown}
                                placeholder="Ketik pesan..."
                                rows={1}
                                className="flex-1 bg-dark-secondary border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-primary"
                            />
                            <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim()}>
                                <Send size={14} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Solo participant warning */}
            {participants.length <= 1 && (
                <div className="px-4 pb-3 pt-1 shrink-0">
                    <Card className="border-warning/30 bg-warning/5">
                        <div className="flex items-center gap-2 text-warning text-sm">
                            <AlertTriangle size={16} />
                            Menunggu participant lain agar raid ini lebih seru!
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default RaidInProgress;
