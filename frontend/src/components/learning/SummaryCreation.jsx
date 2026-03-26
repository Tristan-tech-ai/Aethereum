import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Send,
    CheckCircle,
    AlertTriangle,
    FileText,
    Lightbulb,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

/**
 * SummaryCreation — Summary writing + AI validation component.
 *
 * DRD 7.6 Summary sub-view:
 *   - Textarea (min 50 chars), live char count
 *   - "Check with AI" button → inline AI feedback card
 *   - "Submit & Complete" (enabled after AI approval)
 *
 * PRD Principle: Summary quality check (min 50 chars + AI coherence score ≥40%)
 */
const SummaryCreation = ({
    summaryText = "",
    onSummaryChange,
    onValidate,
    onSubmit,
    summaryScore = null,
    summaryFeedback = null,
    summaryApproved = false,
    loading = false,
    contentTitle = "",
}) => {
    const [hasValidated, setHasValidated] = useState(false);
    const charCount = summaryText.length;
    const wordCount = summaryText.trim().split(/\s+/).filter(Boolean).length;
    const minChars = 50;
    const canValidate = charCount >= minChars;
    const canSubmit = canValidate;

    const handleValidate = async () => {
        setHasValidated(true);
        await onValidate?.();
    };

    return (
        <div className="max-w-[640px] mx-auto px-4 md:px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8">
                <Badge variant="primary" className="mb-3">
                    <FileText size={14} className="mr-1.5" /> Summary Phase
                </Badge>
                <h2 className="text-h2 font-heading text-text-primary mb-2">
                    Write Your Summary
                </h2>
                <p className="text-text-secondary text-sm">
                    Summarize what you learned from{" "}
                    <span className="text-text-primary font-medium">
                        {contentTitle || "this material"}
                    </span>{" "}
                    in your own words
                </p>
            </div>

            {/* Textarea */}
            <div className="mb-4">
                <div className="relative">
                    <textarea
                        value={summaryText}
                        onChange={(e) => onSummaryChange?.(e.target.value)}
                        placeholder="In this material, I learned that... The key concepts include... The most important takeaway is..."
                        rows={8}
                        className={`
              w-full bg-dark-card border rounded-md-drd p-4 text-text-primary text-sm
              resize-none focus:outline-none transition-all duration-200
              placeholder:text-text-disabled
              ${
                  summaryApproved
                      ? "border-success/40 focus:border-success"
                      : charCount >= minChars
                        ? "border-primary/30 focus:border-primary"
                        : "border-border focus:border-primary"
              }
            `}
                    />
                    {summaryApproved && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3"
                        >
                            <CheckCircle size={20} className="text-success" />
                        </motion.div>
                    )}
                </div>

                {/* Char/word count */}
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3">
                        <span
                            className={`text-caption font-medium ${
                                charCount >= minChars
                                    ? "text-success"
                                    : "text-text-muted"
                            }`}
                        >
                            {charCount >= minChars ? "✓" : "○"} {charCount}/
                            {minChars} min chars
                        </span>
                        <span className="text-caption text-text-muted">
                            {wordCount} words
                        </span>
                    </div>
                    <span
                        className={`text-caption ${charCount > 0 ? "text-text-secondary" : "text-text-muted"}`}
                    >
                        {charCount} characters
                    </span>
                </div>
            </div>

            {/* Tips (show before validation) */}
            {!hasValidated && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-card/50 border border-border-subtle rounded-md-drd p-4 mb-6"
                >
                    <div className="flex items-start gap-2">
                        <Lightbulb
                            size={16}
                            className="text-accent mt-0.5 shrink-0"
                        />
                        <div>
                            <p className="text-caption font-semibold text-text-secondary mb-1.5">
                                Tips for a great summary:
                            </p>
                            <ul className="text-caption text-text-muted space-y-1">
                                <li>
                                    • Cover the main concepts and definitions
                                </li>
                                <li>
                                    • Explain key relationships between ideas
                                </li>
                                <li>
                                    • Mention practical applications or examples
                                </li>
                                <li>• Use your own words — don't copy-paste</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* AI Feedback card */}
            <AnimatePresence>
                {summaryFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mb-6 overflow-hidden"
                    >
                        <div
                            className={`
              border rounded-lg-drd p-5
              ${
                  summaryApproved
                      ? "bg-success/5 border-success/30"
                      : "bg-warning/5 border-warning/30"
              }
            `}
                        >
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles
                                    size={16}
                                    className={
                                        summaryApproved
                                            ? "text-success"
                                            : "text-warning"
                                    }
                                />
                                <span className="text-sm font-semibold text-text-primary">
                                    AI Feedback
                                </span>
                                {summaryScore !== null && (
                                    <Badge
                                        variant={
                                            summaryApproved
                                                ? "success"
                                                : "warning"
                                        }
                                    >
                                        Score: {summaryScore}%
                                    </Badge>
                                )}
                            </div>

                            {/* Feedback sections */}
                            <div className="space-y-2.5 text-sm">
                                {summaryFeedback.completeness && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-text-muted shrink-0 w-24 text-caption font-medium">
                                            Completeness
                                        </span>
                                        <span className="text-text-secondary">
                                            {summaryFeedback.completeness}
                                        </span>
                                    </div>
                                )}
                                {summaryFeedback.accuracy && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-text-muted shrink-0 w-24 text-caption font-medium">
                                            Accuracy
                                        </span>
                                        <span className="text-text-secondary">
                                            {summaryFeedback.accuracy}
                                        </span>
                                    </div>
                                )}
                                {summaryFeedback.clarity && (
                                    <div className="flex items-start gap-2">
                                        <span className="text-text-muted shrink-0 w-24 text-caption font-medium">
                                            Clarity
                                        </span>
                                        <span className="text-text-secondary">
                                            {summaryFeedback.clarity}
                                        </span>
                                    </div>
                                )}

                                {/* Missing concepts */}
                                {summaryFeedback.missing_concepts?.length >
                                    0 && (
                                    <div className="mt-3 pt-3 border-t border-border-subtle">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <AlertTriangle
                                                size={14}
                                                className="text-warning"
                                            />
                                            <span className="text-caption font-semibold text-text-secondary">
                                                Missing concepts:
                                            </span>
                                        </div>
                                        <ul className="space-y-1">
                                            {summaryFeedback.missing_concepts.map(
                                                (concept, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-caption text-text-muted flex items-start gap-1.5"
                                                    >
                                                        <span className="text-warning mt-0.5">
                                                            •
                                                        </span>
                                                        {concept}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {/* Approval status */}
                                <div
                                    className={`
                  mt-3 pt-3 border-t border-border-subtle flex items-center gap-2
                  ${summaryApproved ? "text-success" : "text-warning"}
                `}
                                >
                                    {summaryApproved ? (
                                        <>
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-semibold">
                                                Summary approved! You can now
                                                submit.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={16} />
                                            <span className="text-sm font-semibold">
                                                Revise your summary and check
                                                again.
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                    variant="secondary"
                    onClick={handleValidate}
                    disabled={!canValidate || loading}
                    loading={loading && !canSubmit}
                >
                    <Sparkles size={16} className="mr-1.5" />
                    {hasValidated ? "Check Again" : "Check with AI"}
                </Button>

                <Button
                    onClick={onSubmit}
                    disabled={!canSubmit || loading}
                    loading={loading && canSubmit}
                >
                    <Send size={16} className="mr-1.5" />
                    Submit & Complete
                </Button>
            </div>

            {!canValidate && charCount > 0 && (
                <p className="text-center text-caption text-text-muted mt-3">
                    Write at least {minChars - charCount} more characters to
                    enable AI check
                </p>
            )}
        </div>
    );
};

export default SummaryCreation;
