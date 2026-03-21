import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Heart,
    Pin,
    BookOpen,
    Calendar,
    Clock,
    Tag,
    RotateCcw,
    Target,
    Zap,
    Eye,
} from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { tierConfig, subjectIcons } from "./KnowledgeCard";

/**
 * CardDetailModal — DRD §7.3 + Checklist 5.4 "CardDetailModal".
 *
 * Full Knowledge Card detail view:
 *   - Full card info (tier, mastery, quiz, focus, time)
 *   - Full summary text (user's own words)
 *   - Keywords chips
 *   - Timeline (created date, last reviewed)
 *   - "Review This Material" button (restart session)
 *   - Like button + count
 *   - Pin/Unpin toggle
 */

const celebrationEasing = [0.34, 1.56, 0.64, 1];

/* ─── Stat Block ─── */
const StatItem = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-2 px-3 py-2 bg-dark-secondary rounded-md-drd">
        <Icon size={16} className={color || "text-text-muted"} />
        <div>
            <span className="block text-caption text-text-muted">{label}</span>
            <span className="block text-body-sm font-semibold text-text-primary">
                {value}
            </span>
        </div>
    </div>
);

/* ─── Mastery Ring (mini) ─── */
const MasteryRing = ({ mastery, tier }) => {
    const config = tierConfig[tier] || tierConfig.bronze;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - mastery / 100);

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            <svg
                width="96"
                height="96"
                viewBox="0 0 96 96"
                className="-rotate-90"
            >
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke="#1A1A2E"
                    strokeWidth="6"
                />
                <motion.circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke={config.gradient ? "url(#tierGrad)" : config.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
                {config.gradient && (
                    <defs>
                        <linearGradient
                            id="tierGrad"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#B9F2FF" />
                            <stop offset="50%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#FFB3C1" />
                        </linearGradient>
                    </defs>
                )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-h3 font-heading text-text-primary">
                    {mastery}%
                </span>
                <span className="text-overline text-text-muted uppercase tracking-wider">
                    Mastery
                </span>
            </div>
        </div>
    );
};

const CardDetailModal = ({
    isOpen,
    onClose,
    card,
    onReviewMaterial,
    onLike,
    onPinToggle,
    isLiked = false,
}) => {
    const [localLiked, setLocalLiked] = useState(isLiked);
    const [localLikes, setLocalLikes] = useState(card?.likes || 0);

    if (!card) return null;

    const tier = card.tier || "bronze";
    const config = tierConfig[tier] || tierConfig.bronze;
    const subjectInfo =
        subjectIcons[card.subject || card.subject_category || "General"] ||
        subjectIcons["General"];
    const mastery = card.mastery || card.mastery_percentage || 0;
    const isPinned = card.is_pinned || card.pinned || false;
    const keywords = card.keywords || [];
    const summaryText = card.summary_snippet || card.summary || "";
    const createdAt = card.created_at ? new Date(card.created_at) : null;
    const lastReviewed = card.last_reviewed_at
        ? new Date(card.last_reviewed_at)
        : null;

    const handleLike = () => {
        setLocalLiked(!localLiked);
        setLocalLikes((prev) => (localLiked ? prev - 1 : prev + 1));
        onLike?.(card);
    };

    // Border style matching KnowledgeCard
    const borderStyle =
        tier === "diamond"
            ? {
                  border: "2px solid transparent",
                  backgroundImage: `linear-gradient(#252540, #252540), ${config.gradient}`,
                  backgroundOrigin: "border-box",
                  backgroundClip: "padding-box, border-box",
              }
            : { border: `2px solid ${config.color}` };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/65"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.3, ease: celebrationEasing }}
                        className="relative w-full max-w-modal-lg bg-dark-elevated rounded-lg-drd shadow-lg-drd
              overflow-y-auto max-h-[90vh] focus:outline-none"
                        style={{
                            ...borderStyle,
                            boxShadow:
                                config.glow !== "none"
                                    ? config.glow
                                    : undefined,
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Knowledge Card: ${card.title}`}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 p-1.5 text-text-muted hover:text-text-primary
                hover:bg-white/5 rounded-sm-drd transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>

                        {/* Content */}
                        <div className="p-6 md:p-8">
                            {/* Top section: Mastery ring + Card info */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                                <MasteryRing mastery={mastery} tier={tier} />

                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                        <Badge variant={config.badgeVariant}>
                                            {config.label}
                                        </Badge>
                                        {isPinned && (
                                            <Badge variant="primary">
                                                📌 Pinned
                                            </Badge>
                                        )}
                                    </div>
                                    <h2 className="text-h2 font-heading text-text-primary mb-1">
                                        {card.title}
                                    </h2>
                                    <p className="text-body-sm text-text-secondary flex items-center justify-center sm:justify-start gap-1.5">
                                        <span className="text-lg">
                                            {subjectInfo.emoji}
                                        </span>
                                        {card.subject ||
                                            card.subject_category ||
                                            "General"}
                                    </p>
                                </div>
                            </div>

                            {/* Stats grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                <StatItem
                                    icon={Target}
                                    label="Quiz Score"
                                    value={`${card.quiz_score || card.quiz_avg_score || 0}%`}
                                    color="text-success"
                                />
                                <StatItem
                                    icon={Eye}
                                    label="Focus Integrity"
                                    value={`${card.focus_score || card.focus_integrity || 0}%`}
                                    color="text-info"
                                />
                                <StatItem
                                    icon={Clock}
                                    label="Time Invested"
                                    value={`${card.time_spent || card.time_invested || 0}m`}
                                    color="text-accent"
                                />
                                <StatItem
                                    icon={Zap}
                                    label="XP Earned"
                                    value={card.xp_earned || "—"}
                                    color="text-primary-light"
                                />
                            </div>

                            {/* Summary */}
                            {summaryText && (
                                <div className="mb-6">
                                    <h3 className="text-h4 font-heading text-text-primary mb-2 flex items-center gap-1.5">
                                        <BookOpen
                                            size={16}
                                            className="text-primary-light"
                                        />
                                        Your Summary
                                    </h3>
                                    <div className="bg-dark-secondary rounded-md-drd p-4 text-body-sm text-text-secondary leading-relaxed">
                                        {summaryText}
                                    </div>
                                </div>
                            )}

                            {/* Keywords */}
                            {keywords.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-h4 font-heading text-text-primary mb-2 flex items-center gap-1.5">
                                        <Tag
                                            size={16}
                                            className="text-primary-light"
                                        />
                                        Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {keywords.map((kw, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 text-caption font-medium text-text-secondary
                          bg-dark-secondary border border-border rounded-full"
                                            >
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="mb-8">
                                <h3 className="text-h4 font-heading text-text-primary mb-2 flex items-center gap-1.5">
                                    <Calendar
                                        size={16}
                                        className="text-primary-light"
                                    />
                                    Timeline
                                </h3>
                                <div className="space-y-2">
                                    {createdAt && (
                                        <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                                            <div className="w-2 h-2 rounded-full bg-success" />
                                            <span>
                                                Created on{" "}
                                                {createdAt.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {lastReviewed && (
                                        <div className="flex items-center gap-2 text-body-sm text-text-secondary">
                                            <div className="w-2 h-2 rounded-full bg-info" />
                                            <span>
                                                Last reviewed on{" "}
                                                {lastReviewed.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    },
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {!createdAt && !lastReviewed && (
                                        <p className="text-body-sm text-text-muted">
                                            No timeline data available.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle">
                                <div className="flex items-center gap-2">
                                    {/* Like button */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleLike}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-sm-drd border transition-colors
                      ${
                          localLiked
                              ? "bg-danger/10 text-danger border-danger/30"
                              : "bg-dark-secondary text-text-muted border-border hover:text-text-secondary hover:border-border-hover"
                      }`}
                                    >
                                        <Heart
                                            size={16}
                                            fill={
                                                localLiked
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                        <span className="text-body-sm font-medium">
                                            {localLikes}
                                        </span>
                                    </motion.button>

                                    {/* Pin toggle */}
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onPinToggle?.(card)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-sm-drd border transition-colors
                      ${
                          isPinned
                              ? "bg-primary/10 text-primary-light border-primary/30"
                              : "bg-dark-secondary text-text-muted border-border hover:text-text-secondary hover:border-border-hover"
                      }`}
                                    >
                                        <Pin size={16} />
                                        <span className="text-body-sm font-medium">
                                            {isPinned ? "Unpin" : "Pin"}
                                        </span>
                                    </motion.button>
                                </div>

                                {/* Review button */}
                                <Button
                                    onClick={() => onReviewMaterial?.(card)}
                                    size="md"
                                >
                                    <RotateCcw size={16} className="mr-1.5" />
                                    Review This Material
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CardDetailModal;
