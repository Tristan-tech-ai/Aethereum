import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Share2,
    ArrowRight,
    User,
    Star,
    Zap,
    Clock,
    Target,
    Shield,
    Flame,
    Award,
} from "lucide-react";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import KnowledgeCard, { tierConfig } from "../profile/KnowledgeCard";

/**
 * SessionComplete — Reward / completion screen after finishing all sections.
 *
 * DRD 7.6 Session Complete / Reward Screen:
 *   - Full-screen celebration overlay
 *   - Card flip reveal animation (build suspense: Bronze? Silver? Gold? → actual tier)
 *   - XP breakdown with animated counter
 *   - Coins earned
 *   - New achievements (if any)
 *   - Streak update
 *   - CTA buttons: Share | Continue | View Profile
 *
 * DRD 10.1: --motion-celebration: 800ms cubic-bezier(0.34, 1.56, 0.64, 1)
 */

const celebrationEasing = [0.34, 1.56, 0.64, 1];

/* ─── Tier suspense order for the cycling animation ─── */
const TIER_CYCLE = ["bronze", "silver", "gold", "diamond"];

const AnimatedCounter = ({
    value,
    duration = 1000,
    prefix = "",
    suffix = "",
}) => {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const start = Date.now();
        const animate = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, duration]);

    return (
        <span>
            {prefix}
            {display}
            {suffix}
        </span>
    );
};

/**
 * TierSuspenseReveal — Cycles through tiers with increasing speed, then reveals actual tier.
 * Builds suspense: Bronze? → Silver? → Gold? → Diamond? → ACTUAL TIER!
 */
const TierSuspenseReveal = ({ actualTier, onRevealComplete }) => {
    const [cycleIdx, setCycleIdx] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [cycling, setCycling] = useState(true);

    useEffect(() => {
        if (!cycling) return;

        // Cycle through tiers 2-3 full passes with decreasing interval
        const totalCycles =
            TIER_CYCLE.length * 2 + TIER_CYCLE.indexOf(actualTier);
        let current = 0;
        let baseInterval = 200;

        const tick = () => {
            current++;
            setCycleIdx(current % TIER_CYCLE.length);

            if (current >= totalCycles) {
                // Stop on actual tier
                setCycling(false);
                setCycleIdx(TIER_CYCLE.indexOf(actualTier));
                setTimeout(() => {
                    setRevealed(true);
                    onRevealComplete?.();
                }, 400);
                return;
            }

            // Accelerate then decelerate near the end
            const remaining = totalCycles - current;
            const interval =
                remaining > 4
                    ? baseInterval
                    : baseInterval + (4 - remaining) * 80;
            setTimeout(tick, interval);
        };

        const timer = setTimeout(tick, 300);
        return () => clearTimeout(timer);
    }, [actualTier, cycling, onRevealComplete]);

    const currentTier = TIER_CYCLE[cycleIdx];
    const config = tierConfig[currentTier] || tierConfig.bronze;
    const tierEmoji = { bronze: "🥉", silver: "🥈", gold: "🥇", diamond: "💎" };
    const tierLabel = {
        bronze: "Bronze",
        silver: "Silver",
        gold: "Gold",
        diamond: "Diamond",
    };

    return (
        <motion.div
            className="flex flex-col items-center gap-2"
            animate={revealed ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.6, ease: celebrationEasing }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentTier}
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: -90, opacity: 0 }}
                    transition={{ duration: cycling ? 0.12 : 0.4 }}
                    className="text-5xl"
                >
                    {tierEmoji[currentTier]}
                </motion.div>
            </AnimatePresence>

            <motion.span
                className="text-h3 font-heading"
                style={{ color: config.color }}
                animate={revealed ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {tierLabel[currentTier]}
                {cycling ? "?" : "!"}
            </motion.span>

            {revealed && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-caption text-text-muted"
                >
                    Knowledge Card Earned
                </motion.div>
            )}
        </motion.div>
    );
};

const SessionComplete = ({
    rewards = null,
    knowledgeCard = null,
    onViewProfile,
    onContinueLearning,
    onShareProfile,
}) => {
    const [phase, setPhase] = useState("suspense"); // 'suspense' | 'card' | 'rewards'
    const [showCard, setShowCard] = useState(false);
    const [showRewards, setShowRewards] = useState(false);
    const [tierRevealed, setTierRevealed] = useState(false);

    const xpBreakdown = rewards?.xp_breakdown || [];
    const totalXP =
        rewards?.total_xp || xpBreakdown.reduce((sum, x) => sum + x.xp, 0);
    const coinsEarned = rewards?.coins_earned || 0;
    const achievements = rewards?.achievements || [];
    const streakUpdate = rewards?.streak_update || null;

    const cardData = knowledgeCard || {};
    const tier = cardData.tier || "bronze";

    // Phase: after tier suspense reveals → show card → show rewards
    const handleTierRevealed = () => {
        setTierRevealed(true);
        setTimeout(() => {
            setShowCard(true);
            setPhase("card");
        }, 600);
        setTimeout(() => {
            setShowRewards(true);
            setPhase("rewards");
        }, 2000);
    };

    const tierEmoji = { bronze: "🥉", silver: "🥈", gold: "🥇", diamond: "💎" };
    const tierLabel = {
        bronze: "Bronze",
        silver: "Silver",
        gold: "Gold",
        diamond: "Diamond",
    };

    return (
        <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 md:py-12 relative overflow-hidden">
            {/* Background particles for celebration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute w-2 h-2 rounded-full ${
                            i % 3 === 0
                                ? "bg-primary/30"
                                : i % 3 === 1
                                  ? "bg-accent/30"
                                  : "bg-success/30"
                        }`}
                        initial={{
                            x: `${30 + Math.random() * 40}%`,
                            y: "110%",
                            opacity: 0,
                        }}
                        animate={{
                            y: "-10%",
                            opacity: [0, 0.8, 0],
                            x: `${20 + Math.random() * 60}%`,
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            delay: 0.5 + Math.random() * 2,
                            repeat: Infinity,
                            repeatDelay: Math.random() * 3,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>

            {/* Main content */}
            <div className="relative z-10 text-center max-w-lg w-full">
                {/* Celebration header */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: celebrationEasing }}
                >
                    <motion.div
                        className="text-6xl md:text-7xl mb-4"
                        animate={{
                            rotate: [0, -8, 8, -4, 4, 0],
                            scale: [1, 1.15, 1],
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        🎉
                    </motion.div>
                    <h1 className="text-h1 md:text-[2rem] font-heading text-text-primary mb-2">
                        Session Complete!
                    </h1>
                    <p className="text-text-secondary mb-6">
                        You've conquered all sections. A new Knowledge Card
                        awaits!
                    </p>
                </motion.div>

                {/* Tier suspense cycling reveal (DRD §7.6 — build suspense) */}
                {!tierRevealed && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mb-8"
                    >
                        <TierSuspenseReveal
                            actualTier={tier}
                            onRevealComplete={handleTierRevealed}
                        />
                    </motion.div>
                )}

                {/* Card reveal (flips in after tier reveal) */}
                <AnimatePresence>
                    {showCard && (
                        <motion.div
                            initial={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                            animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                            transition={{
                                duration: 0.8,
                                ease: celebrationEasing,
                            }}
                            className="mb-8 flex justify-center"
                            style={{ perspective: 1000 }}
                        >
                            <div className="relative">
                                {/* Tier reveal badge */}
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: -15, opacity: 1 }}
                                    transition={{ delay: 0.5, duration: 0.4 }}
                                    className="absolute -top-6 left-1/2 -translate-x-1/2 z-10"
                                >
                                    <Badge
                                        variant={
                                            tier === "diamond"
                                                ? "primary"
                                                : tier === "gold"
                                                  ? "warning"
                                                  : tier === "silver"
                                                    ? "default"
                                                    : "warning"
                                        }
                                    >
                                        {tierEmoji[tier]} {tierLabel[tier]} Card
                                    </Badge>
                                </motion.div>

                                <KnowledgeCard
                                    title={
                                        cardData.title || "Learning Complete"
                                    }
                                    subject={
                                        cardData.subject ||
                                        cardData.subject_category ||
                                        "General"
                                    }
                                    mastery={
                                        cardData.mastery ||
                                        cardData.mastery_percentage ||
                                        80
                                    }
                                    tier={tier}
                                    quizScore={
                                        cardData.quiz_score ||
                                        cardData.quiz_avg_score ||
                                        80
                                    }
                                    focusScore={
                                        cardData.focus_score ||
                                        cardData.focus_integrity ||
                                        90
                                    }
                                    timeSpent={
                                        cardData.time_spent ||
                                        cardData.time_invested ||
                                        30
                                    }
                                    pinned={false}
                                    likes={0}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Rewards breakdown */}
                <AnimatePresence>
                    {showRewards && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <div className="bg-dark-card border border-border-subtle rounded-lg-drd p-5 text-left">
                                {/* XP Breakdown */}
                                <div className="space-y-2 mb-4">
                                    {xpBreakdown.map((item, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <span className="text-text-secondary">
                                                {item.label}
                                            </span>
                                            <span
                                                className={`font-semibold ${item.xp > 0 ? "text-success" : "text-text-muted"}`}
                                            >
                                                {item.xp > 0
                                                    ? `+${item.xp} XP`
                                                    : "—"}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Total XP */}
                                <div className="border-t border-border-subtle pt-3 flex justify-between items-center mb-2">
                                    <span className="text-body font-semibold text-text-primary flex items-center gap-1.5">
                                        <Zap
                                            size={16}
                                            className="text-primary-light"
                                        />
                                        Total XP
                                    </span>
                                    <span className="text-lg font-bold text-primary-light">
                                        +
                                        <AnimatedCounter
                                            value={totalXP}
                                            duration={1500}
                                        />{" "}
                                        XP
                                    </span>
                                </div>

                                {/* Coins */}
                                <div className="flex justify-between items-center">
                                    <span className="text-body font-semibold text-text-primary flex items-center gap-1.5">
                                        <span className="text-accent">🪙</span>
                                        Coins Earned
                                    </span>
                                    <span className="text-lg font-bold text-accent">
                                        +
                                        <AnimatedCounter
                                            value={coinsEarned}
                                            duration={1200}
                                        />
                                    </span>
                                </div>

                                {/* Streak */}
                                {streakUpdate && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="mt-3 pt-3 border-t border-border-subtle flex items-center gap-2"
                                    >
                                        <Flame
                                            size={16}
                                            className="text-accent"
                                        />
                                        <span className="text-sm text-text-secondary">
                                            Streak:{" "}
                                            <strong className="text-accent">
                                                {streakUpdate.current || 1} day
                                                {(streakUpdate.current || 1) > 1
                                                    ? "s"
                                                    : ""}
                                            </strong>
                                            {streakUpdate.is_new_day &&
                                                " 🔥 New day!"}
                                        </span>
                                    </motion.div>
                                )}

                                {/* Achievements */}
                                {achievements.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 }}
                                        className="mt-3 pt-3 border-t border-border-subtle"
                                    >
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Award
                                                size={16}
                                                className="text-accent"
                                            />
                                            <span className="text-sm font-semibold text-text-primary">
                                                New Achievements!
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            {achievements.map((ach, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{
                                                        opacity: 0,
                                                        x: 20,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                    }}
                                                    transition={{
                                                        delay: 1 + i * 0.2,
                                                    }}
                                                    className="flex items-center gap-2 bg-dark-elevated/50 rounded-md-drd px-3 py-2"
                                                >
                                                    <span className="text-lg">
                                                        {ach.icon || "🏅"}
                                                    </span>
                                                    <div>
                                                        <span className="text-sm font-medium text-text-primary">
                                                            {ach.name}
                                                        </span>
                                                        {ach.description && (
                                                            <p className="text-caption text-text-muted">
                                                                {
                                                                    ach.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CTA Buttons */}
                {showRewards && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3"
                    >
                        <Button
                            variant="ghost"
                            onClick={onShareProfile}
                            size="md"
                        >
                            <Share2 size={16} className="mr-1.5" />
                            Share
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onViewProfile}
                            size="md"
                        >
                            <User size={16} className="mr-1.5" />
                            View Profile
                        </Button>
                        <Button onClick={onContinueLearning} size="md">
                            Continue Learning
                            <ArrowRight size={16} className="ml-1.5" />
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SessionComplete;
