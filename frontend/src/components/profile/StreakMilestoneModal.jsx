import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Gift, Flame } from "lucide-react";
import Button from "../ui/Button";

/**
 * StreakMilestoneModal — Celebration overlay when user hits 7/30/90/365 streak.
 *
 * PRD §5.5 Streak Milestones & Rewards:
 *   🔥  7 days  → "Week Warrior" badge + 100 coins
 *   🔥🔥 30 days → "Monthly Master" badge + 300 coins + profile frame
 *   🔥🔥🔥 90 days → "Quarter Champion" badge + 1000 coins + special rank color
 *   🔥🔥🔥🔥 365 days → "Year Legend" badge + 5000 coins + exclusive "Eternal Flame" title
 *
 * DRD §10.1: --motion-celebration 800ms cubic-bezier(0.34, 1.56, 0.64, 1)
 *
 * Checklist 5.5:
 *   - Achievement badge reveal
 *   - Coins reward display
 *   - "Share your streak!" CTA
 */

const celebrationEasing = [0.34, 1.56, 0.64, 1];

export const STREAK_MILESTONES = [
    {
        days: 7,
        title: "Week Warrior",
        emoji: "🔥",
        flames: 1,
        badge: "🛡️",
        coins: 100,
        description: "You studied 7 days in a row!",
        color: "#22C55E",
        extras: [],
    },
    {
        days: 30,
        title: "Monthly Master",
        emoji: "🔥🔥",
        flames: 2,
        badge: "👑",
        coins: 300,
        description: "A whole month of learning — you're unstoppable!",
        color: "#3B82F6",
        extras: ["Profile Frame unlocked"],
    },
    {
        days: 90,
        title: "Quarter Champion",
        emoji: "🔥🔥🔥",
        flames: 3,
        badge: "⚔️",
        coins: 1000,
        description: "90 days of pure dedication. Legendary!",
        color: "#A78BFA",
        extras: ["Special Rank Color unlocked"],
    },
    {
        days: 365,
        title: "Year Legend",
        emoji: "🔥🔥🔥🔥",
        flames: 4,
        badge: "🏆",
        coins: 5000,
        description: "One full year. You are an Eternal Flame.",
        color: "#FFD700",
        extras: ['Exclusive "Eternal Flame" title unlocked'],
    },
];

/**
 * Get milestone config for a given streak count, or null.
 */
export function getMilestoneForCount(count) {
    return STREAK_MILESTONES.find((m) => m.days === count) || null;
}

/* ─── Floating fire particles ─── */
const FireParticles = ({ count = 8, color }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                    width: 6 + Math.random() * 6,
                    height: 6 + Math.random() * 6,
                    background: color || "#F59E0B",
                    left: `${20 + Math.random() * 60}%`,
                    bottom: "40%",
                }}
                initial={{ opacity: 0, y: 0 }}
                animate={{
                    opacity: [0, 0.9, 0],
                    y: [0, -80 - Math.random() * 120],
                    x: (Math.random() - 0.5) * 60,
                    scale: [0.8, 1.2, 0.3],
                }}
                transition={{
                    duration: 1.5 + Math.random() * 1.5,
                    delay: 0.5 + Math.random() * 1.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                    ease: "easeOut",
                }}
            />
        ))}
    </>
);

/* ─── Animated coin counter ─── */
const CoinCounter = ({ value, delay = 0 }) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const start = Date.now();
            const duration = 1200;
            const tick = () => {
                const elapsed = Date.now() - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setDisplay(Math.round(value * eased));
                if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }, delay);
        return () => clearTimeout(timeout);
    }, [value, delay]);

    return <span>{display.toLocaleString()}</span>;
};

const StreakMilestoneModal = ({ isOpen, onClose, milestone, onShare }) => {
    if (!milestone) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 40 }}
                        transition={{ duration: 0.8, ease: celebrationEasing }}
                        className="relative w-full max-w-md bg-dark-elevated rounded-lg-drd shadow-lg-drd overflow-hidden"
                    >
                        {/* Top glow bar */}
                        <div
                            className="h-1"
                            style={{
                                background: `linear-gradient(90deg, transparent, ${milestone.color}, transparent)`,
                            }}
                        />

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
                        <div className="relative px-6 pt-8 pb-6 text-center">
                            {/* Fire particles */}
                            <FireParticles count={10} color={milestone.color} />

                            {/* Badge reveal */}
                            <motion.div
                                initial={{ scale: 0, rotate: -45 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    duration: 0.8,
                                    ease: celebrationEasing,
                                    delay: 0.2,
                                }}
                                className="text-6xl mb-3 relative inline-block"
                            >
                                {milestone.badge}
                                {/* Glow ring */}
                                <motion.div
                                    className="absolute inset-0 rounded-full"
                                    animate={{
                                        boxShadow: [
                                            `0 0 20px ${milestone.color}40`,
                                            `0 0 40px ${milestone.color}60`,
                                            `0 0 20px ${milestone.color}40`,
                                        ],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    style={{ transform: "scale(1.5)" }}
                                />
                            </motion.div>

                            {/* Flames row */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="text-3xl mb-2"
                            >
                                {milestone.emoji}
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-h2 font-heading text-text-primary mb-1"
                            >
                                {milestone.title}!
                            </motion.h2>

                            {/* Streak count */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-body font-semibold mb-2"
                                style={{ color: milestone.color }}
                            >
                                {milestone.days}-Day Streak
                            </motion.p>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="text-body-sm text-text-secondary mb-6"
                            >
                                {milestone.description}
                            </motion.p>

                            {/* Rewards section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="bg-dark-secondary rounded-md-drd p-4 mb-6 space-y-3"
                            >
                                <h3 className="text-caption font-semibold text-text-muted uppercase tracking-wider mb-2">
                                    Rewards Earned
                                </h3>

                                {/* Coins */}
                                <div className="flex items-center justify-between">
                                    <span className="text-body-sm text-text-secondary flex items-center gap-2">
                                        <span className="text-lg">🪙</span>{" "}
                                        Focus Coins
                                    </span>
                                    <span className="text-body font-bold text-accent">
                                        +
                                        <CoinCounter
                                            value={milestone.coins}
                                            delay={1200}
                                        />
                                    </span>
                                </div>

                                {/* Badge */}
                                <div className="flex items-center justify-between">
                                    <span className="text-body-sm text-text-secondary flex items-center gap-2">
                                        <span className="text-lg">
                                            {milestone.badge}
                                        </span>{" "}
                                        Achievement Badge
                                    </span>
                                    <span className="text-body-sm font-semibold text-success">
                                        Unlocked
                                    </span>
                                </div>

                                {/* Extras */}
                                {milestone.extras.map((extra, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1.3 + i * 0.15 }}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-body-sm text-text-secondary flex items-center gap-2">
                                            <Gift
                                                size={16}
                                                className="text-primary-light"
                                            />{" "}
                                            {extra}
                                        </span>
                                        <span className="text-body-sm font-semibold text-primary-light">
                                            New!
                                        </span>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.4 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-3"
                            >
                                <Button
                                    onClick={onShare}
                                    variant="secondary"
                                    size="md"
                                >
                                    <Share2 size={16} className="mr-1.5" />
                                    Share Your Streak!
                                </Button>
                                <Button onClick={onClose} size="md">
                                    <Flame size={16} className="mr-1.5" />
                                    Keep Going
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StreakMilestoneModal;
