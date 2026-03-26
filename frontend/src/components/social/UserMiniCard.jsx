import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, Swords, TrendingUp, Crown } from "lucide-react";
import Avatar from "../ui/Avatar";

/* ─── Rank config (mirrors LevelBadge.jsx) ─── */
const rankConfig = {
    bronze:   { name: "Bronze",   image: "/rank/bronze (1).webp",          color: "#CD7F32", min: 1,  max: 5   },
    silver:   { name: "Silver",   image: "/rank/silver (2).webp",          color: "#94A3B8", min: 6,  max: 15  },
    gold:     { name: "Gold",     image: "/rank/gold (3).webp",            color: "#EAB308", min: 16, max: 30  },
    platinum: { name: "Platinum", image: "/rank/platinum (4).webp",        color: "#7DD3FC", min: 31, max: 50  },
    emerald:  { name: "Emerald",  image: "/rank/emerald (5).webp",         color: "#10B981", min: 51, max: 75  },
    diamond:  { name: "Diamond",  image: "/rank/diamond (tertinggi).webp", color: "#A5B4FC", min: 76, max: 100 },
};

export const getRankForLevel = (level) => {
    for (const [key, cfg] of Object.entries(rankConfig)) {
        if (level >= cfg.min && level <= cfg.max) return { key, ...cfg };
    }
    return { key: "bronze", ...rankConfig.bronze };
};

/**
 * UserMiniCard — DRD §7.8, PRD §6.1
 *
 * Compact user preview used in Explore page sections.
 * Shows avatar, username, level, rank badge, top subject.
 * Actions: Add Friend, Challenge to Duel.
 * Click navigates to public profile.
 *
 * Props:
 *  - user        { id, username, name, avatar_url, level, xp, top_subject, streak_count, cards_count, weekly_xp }
 *  - rank        (number, position in list — optional, for podium styling)
 *  - variant     'default' | 'trending' | 'rising' | 'sage'
 *  - onAddFriend (userId) => void
 *  - onChallenge (userId) => void
 *  - isFriend    boolean
 *  - isSelf      boolean
 */
const UserMiniCard = ({
    user,
    rank: position,
    variant = "default",
    onAddFriend,
    onChallenge,
    isFriend = false,
    isSelf = false,
}) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);

    const level = user.level ?? 1;
    const rankInfo = getRankForLevel(level);
    const topSubject = user.top_subject || null;
    const weeklyXP = user.weekly_xp ?? 0;
    const streakCount = user.streak_count ?? user.current_streak ?? 0;
    const cardsCount = user.cards_count ?? user.knowledge_cards_count ?? 0;

    /* ─── Variant-specific accent ─── */
    const variantStyles = {
        default: { border: "border-border-subtle", glow: "" },
        trending: {
            border: "border-primary/30",
            glow: "hover:shadow-glow-primary",
        },
        rising: {
            border: "border-success/30",
            glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.15)]",
        },
        sage: {
            border: "border-warning/40",
            glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
        },
    };
    const vs = variantStyles[variant] || variantStyles.default;

    /* ─── Podium medal for rankings ─── */
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };

    return (
        <motion.div
            className={`
        relative group bg-dark-card rounded-xl ${vs.border} border
        p-4 cursor-pointer transition-all duration-200
        hover:border-primary/50 ${vs.glow}
      `}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/u/${user.username}`)}
        >
            {/* Position badge */}
            {position && position <= 10 && (
                <div className="absolute -top-2 -left-2 z-10">
                    {position <= 3 ? (
                        <span className="text-xl">{medals[position]}</span>
                    ) : (
                        <span className="bg-dark-tertiary border border-border-subtle text-text-muted text-caption font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {position}
                        </span>
                    )}
                </div>
            )}

            {/* ── Header: avatar + info ── */}
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <Avatar
                        src={
                            user.avatar_url?.startsWith("http")
                                ? user.avatar_url
                                : user.avatar_url
                                  ? `/storage/${user.avatar_url}`
                                  : null
                        }
                        name={user.name || user.username}
                        size="md"
                    />
                    {/* Rank emoji overlay */}
                    <span
                        className="absolute -bottom-1 -right-1 text-sm"
                        title={rankInfo.name}
                    >
                        {rankInfo.emoji}
                    </span>
                </div>

                <div className="min-w-0 flex-1">
                    <h4 className="text-body-sm font-semibold text-text-primary truncate">
                        {user.name || user.username}
                    </h4>
                    <p className="text-caption text-text-muted truncate">
                        @{user.username}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span
                            className="text-caption font-medium"
                            style={{ color: rankInfo.color }}
                        >
                            Lv.{level} {rankInfo.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Stats row ── */}
            <div className="flex items-center gap-3 mt-3 text-caption text-text-muted">
                {weeklyXP > 0 && (
                    <div
                        className="flex items-center gap-1"
                        title="XP this week"
                    >
                        <TrendingUp size={12} className="text-primary" />
                        <span className="font-medium text-text-secondary">
                            +{weeklyXP.toLocaleString()} XP
                        </span>
                    </div>
                )}
                {streakCount > 0 && (
                    <div
                        className="flex items-center gap-1"
                        title="Active streak"
                    >
                        <span className="text-xs">🔥</span>
                        <span className="font-medium text-text-secondary">
                            {streakCount}d
                        </span>
                    </div>
                )}
                {cardsCount > 0 && (
                    <div
                        className="flex items-center gap-1"
                        title="Knowledge Cards"
                    >
                        <span className="text-xs">📚</span>
                        <span className="font-medium text-text-secondary">
                            {cardsCount}
                        </span>
                    </div>
                )}
            </div>

            {/* Top Subject pill */}
            {topSubject && (
                <div className="mt-2">
                    <span className="inline-block bg-primary/10 text-primary text-caption px-2 py-0.5 rounded-full">
                        {topSubject}
                    </span>
                </div>
            )}

            {/* ── Action buttons (always visible, brighter on hover) ── */}
            {!isSelf && (onAddFriend || onChallenge) && (
                <div
                    className={`flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle transition-opacity duration-150 ${
                        hovered ? "opacity-100" : "opacity-40"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {!isFriend && onAddFriend && (
                        <button
                            onClick={() => onAddFriend(user.id)}
                            className="flex items-center gap-1.5 text-caption font-medium text-primary hover:text-primary-light transition-colors px-2 py-1 rounded-md hover:bg-primary/10"
                        >
                            <UserPlus size={13} />
                            Add Friend
                        </button>
                    )}
                    {onChallenge && (
                        <button
                            onClick={() => onChallenge(user.id)}
                            className="flex items-center gap-1.5 text-caption font-medium text-warning hover:text-warning/80 transition-colors px-2 py-1 rounded-md hover:bg-warning/10"
                        >
                            <Swords size={13} />
                            Duel
                        </button>
                    )}
                </div>
            )}

            {/* Sage crown for variant === 'sage' */}
            {variant === "sage" && (
                <div className="absolute -top-2 -right-2">
                    <Crown
                        size={16}
                        className="text-warning"
                        fill="currentColor"
                    />
                </div>
            )}
        </motion.div>
    );
};

export default UserMiniCard;
