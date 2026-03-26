import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MessageCircle,
    Newspaper,
    ArrowRight,
    Loader2,
    RefreshCw,
} from "lucide-react";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useFeedStore } from "../../stores/feedStore";
import { useAuthStore } from "../../stores/authStore";
import useFeedSocket from "../../hooks/useFeedSocket";

/* ─────────────── Event type config ─────────────── */
const EVENT_CONFIG = {
    rank_up: {
        emoji: "🎓",
        color: "text-primary-light",
        bgGlow: "from-primary/10 to-transparent",
        template: (data) => `naik ke Rank ${data.new_rank || "Gold"}!`,
    },
    achievement: {
        emoji: "🏅",
        color: "text-accent",
        bgGlow: "from-accent/10 to-transparent",
        template: (data) =>
            `mendapat badge "${data.badge_name || "Quiz Master"}"!`,
    },
    streak_milestone: {
        emoji: "🔥",
        color: "text-warning",
        bgGlow: "from-warning/10 to-transparent",
        template: (data) => `mencapai ${data.streak_days || data.streak_count || 30}-day streak!`,
    },
    raid_complete: {
        emoji: "⚔️",
        color: "text-danger",
        bgGlow: "from-danger/10 to-transparent",
        template: (data) =>
            `menyelesaikan Study Raid dengan team score ${data.team_score || data.score || 95}%!`,
    },
    duel_complete: {
        emoji: "⏱️",
        color: "text-danger",
        bgGlow: "from-danger/10 to-transparent",
        template: () => "menyelesaikan Focus Duel!",
    },
    challenge_complete: {
        emoji: "🎯",
        color: "text-success",
        bgGlow: "from-success/10 to-transparent",
        template: (data) =>
            `Community Challenge "${data.challenge_title || data.challenge_name || "Read-a-thon"}" tercapai!`,
    },
    diamond_card: {
        emoji: "💎",
        color: "text-secondary",
        bgGlow: "from-secondary/10 to-transparent",
        template: (data) =>
            `earned a Diamond card in ${data.subject || "Molecular Biology"}!`,
    },
};

const PAGE_SIZE = 5;

/* ─────────────── Time formatter ─────────────── */
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
    });
}

/* ─────────────── Skeleton ─────────────── */
const FeedSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <div
                key={i}
                className="bg-dark-card border border-border rounded-md-drd p-5 flex items-start gap-3 animate-pulse"
            >
                <div className="w-9 h-9 rounded-full bg-[#1A1A2E]" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-[#1A1A2E] rounded w-3/4" />
                    <div className="h-3 bg-[#1A1A2E] rounded w-1/3" />
                </div>
            </div>
        ))}
    </div>
);

/* ─────────────── Empty state (DRD §14.1) ─────────────── */
const EmptyFeed = () => {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-dark-card border border-border flex items-center justify-center mb-6">
                <Newspaper size={32} className="text-text-muted" />
            </div>
            <h3 className="text-lg font-heading text-text-primary mb-2">
                No activity yet
            </h3>
            <p className="text-sm text-text-muted max-w-xs mb-6">
                Start learning to appear in the community feed!
            </p>
            <Button onClick={() => navigate("/dashboard")}>
                Start Session <ArrowRight size={16} className="ml-1.5" />
            </Button>
        </div>
    );
};

/* ─────────────── Single feed event card ─────────────── */
const FeedEventCard = ({ event, onLike }) => {
    const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.achievement;
    const data = event.event_data || {};
    const userName = event.user?.name || "Unknown";
    const [liked, setLiked] = useState(Boolean(event.liked_by_me ?? event.is_liked));
    const [likeCount, setLikeCount] = useState(event.likes || 0);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        setLiked(Boolean(event.liked_by_me ?? event.is_liked));
        setLikeCount(event.likes || 0);
    }, [event.id, event.liked_by_me, event.is_liked, event.likes]);

    const handleLike = () => {
        const newLiked = !liked;
        setLiked(newLiked);
        setLikeCount((c) => (newLiked ? c + 1 : Math.max(0, c - 1)));
        if (newLiked) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 600);
        }
        onLike?.(event.id, newLiked);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
        >
            <div className="bg-dark-card border border-border rounded-md-drd p-5 group relative overflow-hidden">
                {/* Subtle glow bar */}
                <div
                    className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${config.bgGlow} opacity-60`}
                />

                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar
                        name={userName}
                        size="sm"
                        src={event.user?.avatar_url}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-secondary leading-relaxed">
                            <span className="font-semibold text-text-primary">
                                {userName}
                            </span>{" "}
                            <span className={`${config.color} text-base`}>
                                {config.emoji}
                            </span>{" "}
                            {config.template(data)}
                        </p>

                        {/* Actions row */}
                        <div className="flex items-center gap-4 mt-2">
                            {/* Like button */}
                            <button
                                onClick={handleLike}
                                className={`flex items-center gap-1.5 text-caption transition-colors duration-200 ${
                                    liked
                                        ? "text-danger"
                                        : "text-text-muted hover:text-danger"
                                }`}
                            >
                                <span className="relative">
                                    <Heart
                                        size={15}
                                        fill={liked ? "currentColor" : "none"}
                                        className="transition-transform duration-200"
                                    />
                                    {/* Like burst animation */}
                                    {animating && (
                                        <motion.span
                                            initial={{ scale: 0.5, opacity: 1 }}
                                            animate={{ scale: 2.5, opacity: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                        >
                                            <Heart
                                                size={15}
                                                fill="currentColor"
                                                className="text-danger"
                                            />
                                        </motion.span>
                                    )}
                                </span>
                                <span className="font-medium">{likeCount}</span>
                            </button>

                            {/* Comment placeholder */}
                            <button className="flex items-center gap-1.5 text-caption text-text-muted hover:text-text-secondary transition-colors">
                                <MessageCircle size={14} />
                                <span>Comment</span>
                            </button>

                            {/* Timestamp */}
                            <span className="text-caption text-text-muted ml-auto">
                                {timeAgo(event.created_at)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ─────────────── Main CommunityFeed ─────────────── */
const CommunityFeed = () => {
    const user = useAuthStore((state) => state.user);
    const {
        feedEvents,
        loading,
        error,
        hasMore,
        page,
        fetchFeed,
        loadMore,
        likeFeedEvent,
        clearError,
    } = useFeedStore();

    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef(null);
    const sentinelRef = useRef(null);

    useFeedSocket(user?.id);

    /* Fetch feed events from API */
    /* Initial load */
    useEffect(() => {
        fetchFeed(1, true);
    }, [fetchFeed]);

    /* Passive refresh on focus + interval */
    useEffect(() => {
        const onFocus = () => fetchFeed(1, true);
        window.addEventListener("focus", onFocus);

        const intervalId = setInterval(() => {
            fetchFeed(1, true);
        }, 45000);

        return () => {
            window.removeEventListener("focus", onFocus);
            clearInterval(intervalId);
        };
    }, [fetchFeed]);

    /* Infinite scroll — IntersectionObserver */
    useEffect(() => {
        if (!sentinelRef.current || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loadingMore && hasMore) {
                    setLoadingMore(true);
                    loadMore().finally(() => setLoadingMore(false));
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinelRef.current);
        observerRef.current = observer;

        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, page, loadMore]);

    /* Handle like */
    const handleLike = async (eventId, liked) => {
        await likeFeedEvent(eventId, liked);
    };

    /* ── Render ── */
    if (loading) return <FeedSkeleton />;
    if (!loading && feedEvents.length === 0) return <EmptyFeed />;

    return (
        <div className="max-w-2xl space-y-4">
            {/* Feed header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-h3 font-heading text-text-primary">
                    Community Feed
                </h2>
                <button
                    type="button"
                    onClick={() => fetchFeed(1, true)}
                    className="inline-flex items-center gap-1.5 text-caption text-text-muted hover:text-text-secondary transition-colors"
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {error && (
                <Card>
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-danger">{error}</p>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={clearError}>Dismiss</Button>
                            <Button size="sm" onClick={() => fetchFeed(1, true)}>Retry</Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Event cards */}
            {feedEvents.map((event) => (
                <FeedEventCard
                    key={event.id}
                    event={event}
                    onLike={handleLike}
                />
            ))}

            {/* Loading more spinner */}
            {loadingMore && (
                <div className="flex justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-primary" />
                </div>
            )}

            {/* Infinite scroll sentinel */}
            {hasMore && <div ref={sentinelRef} className="h-4" />}

            {/* End of feed */}
            {!hasMore && feedEvents.length > 0 && (
                <p className="text-center text-caption text-text-muted py-4">
                    You're all caught up! 🎉
                </p>
            )}
        </div>
    );
};

export default CommunityFeed;
