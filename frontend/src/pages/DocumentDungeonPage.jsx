import React, { useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Heart,
    Clock,
    Zap,
    Loader2,
    AlertTriangle,
    BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSessionStore } from "../stores/sessionStore";
import QuestMap from "../components/learning/QuestMap";
import ReadingView from "../components/learning/ReadingView";
import QuizBattle from "../components/learning/QuizBattle";
import SummaryCreation from "../components/learning/SummaryCreation";
import SessionComplete from "../components/learning/SessionComplete";
import Button from "../components/ui/Button";

/**
 * DocumentDungeonPage — Full-screen immersive learning session.
 *
 * DRD 7.6 Layout:
 *   1. Top Bar: Exit button, Session title, Focus timer, Focus hearts
 *   2. Quest Map sidebar (desktop) / collapsible (mobile)
 *   3. Reading Area / Quiz / Summary / Complete views
 *   4. Action Bar (bottom) for reading mode
 *
 * Route: /learn/:materialId (outside App layout, full-screen)
 *
 * API: Calls sessionStore which integrates with backend session APIs.
 *       Falls back to local content if backend session endpoints aren't ready.
 */

const DocumentDungeonPage = () => {
    const navigate = useNavigate();
    const { materialId } = useParams();

    const {
        session,
        content,
        sections,
        currentSectionIndex,
        sectionStates,
        focusTimer,
        totalFocusTime,
        lives,
        tabSwitches,
        focusIntegrity,
        quizQuestions,
        quizScore,
        quizPassed,
        quizAttempts,
        quizCooldownUntil,
        summaryText,
        summaryScore,
        summaryFeedback,
        summaryApproved,
        rewards,
        knowledgeCard,
        view,
        loading,
        error,
        readingDone,
        minReadTime,
        startSession,
        enterSection,
        tickFocusTimer,
        recordTabSwitch,
        recordTabReturn,
        reportProgress,
        finishReading,
        submitQuiz,
        retryQuiz,
        proceedAfterQuiz,
        completeCurrentSection,
        setSummaryText,
        validateSummary,
        completeSession,
        resetSession,
    } = useSessionStore();

    // ── Start session on mount ──
    useEffect(() => {
        if (materialId) {
            startSession(materialId);
        }
        return () => {
            resetSession();
        };
    }, [materialId]);

    // ── Handlers ──
    const handleExit = useCallback(() => {
        if (view === "complete") {
            navigate("/library");
        } else {
            const confirm = window.confirm(
                "Are you sure you want to exit? Your progress in this section will be lost.",
            );
            if (confirm) {
                reportProgress();
                navigate(-1);
            }
        }
    }, [view, navigate, reportProgress]);

    const handleEnterSection = useCallback(
        (index) => {
            enterSection(index);
        },
        [enterSection],
    );

    const handleDoneReading = useCallback(() => {
        finishReading();
    }, [finishReading]);

    const handleQuizSubmit = useCallback(
        async (answers) => {
            return await submitQuiz(answers);
        },
        [submitQuiz],
    );

    const handleQuizRetry = useCallback(() => {
        retryQuiz();
    }, [retryQuiz]);

    const handleQuizProceed = useCallback(() => {
        // Mark current section as completed, move to next or summary
        completeCurrentSection();
    }, [completeCurrentSection]);

    const handleSummaryValidate = useCallback(async () => {
        await validateSummary();
    }, [validateSummary]);

    const handleSummarySubmit = useCallback(async () => {
        await completeSession();
    }, [completeSession]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const completedCount = sectionStates.filter(
        (s) => s === "completed",
    ).length;
    const contentTitle = content?.title || "Document Dungeon";

    // ── Loading state ──
    if (loading && !session) {
        return (
            <div className="fixed inset-0 bg-dark-base z-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        className="mb-4 inline-block"
                    >
                        <Loader2 size={40} className="text-primary" />
                    </motion.div>
                    <h2 className="text-h3 font-heading text-text-primary mb-2">
                        Preparing your dungeon...
                    </h2>
                    <p className="text-text-muted text-sm">
                        Loading content and generating challenges
                    </p>
                </div>
            </div>
        );
    }

    // ── Error state ──
    if (error && !session) {
        return (
            <div className="fixed inset-0 bg-dark-base z-50 flex items-center justify-center">
                <div className="text-center max-w-sm mx-4">
                    <AlertTriangle
                        size={48}
                        className="text-danger mx-auto mb-4"
                    />
                    <h2 className="text-h3 font-heading text-text-primary mb-2">
                        Failed to Load
                    </h2>
                    <p className="text-text-secondary text-sm mb-6">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <Button
                            variant="secondary"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                        <Button onClick={() => startSession(materialId)}>
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── No sections fallback ──
    if (session && sections.length === 0) {
        return (
            <div className="fixed inset-0 bg-dark-base z-50 flex items-center justify-center">
                <div className="text-center max-w-sm mx-4">
                    <BookOpen
                        size={48}
                        className="text-text-muted mx-auto mb-4"
                    />
                    <h2 className="text-h3 font-heading text-text-primary mb-2">
                        No Sections Found
                    </h2>
                    <p className="text-text-secondary text-sm mb-6">
                        This content hasn't been analyzed yet. Please wait for
                        AI processing to complete.
                    </p>
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/library")}
                    >
                        Back to Library
                    </Button>
                </div>
            </div>
        );
    }

    // ── Session complete — full screen ──
    if (view === "complete") {
        return (
            <div className="fixed inset-0 bg-dark-base z-50 flex flex-col overflow-hidden">
                {/* Minimal top bar */}
                <div className="h-14 bg-dark-secondary border-b border-border-subtle flex items-center px-4 shrink-0">
                    <button
                        onClick={() => navigate("/library")}
                        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm hidden sm:inline">
                            Back to Library
                        </span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <SessionComplete
                        rewards={rewards}
                        knowledgeCard={knowledgeCard}
                        onViewProfile={() => navigate("/profile")}
                        onContinueLearning={() => navigate("/library")}
                        onShareProfile={() => navigate("/profile")}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-dark-base z-50 flex flex-col overflow-hidden">
            {/* ── Top Bar ── */}
            <div className="h-14 bg-dark-secondary border-b border-border-subtle relative flex items-center justify-between px-4 shrink-0">
                {/* Left: Exit */}
                <button
                    onClick={handleExit}
                    className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm hidden sm:inline">Exit</span>
                </button>

                {/* Center: Title + section info — absolutely centered on the full bar */}
                <div className="absolute left-1/2 -translate-x-1/2 text-center max-w-[40%] pointer-events-none">
                    <h2 className="text-sm font-semibold text-text-primary truncate">
                        {contentTitle}
                    </h2>
                    {view === "reading" && (
                        <span className="text-[11px] text-text-muted">
                            Section {currentSectionIndex + 1}/{sections.length}
                        </span>
                    )}
                </div>

                {/* Right: Focus stats */}
                <div className="flex items-center gap-3 md:gap-4">
                    {/* Timer */}
                    <div className="flex items-center gap-1">
                        <Clock
                            size={14}
                            className="text-text-muted hidden sm:block"
                        />
                        <span
                            className="text-sm font-mono text-text-secondary"
                            aria-live="polite"
                        >
                            {formatTime(
                                view === "reading"
                                    ? focusTimer
                                    : totalFocusTime,
                            )}
                        </span>
                    </div>

                    {/* Focus integrity */}
                    <div className="hidden sm:flex items-center gap-1">
                        <Zap
                            size={14}
                            className={
                                focusIntegrity >= 90
                                    ? "text-success"
                                    : focusIntegrity >= 60
                                      ? "text-warning"
                                      : "text-danger"
                            }
                        />
                        <span
                            className={`text-caption font-semibold ${
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
                            <span key={h}>
                                <Heart
                                    size={16}
                                    className={
                                        h <= lives
                                            ? "text-danger fill-danger"
                                            : "text-text-disabled opacity-30"
                                    }
                                />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Main Content Area ── */}
            <div className="flex flex-1 overflow-hidden">
                {/* Quest Map Sidebar — visible on desktop for quest-map & reading views */}
                {(view === "quest-map" || view === "reading") && (
                    <div className="w-[240px] bg-dark-secondary border-r border-border-subtle shrink-0 hidden lg:flex flex-col">
                        <QuestMap
                            sections={sections}
                            sectionStates={sectionStates}
                            currentSectionIndex={currentSectionIndex}
                            onEnterSection={handleEnterSection}
                            contentTitle={contentTitle}
                            totalFocusTime={totalFocusTime}
                        />
                    </div>
                )}

                {/* Main view */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {/* ── QUEST MAP (mobile/center) ── */}
                        {view === "quest-map" && (
                            <motion.div
                                key="quest-map"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 overflow-y-auto"
                            >
                                {/* Mobile quest map */}
                                <div className="lg:hidden">
                                    <QuestMap
                                        sections={sections}
                                        sectionStates={sectionStates}
                                        currentSectionIndex={
                                            currentSectionIndex
                                        }
                                        onEnterSection={handleEnterSection}
                                        contentTitle={contentTitle}
                                        totalFocusTime={totalFocusTime}
                                    />
                                </div>

                                {/* Desktop: center content with call-to-action */}
                                <div className="hidden lg:flex flex-1 items-center justify-center min-h-full">
                                    <div className="text-center px-6 py-12 max-w-md">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <div className="text-5xl mb-4">
                                                ⚔️
                                            </div>
                                            <h2 className="text-h2 font-heading text-text-primary mb-3">
                                                {completedCount === 0
                                                    ? "Ready to Conquer?"
                                                    : `${completedCount}/${sections.length} Sections Done`}
                                            </h2>
                                            <p className="text-text-secondary mb-6">
                                                {completedCount === 0
                                                    ? "Select a section from the quest map to begin your learning journey."
                                                    : "Select the next unlocked section to continue."}
                                            </p>

                                            {/* Section progress bar */}
                                            <div className="w-full max-w-xs mx-auto mb-6">
                                                <div className="flex gap-1.5">
                                                    {sectionStates.map(
                                                        (state, i) => (
                                                            <div
                                                                key={i}
                                                                className={`flex-1 h-2 rounded-full transition-colors ${
                                                                    state ===
                                                                    "completed"
                                                                        ? "bg-success"
                                                                        : state ===
                                                                            "current"
                                                                          ? "bg-primary"
                                                                          : "bg-dark-card"
                                                                }`}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick enter current section button */}
                                            {sectionStates.includes(
                                                "current",
                                            ) && (
                                                <Button
                                                    size="lg"
                                                    onClick={() =>
                                                        handleEnterSection(
                                                            sectionStates.indexOf(
                                                                "current",
                                                            ),
                                                        )
                                                    }
                                                >
                                                    Enter Section{" "}
                                                    {sectionStates.indexOf(
                                                        "current",
                                                    ) + 1}
                                                </Button>
                                            )}
                                        </motion.div>
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
                                transition={{ duration: 0.2 }}
                                className="flex-1 overflow-hidden"
                            >
                                <ReadingView
                                    section={sections[currentSectionIndex]}
                                    sectionIndex={currentSectionIndex}
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
                            </motion.div>
                        )}

                        {/* ── QUIZ VIEW ── */}
                        {view === "quiz" && (
                            <motion.div
                                key="quiz"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <QuizBattle
                                    questions={quizQuestions}
                                    onSubmit={handleQuizSubmit}
                                    onRetry={handleQuizRetry}
                                    onProceed={handleQuizProceed}
                                    quizScore={quizScore}
                                    quizPassed={quizPassed}
                                    quizAttempts={quizAttempts}
                                    cooldownUntil={quizCooldownUntil}
                                />
                            </motion.div>
                        )}

                        {/* ── SUMMARY VIEW ── */}
                        {view === "summary" && (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1 overflow-y-auto"
                            >
                                <SummaryCreation
                                    summaryText={summaryText}
                                    onSummaryChange={setSummaryText}
                                    onValidate={handleSummaryValidate}
                                    onSubmit={handleSummarySubmit}
                                    summaryScore={summaryScore}
                                    summaryFeedback={summaryFeedback}
                                    summaryApproved={summaryApproved}
                                    loading={loading}
                                    contentTitle={contentTitle}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default DocumentDungeonPage;
