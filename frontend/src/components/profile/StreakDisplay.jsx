import React from "react";
import { motion } from "framer-motion";
import { Snowflake } from "lucide-react";

/**
 * Streak stage assets — 5 tiers based on streak count.
 * Images from /public/streak/ (1.webp → 5.webp).
 */
export const STREAK_STAGES = [
    { min: 200, image: "/streak/5.webp", label: "Eternal Flame",  color: "#A5B4FC" },
    { min: 100, image: "/streak/4.webp", label: "Blazing Legend", color: "#EAB308" },
    { min: 30,  image: "/streak/3.webp", label: "Inferno",        color: "#F97316" },
    { min: 10,  image: "/streak/2.webp", label: "Rising Flame",   color: "#F59E0B" },
    { min: 0,   image: "/streak/1.webp", label: "Spark",          color: "#22C55E" },
];

export function getStreakStage(count) {
    return STREAK_STAGES.find((s) => count >= s.min) || STREAK_STAGES[STREAK_STAGES.length - 1];
}

const statusConfig = {
    active: {
        label: "Active",
        color: "text-success",
        bgColor: "bg-success/10",
        flameAnim: true,
    },
    "at-risk": {
        label: "At Risk ⚠️",
        color: "text-warning",
        bgColor: "bg-warning/10",
        flameAnim: false,
    },
    broken: {
        label: "Broken 💔",
        color: "text-danger",
        bgColor: "bg-danger/10",
        flameAnim: false,
    },
};

/**
 * Next milestone thresholds aligned with streak stages.
 */
export function nextMilestone(count) {
    const milestones = [
        { target: 10,  label: "Rising Flame",  image: "/streak/2.webp" },
        { target: 30,  label: "Inferno",        image: "/streak/3.webp" },
        { target: 100, label: "Blazing Legend", image: "/streak/4.webp" },
        { target: 200, label: "Eternal Flame",  image: "/streak/5.webp" },
    ];
    return milestones.find((m) => count < m.target) || null;
}

/* ─── Stage image with pulse animation ─── */
const StreakFlameImage = ({ count, active, size = "md" }) => {
    const stage = getStreakStage(count);
    const sizeClass = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-14 h-14", xl: "w-20 h-20" }[size] || "w-8 h-8";
    return (
        <motion.img
            src={stage.image}
            alt={stage.label}
            className={`${sizeClass} object-contain select-none`}
            animate={
                active
                    ? { scale: [1, 1.07, 1], opacity: [1, 0.88, 1] }
                    : { opacity: 0.4 }
            }
            transition={
                active
                    ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
            }
        />
    );
};

/* ─── Weekly goal progress dots (DRD §8.4: ●●●●○○○ = 4/7) ─── */
const WeeklyGoalDots = ({ goal, progress }) => (
    <div>
        <div className="flex items-center justify-between mb-1">
            <span className="text-caption text-text-muted">Weekly Goal</span>
            <span className="text-caption text-text-secondary">
                {progress}/{goal} days
            </span>
        </div>
        <div className="flex gap-1.5">
            {Array.from({ length: goal }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={false}
                    animate={{
                        backgroundColor: i < progress ? "#22C55E" : "#1A1A2E",
                        scale: i < progress ? 1 : 0.85,
                    }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="w-3 h-3 rounded-full"
                />
            ))}
        </div>
    </div>
);

const StreakDisplay = ({
    count = 0,
    bestStreak = 0,
    status = "active",
    weeklyGoal = 5,
    weeklyProgress = 3,
    freezeAvailable = false,
    onUseFreeze,
    compact = false,
    className = "",
}) => {
    const s = statusConfig[status] || statusConfig.active;
    const milestone = nextMilestone(count);

    const stage = getStreakStage(count);

    /* ─── Compact variant (for navbar / header inline) ─── */
    if (compact) {
        return (
            <div className={`flex items-center gap-1.5 ${className}`}>
                <StreakFlameImage count={count} active={s.flameAnim} size="sm" />
                <span className="font-bold text-text-primary">{count}</span>
            </div>
        );
    }

    /* ─── Full variant ─── */
    return (
        <div className={className}>
            {/* Stage image + Count + Status */}
            <div className="flex items-center gap-3 mb-3">
                <StreakFlameImage count={count} active={s.flameAnim} size="lg" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-2xl font-bold text-text-primary">{count}</span>
                        <span className="text-body-sm text-text-secondary">day streak</span>
                        <motion.span
                            key={status}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`text-caption font-semibold px-2 py-0.5 rounded-full ${s.color} ${s.bgColor}`}
                        >
                            {s.label}
                        </motion.span>
                    </div>
                    <p className="text-caption font-semibold" style={{ color: stage.color }}>
                        {stage.label}
                    </p>
                    <p className="text-caption text-text-muted">Best: {bestStreak} days</p>
                </div>
            </div>

            {/* Weekly Goal */}
            <WeeklyGoalDots goal={weeklyGoal} progress={weeklyProgress} />

            {/* Next milestone teaser */}
            {milestone && count > 0 && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-caption text-text-muted mb-1">
                        <div className="flex items-center gap-1.5">
                            <img src={milestone.image} alt={milestone.label} className="w-4 h-4 object-contain" />
                            <span>Next: {milestone.label}</span>
                        </div>
                        <span>{count}/{milestone.target}</span>
                    </div>
                    <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: stage.color }}
                            initial={{ width: 0 }}
                            animate={{
                                width: `${Math.min((count / milestone.target) * 100, 100)}%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}

            {/* Streak freeze button (PRD §5.5 — 1x per week) */}
            {status === "at-risk" && freezeAvailable && onUseFreeze && (
                <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={onUseFreeze}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2
            text-body-sm font-medium text-info bg-info/10 border border-info/20
            rounded-sm-drd hover:bg-info/15 transition-colors"
                >
                    <Snowflake size={14} />
                    Use Streak Freeze
                </motion.button>
            )}
        </div>
    );
};

export default StreakDisplay;
