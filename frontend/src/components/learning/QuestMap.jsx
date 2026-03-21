import React from "react";
import {
    Lock,
    CheckCircle,
    Sparkles,
    ChevronRight,
    Zap,
    BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * QuestMap — Visual section layout for Document Dungeon.
 * DRD 7.6: Quest Map (sidebar or top section): Section nodes (locked/current/done), linear path
 * DRD 13.2: Section overview, click to enter reading
 */
const QuestMap = ({
    sections = [],
    sectionStates = [],
    currentSectionIndex = 0,
    onEnterSection,
    contentTitle = "",
    totalFocusTime = 0,
    className = "",
}) => {
    const completedCount = sectionStates.filter(
        (s) => s === "completed",
    ).length;
    const progress =
        sections.length > 0
            ? Math.round((completedCount / sections.length) * 100)
            : 0;

    const formatTime = (s) => {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return `${mins}m`;
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-border-subtle">
                <div className="flex items-center gap-2 mb-1">
                    <BookOpen size={18} className="text-primary-light" />
                    <h2 className="text-h3 font-heading text-text-primary truncate">
                        {contentTitle || "Document Dungeon"}
                    </h2>
                </div>
                <p className="text-caption text-text-muted">
                    {completedCount}/{sections.length} sections conquered
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-caption text-text-secondary">
                            Progress
                        </span>
                        <span className="text-caption font-semibold text-primary-light">
                            {progress}%
                        </span>
                    </div>
                    <div className="h-2 bg-dark-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        />
                    </div>
                </div>

                {totalFocusTime > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-caption text-text-muted">
                        <Zap size={12} className="text-accent" />
                        <span>{formatTime(totalFocusTime)} focused</span>
                    </div>
                )}
            </div>

            {/* Section List */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="relative">
                    {/* Vertical connector line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border-subtle" />

                    <div className="space-y-1">
                        {sections.map((section, i) => {
                            const state = sectionStates[i] || "locked";
                            const isClickable = state !== "locked";
                            const sectionTitle =
                                section?.title ||
                                section?.heading ||
                                `Section ${i + 1}`;
                            const wordCount =
                                section?.word_count ||
                                section?.content?.split(/\s+/)?.length ||
                                0;

                            return (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        delay: i * 0.08,
                                        duration: 0.3,
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            isClickable && onEnterSection?.(i)
                                        }
                                        disabled={!isClickable}
                                        className={`
                      relative w-full flex items-center gap-3 px-2 py-3 rounded-md-drd
                      transition-all duration-200 text-left group
                      ${
                          state === "current"
                              ? "bg-primary/10 ring-1 ring-primary/30 hover:bg-primary/15"
                              : state === "completed"
                                ? "hover:bg-dark-card/50"
                                : "opacity-50 cursor-not-allowed"
                      }
                    `}
                                    >
                                        {/* Node */}
                                        <div
                                            className={`
                      relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0
                      transition-all duration-200
                      ${
                          state === "completed"
                              ? "bg-success/20 text-success"
                              : state === "current"
                                ? "bg-primary/20 text-primary-light ring-2 ring-primary/40 shadow-glow-primary"
                                : "bg-dark-card text-text-disabled border border-border-subtle"
                      }
                    `}
                                        >
                                            {state === "completed" && (
                                                <CheckCircle size={18} />
                                            )}
                                            {state === "current" && (
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.1, 1],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                    }}
                                                >
                                                    <Sparkles size={16} />
                                                </motion.div>
                                            )}
                                            {state === "locked" && (
                                                <Lock size={14} />
                                            )}
                                        </div>

                                        {/* Section info */}
                                        <div className="flex-1 min-w-0">
                                            <span
                                                className={`
                        text-sm font-medium block truncate
                        ${state === "current" ? "text-text-primary" : state === "completed" ? "text-text-secondary" : "text-text-disabled"}
                      `}
                                            >
                                                {sectionTitle}
                                            </span>
                                            {wordCount > 0 && (
                                                <span className="text-[11px] text-text-muted">
                                                    ~
                                                    {Math.ceil(wordCount / 200)}{" "}
                                                    min read
                                                </span>
                                            )}
                                        </div>

                                        {/* Arrow for current */}
                                        {state === "current" && (
                                            <ChevronRight
                                                size={16}
                                                className="text-primary-light opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            />
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer — Motivational text */}
            <div className="p-4 border-t border-border-subtle">
                <p className="text-caption text-text-muted text-center italic">
                    {completedCount === 0
                        ? "🗡️ Begin your conquest!"
                        : completedCount === sections.length
                          ? "🏆 All sections conquered!"
                          : `⚔️ ${sections.length - completedCount} section${sections.length - completedCount > 1 ? "s" : ""} remaining`}
                </p>
            </div>
        </div>
    );
};

export default QuestMap;
