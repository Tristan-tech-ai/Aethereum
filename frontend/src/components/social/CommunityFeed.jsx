import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    MessageCircle,
    Newspaper,
    ArrowRight,
    Loader2,
} from "lucide-react";
import Card from "../ui/Card";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

/* ─────────────── Event type config ─────────────── */
const EVENT_CONFIG = {
    rank_up: {
        emoji: "🎓",
        color: "text-primary-light",
        bgGlow: "from-primary/10 to-transparent",
        template: (data) => `naik ke Rank ${data.new_rank || "Scholar"}!`,
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
        template: (data) => `mencapai ${data.streak_count || 30}-day streak!`,
    },
    raid_complete: {
        emoji: "⚔️",
        color: "text-danger",
        bgGlow: "from-danger/10 to-transparent",
        template: (data) =>
            `menyelesaikan Study Raid dengan team score ${data.score || 95}%!`,
    },
    challenge_complete: {
        emoji: "🎯",
        color: "text-success",
        bgGlow: "from-success/10 to-transparent",
        template: (data) =>
            `Community Challenge "${data.challenge_name || "Read-a-thon"}" tercapai! All participants +${data.coins || 100} coins`,
    },
    diamond_card: {
        emoji: "💎",
        color: "text-secondary",
        bgGlow: "from-secondary/10 to-transparent",
        template: (data) =>
            `earned a Diamond card in ${data.subject || "Molecular Biology"}!`,
    },
};

/* ─────────────── Demo data ─────────────── */
const DEMO_EVENTS = [
    {
        id: "1",
        user: { name: "Andi", avatar_url: null },
        event_type: "rank_up",
        event_data: { new_rank: "Scholar" },
        likes: 12,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
        id: "2",
        user: { name: "Budi", avatar_url: null },
        event_type: "achievement",
        event_data: { badge_name: "Quiz Master" },
        likes: 8,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    },
    {
        id: "3",
        user: { name: "Siti", avatar_url: null },
        event_type: "streak_milestone",
        event_data: { streak_count: 30 },
        likes: 24,
        liked_by_me: true,
        is_public: true,
        created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    },
    {
        id: "4",
        user: { name: "Arief", avatar_url: null },
        event_type: "raid_complete",
        event_data: { score: 95, raid_name: "Data Structures Raid" },
        likes: 15,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    },
    {
        id: "5",
        user: { name: "Maya", avatar_url: null },
        event_type: "diamond_card",
        event_data: { subject: "Molecular Biology" },
        likes: 31,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    },
    {
        id: "6",
        user: { name: "Community", avatar_url: null },
        event_type: "challenge_complete",
        event_data: { challenge_name: "Read-a-thon", coins: 100 },
        likes: 56,
        liked_by_me: true,
        is_public: true,
        created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
    },
    {
        id: "7",
        user: { name: "Dian", avatar_url: null },
        event_type: "rank_up",
        event_data: { new_rank: "Sage" },
        likes: 42,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 50 * 3600000).toISOString(),
    },
    {
        id: "8",
        user: { name: "Eka", avatar_url: null },
        event_type: "achievement",
        event_data: { badge_name: "Night Owl" },
        likes: 5,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
    },
    {
        id: "9",
        user: { name: "Fajar", avatar_url: null },
        event_type: "streak_milestone",
        event_data: { streak_count: 7 },
        likes: 9,
        liked_by_me: false,
        is_public: true,
        created_at: new Date(Date.now() - 96 * 3600000).toISOString(),
    },
    {
        id: "10",
        user: { name: "Gita", avatar_url: null },
        event_type: "raid_complete",
        event_data: { score: 88, raid_name: "Physics Raid" },
        likes: 18,
        liked_by_me: true,
        is_public: true,
        created_at: new Date(Date.now() - 120 * 3600000).toISOString(),
    },
];

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
    const [liked, setLiked] = useState(event.liked_by_me);
    const [likeCount, setLikeCount] = useState(event.likes || 0);
    const [animating, setAnimating] = useState(false);

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
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [useDemo, setUseDemo] = useState(false);
    const observerRef = useRef(null);
    const sentinelRef = useRef(null);

    /* Fetch feed events from API, fall back to demo */
    const fetchEvents = useCallback(
        async (pageNum = 1, append = false) => {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            try {
                const res = await api.get("/api/v1/feed", {
                    params: { page: pageNum, per_page: PAGE_SIZE },
                });
                
                const items = res.data?.data?.feed?.data || [];

                if (items.length === 0 && pageNum === 1) {
                    // Got empty from API — use demo
                    throw new Error("empty");
                }

                setEvents((prev) => (append ? [...prev, ...items] : items));
                setHasMore(items.length >= PAGE_SIZE);
            } catch {
                // Fallback to demo data
                if (pageNum === 1) {
                    setUseDemo(true);
                    const slice = DEMO_EVENTS.slice(0, PAGE_SIZE);
                    setEvents(slice);
                    setHasMore(DEMO_EVENTS.length > PAGE_SIZE);
                } else if (useDemo) {
                    const start = (pageNum - 1) * PAGE_SIZE;
                    const slice = DEMO_EVENTS.slice(start, start + PAGE_SIZE);
                    setEvents((prev) => [...prev, ...slice]);
                    setHasMore(start + PAGE_SIZE < DEMO_EVENTS.length);
                }
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [useDemo],
    );

    /* Initial load */
    useEffect(() => {
        fetchEvents(1);
    }, []);

    /* Infinite scroll — IntersectionObserver */
    useEffect(() => {
        if (!sentinelRef.current || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !loadingMore && hasMore) {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchEvents(nextPage, true);
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sentinelRef.current);
        observerRef.current = observer;

        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, page, fetchEvents]);

    /* Handle like */
    const handleLike = async (eventId, liked) => {
        try {
            await api.post(`/api/v1/feed/${eventId}/like`);
        } catch {
            // Silently fail — optimistic UI already updated
        }
    };

    /* ── Render ── */
    if (loading) return <FeedSkeleton />;
    if (!loading && events.length === 0) return <EmptyFeed />;

    return (
        <div className="max-w-2xl space-y-4">
            {/* Feed header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-h3 font-heading text-text-primary">
                    Community Feed
                </h2>
                {useDemo && (
                    <span className="text-caption text-text-muted bg-dark-secondary px-2 py-0.5 rounded-full">
                        Demo
                    </span>
                )}
            </div>

            {/* Event cards */}
            {events.map((event) => (
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
            {!hasMore && events.length > 0 && (
                <p className="text-center text-caption text-text-muted py-4">
                    You're all caught up! 🎉
                </p>
            )}
        </div>
    );
};

export default CommunityFeed;
