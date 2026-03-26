import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Swords,
    Timer,
    Brain,
    BookOpen,
    Repeat,
    Target,
    Users,
    Flame,
    ArrowRight,
    Newspaper,
    Loader2,
    ChevronRight,
    Heart,
    LayoutList,
    Rss,
} from "lucide-react";
import Avatar from "../../components/ui/Avatar";
import PostComposer from "../../components/community/PostComposer";
import PostCard from "../../components/community/PostCard";
import FriendsList from "../../components/social/FriendsList";
import { usePostStore } from "../../stores/postStore";
import { useFeedStore } from "../../stores/feedStore";
import { useFriendStore } from "../../stores/friendStore";
import { useSocialStore } from "../../stores/socialStore";
import { useChallengeStore } from "../../stores/challengeStore";
import { useAuthStore } from "../../stores/authStore";
import useNotifications from "../../hooks/useNotifications";
import useFeedSocket from "../../hooks/useFeedSocket";

const ACTIVITIES = [
    { key: "raids",     to: "/community/raids",   Icon: Swords,   label: "Study Raids",     desc: "Real-time group study",        accent: "#7C3AED" },
    { key: "duels",     to: "/community/duels",   Icon: Timer,    label: "Focus Duels",     desc: "Challenge a friend",           accent: "#EF4444" },
    { key: "arena",     to: "/community/arena",   Icon: Brain,    label: "Quiz Arena",      desc: "Live competitive quiz",        accent: "#06B6D4" },
    { key: "rooms",     to: "/community/rooms",   Icon: BookOpen, label: "Study Rooms",     desc: "Virtual study room",           accent: "#22C55E" },
    { key: "relay",     to: "/community/relay",   Icon: Repeat,   label: "Learning Relay",  desc: "Share content as a team",      accent: "#F59E0B" },
    { key: "challenge", to: "/challenge",         Icon: Target,   label: "Weekly Challenge",desc: "Community-wide goal",          accent: "#F59E0B" },
];

const EVENT_CONFIG = {
    rank_up:            { emoji: "ðŸŽ“", color: "text-primary-light", template: (d) => `leveled up to Rank ${d.new_rank || "Gold"}!` },
    achievement:        { emoji: "ðŸ…", color: "text-accent",        template: (d) => `earned badge "${d.badge_name || "Explorer"}"!` },
    streak_milestone:   { emoji: "ðŸ”¥", color: "text-warning",       template: (d) => `hit a ${d.streak_days || d.streak_count || 30}-day streak!` },
    raid_complete:      { emoji: "âš”ï¸", color: "text-danger",        template: (d) => `finished a Study Raid Â· score ${d.team_score || d.score || 95}%!` },
    duel_complete:      { emoji: "â±ï¸", color: "text-danger",        template: () => "completed a Focus Duel!" },
    challenge_complete: { emoji: "ðŸŽ¯", color: "text-success",       template: (d) => `completed "${d.challenge_title || d.challenge_name || "Challenge"}"!` },
    diamond_card:       { emoji: "ðŸ’Ž", color: "text-secondary",     template: (d) => `earned a Diamond card in ${d.subject || "a subject"}!` },
};

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const FeedEventCard = ({ event, onLike }) => {
    const cfg = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.achievement;
    const data = event.event_data || {};
    const [liked, setLiked] = useState(Boolean(event.liked_by_me));
    const [likeCount, setLikeCount] = useState(event.likes || 0);
    const handleLike = () => {
        const next = !liked;
        setLiked(next);
        setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
        onLike?.(event.id, next);
    };
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
            <div className="bg-dark-card border border-border/50 rounded-2xl p-4 flex gap-3">
                <Avatar name={event.user?.name} src={event.user?.avatar_url} size="sm" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-secondary leading-relaxed">
                        <span className="font-semibold text-text-primary">{event.user?.name || "Someone"}</span>
                        {" "}<span className={`${cfg.color} text-base`}>{cfg.emoji}</span>{" "}
                        {cfg.template(data)}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={handleLike}
                            className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-red-400" : "text-text-muted hover:text-red-400"}`}
                        >
                            <Heart size={13} fill={liked ? "currentColor" : "none"} />
                            {likeCount > 0 && <span>{likeCount}</span>}
                        </button>
                        <span className="text-[11px] text-text-disabled ml-auto">{timeAgo(event.created_at)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const UnifiedFeed = ({ tab }) => {
    const user = useAuthStore((s) => s.user);
    const { posts, loading: pL, hasMore: pH, fetchPosts, loadMore: pMore } = usePostStore();
    const { feedEvents, loading: eL, hasMore: eH, fetchFeed, loadMore: eMore, likeFeedEvent } = useFeedStore();
    const sentinelRef = useRef(null);
    useFeedSocket(user?.id);

    useEffect(() => {
        if (tab === "posts")  fetchPosts(1);
        if (tab === "events") fetchFeed(1, true);
    }, [tab]);

    useEffect(() => {
        if (!sentinelRef.current) return;
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            if (tab === "posts"  && pH && !pL) pMore();
            if (tab === "events" && eH && !eL) eMore();
        }, { threshold: 0.1 });
        obs.observe(sentinelRef.current);
        return () => obs.disconnect();
    }, [tab, pH, eH, pL, eL]);

    if (tab === "posts") {
        if (pL && posts.length === 0) return (
            <div className="space-y-3">
                {[1,2,3].map((i) => <div key={i} className="bg-dark-card border border-border/50 rounded-2xl h-32 animate-pulse" />)}
            </div>
        );
        if (!pL && posts.length === 0) return (
            <div className="flex flex-col items-center py-16 gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-dark-card border border-border/50 flex items-center justify-center">
                    <Newspaper size={28} className="text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-primary">No posts yet</p>
                <p className="text-xs text-text-muted">Be the first to share something!</p>
            </div>
        );
        return (
            <div className="space-y-3">
                {posts.map((p) => <PostCard key={p.id} post={p} />)}
                {pH && !pL && <div ref={sentinelRef} className="h-4" />}
                {pL && posts.length > 0 && <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-primary" /></div>}
            </div>
        );
    }

    if (eL && feedEvents.length === 0) return (
        <div className="space-y-3">
            {[1,2,3].map((i) => <div key={i} className="bg-dark-card border border-border/50 rounded-2xl h-20 animate-pulse" />)}
        </div>
    );
    if (!eL && feedEvents.length === 0) return (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-card border border-border/50 flex items-center justify-center">
                <Rss size={28} className="text-text-muted" />
            </div>
            <p className="text-sm font-semibold text-text-primary">No activity yet</p>
            <p className="text-xs text-text-muted">Start learning to see activity here!</p>
        </div>
    );
    return (
        <div className="space-y-3">
            {feedEvents.map((e) => <FeedEventCard key={e.id} event={e} onLike={likeFeedEvent} />)}
            {eH && !eL && <div ref={sentinelRef} className="h-4" />}
            {eL && feedEvents.length > 0 && <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-primary" /></div>}
        </div>
    );
};

const CommunityHubPage = () => {
    const user = useAuthStore((s) => s.user);
    const { friends, fetchFriends } = useFriendStore();
    const { myRaids, pendingDuels, fetchMyRaids, fetchMyDuels } = useSocialStore();
    const { currentChallenge, fetchCurrentChallenge } = useChallengeStore();
    const { fetchPosts } = usePostStore();
    const { fetchFeed } = useFeedStore();
    const [feedTab, setFeedTab] = useState("posts");
    useNotifications(user?.id);

    useEffect(() => {
        fetchFriends(); fetchMyRaids(); fetchMyDuels(); fetchCurrentChallenge();
        fetchPosts(1); fetchFeed(1, true);
    }, []);

    const activeRaids   = myRaids.filter((r) => ["active","lobby"].includes(r.status)).length;
    const pendingDuels_ = pendingDuels.length;
    const online        = friends.filter((f) => f.online || f.is_learning_now).length;

    const stats = [
        { Icon: Swords,  label: "Active Raids",   value: String(activeRaids),  color: "text-primary-light", bg: "bg-primary/10"     },
        { Icon: Timer,   label: "Pending Duels",  value: String(pendingDuels_),color: "text-red-400",       bg: "bg-red-500/10"     },
        { Icon: Users,   label: "Friends Online", value: String(online),       color: "text-emerald-400",   bg: "bg-emerald-400/10" },
        { Icon: Flame,   label: "Streak",         value: user?.streak_days ? `${user.streak_days}d` : "0d", color: "text-amber-400", bg: "bg-amber-400/10" },
    ];

    const activityStat = (key) => {
        const map = {
            raids:     activeRaids > 0  ? { label: `${activeRaids} active`,   color: "text-primary-light" } : { label: "No active",   color: "text-text-muted" },
            duels:     pendingDuels_ > 0 ? { label: `${pendingDuels_} pending`, color: "text-red-400" }      : { label: "No pending",  color: "text-text-muted" },
            arena:     { label: "Ready",  color: "text-text-muted" },
            rooms:     online > 0       ? { label: `${online} online`,         color: "text-emerald-400" }   : { label: "0 online",   color: "text-text-muted" },
            relay:     { label: "Ready",  color: "text-text-muted" },
            challenge: currentChallenge ? { label: `${currentChallenge.current_value ?? 0}/${currentChallenge.goal_value ?? "?"}`, color: "text-accent" } : { label: "â€”", color: "text-text-muted" },
        };
        return map[key] || { label: "â€”", color: "text-text-muted" };
    };

    return (
        <div className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Users size={18} className="text-white" />
                    </div>
                    Community
                </h1>
                <p className="text-sm text-text-secondary mt-1 ml-[46px]">Learn together, grow together</p>
            </div>

            {/* Quick stat bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {stats.map(({ Icon, label, value, color, bg }) => (
                    <div key={label} className="bg-dark-card border border-border/60 rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                            <Icon size={16} className={color} />
                        </div>
                        <div>
                            <p className={`text-lg font-bold font-heading ${color}`}>{value}</p>
                            <p className="text-[10px] text-text-muted">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3-column layout */}
            <div className="flex gap-5 items-start">
                {/* Left: activity sidebar (xl+) */}
                <aside className="hidden xl:flex flex-col w-56 shrink-0 gap-1 sticky top-6">
                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 mb-1">Activities</p>
                    {ACTIVITIES.map((a) => {
                        const s = activityStat(a.key);
                        return (
                            <Link key={a.key} to={a.to}
                                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-card border border-transparent hover:border-border/50 transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.accent}18` }}>
                                    <a.Icon size={15} style={{ color: a.accent }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-text-primary truncate">{a.label}</p>
                                    <p className={`text-[10px] ${s.color}`}>{s.label}</p>
                                </div>
                                <ChevronRight size={12} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </Link>
                        );
                    })}
                </aside>

                {/* Center: feed */}
                <main className="flex-1 min-w-0 space-y-4">
                    {/* Mobile activity grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 xl:hidden">
                        {ACTIVITIES.map((a) => {
                            const s = activityStat(a.key);
                            return (
                                <Link key={a.key} to={a.to}
                                    className="group bg-dark-card border border-border/60 rounded-xl p-3 hover:border-border-hover hover:-translate-y-0.5 transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.accent}18` }}>
                                            <a.Icon size={13} style={{ color: a.accent }} />
                                        </div>
                                        <span className="text-xs font-semibold text-text-primary truncate">{a.label}</span>
                                    </div>
                                    <p className={`text-[10px] ${s.color}`}>{s.label}</p>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Post Composer */}
                    <PostComposer onPosted={() => setFeedTab("posts")} />

                    {/* Feed tabs */}
                    <div className="flex gap-1 bg-dark-secondary rounded-xl p-1 border border-border/60">
                        {[
                            { id: "posts",  Icon: LayoutList, label: "Posts" },
                            { id: "events", Icon: Rss,        label: "Activity" },
                        ].map((t) => (
                            <button key={t.id} onClick={() => setFeedTab(t.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                                    feedTab === t.id ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                                }`}
                            >
                                <t.Icon size={13} /> {t.label}
                            </button>
                        ))}
                    </div>

                    <UnifiedFeed tab={feedTab} />
                </main>

                {/* Right: friends */}
                <aside className="hidden lg:block w-72 shrink-0 sticky top-6">
                    <FriendsList onAddFriend={() => {}} />
                </aside>
            </div>
        </div>
    );
};

export default CommunityHubPage;
