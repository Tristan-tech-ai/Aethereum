import React, { useEffect, useMemo, useState } from "react";
import {
    Trophy,
    Crown,
    Medal,
    TrendingUp,
    Flame,
    BookOpen,
    Clock,
    Star,
    ArrowUpRight,
    ArrowDownRight,
    User,
    Zap,
    Loader2,
} from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";

const timeFilters = ["This Week", "This Month", "All Time"];

const categoryFilters = [
    { key: "xp", label: "XP Earned", icon: Zap, endpoint: "quiz" },
    { key: "streak", label: "Streak", icon: Flame, endpoint: "streak" },
    { key: "hours", label: "Study Hours", icon: Clock, endpoint: "focus" },
    { key: "courses", label: "Cards Collected", icon: BookOpen, endpoint: "knowledge" },
];

const initials = (name = "?") =>
    String(name)
        .split(" ")
        .slice(0, 2)
        .map((s) => s[0])
        .join("")
        .toUpperCase();

const LEADERBOARD_CACHE = {};
const CACHE_TTL = 60000;

const PodiumCard = ({ entry, position, metricLabel, metricValue }) => {
    const podiumConfig = {
        1: { height: "h-44", color: "#F59E0B", ringColor: "ring-[#F59E0B]", bg: "from-[#F59E0B]/10 to-transparent", icon: Crown, label: "1st" },
        2: { height: "h-36", color: "#94A3B8", ringColor: "ring-[#94A3B8]", bg: "from-[#94A3B8]/10 to-transparent", icon: Medal, label: "2nd" },
        3: { height: "h-32", color: "#CD7F32", ringColor: "ring-[#CD7F32]", bg: "from-[#CD7F32]/10 to-transparent", icon: Medal, label: "3rd" },
    };
    const cfg = podiumConfig[position];
    const Icon = cfg.icon;

    return (
        <div className={`flex flex-col items-center ${position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3"}`}>
            <div className="relative mb-3">
                <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold ring-3 ${cfg.ringColor}`}
                    style={{ background: `${cfg.color}20`, color: cfg.color }}
                >
                    {entry.avatar}
                </div>
                <div
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: cfg.color }}
                >
                    <Icon size={12} className="text-dark-base" />
                </div>
            </div>
            <p className="text-sm font-semibold text-text-primary">{entry.name}</p>
            <p className="text-[11px] text-text-muted">@{entry.username}</p>
            <p className="text-xs font-bold mt-1" style={{ color: cfg.color }}>
                {metricValue.toLocaleString()} {metricLabel}
            </p>
            <div
                className={`${cfg.height} w-24 mt-3 rounded-t-xl bg-gradient-to-t ${cfg.bg} border border-border/40 border-b-0 flex items-start justify-center pt-3`}
            >
                <span className="text-lg font-bold font-heading" style={{ color: cfg.color }}>
                    {cfg.label}
                </span>
            </div>
        </div>
    );
};

const LeaderboardPage = () => {
    const authUser = useAuthStore((s) => s.user);
    const [timeFilter, setTimeFilter] = useState("This Week");
    const [category, setCategory] = useState("xp");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    const activeCategory = useMemo(
        () => categoryFilters.find((c) => c.key === category) ?? categoryFilters[0],
        [category],
    );

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const cacheKey = activeCategory.endpoint;
            const cached = LEADERBOARD_CACHE[cacheKey];
            const isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL);

            if (cached) {
                setRows(cached.data);
                if (isFresh) {
                    setLoading(false);
                    return;
                }
            }

            if (!cached) setLoading(true);
            try {
                const res = await api.get(`/v1/leaderboards/${activeCategory.endpoint}`);
                const payload = res.data?.data ?? res.data;
                const list = payload?.leaderboard ?? [];
                const mapped = list.map((entry, index) => ({
                    rank: index + 1,
                    id: entry.id,
                    name: entry.name,
                    username: entry.username,
                    avatar: initials(entry.name),
                    avatar_url: entry.avatar_url,
                    level: Number(entry.level ?? 0),
                    rankTitle: entry.rank ?? "Silver",
                    streak: Number(entry.current_streak ?? 0),
                    hours: Number(entry.total_learning_hours ?? 0),
                    courses: Number(entry.total_knowledge_cards ?? 0),
                    xp: Number(entry.total_xp_ever ?? entry.xp ?? 0),
                    trend: 0,
                    isYou: entry.id === authUser?.id,
                }));
                LEADERBOARD_CACHE[cacheKey] = { data: mapped, timestamp: Date.now() };
                setRows(mapped);
            } catch {
                if (!cached) setRows([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [activeCategory.endpoint, authUser?.id]);

    const topThree = rows.slice(0, 3);
    const restOfBoard = rows.slice(3);

    const yourEntry = rows.find((r) => r.isYou);
    const yourRank = yourEntry?.rank ?? 0;
    const totalPlayers = rows.length;
    const percentile = yourRank > 0 && totalPlayers > 0
        ? `Top ${Math.max(1, Math.round((yourRank / totalPlayers) * 100))}%`
        : "—";

    const getMetric = (entry) => {
        const map = { xp: entry.xp, streak: entry.streak, hours: entry.hours, courses: entry.courses };
        return Number(map[category] ?? 0);
    };

    const getMetricLabel = () => {
        const map = { xp: "XP", streak: "days", hours: "hrs", courses: "cards" };
        return map[category] ?? "value";
    };

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading font-bold text-text-primary">Leaderboard</h1>
                    <p className="text-body-sm text-text-secondary mt-1">See how you stack up against the community</p>
                </div>
                <div className="flex items-center gap-4 px-5 py-3 bg-primary/10 border border-primary/20 rounded-xl">
                    <div className="text-center">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider">Your Rank</p>
                        <p className="text-xl font-bold text-primary-light font-heading">{yourRank > 0 ? `#${yourRank}` : "—"}</p>
                    </div>
                    <div className="w-px h-8 bg-border/40" />
                    <div className="text-center">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider">Percentile</p>
                        <p className="text-sm font-semibold text-text-primary">{percentile}</p>
                    </div>
                    <div className="w-px h-8 bg-border/40" />
                    <div className="text-center">
                        <p className="text-[11px] text-text-muted uppercase tracking-wider">Change</p>
                        <div className="flex items-center gap-0.5 text-sm font-semibold text-text-muted">—</div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex items-center gap-1 p-1 bg-dark-card border border-border/40 rounded-lg">
                    {timeFilters.map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeFilter(t)}
                            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                                timeFilter === t ? "bg-primary text-white" : "text-text-secondary hover:text-text-primary hover:bg-dark-secondary"
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {categoryFilters.map((c) => (
                        <button
                            key={c.key}
                            onClick={() => setCategory(c.key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                category === c.key ? "bg-primary/10 border-primary/30 text-primary-light" : "border-border/40 text-text-secondary hover:text-text-primary hover:border-border-hover"
                            }`}
                        >
                            <c.icon size={13} />
                            {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-dark-card border border-border/60 rounded-xl p-6 pt-8 min-h-[280px]">
                {loading ? (
                    <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>
                ) : topThree.length > 0 ? (
                    <div className="flex items-end justify-center gap-6 sm:gap-10">
                        {topThree.map((entry) => (
                            <PodiumCard
                                key={entry.rank}
                                entry={entry}
                                position={entry.rank}
                                metricLabel={getMetricLabel()}
                                metricValue={getMetric(entry)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-sm text-text-muted">No leaderboard data yet.</div>
                )}
            </div>

            <div className="bg-dark-card border border-border/60 rounded-xl overflow-hidden">
                <div className="flex items-center px-5 py-3 border-b border-border/40 text-[11px] text-text-muted uppercase tracking-wider font-semibold">
                    <span className="w-12 text-center">Rank</span>
                    <span className="flex-1 pl-4">Player</span>
                    <span className="w-20 text-center hidden sm:block">Level</span>
                    <span className="w-20 text-center hidden md:block">Streak</span>
                    <span className="w-24 text-right pr-2">{activeCategory.label}</span>
                    <span className="w-16 text-center">Trend</span>
                </div>
                {rows.length === 0 && !loading ? (
                    <div className="px-5 py-8 text-center text-sm text-text-muted">No players found.</div>
                ) : (
                    restOfBoard.map((entry) => (
                        <div
                            key={entry.id ?? entry.rank}
                            className={`flex items-center px-5 py-3 border-b border-border/20 transition-colors ${entry.isYou ? "bg-primary/8 border-l-2 border-l-primary" : "hover:bg-dark-secondary/30"}`}
                        >
                            <span className="w-12 text-center">
                                {entry.rank <= 3 ? <Crown size={14} className="inline text-accent" /> : <span className="text-sm font-bold text-text-muted">{entry.rank}</span>}
                            </span>
                            <div className="flex-1 flex items-center gap-3 pl-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${entry.isYou ? "bg-primary/20 text-primary-light ring-1 ring-primary/40" : "bg-dark-secondary text-text-secondary"}`}>
                                    {entry.avatar}
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate ${entry.isYou ? "text-primary-light" : "text-text-primary"}`}>
                                        {entry.name} {entry.isYou && <span className="text-[10px] text-primary-light/60">(You)</span>}
                                    </p>
                                    <p className="text-[11px] text-text-muted">@{entry.username} · {entry.rankTitle}</p>
                                </div>
                            </div>
                            <span className="w-20 text-center text-sm font-semibold text-text-secondary hidden sm:block">Lv. {entry.level}</span>
                            <span className="w-20 text-center hidden md:flex items-center justify-center gap-1 text-sm">
                                <Flame size={13} className="text-accent" />
                                <span className="font-medium text-text-secondary">{entry.streak}</span>
                            </span>
                            <span className="w-24 text-right pr-2 text-sm font-bold font-mono text-text-primary">
                                {getMetric(entry).toLocaleString()} <span className="text-[10px] text-text-muted font-normal">{getMetricLabel()}</span>
                            </span>
                            <span className="w-16 flex items-center justify-center">
                                {entry.trend > 0 ? (
                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-success"><ArrowUpRight size={12} />+{entry.trend}</span>
                                ) : entry.trend < 0 ? (
                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-danger"><ArrowDownRight size={12} />{entry.trend}</span>
                                ) : (
                                    <span className="text-xs text-text-muted">—</span>
                                )}
                            </span>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <User size={18} className="mx-auto text-primary-light mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{totalPlayers.toLocaleString()}</p>
                    <p className="text-[11px] text-text-muted">Total Players</p>
                </div>
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <Trophy size={18} className="mx-auto text-accent mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{yourRank > 0 ? `#${yourRank}` : "—"}</p>
                    <p className="text-[11px] text-text-muted">Your Rank</p>
                </div>
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <TrendingUp size={18} className="mx-auto text-success mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{percentile}</p>
                    <p className="text-[11px] text-text-muted">Percentile</p>
                </div>
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <Star size={18} className="mx-auto text-secondary mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{Number(authUser?.total_xp_ever ?? authUser?.xp ?? 0).toLocaleString()}</p>
                    <p className="text-[11px] text-text-muted">Your Total XP</p>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
