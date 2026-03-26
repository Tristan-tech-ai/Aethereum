import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    Clock,
    Flame,
    Zap,
    TrendingUp,
    Play,
    Pause,
    RotateCcw,
    ChevronRight,
    Trophy,
    Users,
    Target,
    Calendar,
    Award,
    Star,
    FileText,
    Globe,
    Plus,
    Upload,
    Crown,
    CheckCircle,
    ArrowRight,
    ArrowUpRight,
    GraduationCap,
    Medal,
    Rocket,
    Timer,
    BarChart3,
    Activity,
    RefreshCw,
    Loader2,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
} from "recharts";
import { useAuthStore } from "../stores/authStore";
import { useDashboard } from "../hooks/useDashboard";

/* ════════════════════════════════════════════════════════════
   ICON MAP  (maps backend icon strings to Lucide components)
   ════════════════════════════════════════════════════════════ */

const ICON_MAP = {
    rocket: Rocket,
    target: Target,
    users: Users,
    crown: Crown,
    award: Award,
    star: Star,
    trophy: Trophy,
    "book-open": BookOpen,
    flame: Flame,
    zap: Zap,
};

const resolveIcon = (iconStr) => ICON_MAP[iconStr] ?? Star;

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════ */

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, value, trend, trendLabel, color }) => (
    <div className="relative overflow-hidden rounded-xl bg-dark-card border border-border/60 p-5 group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
        <div
            className="absolute top-0 right-0 w-24 h-24 rounded-bl-[48px] opacity-[0.06] pointer-events-none"
            style={{ background: color }}
        />
        <div className="flex items-start justify-between mb-3">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18` }}
            >
                <Icon size={20} style={{ color }} />
            </div>
            <div
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                    color: trend >= 0 ? "#22C55E" : "#EF4444",
                    background:
                        trend >= 0
                            ? "rgba(34,197,94,0.1)"
                            : "rgba(239,68,68,0.1)",
                }}
            >
                <ArrowUpRight
                    size={12}
                    className={trend < 0 ? "rotate-90" : ""}
                />
                {trend >= 0 ? "+" : ""}
                {trend}%
            </div>
        </div>
        <p className="text-[11px] text-text-muted uppercase tracking-wider font-medium mb-1">
            {label}
        </p>
        <p className="text-2xl font-bold text-text-primary font-heading">
            {value}
        </p>
        <p className="text-[11px] text-text-muted mt-1">{trendLabel}</p>
    </div>
);

/* ── Custom Recharts Tooltip ── */
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-dark-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
            <p className="text-xs font-semibold text-text-primary mb-1">
                {label}
            </p>
            {payload.map((p, i) => (
                <p key={i} className="text-[11px] text-text-secondary">
                    {p.name}:{" "}
                    <span className="font-semibold text-text-primary">
                        {p.value}
                        {p.name === "hours" ? "h" : ""}
                    </span>
                </p>
            ))}
        </div>
    );
};

/* ── SVG Donut Chart ── */
const DonutChart = ({ completed, inProgress, total }) => {
    const safeTotal = Math.max(total, 1);
    const size = 148;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const completedLen = (completed / safeTotal) * circumference;
    const inProgressLen = (inProgress / safeTotal) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#1E1E32"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${completedLen} ${circumference - completedLen}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${inProgressLen} ${circumference - inProgressLen}`}
                    strokeDashoffset={-completedLen}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-text-primary font-heading">
                    {safeTotal > 0
                        ? Math.round((completed / safeTotal) * 100)
                        : 0}
                    %
                </span>
                <span className="text-[10px] text-text-muted">Completed</span>
            </div>
        </div>
    );
};

/* ── Study Timer ── */
const StudyTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [running]);

    const fmt = (s) => {
        const h = String(Math.floor(s / 3600)).padStart(2, "0");
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${h}:${m}:${sec}`;
    };

    return (
        <div className="flex flex-col items-center gap-5">
            <div className="relative">
                <div
                    className="text-4xl font-mono font-bold text-text-primary tracking-[0.12em]"
                    style={{
                        textShadow: running
                            ? "0 0 24px rgba(124,58,237,0.5)"
                            : "none",
                    }}
                >
                    {fmt(seconds)}
                </div>
                {running && (
                    <div className="absolute -inset-4 rounded-2xl border border-primary/20 animate-pulse pointer-events-none" />
                )}
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setRunning(!running)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                        running
                            ? "bg-warning/15 text-warning hover:bg-warning/25"
                            : "bg-primary/15 text-primary-light hover:bg-primary/25"
                    }`}
                >
                    {running ? (
                        <Pause size={18} />
                    ) : (
                        <Play size={18} className="ml-0.5" />
                    )}
                </button>
                <button
                    onClick={() => {
                        setRunning(false);
                        setSeconds(0);
                    }}
                    className="w-11 h-11 rounded-full flex items-center justify-center bg-dark-secondary text-text-muted hover:text-text-primary hover:bg-dark-elevated transition-all duration-200"
                >
                    <RotateCcw size={16} />
                </button>
            </div>
            <p className="text-[11px] text-text-muted">
                {running ? "Focus mode active" : "Start a study session"}
            </p>
        </div>
    );
};

/* ════════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ════════════════════════════════════════════════════════════ */

const DashboardPage = () => {
    const { user } = useAuthStore();
    const { data, loading, error, refresh } = useDashboard();

    const name = user?.name?.split(" ")[0] || "Scholar";
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 18
              ? "Good afternoon"
              : "Good evening";

    const quickStats     = data?.quick_stats      ?? {};
    const weeklyActivity = data?.weekly_activity?.length
        ? data.weekly_activity
        : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day => ({ day, hours: 0, quizzes: 0 }));
    const xpTrend = data?.xp_trend?.length
        ? data.xp_trend
        : ['W1','W2','W3','W4','W5','W6','W7'].map((week, i) => ({ week, xp: 0 }));
    const continueItems  = data?.continue_learning ?? [];
    const leaderboard    = data?.leaderboard      ?? [];
    const achievements   = data?.achievements     ?? [];
    const courseProgress = data?.course_progress  ?? { completed: 0, inProgress: 0, notStarted: 0, total: 0 };
    const communityStats = data?.community_stats  ?? {};

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading font-bold text-text-primary">
                        Dashboard
                    </h1>
                    <p className="text-body-sm text-text-secondary mt-1">
                        {greeting}, {name}! Track your progress and keep
                        learning.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/library"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-all duration-200 hover:shadow-glow-primary"
                    >
                        <Plus size={16} />
                        Generate Course
                    </Link>
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:border-border-hover bg-dark-card text-text-secondary hover:text-text-primary text-sm font-medium transition-all duration-200 disabled:opacity-50"
                    >
                        {loading
                            ? <Loader2 size={16} className="animate-spin" />
                            : <RefreshCw size={16} />}
                        {loading ? "Loading…" : "Refresh"}
                    </button>
                </div>
            </div>

            {/* ── Error banner ── */}
            {error && (
                <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
                    {error} —{" "}
                    <button onClick={refresh} className="underline hover:no-underline">
                        retry
                    </button>
                </div>
            )}

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={BookOpen}
                    label="Active Courses"
                    value={quickStats.active_courses?.value ?? 0}
                    trend={quickStats.active_courses?.trend ?? 0}
                    trendLabel={quickStats.active_courses?.trend_label ?? "In progress"}
                    color="#7C3AED"
                />
                <StatCard
                    icon={Clock}
                    label="Study Hours"
                    value={quickStats.study_hours?.value ?? "0h"}
                    trend={quickStats.study_hours?.trend ?? 0}
                    trendLabel={quickStats.study_hours?.trend_label ?? "vs last week"}
                    color="#3B82F6"
                />
                <StatCard
                    icon={Flame}
                    label="Day Streak"
                    value={quickStats.day_streak?.value ?? 0}
                    trend={quickStats.day_streak?.trend ?? 0}
                    trendLabel={quickStats.day_streak?.trend_label ?? "Keep going!"}
                    color="#F59E0B"
                />
                <StatCard
                    icon={Zap}
                    label="XP Earned"
                    value={quickStats.xp_earned?.value ?? "0"}
                    trend={quickStats.xp_earned?.trend ?? 0}
                    trendLabel={quickStats.xp_earned?.trend_label ?? "This week"}
                    color="#22C55E"
                />
            </div>

            {/* ── Row: Activity Chart + In Progress ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-dark-card border border-border/60 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={18} className="text-primary-light" />
                            <h3 className="text-sm font-semibold text-text-primary">
                                Weekly Study Activity
                            </h3>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-text-muted">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-primary" /> Hours
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-secondary" /> Sessions
                            </span>
                        </div>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyActivity} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E32" vertical={false} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.06)" }} />
                                <Bar dataKey="hours" fill="#7C3AED" radius={[6, 6, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="quizzes" fill="#06B6D4" radius={[6, 6, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-primary-light" />
                            <h3 className="text-sm font-semibold text-text-primary">In Progress</h3>
                        </div>
                        <Link to="/library" className="text-[11px] text-primary-light font-medium hover:text-primary transition-colors">
                            View All
                        </Link>
                    </div>
                    {continueItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                            <BookOpen size={24} className="text-text-muted/40" />
                            <p className="text-xs text-text-muted">No active sessions yet.</p>
                            <Link to="/library" className="text-xs text-primary-light hover:text-primary transition-colors">
                                Browse library →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {continueItems.map((item) => (
                                <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-dark-secondary/50 hover:bg-dark-secondary transition-colors">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/15 text-primary-light">
                                        <FileText size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-text-primary truncate">{item.title}</p>
                                        <p className="text-[11px] text-text-muted mt-0.5">{item.sections} sections · {item.progress}%</p>
                                        <div className="w-full h-1 bg-dark-secondary rounded-full overflow-hidden mt-1.5">
                                            <div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: item.color ?? "#7C3AED" }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Continue Learning Cards ── */}
            {continueItems.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BookOpen size={18} className="text-primary-light" />
                            <h3 className="text-sm font-semibold text-text-primary">Continue Learning</h3>
                        </div>
                        <Link to="/library" className="text-[11px] text-primary-light hover:text-primary flex items-center gap-1 transition-colors font-medium">
                            View Library <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {continueItems.map((c) => (
                                <div key={c.id} className="bg-dark-card border border-border/60 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 group">
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${c.color ?? "#7C3AED"}18` }}>
                                            <FileText size={16} style={{ color: c.color ?? "#7C3AED" }} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-text-primary leading-tight truncate">{c.title}</h4>
                                            <p className="text-[11px] text-text-muted mt-0.5">{c.subject}</p>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-[11px] mb-1.5">
                                            <span className="text-text-muted">{c.sections} sections</span>
                                            <span className="font-semibold text-text-secondary">{c.progress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.progress}%`, background: c.color ?? "#7C3AED" }} />
                                        </div>
                                    </div>
                                    <Link to={`/learn/${c.id}`} className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg border border-border/60 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-hover hover:bg-dark-secondary/50 transition-all duration-200">
                                        Continue <ChevronRight size={14} />
                                    </Link>
                                </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Row: Progress Donut + Leaderboard + Timer ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <GraduationCap size={18} className="text-primary-light" />
                        <h3 className="text-sm font-semibold text-text-primary">Course Progress</h3>
                    </div>
                    <div className="flex items-center justify-center mb-5">
                        <DonutChart completed={courseProgress.completed} inProgress={courseProgress.inProgress} total={courseProgress.total} />
                    </div>
                    <div className="flex items-center justify-center gap-5 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-success" />
                            <span className="text-[11px] text-text-muted">Completed ({courseProgress.completed})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                            <span className="text-[11px] text-text-muted">In Progress ({courseProgress.inProgress})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-dark-secondary" />
                            <span className="text-[11px] text-text-muted">Not Started ({courseProgress.notStarted})</span>
                        </div>
                    </div>
                </div>

                <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-accent" />
                            <h3 className="text-sm font-semibold text-text-primary">Leaderboard</h3>
                        </div>
                        <Link to="/explore" className="text-[11px] text-primary-light hover:text-primary flex items-center gap-1 transition-colors font-medium">
                            Full Board <ArrowRight size={12} />
                        </Link>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-6">No leaderboard data yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.map((entry) => (
                                <div key={entry.rank} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${entry.isYou ? "bg-primary/10 border border-primary/20" : "hover:bg-dark-secondary/50"}`}>
                                    <span className="w-6 flex justify-center">
                                        {entry.rank === 1 ? <Crown size={14} className="text-accent" />
                                        : entry.rank === 2 ? <Medal size={14} className="text-text-secondary" />
                                        : entry.rank === 3 ? <Medal size={14} className="text-[#CD7F32]" />
                                        : <span className="text-xs font-bold text-text-muted">{entry.rank}</span>}
                                    </span>
                                    {entry.avatar_url ? (
                                        <img src={entry.avatar_url} alt={entry.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-dark-secondary flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
                                            {entry.avatar}
                                        </div>
                                    )}
                                    <span className={`flex-1 text-xs font-medium ${entry.isYou ? "text-primary-light" : "text-text-primary"}`}>
                                        {entry.name}{" "}{entry.isYou && <span className="text-[10px] text-primary-light/60">(You)</span>}
                                    </span>
                                    <span className="text-[11px] font-mono text-text-muted">{(entry.xp ?? 0).toLocaleString()} XP</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-dark-card border border-border/60 rounded-xl p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-5">
                        <Timer size={18} className="text-primary-light" />
                        <h3 className="text-sm font-semibold text-text-primary">Study Timer</h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center"><StudyTimer /></div>
                </div>
            </div>

            {/* ── Row: XP Trend + Achievements ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Activity size={18} className="text-primary-light" />
                            <h3 className="text-sm font-semibold text-text-primary">XP Trend</h3>
                        </div>
                        <span className="text-[11px] text-text-muted">Last 7 weeks</span>
                    </div>
                    <div className="h-[180px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={xpTrend}>
                                <defs>
                                    <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E32" vertical={false} />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="xp" stroke="#7C3AED" fill="url(#xpGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Award size={18} className="text-accent" />
                            <h3 className="text-sm font-semibold text-text-primary">Achievements</h3>
                        </div>
                        <Link to="/profile" className="text-[11px] text-primary-light hover:text-primary flex items-center gap-1 transition-colors font-medium">
                            View All <ArrowRight size={12} />
                        </Link>
                    </div>
                    {achievements.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-6">No achievements yet — start learning!</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((a) => {
                                const IconComp = resolveIcon(a.icon);
                                const color = a.earned ? "#7C3AED" : "#64748B";
                                return (
                                    <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${a.earned ? "bg-dark-secondary/30 border-border/40" : "bg-dark-secondary/10 border-border/20 opacity-50"}`}>
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.earned ? `${color}18` : "#1A1A2E" }}>
                                            <IconComp size={16} style={{ color }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-text-primary truncate">{a.title}</p>
                                            <p className="text-[10px] text-text-muted truncate">{a.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Community Activity ── */}
            <div className="bg-dark-card border border-border/60 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Globe size={18} className="text-secondary" />
                        <h3 className="text-sm font-semibold text-text-primary">Community Activity</h3>
                    </div>
                    <Link to="/social" className="text-[11px] text-primary-light hover:text-primary flex items-center gap-1 transition-colors font-medium">
                        Social Hub <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { label: "Studying Now",  value: communityStats.studying_now  ?? 0, icon: BookOpen, color: "#7C3AED" },
                        { label: "Active Rooms",  value: communityStats.active_rooms  ?? 0, icon: Users,    color: "#06B6D4" },
                        { label: "Ongoing Raids", value: communityStats.ongoing_raids ?? 0, icon: Target,   color: "#EF4444" },
                        { label: "Friends Online",value: communityStats.friends_online?? 0, icon: Star,     color: "#22C55E" },
                    ].map((stat, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-dark-secondary/30 border border-border/20">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${stat.color}15` }}>
                                <stat.icon size={18} style={{ color: stat.color }} />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-text-primary font-heading">{stat.value}</p>
                                <p className="text-[11px] text-text-muted">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
