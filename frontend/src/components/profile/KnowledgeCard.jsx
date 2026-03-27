import React, { useMemo } from "react";
import { motion } from "framer-motion";
import Badge from "../ui/Badge";

/* ─── Tier config (DRD §2.1 + §8.1) ─── */
export const tierConfig = {
    bronze: {
        color: "#CD7F32",
        glow: "none",
        hoverGlow: "0 0 12px rgba(205,127,50,0.3)",
        label: "🥉 Bronze",
        bgTint: "transparent",
        gradient: null,
        badgeVariant: "warning",
    },
    silver: {
        color: "#C0C0C0",
        glow: "0 0 8px rgba(192,192,192,0.2)",
        hoverGlow: "0 0 16px rgba(192,192,192,0.35)",
        label: "🥈 Silver",
        bgTint: "rgba(192,192,192,0.03)",
        gradient: null,
        badgeVariant: "default",
    },
    gold: {
        color: "#FFD700",
        glow: "0 0 12px rgba(255,215,0,0.3)",
        hoverGlow: "0 0 22px rgba(255,215,0,0.45)",
        label: "🥇 Gold",
        bgTint: "rgba(255,215,0,0.03)",
        gradient: null,
        badgeVariant: "warning",
    },
    diamond: {
        color: "#B9F2FF",
        glow: "0 0 20px rgba(167,139,250,0.4)",
        hoverGlow: "0 0 30px rgba(167,139,250,0.55)",
        label: "💎 Diamond",
        bgTint: "rgba(167,139,250,0.05)",
        gradient: "linear-gradient(135deg, #B9F2FF, #A78BFA, #FFB3C1)",
        badgeVariant: "primary",
    },
};

export const subjectIcons = {
    "Computer Science": { emoji: "💻", color: "#3B82F6" },
    Mathematics: { emoji: "📐", color: "#EF4444" },
    Physics: { emoji: "⚛️", color: "#06B6D4" },
    Biology: { emoji: "🧬", color: "#22C55E" },
    Chemistry: { emoji: "🧪", color: "#A855F7" },
    Literature: { emoji: "📖", color: "#F59E0B" },
    History: { emoji: "🏛️", color: "#D97706" },
    Economics: { emoji: "📊", color: "#10B981" },
    Languages: { emoji: "🌏", color: "#6366F1" },
    "Art & Design": { emoji: "🎨", color: "#EC4899" },
    General: { emoji: "📚", color: "#8B5CF6" },
};

/**
 * Determine card tier from mastery percentage (PRD §5.4).
 * @param {number} mastery 0-100
 * @returns {'bronze'|'silver'|'gold'|'diamond'}
 */
export function tierFromMastery(mastery) {
    if (mastery >= 100) return "diamond";
    if (mastery >= 90) return "gold";
    if (mastery >= 80) return "silver";
    return "bronze";
}

/* ─── Diamond sparkle dots (CSS particle effect per DRD §8.1) ─── */
const DiamondSparkles = () => (
    <>
        {[
            { top: 8, right: 12, size: 6, delay: 0 },
            { top: 16, right: 24, size: 4, delay: 0.5 },
            { bottom: 24, left: 12, size: 4, delay: 1 },
            { bottom: 40, right: 20, size: 5, delay: 1.5 },
            { top: 40, left: 20, size: 3, delay: 0.8 },
        ].map((dot, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                    top: dot.top,
                    right: dot.right,
                    bottom: dot.bottom,
                    left: dot.left,
                    width: dot.size,
                    height: dot.size,
                    background:
                        i % 3 === 0
                            ? "#B9F2FF"
                            : i % 3 === 1
                              ? "#A78BFA"
                              : "#FFB3C1",
                }}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
                transition={{
                    duration: 2,
                    delay: dot.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        ))}
    </>
);

/**
 * KnowledgeCard — DRD §8.1 Knowledge Card Component.
 *
 * All 4 tier variants with proper borders, glows, animations.
 * Hover: scale(1.05) + deeper glow (DRD §10.2).
 * Gold idle: shimmer-glow 3s loop. Diamond idle: sparkle particles.
 */
const KnowledgeCard = ({
    title = "Untitled",
    subject = "General",
    mastery = 75,
    tier: tierProp,
    quizScore = 80,
    focusScore = 85,
    timeSpent = 45,
    pinned = false,
    likes = 0,
    onClick,
    onPinToggle,
    compact = false,
    className = "",
}) => {
    const tier = tierProp || tierFromMastery(mastery);
    const config = tierConfig[tier] || tierConfig.bronze;
    const subjectInfo = subjectIcons[subject] || subjectIcons["General"];

    // Build border style — Diamond gets gradient border via background-clip trick
    const borderStyle = useMemo(() => {
        if (tier === "diamond") {
            return {
                border: "2px solid transparent",
                backgroundImage: `linear-gradient(#1E1E32, #1E1E32), ${config.gradient}`,
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
            };
        }
        return { border: `2px solid ${config.color}` };
    }, [tier, config]);

    // Gold shimmer animation via inline keyframes
    const goldShimmerStyle =
        tier === "gold"
            ? { animation: "shimmer-glow 3s ease-in-out infinite" }
            : {};

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ scale: 1.05, boxShadow: config.hoverGlow }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
        relative w-full sm:max-w-[280px] bg-dark-card
        rounded-md-drd overflow-hidden cursor-pointer select-none
        ${className}
      `}
            style={{
                ...borderStyle,
                backgroundColor:
                    config.bgTint !== "transparent" ? undefined : "#1E1E32",
                boxShadow: config.glow,
                ...goldShimmerStyle,
            }}
        >
            {/* Diamond sparkle particles */}
            {tier === "diamond" && <DiamondSparkles />}

            {/* Header */}
            <div className={`px-4 ${compact ? "pt-3 pb-1.5" : "pt-4 pb-2"}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">
                            {subjectInfo.emoji}
                        </span>
                        <h4 className="text-sm font-semibold text-text-primary truncate">
                            {title}
                        </h4>
                    </div>
                    <Badge
                        variant={config.badgeVariant}
                        className="shrink-0 text-[10px]"
                    >
                        {config.label}
                    </Badge>
                </div>
                <span className="text-caption text-text-muted mt-0.5 block">
                    {subject}
                </span>
            </div>

            {/* Mastery Bar */}
            <div className={`px-4 ${compact ? "py-1.5" : "py-2"}`}>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-caption text-text-muted">
                        Mastery
                    </span>
                    <span className="text-caption font-semibold text-text-primary">
                        {mastery}%
                    </span>
                </div>
                <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        style={{
                            background: config.gradient || config.color,
                        }}
                    />
                </div>
            </div>

            {/* Stats */}
            {!compact && (
                <div className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-caption text-text-muted">
                        🎯 {quizScore}% quiz
                    </span>
                    <span className="text-caption text-text-muted">
                        ⚡ {focusScore}% focus
                    </span>
                    <span className="text-caption text-text-muted">
                        ⏱️ {timeSpent}m
                    </span>
                </div>
            )}

            {/* Footer */}
            <div
                className={`px-4 ${compact ? "py-1.5" : "py-2"} border-t border-border-subtle flex items-center justify-between`}
            >
                {pinned ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPinToggle?.();
                        }}
                        className="text-caption text-primary-light hover:text-primary transition-colors"
                    >
                        📌 Pinned
                    </button>
                ) : onPinToggle ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onPinToggle?.();
                        }}
                        className="text-caption text-text-muted hover:text-text-secondary transition-colors"
                    >
                        📌 Pin
                    </button>
                ) : (
                    <span />
                )}
                <span className="text-caption text-text-muted">❤️ {likes}</span>
            </div>
        </motion.div>
    );
};

export default KnowledgeCard;
