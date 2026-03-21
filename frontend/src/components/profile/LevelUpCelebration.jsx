import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getRank } from "./LevelBadge";

/**
 * LevelUpCelebration — full-screen animation when user levels up.
 *
 * DRD §10.2: Level Up → Confetti burst (Framer Motion) + scale pulse + rank update.
 * DRD §10.1: --motion-celebration = 800ms, cubic-bezier(0.34, 1.56, 0.64, 1).
 * PRD §5.3: Rank-Up Celebration → full-screen animation + notification.
 *
 * Usage:
 *   <LevelUpCelebrationManager />  — place once in app layout
 *   // Dispatch event:
 *   window.dispatchEvent(new CustomEvent('level-up', {
 *     detail: { newLevel: 16, oldLevel: 15, oldRank: 'learner', newRank: 'scholar' }
 *   }));
 */

// ── Confetti Particle ──

const ConfettiParticle = ({ index, color, containerW, containerH }) => {
    const x = useMemo(() => Math.random() * containerW, [containerW]);
    const delay = useMemo(() => Math.random() * 0.4, []);
    const rotation = useMemo(() => Math.random() * 720 - 360, []);
    const size = useMemo(() => 6 + Math.random() * 8, []);
    const shape = useMemo(
        () => (Math.random() > 0.5 ? "rounded-full" : "rounded-sm"),
        [],
    );
    const driftX = useMemo(() => (Math.random() - 0.5) * 200, []);

    return (
        <motion.div
            className={`absolute ${shape}`}
            style={{
                width: size,
                height: size * (Math.random() > 0.5 ? 1 : 0.5),
                backgroundColor: color,
                left: x,
                top: -20,
            }}
            initial={{ opacity: 1, y: -20, rotate: 0 }}
            animate={{
                opacity: [1, 1, 0],
                y: containerH + 40,
                x: driftX,
                rotate: rotation,
            }}
            transition={{
                duration: 2.5 + Math.random(),
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        />
    );
};

// ── Main Component ──

const LevelUpCelebration = ({ data, onClose }) => {
    const {
        newLevel,
        oldLevel,
        oldRank: oldRankKey,
        newRank: newRankKey,
    } = data;
    const newRank = getRank(newLevel);
    const oldRank = oldRankKey ? getRank(oldLevel) : null;
    const isRankUp = newRankKey && oldRankKey && newRankKey !== oldRankKey;
    const [phase, setPhase] = useState("burst"); // burst → reveal → done

    // Phase timing
    useEffect(() => {
        const t1 = setTimeout(() => setPhase("reveal"), 800);
        const t2 = setTimeout(() => setPhase("done"), 4500);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // Auto-close
    useEffect(() => {
        const t = setTimeout(() => onClose?.(), 6000);
        return () => clearTimeout(t);
    }, [onClose]);

    // Confetti colors — use rank color + complementary
    const confettiColors = useMemo(
        () => [
            newRank.color,
            "#FFD700",
            "#A78BFA",
            "#22C55E",
            "#F59E0B",
            "#3B82F6",
            "#EC4899",
        ],
        [newRank.color],
    );

    const particles = useMemo(
        () =>
            Array.from({ length: 60 }, (_, i) => ({
                id: i,
                color: confettiColors[i % confettiColors.length],
            })),
        [confettiColors],
    );

    return (
        <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-dark-base/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
        >
            {/* Confetti Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                    <ConfettiParticle
                        key={p.id}
                        index={p.id}
                        color={p.color}
                        containerW={
                            typeof window !== "undefined"
                                ? window.innerWidth
                                : 1920
                        }
                        containerH={
                            typeof window !== "undefined"
                                ? window.innerHeight
                                : 1080
                        }
                    />
                ))}
            </div>

            {/* Radial glow burst */}
            <motion.div
                className="absolute rounded-full"
                style={{ backgroundColor: `${newRank.color}15` }}
                initial={{ width: 0, height: 0, opacity: 0.8 }}
                animate={{ width: 600, height: 600, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            />

            {/* Content */}
            <div
                className="relative text-center z-10 px-6 max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Level ring pulse */}
                <motion.div
                    className="mx-auto mb-6"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: 0.2,
                    }}
                >
                    {/* Glowing ring */}
                    <div className="relative w-32 h-32 mx-auto">
                        <svg width={128} height={128} className="-rotate-90">
                            <circle
                                cx={64}
                                cy={64}
                                r={56}
                                fill="none"
                                stroke="#1A1A2E"
                                strokeWidth={6}
                            />
                            <motion.circle
                                cx={64}
                                cy={64}
                                r={56}
                                fill="none"
                                stroke={newRank.color}
                                strokeWidth={6}
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 56}
                                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{
                                    duration: 1.2,
                                    ease: [0.34, 1.56, 0.64, 1],
                                    delay: 0.4,
                                }}
                                style={{
                                    filter: `drop-shadow(0 0 12px ${newRank.color}80)`,
                                }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.span
                                className="text-5xl font-bold text-text-primary"
                                initial={{ scale: 2, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.34, 1.56, 0.64, 1],
                                    delay: 0.6,
                                }}
                            >
                                {newLevel}
                            </motion.span>
                        </div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                    className="text-h1 font-heading text-text-primary mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                >
                    Level Up!
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                    className="text-text-secondary mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                >
                    You reached{" "}
                    <span className="font-semibold text-text-primary">
                        Level {newLevel}
                    </span>
                </motion.p>

                {/* Rank-up announcement */}
                {isRankUp && (
                    <motion.div
                        className="mb-6 px-6 py-4 rounded-md-drd border"
                        style={{
                            borderColor: `${newRank.color}40`,
                            backgroundColor: `${newRank.color}10`,
                        }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            delay: 1.4,
                            duration: 0.8,
                            ease: [0.34, 1.56, 0.64, 1],
                        }}
                    >
                        <p className="text-caption text-text-muted uppercase tracking-wider mb-1">
                            New Rank Achieved
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            {oldRank && (
                                <>
                                    <span className="text-text-muted line-through">
                                        {oldRank.emoji} {oldRank.name}
                                    </span>
                                    <span className="text-text-muted">→</span>
                                </>
                            )}
                            <span
                                className="text-xl font-bold"
                                style={{ color: newRank.color }}
                            >
                                {newRank.emoji} {newRank.name}
                            </span>
                        </div>
                    </motion.div>
                )}

                {/* Dismiss hint */}
                <motion.p
                    className="text-caption text-text-disabled"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 0.5 }}
                >
                    Tap anywhere to continue
                </motion.p>
            </div>
        </motion.div>
    );
};

// ── Manager — listens for level-up events ──

const LevelUpCelebrationManager = () => {
    const [celebration, setCelebration] = useState(null);

    useEffect(() => {
        const handler = (e) => {
            const data = e.detail;
            if (!data?.newLevel) return;
            setCelebration(data);
        };

        window.addEventListener("level-up", handler);
        return () => window.removeEventListener("level-up", handler);
    }, []);

    const handleClose = useCallback(() => setCelebration(null), []);

    return (
        <AnimatePresence>
            {celebration && (
                <LevelUpCelebration
                    key={celebration.newLevel}
                    data={celebration}
                    onClose={handleClose}
                />
            )}
        </AnimatePresence>
    );
};

export { LevelUpCelebration };
export default LevelUpCelebrationManager;
