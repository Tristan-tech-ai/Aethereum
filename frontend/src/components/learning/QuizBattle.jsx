import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Swords,
    CheckCircle,
    XCircle,
    ChevronRight,
    RotateCcw,
    Clock,
    Trophy,
    AlertTriangle,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

/**
 * QuizBattle — Guardian Battle quiz component.
 *
 * DRD 7.6 Quiz/Guardian Battle sub-view:
 *   - Question card (center), 4 options (2×2 grid), timer bar at top, question counter (1/5)
 *   - Correct: green flash + ✓, Wrong: red flash + ✕ + explanation
 *   - Results: pass/fail animation, score breakdown, retry (if fail, 5min cooldown)
 *
 * DRD 10.2:
 *   - Quiz correct: Green flash + checkmark draw animation
 *   - Quiz wrong: Red shake + X draw animation
 *
 * DRD 11.2: Quiz Options — 1 column stack (mobile) / 2×2 grid (desktop)
 */

const QUESTION_TIME_LIMIT = 120; // 2 minutes per question

const QuizBattle = ({
    questions = [],
    onSubmit,
    onRetry,
    onProceed,
    quizScore = null,
    quizPassed = false,
    quizAttempts = 0,
    cooldownUntil = null,
}) => {
    const [phase, setPhase] = useState("battle"); // 'battle' | 'feedback' | 'results'
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [results, setResults] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackCorrect, setFeedbackCorrect] = useState(false);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
    const [cooldownLeft, setCooldownLeft] = useState(0);
    const timerRef = useRef(null);
    const feedbackTimerRef = useRef(null);

    // Timer per question
    useEffect(() => {
        if (phase !== "battle") return;
        setTimeLeft(QUESTION_TIME_LIMIT);
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    // Auto-submit wrong answer on timeout
                    handleSubmitAnswer(-1);
                    return QUESTION_TIME_LIMIT;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [currentQ, phase]);

    // Cooldown timer
    useEffect(() => {
        if (!cooldownUntil) {
            setCooldownLeft(0);
            return;
        }
        const updateCooldown = () => {
            const left = Math.max(
                0,
                Math.ceil((cooldownUntil - Date.now()) / 1000),
            );
            setCooldownLeft(left);
        };
        updateCooldown();
        const id = setInterval(updateCooldown, 1000);
        return () => clearInterval(id);
    }, [cooldownUntil]);

    // If score is already set (from parent/store), show results
    useEffect(() => {
        if (quizScore !== null && phase === "battle" && answers.length === 0) {
            // External score was set (e.g., from retry navigation)
        }
    }, [quizScore]);

    const handleSubmitAnswer = useCallback(
        (answerIdx) => {
            if (showFeedback) return;
            clearInterval(timerRef.current);

            const q = questions[currentQ];
            const correct = q?.correct ?? q?.correct_index ?? 0;
            const isCorrect = answerIdx === correct;

            setSelectedAnswer(answerIdx);
            setFeedbackCorrect(isCorrect);
            setShowFeedback(true);

            // Show feedback then proceed
            feedbackTimerRef.current = setTimeout(() => {
                const newAnswers = [...answers, answerIdx];
                setAnswers(newAnswers);
                setShowFeedback(false);
                setSelectedAnswer(null);

                if (currentQ < questions.length - 1) {
                    setCurrentQ((q) => q + 1);
                } else {
                    // Submit all answers
                    setPhase("results");
                    onSubmit?.(newAnswers).then((res) => {
                        setResults(res);
                    });
                }
            }, 1500);

            return () => clearTimeout(feedbackTimerRef.current);
        },
        [currentQ, questions, answers, showFeedback, onSubmit],
    );

    const handleRetry = () => {
        setPhase("battle");
        setCurrentQ(0);
        setSelectedAnswer(null);
        setAnswers([]);
        setResults(null);
        setShowFeedback(false);
        onRetry?.();
    };

    const formatCooldown = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    const timerProgress = (timeLeft / QUESTION_TIME_LIMIT) * 100;
    const timerColor =
        timeLeft > 60
            ? "bg-success"
            : timeLeft > 30
              ? "bg-warning"
              : "bg-danger";

    // ── BATTLE PHASE ──
    if (phase === "battle" && questions.length > 0) {
        const q = questions[currentQ];
        const options = q?.options || [];

        return (
            <div className="max-w-[640px] mx-auto px-4 md:px-6 py-8">
                {/* Timer bar */}
                <div className="h-1.5 bg-dark-secondary rounded-full overflow-hidden mb-6">
                    <motion.div
                        className={`h-full ${timerColor} rounded-full`}
                        style={{ width: `${timerProgress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <Badge variant="primary" className="mb-3">
                        <Swords size={14} className="mr-1.5" /> Guardian Battle
                    </Badge>
                    <h2 className="text-h2 font-heading text-text-primary mb-3">
                        Question {currentQ + 1} of {questions.length}
                    </h2>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-2">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    i < currentQ
                                        ? "bg-success"
                                        : i === currentQ
                                          ? "bg-primary shadow-glow-primary"
                                          : "bg-dark-secondary"
                                }`}
                            />
                        ))}
                    </div>

                    {/* Timer text */}
                    <div className="flex items-center justify-center gap-1.5 text-caption">
                        <Clock
                            size={12}
                            className={
                                timeLeft <= 30
                                    ? "text-danger"
                                    : "text-text-muted"
                            }
                        />
                        <span
                            className={`font-mono ${timeLeft <= 30 ? "text-danger font-semibold" : "text-text-muted"}`}
                        >
                            {Math.floor(timeLeft / 60)}:
                            {(timeLeft % 60).toString().padStart(2, "0")}
                        </span>
                    </div>
                </div>

                {/* Question card */}
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-dark-card border border-border-subtle rounded-lg-drd p-6 mb-6"
                >
                    <p className="text-body text-text-primary font-medium text-center">
                        {q?.question || q?.text || "Question text"}
                    </p>
                </motion.div>

                {/* Options grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {options.map((opt, i) => {
                        const correct = q?.correct ?? q?.correct_index ?? 0;
                        let optionStyle =
                            "border-border bg-dark-card text-text-secondary hover:border-border-hover hover:bg-dark-elevated";

                        if (showFeedback) {
                            if (i === correct) {
                                optionStyle =
                                    "border-success bg-success/10 text-success";
                            } else if (
                                i === selectedAnswer &&
                                !feedbackCorrect
                            ) {
                                optionStyle =
                                    "border-danger bg-danger/10 text-danger";
                            } else {
                                optionStyle =
                                    "border-border-subtle bg-dark-card/50 text-text-disabled";
                            }
                        } else if (selectedAnswer === i) {
                            optionStyle =
                                "border-primary bg-primary/10 text-text-primary";
                        }

                        return (
                            <motion.button
                                key={i}
                                onClick={() =>
                                    !showFeedback && handleSubmitAnswer(i)
                                }
                                disabled={showFeedback}
                                whileHover={
                                    !showFeedback ? { scale: 1.02 } : {}
                                }
                                whileTap={!showFeedback ? { scale: 0.98 } : {}}
                                animate={
                                    showFeedback &&
                                    i === selectedAnswer &&
                                    !feedbackCorrect
                                        ? { x: [0, -6, 6, -4, 4, 0] }
                                        : {}
                                }
                                transition={{ duration: 0.4 }}
                                className={`
                  p-4 rounded-md-drd border-2 text-left text-sm font-medium
                  transition-colors duration-200 min-h-[56px] flex items-center gap-2
                  ${optionStyle}
                `}
                            >
                                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center shrink-0 text-caption">
                                    {showFeedback &&
                                    i ===
                                        (q?.correct ??
                                            q?.correct_index ??
                                            0) ? (
                                        <CheckCircle
                                            size={14}
                                            className="text-success"
                                        />
                                    ) : showFeedback &&
                                      i === selectedAnswer &&
                                      !feedbackCorrect ? (
                                        <XCircle
                                            size={14}
                                            className="text-danger"
                                        />
                                    ) : (
                                        String.fromCharCode(65 + i)
                                    )}
                                </span>
                                <span className="flex-1">
                                    {typeof opt === "string"
                                        ? opt
                                        : opt?.text || opt?.label || ""}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Feedback banner */}
                <AnimatePresence>
                    {showFeedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`
                p-4 rounded-md-drd border text-center text-sm
                ${
                    feedbackCorrect
                        ? "bg-success/10 border-success/30 text-success"
                        : "bg-danger/10 border-danger/30 text-danger"
                }
              `}
                        >
                            {feedbackCorrect ? (
                                <div className="flex items-center justify-center gap-2">
                                    <CheckCircle size={18} />
                                    <span className="font-semibold">
                                        Correct! Well done! ✨
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <XCircle size={18} />
                                        <span className="font-semibold">
                                            Not quite!
                                        </span>
                                    </div>
                                    {questions[currentQ]?.explanation && (
                                        <p className="text-text-secondary text-caption mt-1">
                                            {questions[currentQ].explanation}
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ── RESULTS PHASE ──
    const score = results?.score ?? quizScore ?? 0;
    const passed = results?.passed ?? quizPassed ?? false;
    const correctCount =
        results?.results?.filter((r) => r.isCorrect)?.length ??
        Math.round((score / 100) * questions.length);

    return (
        <div className="max-w-[500px] mx-auto px-4 md:px-6 py-12 text-center">
            {/* Pass/Fail Animation */}
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
            >
                {passed ? (
                    <>
                        <motion.div
                            className="text-6xl mb-4"
                            animate={{
                                rotate: [0, -10, 10, -5, 5, 0],
                                scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            🎉
                        </motion.div>
                        <h2 className="text-h1 font-heading text-success mb-2">
                            Guardian Defeated!
                        </h2>
                        <p className="text-text-secondary mb-2">
                            You passed the quiz
                        </p>
                    </>
                ) : (
                    <>
                        <motion.div
                            className="text-6xl mb-4"
                            animate={{ x: [0, -10, 10, -5, 5, 0] }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            💀
                        </motion.div>
                        <h2 className="text-h1 font-heading text-danger mb-2">
                            Guardian Stands!
                        </h2>
                        <p className="text-text-secondary mb-2">
                            You need 70% to pass
                        </p>
                    </>
                )}
            </motion.div>

            {/* Score display */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="my-8"
            >
                <div className="inline-flex items-center gap-4 bg-dark-card border border-border-subtle rounded-lg-drd px-8 py-6">
                    <div className="text-center">
                        <div
                            className={`text-4xl font-bold font-heading ${passed ? "text-success" : "text-danger"}`}
                        >
                            {score}%
                        </div>
                        <div className="text-caption text-text-muted mt-1">
                            Score
                        </div>
                    </div>
                    <div className="w-px h-12 bg-border-subtle" />
                    <div className="text-center">
                        <div className="text-4xl font-bold font-heading text-text-primary">
                            {correctCount}/{questions.length}
                        </div>
                        <div className="text-caption text-text-muted mt-1">
                            Correct
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Question results breakdown */}
            {results?.results && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mb-8"
                >
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                        Question Breakdown
                    </h3>
                    <div className="space-y-2 text-left">
                        {results.results.map((r, i) => (
                            <div
                                key={i}
                                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-md-drd border text-sm
                  ${
                      r.isCorrect
                          ? "bg-success/5 border-success/20"
                          : "bg-danger/5 border-danger/20"
                  }
                `}
                            >
                                {r.isCorrect ? (
                                    <CheckCircle
                                        size={16}
                                        className="text-success shrink-0"
                                    />
                                ) : (
                                    <XCircle
                                        size={16}
                                        className="text-danger shrink-0"
                                    />
                                )}
                                <span
                                    className={`flex-1 truncate ${r.isCorrect ? "text-text-secondary" : "text-text-secondary"}`}
                                >
                                    Q{i + 1}:{" "}
                                    {questions[i]?.question?.slice(0, 60)}...
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Actions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
                {passed ? (
                    <Button onClick={onProceed} size="lg">
                        <Trophy size={18} className="mr-1.5" />
                        Continue
                        <ChevronRight size={18} className="ml-1" />
                    </Button>
                ) : (
                    <>
                        {cooldownLeft > 0 ? (
                            <div className="flex items-center gap-2 text-text-muted text-sm">
                                <AlertTriangle
                                    size={16}
                                    className="text-warning"
                                />
                                <span>
                                    Retry available in{" "}
                                    <strong className="text-warning">
                                        {formatCooldown(cooldownLeft)}
                                    </strong>
                                </span>
                            </div>
                        ) : (
                            <Button
                                onClick={handleRetry}
                                variant="secondary"
                                size="lg"
                            >
                                <RotateCcw size={18} className="mr-1.5" />
                                Retry Quiz
                            </Button>
                        )}
                        {quizAttempts > 0 && (
                            <span className="text-caption text-text-muted">
                                Attempt {quizAttempts} • Need ≥70% to pass
                            </span>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default QuizBattle;
