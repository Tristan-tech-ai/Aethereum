import React, { useEffect, useRef, useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Button from "../ui/Button";


/**
 * ReadingView — Clean markdown reading interface with focus tracking.
 *
 * DRD 7.6:
 *   - Clean markdown render, max-width 720px, comfortable line-height (1.8)
 *   - Focus timer, focus hearts ❤️❤️❤️
 *   - Tab switch detection → reduces focus integrity
 *   - "I'm Done Reading" button (appears after min read time)
 *   - Warning overlay on distraction
 *
 * DRD 10.2:
 *   - Focus heart loss: Heart shrink + fade + screen edge red flash
 *   - Quiz correct/wrong: Green flash / red shake
 */
const ReadingView = ({
    section,
    sectionIndex = 0,
    totalSections = 1,
    focusTimer = 0,
    lives = 3,
    focusIntegrity = 100,
    readingDone = false,
    minReadTime = 30,
    onTick,
    onTabSwitch,
    onTabReturn,
    onDoneReading,
    onReportProgress,
}) => {
    const timerRef = useRef(null);
    const progressRef = useRef(null);
    const [showWarning, setShowWarning] = useState(false);
    const [redFlash, setRedFlash] = useState(false);
    const prevLivesRef = useRef(lives);

    const sectionTitle =
        section?.title || section?.heading || `Section ${sectionIndex + 1}`;
    const sectionContent =
        section?.content || section?.content_text || section?.body || section?.text || "";

    // ── Focus timer ──
    useEffect(() => {
        timerRef.current = setInterval(() => {
            onTick?.();
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [onTick]);

    // ── Report progress every 30s ──
    useEffect(() => {
        progressRef.current = setInterval(() => {
            onReportProgress?.();
        }, 30000);
        return () => clearInterval(progressRef.current);
    }, [onReportProgress]);

    // ── Tab visibility detection ──
    const handleVisibilityChange = useCallback(() => {
        if (document.hidden) {
            onTabSwitch?.();
            setShowWarning(true);
        } else {
            onTabReturn?.();
            // Warning stays until user dismisses it with OK button
        }
    }, [onTabSwitch, onTabReturn]);

    useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
    }, [handleVisibilityChange]);

    // ── Heart loss animation ──
    useEffect(() => {
        if (lives < prevLivesRef.current) {
            setRedFlash(true);
            setTimeout(() => setRedFlash(false), 400);
        }
        prevLivesRef.current = lives;
    }, [lives]);

    const handleDoneReading = useCallback(() => {
        onDoneReading?.();
    }, [onDoneReading]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const timeUntilReady = Math.max(0, minReadTime - focusTimer);

    return (
        <div className="relative flex flex-col h-full">
            {/* Red flash overlay on distraction */}
            <AnimatePresence>
                {redFlash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.15 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-danger z-40 pointer-events-none"
                    />
                )}
            </AnimatePresence>

            {/* Distraction warning overlay */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-30 flex items-center justify-center bg-dark-base/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="text-center px-6 py-8 bg-dark-elevated rounded-lg-drd border border-danger/30 max-w-sm mx-4"
                        >
                            <AlertTriangle
                                size={48}
                                className="text-danger mx-auto mb-4"
                            />
                            <h3 className="text-h3 font-heading text-text-primary mb-2">
                                Focus Lost!
                            </h3>
                            <p className="text-text-secondary text-sm mb-1">
                                Tab switching costs you a life heart.
                            </p>
                            <p className="text-text-muted text-caption mb-6">
                                Stay focused to maintain your integrity score.
                            </p>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="px-6 py-2 bg-danger hover:bg-danger/80 text-white text-sm font-semibold rounded-lg transition-colors"
                            >
                                OK, Noted
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reading content */}
            <div
                className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border-subtle scrollbar-track-transparent"
            >
                <div className="max-w-[720px] mx-auto px-6 py-8 md:px-8">
                    {/* Section header */}
                    <div className="mb-8">
                        <span className="text-caption text-primary-light font-semibold uppercase tracking-wider">
                            Section {sectionIndex + 1} of {totalSections}
                        </span>
                        <h1 className="text-h2 font-heading text-text-primary mt-2">
                            {sectionTitle}
                        </h1>
                    </div>

                    {/* Markdown content */}
                    <div className="prose-dark leading-[1.8]">
                        <ReactMarkdown
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-h1 font-heading text-text-primary mt-10 mb-4">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-h2 font-heading text-text-primary mt-8 mb-3">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-h3 font-heading text-text-primary mt-6 mb-2">
                                        {children}
                                    </h3>
                                ),
                                h4: ({ children }) => (
                                    <h4 className="text-h4 font-heading text-text-primary mt-4 mb-2">
                                        {children}
                                    </h4>
                                ),
                                p: ({ children }) => (
                                    <p className="text-body text-text-secondary leading-relaxed mb-4">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc ml-5 space-y-1 mb-4 text-text-secondary">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal ml-5 space-y-1 mb-4 text-text-secondary">
                                        {children}
                                    </ol>
                                ),
                                li: ({ children }) => (
                                    <li className="text-body text-text-secondary leading-relaxed">
                                        {children}
                                    </li>
                                ),
                                code: ({ inline, className, children }) => {
                                    if (inline) {
                                        return (
                                            <code className="px-1.5 py-0.5 bg-dark-card text-primary-light rounded text-[13px] font-mono">
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <pre className="bg-dark-card border border-border-subtle rounded-md-drd p-4 overflow-x-auto mb-4">
                                            <code className="text-sm font-mono text-text-secondary leading-relaxed">
                                                {children}
                                            </code>
                                        </pre>
                                    );
                                },
                                pre: ({ children }) => <>{children}</>,
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-primary/40 pl-4 italic text-text-muted mb-4">
                                        {children}
                                    </blockquote>
                                ),
                                table: ({ children }) => (
                                    <div className="overflow-x-auto mb-4">
                                        <table className="w-full text-sm border-collapse">
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => (
                                    <thead className="bg-dark-card">
                                        {children}
                                    </thead>
                                ),
                                th: ({ children }) => (
                                    <th className="border border-border-subtle px-3 py-2 text-left text-text-primary font-semibold">
                                        {children}
                                    </th>
                                ),
                                td: ({ children }) => (
                                    <td className="border border-border-subtle px-3 py-2 text-text-secondary">
                                        {children}
                                    </td>
                                ),
                                strong: ({ children }) => (
                                    <strong className="text-text-primary font-semibold">
                                        {children}
                                    </strong>
                                ),
                                em: ({ children }) => (
                                    <em className="text-text-secondary italic">
                                        {children}
                                    </em>
                                ),
                                a: ({ href, children }) => (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary-light hover:text-primary underline decoration-primary/30"
                                    >
                                        {children}
                                    </a>
                                ),
                                hr: () => (
                                    <hr className="border-border-subtle my-8" />
                                ),
                                img: ({ src, alt }) => (
                                    <img
                                        src={src}
                                        alt={alt}
                                        className="max-w-full rounded-md-drd my-4"
                                        loading="lazy"
                                    />
                                ),
                            }}
                        >
                            {sectionContent}
                        </ReactMarkdown>
                    </div>

                    {/* Spacer for bottom bar */}
                    <div className="h-20" />
                </div>
            </div>

            {/* Bottom action bar */}
            <div className="shrink-0 h-16 bg-dark-secondary border-t border-border-subtle flex items-center justify-between px-4 md:px-6">
                <div />

                {/* Right: Done button */}
                <div className="flex items-center gap-3">
                    {!readingDone && timeUntilReady > 0 && (
                        <span className="text-caption text-text-muted hidden sm:inline">
                            {timeUntilReady}s until ready
                        </span>
                    )}
                    <Button
                        onClick={handleDoneReading}
                        disabled={!readingDone}
                        size="sm"
                    >
                        {readingDone
                            ? "I'm Done Reading"
                            : `Wait ${timeUntilReady}s`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReadingView;
