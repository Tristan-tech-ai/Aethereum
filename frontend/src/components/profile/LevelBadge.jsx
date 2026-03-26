import React from "react";
import { motion } from "framer-motion";

/**
 * Rank configuration — DRD §2.1 Rank Colors, PRD §5.3 Rank System.
 */
const rankConfig = {
    bronze:   { name: "Bronze",   image: "/rank/bronze (1).webp",          color: "#CD7F32", min: 1,  max: 5   },
    silver:   { name: "Silver",   image: "/rank/silver (2).webp",          color: "#94A3B8", min: 6,  max: 15  },
    gold:     { name: "Gold",     image: "/rank/gold (3).webp",            color: "#EAB308", min: 16, max: 30  },
    platinum: { name: "Platinum", image: "/rank/platinum (4).webp",        color: "#7DD3FC", min: 31, max: 50  },
    emerald:  { name: "Emerald",  image: "/rank/emerald (5).webp",         color: "#10B981", min: 51, max: 75  },
    diamond:  { name: "Diamond",  image: "/rank/diamond (tertinggi).webp", color: "#A5B4FC", min: 76, max: 100 },
};

/**
 * XP formula from PRD §5.2:
 * XP_needed(level) = round(100 * (level^1.5))
 */
const xpForLevel = (level) => Math.round(100 * Math.pow(level, 1.5));

/**
 * Get XP required to go from `level` to `level + 1`.
 */
const xpToNextLevel = (level) => xpForLevel(level + 1) - xpForLevel(level);

/**
 * Calculate level + progress from total XP.
 */
const levelFromXP = (totalXP) => {
    let lvl = 1;
    while (lvl < 100 && xpForLevel(lvl + 1) <= totalXP) lvl++;
    const currentLevelXP = totalXP - xpForLevel(lvl);
    const needed = xpToNextLevel(lvl);
    return {
        level: lvl,
        currentXP: Math.max(0, currentLevelXP),
        nextLevelXP: needed,
    };
};

const getRank = (level) => {
    for (const [key, config] of Object.entries(rankConfig)) {
        if (level >= config.min && level <= config.max)
            return { key, ...config };
    }
    return { key: "bronze", ...rankConfig.bronze };
};

/**
 * LevelBadge — DRD §8.3 Level & XP Display.
 *
 * - Circular progress ring (SVG), 80px diameter (md)
 * - Level number centered (bold, 24px)
 * - Ring color = current rank color + glow matching rank
 * - XP bar (full width, height 8px, rounded) below
 * - Text: "{current_xp} / {next_level_xp} XP"
 */
const LevelBadge = ({
    level = 1,
    currentXP = 0,
    nextLevelXP = 100,
    size = "md",
    showRank = true,
    showXP = true,
    animated = true,
    className = "",
}) => {
    const rank = getRank(level);
    const progress =
        nextLevelXP > 0 ? Math.min((currentXP / nextLevelXP) * 100, 100) : 0;

    const sizes = {
        sm: {
            ring: 48,
            stroke: 3,
            text: "text-sm",
            label: "text-[9px]",
            emoji: "text-xs",
        },
        md: {
            ring: 80,
            stroke: 4,
            text: "text-2xl",
            label: "text-caption",
            emoji: "text-sm",
        },
        lg: {
            ring: 96,
            stroke: 5,
            text: "text-3xl",
            label: "text-body-sm",
            emoji: "text-base",
        },
        xl: {
            ring: 128,
            stroke: 6,
            text: "text-4xl",
            label: "text-body",
            emoji: "text-lg",
        },
    };
    const s = sizes[size] || sizes.md;
    const radius = (s.ring - s.stroke * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    // DRD: Glow intensity increases with higher rank
    const glowIntensity = {
        bronze:   4,
        silver:   6,
        gold:     8,
        platinum: 10,
        emerald:  12,
        diamond:  16,
    };
    const glow = glowIntensity[rank.key] || 6;

    return (
        <div className={`flex flex-col items-center gap-1.5 ${className}`}>
            {/* SVG Ring */}
            <div className="relative" style={{ width: s.ring, height: s.ring }}>
                <svg width={s.ring} height={s.ring} className="-rotate-90">
                    {/* Track */}
                    <circle
                        cx={s.ring / 2}
                        cy={s.ring / 2}
                        r={radius}
                        fill="none"
                        stroke="#1A1A2E"
                        strokeWidth={s.stroke}
                    />
                    {/* Progress — animated on mount via motion */}
                    <motion.circle
                        cx={s.ring / 2}
                        cy={s.ring / 2}
                        r={radius}
                        fill="none"
                        stroke={rank.color}
                        strokeWidth={s.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={
                            animated
                                ? { strokeDashoffset: circumference }
                                : false
                        }
                        animate={{ strokeDashoffset: offset }}
                        transition={{
                            duration: 0.8,
                            ease: [0.34, 1.56, 0.64, 1],
                        }}
                        style={{
                            filter: `drop-shadow(0 0 ${glow}px ${rank.color}60)`,
                        }}
                    />
                </svg>
                {/* Level Number */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${s.text} font-bold text-text-primary`}>
                        {level}
                    </span>
                </div>
            </div>

            {/* Rank Name */}
            {showRank && (
                <div className="flex items-center gap-1">
                    <span className={s.emoji}>{rank.emoji}</span>
                    <span
                        className={`${s.label} font-semibold`}
                        style={{ color: rank.color }}
                    >
                        {rank.name}
                    </span>
                </div>
            )}

            {/* XP Progress — DRD: height 8px (h-2), rounded, rank color fill */}
            {showXP && (
                <div className="w-full max-w-[140px]">
                    <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            initial={animated ? { width: 0 } : false}
                            animate={{ width: `${progress}%` }}
                            transition={{
                                duration: 0.6,
                                ease: "easeOut",
                                delay: 0.3,
                            }}
                            style={{ backgroundColor: rank.color }}
                        />
                    </div>
                    <p className="text-[10px] text-text-muted text-center mt-0.5">
                        {currentXP.toLocaleString()} /{" "}
                        {nextLevelXP.toLocaleString()} XP
                    </p>
                </div>
            )}
        </div>
    );
};

export { getRank, rankConfig, xpForLevel, xpToNextLevel, levelFromXP };
export default LevelBadge;
