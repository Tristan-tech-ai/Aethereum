import React from "react";
import { motion } from "framer-motion";
import { Shield, Snowflake } from "lucide-react";

/**
 * StreakDisplay — DRD §8.4 Streak Display.
 *
 * - 🔥 flame icon (animated flicker CSS if active — DRD §10.2)
 * - Count number (bold, 20px)
 * - Status label: "Active", "At Risk ⚠️" (if today not yet studied), "Broken 💔"
 * - Weekly goal: mini progress dots (●●●●○○○ = 4/7) — DRD §8.4
 * - Streak freeze button (PRD §5.5 — 1x per week)
 *
 * PRD §5.5:
 *   Daily Streak = Login + minimal 1 completed section per hari.
 *   Weekly Goal default 5 hari/minggu (bisa dikustomisasi: 3/5/7).
 *   Streak Freeze: 1x per minggu.
 */

const statusConfig = {
    active: {
        label: "Active",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/20",
        flameAnim: true,
    },
    "at-risk": {
        label: "At Risk ⚠️",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/20",
        flameAnim: false,
    },
    broken: {
        label: "Broken 💔",
        color: "text-danger",
        bgColor: "bg-danger/10",
        borderColor: "border-danger/20",
        flameAnim: false,
    },
};

/**
 * Determine the next milestone from 7, 30, 90, 365.
 * @param {number} count current streak
 * @returns {{ target: number, label: string } | null}
 */
export function nextMilestone(count) {
    const milestones = [
        { target: 7, label: "🔥 Week Warrior" },
        { target: 30, label: "🔥🔥 Monthly Master" },
        { target: 90, label: "🔥🔥🔥 Quarter Champion" },
        { target: 365, label: "🔥🔥🔥🔥 Year Legend" },
    ];
    return milestones.find((m) => count < m.target) || null;
}

/* ─── Flame icon with flicker animation ─── */
const FlameIcon = ({ active, size = "text-xl" }) => (
    <motion.span
        className={`${size} inline-block select-none`}
        animate={
            active
                ? { opacity: [1, 0.75, 1], scale: [1, 1.08, 1] }
                : { opacity: 0.5 }
        }
        transition={
            active
                ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.3 }
        }
    >
        🔥
    </motion.span>
);

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

    /* ─── Compact variant (for navbar / header inline) ─── */
    if (compact) {
        return (
            <div className={`flex items-center gap-1.5 ${className}`}>
                <FlameIcon active={s.flameAnim} size="text-base" />
                <span className="font-bold text-text-primary">{count}</span>
            </div>
        );
    }

    /* ─── Full variant ─── */
    return (
        <div className={className}>
            {/* Row 1: Flame + Count + Status */}
            <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1.5">
                    <FlameIcon active={s.flameAnim} />
                    <span className="text-xl font-bold text-text-primary">
                        {count}
                    </span>
                    <span className="text-body-sm text-text-secondary">
                        day streak
                    </span>
                </div>

                {/* Status pill */}
                <motion.span
                    key={status}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-caption font-semibold px-2 py-0.5 rounded-full ${s.color} ${s.bgColor}`}
                >
                    {s.label}
                </motion.span>
            </div>

            {/* Best streak */}
            <p className="text-caption text-text-muted mb-2">
                Best: {bestStreak} days
            </p>

            {/* Weekly Goal */}
            <WeeklyGoalDots goal={weeklyGoal} progress={weeklyProgress} />

            {/* Next milestone teaser */}
            {milestone && count > 0 && (
                <div className="mt-3">
                    <div className="flex items-center justify-between text-caption text-text-muted mb-1">
                        <span>Next: {milestone.label}</span>
                        <span>
                            {count}/{milestone.target}
                        </span>
                    </div>
                    <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full bg-accent"
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
