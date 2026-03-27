import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Share2,
    Edit,
    Users,
    Heart,
    Swords,
    MapPin,
    CalendarDays,
    BookOpen,
    Crown,
    Trophy,
    ChevronRight,
    Flame,
    Clock,
    Pin,
    Star,
    Target,
    Activity,
    Award,
    Layers,
    GraduationCap,
    BarChart3,
    CheckCircle2,
    Calendar,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import api from "../services/api";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import KnowledgeCard from "../components/profile/KnowledgeCard";
import CardDetailModal from "../components/profile/CardDetailModal";
import LearningHeatmap from "../components/profile/LearningHeatmap";
import LevelBadge from "../components/profile/LevelBadge";
import StreakDisplay from "../components/profile/StreakDisplay";
import AchievementGrid from "../components/profile/AchievementGrid";
import AchievementBadge from "../components/profile/AchievementBadge";

/* ── Activity icon / color maps ── */
const activityIconMap = {
    quiz: BarChart3, card: Layers, social: Users, streak: Flame,
    achievement: Award, course: CheckCircle2, rank_up: Crown,
    raid_complete: Users, streak_milestone: Flame,
};

const activityColors = {
    quiz: { bg: "bg-warning/10", text: "text-warning" },
    card: { bg: "bg-primary/10", text: "text-primary-light" },
    social: { bg: "bg-info/10", text: "text-info" },
    streak: { bg: "bg-danger/10", text: "text-danger" },
    achievement: { bg: "bg-accent/10", text: "text-accent" },
    course: { bg: "bg-success/10", text: "text-success" },
    rank_up: { bg: "bg-accent/10", text: "text-accent" },
    raid_complete: { bg: "bg-info/10", text: "text-info" },
    streak_milestone: { bg: "bg-danger/10", text: "text-danger" },
};

/** Map backend feed event_type to readable text */
function feedEventToText(event) {
    const d = event.event_data || {};
    switch (event.event_type) {
        case "rank_up":
            return `Ranked up to ${d.new_rank || "?"} (Level ${d.level || "?"})`;
        case "achievement":
            return `Unlocked ${d.name || "an achievement"}`;
        case "streak_milestone":
            return `${d.streak || "?"}-day learning streak!`;
        case "raid_complete":
            return `Completed a Study Raid (team score ${d.team_score || "?"}%)`;
        case "session_complete":
            return `Completed: ${d.title || "a learning session"}`;
        case "card_earned":
            return `Earned a Knowledge Card — ${d.title || ""}`;
        default:
            return d.description || event.event_type?.replace(/_/g, " ") || "Activity";
    }
}

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Subject color palette for top subjects */
const subjectColorPalette = ["#3B82F6", "#22C55E", "#EF4444", "#F59E0B", "#8B5CF6", "#06B6D4"];

function normalizeCard(card) {
    return {
        id: card.id,
        title: card.title,
        subject: card.subject_category || card.subject || "General",
        mastery: Number(card.mastery_percentage ?? card.mastery ?? 0),
        tier: String(card.tier || "bronze").toLowerCase(),
        quizScore: Number(card.quiz_avg_score ?? card.quizScore ?? 0),
        focusScore: Number(card.focus_integrity ?? card.focusScore ?? 0),
        timeSpent: Number(card.time_invested ?? card.timeSpent ?? 0),
        pinned: Boolean(card.is_pinned ?? card.pinned),
        likes: Number(card.likes ?? 0),
        raw: card,
    };
}

const PROFILE_CACHE = {
    data: null,
    timestamp: 0
};
const CACHE_TTL = 60000;

const KnowledgeProfilePage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("overview");
    const [cardFilter, setCardFilter] = useState("all");
    const [selectedCard, setSelectedCard] = useState(null);

    const [profileData, setProfileData] = useState(null);
    const [cardsData, setCardsData] = useState({ pinned: [], all: [] });
    const [achievementsData, setAchievementsData] = useState([]);
    const [activityFeed, setActivityFeed] = useState([]);
    const [studyBuddies, setStudyBuddies] = useState([]);
    const [topSubjects, setTopSubjects] = useState([]);
    const [heatmapRaw, setHeatmapRaw] = useState([]);

    useEffect(() => {
        const applyData = (profRes, cardsRes, achRes, heatRes) => {
            if (profRes.status === "fulfilled" && profRes.value.data?.data) {
                const data = profRes.value.data.data;
                setProfileData(data);
                if (data.activity_feed) setActivityFeed(data.activity_feed);
                if (data.study_buddies) setStudyBuddies(data.study_buddies);
                if (data.top_subjects) setTopSubjects(data.top_subjects);
            }
            if (cardsRes.status === "fulfilled" && cardsRes.value.data?.data) {
                const d = cardsRes.value.data.data;
                const cards = (d.cards || []).map(normalizeCard);
                setCardsData({
                    pinned: cards.filter(c => c.pinned),
                    all: cards,
                });
            }
            if (achRes.status === "fulfilled" && achRes.value.data?.data?.achievements) {
                setAchievementsData(achRes.value.data.data.achievements);
            }
            if (heatRes.status === "fulfilled" && heatRes.value.data?.data?.heatmap) {
                const map = heatRes.value.data.data.heatmap;
                setHeatmapRaw(
                    Object.entries(map).map(([date, value]) => ({
                        date,
                        sessions: Number(value.count ?? 0),
                        minutes: Number(value.minutes ?? 0),
                    }))
                );
            }
        };

        const fetchData = async () => {
            const isFresh = PROFILE_CACHE.data && (Date.now() - PROFILE_CACHE.timestamp < CACHE_TTL);
            if (PROFILE_CACHE.data) {
                const { profRes, cardsRes, achRes, heatRes } = PROFILE_CACHE.data;
                applyData(profRes, cardsRes, achRes, heatRes);
                if (isFresh) return; // return completely fresh
            }

            const [profRes, cardsRes, achRes, heatRes] = await Promise.allSettled([
                api.get("/v1/profile/me"),
                api.get("/v1/profile/me/cards?per_page=50"),
                api.get("/v1/profile/me/achievements"),
                api.get("/v1/profile/me/heatmap"),
            ]);

            PROFILE_CACHE.data = { profRes, cardsRes, achRes, heatRes };
            PROFILE_CACHE.timestamp = Date.now();
            applyData(profRes, cardsRes, achRes, heatRes);
        };
        fetchData();
    }, []);

    const tabs = ["Overview", "Cards", "Achievements"];
    const p = profileData?.user;
    const name = p?.name || user?.name || "—";
    const username = p?.username || user?.username || "user";
    const avatarUrl = p?.avatar_url || user?.avatar_url;
    const bio = p?.bio || user?.bio || "";
    const joinDate = p?.created_at
        ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "";

    const filteredCards = cardFilter === "all" ? cardsData.all : cardsData.all.filter((c) => c.tier?.toLowerCase() === cardFilter);

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/u/${username}`;
        if (navigator.share) {
            try {
                await navigator.share({ title: `${name} — Aethereum Profile`, url: shareUrl });
            } catch { /* user cancelled */ }
        } else {
            await navigator.clipboard.writeText(shareUrl);
        }
    };

    const stats = profileData?.stats || {};
    const unlockedCount = achievementsData.filter(a => a.unlocked).length;
    const totalCards = stats.total_cards ?? cardsData.all.length;
    const level = p?.level ?? user?.level ?? 1;
    const rankTitle = p?.rank ?? user?.rank ?? "Bronze";
    const currentStreak = p?.current_streak ?? 0;
    const longestStreak = p?.longest_streak ?? 0;
    const weeklyGoal = p?.weekly_goal ?? 5;
    const interests = (profileData?.interests || []).slice(0, 6);
    const topSubjectsData = topSubjects.length > 0
        ? topSubjects
        : Object.values(cardsData.all.reduce((acc, card) => {
            const key = card.subject || "General";
            if (!acc[key]) {
                acc[key] = { name: key, masterySum: 0, count: 0, color: subjectColorPalette[Object.keys(acc).length % subjectColorPalette.length] };
            }
            acc[key].masterySum += card.mastery || 0;
            acc[key].count += 1;
            return acc;
        }, {})).map((s) => ({
            name: s.name,
            mastery: Math.round(s.masterySum / Math.max(1, s.count)),
            color: s.color,
        })).slice(0, 3);

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto space-y-6">

            {/* ╔══════════════════════════════════════════════════╗
               ║  HERO BANNER + PROFILE HEADER                   ║
               ╚══════════════════════════════════════════════════╝ */}
            <div className="relative rounded-lg-drd overflow-hidden bg-dark-card border border-border">
                {/* Animated mesh gradient banner */}
                <div className="h-36 sm:h-44 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/20 to-info/30" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(124,58,237,0.3),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.25),transparent_50%)]" />
                    {/* Subtle grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "32px 32px"
                    }} />
                    {/* Floating orbs */}
                    <div className="absolute w-24 h-24 rounded-full bg-primary/20 blur-2xl top-4 left-[15%] animate-[pulse_4s_ease-in-out_infinite]" />
                    <div className="absolute w-20 h-20 rounded-full bg-info/20 blur-2xl bottom-2 right-[20%] animate-[pulse_5s_ease-in-out_infinite_1s]" />
                    <div className="absolute w-16 h-16 rounded-full bg-accent/15 blur-xl top-8 right-[40%] animate-[pulse_6s_ease-in-out_infinite_2s]" />
                </div>

                {/* Profile content below banner */}
                <div className="px-5 sm:px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start gap-5 -mt-14 sm:-mt-12">
                        {/* Avatar with rank glow ring */}
                        <div className="relative flex-shrink-0">
                            <div className="ring-[3px] ring-dark-card rounded-full shadow-lg-drd">
                                <div className="ring-2 ring-rank-gold/60 rounded-full p-[2px]">
                                    <Avatar
                                        src={avatarUrl ? (avatarUrl.startsWith("http") ? avatarUrl : `/storage/${avatarUrl}`) : null}
                                        name={name}
                                        size="2xl"
                                        online={true}
                                    />
                                </div>
                            </div>
                            {/* Level badge overlay */}
                            <div className="absolute -bottom-1 -right-1 bg-dark-card rounded-full p-0.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-primary">
                                    <span className="text-xs font-bold text-white">{level}</span>
                                </div>
                            </div>
                        </div>

                        {/* Name + info */}
                        <div className="flex-1 pt-1 sm:pt-5 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-h2 font-heading text-text-primary truncate">{name}</h1>
                                        <Badge variant="primary" className="flex items-center gap-1">
                                            <Crown size={10} /> {rankTitle}
                                        </Badge>
                                    </div>
                                    <p className="text-body-sm text-text-muted mt-0.5">@{username}</p>
                                </div>
                                {/* Action buttons */}
                                <div className="flex gap-2 flex-shrink-0">
                                    <Link to="/settings">
                                        <Button variant="secondary" size="sm">
                                            <Edit size={14} className="mr-1.5" /> Edit Profile
                                        </Button>
                                    </Link>
                                    <Button size="sm" onClick={handleShare}>
                                        <Share2 size={14} className="mr-1.5" /> Share
                                    </Button>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-body-sm text-text-secondary mt-2 max-w-xl leading-relaxed">{bio}</p>

                            {/* Interest tags */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {interests.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-primary/8 text-primary-light border border-primary/15 hover:bg-primary/15 transition-colors cursor-default">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-caption text-text-muted">
                                <span className="flex items-center gap-1"><MapPin size={11} /> Jakarta, Indonesia</span>
                                <span className="flex items-center gap-1"><CalendarDays size={11} /> Joined {joinDate}</span>
                                <span className="flex items-center gap-1"><BookOpen size={11} /> {stats.subjects_studied ?? 0} subjects studied</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Social Stats Bar ── */}
                    <div className="mt-5 pt-5 border-t border-border-subtle">
                        <div className="flex flex-wrap gap-6 sm:gap-8">
                            {[
                                { icon: Users, color: "text-primary-light", value: stats.friends_count ?? 0, label: "Friends" },
                                { icon: Heart, color: "text-danger", value: stats.total_likes ?? 0, label: "Likes Received" },
                                { icon: Swords, color: "text-warning", value: stats.duels_won ?? 0, label: "Duels Won" },
                                { icon: Layers, color: "text-tier-diamond", value: totalCards, label: "Knowledge Cards" },
                                { icon: Trophy, color: "text-accent", value: unlockedCount, label: "Achievements" },
                                { icon: Clock, color: "text-info", value: `${stats.total_study_time_hours ?? 0}h`, label: "Study Time" },
                            ].map((stat, i) => (
                                <div key={i} className="group flex items-center gap-2.5 cursor-default">
                                    <div className="w-9 h-9 rounded-lg bg-dark-secondary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-fast">
                                        <stat.icon size={15} className={stat.color} />
                                    </div>
                                    <div>
                                        <p className="text-body-sm font-bold text-text-primary leading-none">{stat.value}</p>
                                        <p className="text-[11px] text-text-muted">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ╔══════════════════════════════════════════════════╗
               ║  PLAYER CARD (Level + Streak + Weekly Goal)      ║
               ╚══════════════════════════════════════════════════╝ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Level Progress */}
                <Card className="flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-normal">
                    <LevelBadge level={level} currentXP={p?.xp ?? 0} nextLevelXP={stats.xp_next_level ?? 100} size="md" />
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-text-primary">Level {level}</p>
                        <p className="text-caption text-text-muted mb-1.5"><GraduationCap size={10} className="inline mr-1" />{rankTitle}</p>
                        <div className="h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-slow"
                                 style={{ width: `${stats.xp_next_level ? Math.round(((p?.xp ?? 0) / stats.xp_next_level) * 100) : 0}%` }} />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">{(p?.xp ?? 0).toLocaleString()} / {(stats.xp_next_level ?? 0).toLocaleString()} XP</p>
                    </div>
                </Card>

                {/* Streak */}
                <Card className="flex items-center gap-4 group hover:-translate-y-0.5 transition-all duration-normal">
                    <StreakDisplay count={currentStreak} bestStreak={longestStreak} status={currentStreak > 0 ? "active" : "inactive"} weeklyGoal={weeklyGoal} weeklyProgress={stats.weekly_progress ?? 0} compact={true} />
                    <div className="flex-1 min-w-0">
                        <p className="text-body-sm font-semibold text-text-primary flex items-center gap-1">
                            {currentStreak}-Day Streak <Flame size={13} className="text-danger" />
                        </p>
                        <p className="text-caption text-text-muted">Personal best: {longestStreak} days</p>
                        <div className="flex gap-1 mt-2">
                            {[1,2,3,4,5,6,7].map(d => (
                                <div key={d} className={`w-full h-1.5 rounded-full ${d <= (stats.weekly_progress ?? 0) ? "bg-success" : d === (stats.weekly_progress ?? 0) + 1 ? "bg-success/30" : "bg-dark-secondary"}`} />
                            ))}
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">{stats.weekly_progress ?? 0}/{weeklyGoal} days this week</p>
                    </div>
                </Card>

                {/* Top Subject Quick View */}
                <Card className="group hover:-translate-y-0.5 transition-all duration-normal">
                    <p className="text-caption text-text-muted font-medium mb-3 flex items-center gap-1">
                        <BarChart3 size={11} /> Top Subjects
                    </p>
                    <div className="space-y-2.5">
                        {topSubjectsData.map((s, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color || subjectColorPalette[i % subjectColorPalette.length]}18` }}>
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color || subjectColorPalette[i % subjectColorPalette.length] }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[11px] text-text-secondary font-medium truncate">{s.name}</span>
                                        <span className="text-[10px] text-text-muted flex-shrink-0 ml-2">{s.mastery}%</span>
                                    </div>
                                    <div className="h-1 bg-dark-secondary rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-slow" style={{ width: `${s.mastery}%`, backgroundColor: s.color || subjectColorPalette[i % subjectColorPalette.length] }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ╔══════════════════════════════════════════════════╗
               ║  TAB NAVIGATION                                  ║
               ╚══════════════════════════════════════════════════╝ */}
            <div className="flex gap-1 bg-dark-secondary/50 p-1 rounded-lg-drd border border-border-subtle w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-fast ${
                            activeTab === tab.toLowerCase()
                                ? "bg-primary text-white shadow-glow-primary"
                                : "text-text-muted hover:text-text-primary hover:bg-white/[0.03]"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ╔══════════════════════════════════════════════════╗
               ║  OVERVIEW TAB                                    ║
               ╚══════════════════════════════════════════════════╝ */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column: Main content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ── Learning Activity ── */}
                        <Card padding="spacious">
                            <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4">
                                <Calendar size={16} className="text-success" /> Learning Activity
                            </h3>
                            <LearningHeatmap rawData={heatmapRaw} />
                        </Card>

                        {/* ── Trophy Showcase ── */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2">
                                    <Trophy size={16} className="text-accent" /> Achievements
                                </h3>
                                <button onClick={() => setActiveTab("achievements")} className="text-caption text-primary-light hover:text-primary font-medium flex items-center gap-0.5 transition-colors">
                                    See all <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {achievementsData.filter(a => a.unlocked).slice(0, 6).map((a, i) => (
                                    <div key={i} className="flex-shrink-0">
                                        <AchievementBadge
                                            name={a.name}
                                            description={a.description}
                                            emoji={a.emoji}
                                            icon={a.icon}
                                            unlocked={a.unlocked}
                                            featured={a.featured}
                                            unlockedDate={a.unlockedDate}
                                            size="sm"
                                        />
                                    </div>
                                ))}
                                {/* "More" card */}
                                <div className="flex-shrink-0 w-24">
                                    <button onClick={() => setActiveTab("achievements")} className="w-full h-full min-h-[90px] bg-dark-card/50 border border-dashed border-border-subtle rounded-md-drd p-2.5 flex flex-col items-center justify-center text-center hover:border-border-hover transition-all duration-normal">
                                        <span className="text-body-sm font-bold text-text-muted">+{achievementsData.length - unlockedCount}</span>
                                        <span className="text-[9px] text-text-muted">more</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* ── Pinned Knowledge Cards ── */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2">
                                    <Pin size={14} className="text-text-muted" /> Pinned Cards
                                    <span className="text-caption text-text-muted font-normal bg-dark-secondary px-2 py-0.5 rounded-full">{cardsData.pinned.length}</span>
                                </h3>
                                <button onClick={() => setActiveTab("cards")} className="text-caption text-primary-light hover:text-primary font-medium flex items-center gap-0.5 transition-colors">
                                    View all <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {cardsData.pinned.slice(0, 4).map((c, i) => (
                                    <KnowledgeCard key={i} {...c} compact onClick={() => setSelectedCard(c)} />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right column: Sidebar */}
                    <div className="space-y-5">

                        {/* ── Study Buddies ── */}
                        <Card padding="spacious">
                            <h3 className="text-h4 font-heading text-text-primary mb-4 flex items-center gap-2">
                                <Users size={14} className="text-primary-light" /> Study Buddies
                            </h3>
                            <div className="space-y-3">
                                {studyBuddies.map((buddy, i) => (
                                    <div key={i} className="flex items-center gap-3 group">
                                        <div className="relative">
                                            <Avatar name={buddy.name} size="sm" />
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-card ${buddy.online ? "bg-success" : "bg-text-disabled"}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-body-sm text-text-secondary font-medium truncate group-hover:text-text-primary transition-colors">{buddy.name}</p>
                                            <p className="text-[10px] text-text-muted">{buddy.online ? "Online now" : "Offline"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 w-full text-center text-caption text-primary-light hover:text-primary font-medium py-2 rounded-md hover:bg-primary/5 transition-all">
                                View all friends →
                            </button>
                        </Card>

                        {/* ── Recent Activity ── */}
                        <Card padding="spacious">
                            <h3 className="text-h4 font-heading text-text-primary mb-4 flex items-center gap-2">
                                <Activity size={14} className="text-info" /> Recent Activity
                            </h3>
                            {activityFeed.length > 0 ? (
                                <div className="relative">
                                    <div className="absolute left-[13px] top-4 bottom-4 w-px bg-border-subtle" />
                                    <div className="space-y-0">
                                        {activityFeed.map((a, i) => {
                                            const evType = a.event_type || a.type;
                                            const IconComp = activityIconMap[evType] || Activity;
                                            const colors = activityColors[evType] || { bg: "bg-dark-secondary", text: "text-text-muted" };
                                            return (
                                                <div key={i} className="flex items-start gap-3 py-2.5 relative">
                                                    <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 z-10 ${colors.bg}`}>
                                                        <IconComp size={13} className={colors.text} />
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-body-sm text-text-secondary leading-snug">{a.text || feedEventToText(a)}</p>
                                                        <p className="text-[10px] text-text-muted mt-0.5">{a.time || timeAgo(a.created_at)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-body-sm text-text-muted text-center py-6">No recent activity yet</p>
                            )}
                        </Card>
                    </div>
                </div>
            )}

            {/* ╔══════════════════════════════════════════════════╗
               ║  CARDS TAB                                       ║
               ╚══════════════════════════════════════════════════╝ */}
            {activeTab === "cards" && (
                <div>
                    {/* Filter pills */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {[
                            { key: "all", label: "All", count: cardsData.all.length },
                            { key: "diamond", label: "Diamond", count: cardsData.all.filter(c=>c.tier==="diamond").length },
                            { key: "gold", label: "Gold", count: cardsData.all.filter(c=>c.tier==="gold").length },
                            { key: "silver", label: "Silver", count: cardsData.all.filter(c=>c.tier==="silver").length },
                            { key: "bronze", label: "Bronze", count: cardsData.all.filter(c=>c.tier==="bronze").length },
                        ].map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setCardFilter(f.key)}
                                className={`px-3.5 py-1.5 text-caption font-semibold rounded-full transition-all duration-fast flex items-center gap-1.5 ${
                                    cardFilter === f.key
                                        ? "bg-primary/15 text-primary-light shadow-sm-drd ring-1 ring-primary/20"
                                        : "bg-dark-card text-text-muted hover:text-text-secondary hover:bg-dark-elevated"
                                }`}
                            >
                                {f.label}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cardFilter === f.key ? "bg-primary/20" : "bg-dark-secondary"}`}>{f.count}</span>
                            </button>
                        ))}
                    </div>

                    {filteredCards.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredCards.map((c, i) => (
                                <KnowledgeCard key={i} {...c} onClick={() => setSelectedCard(c)} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Layers size={32} className="text-text-disabled mx-auto mb-3" />
                            <p className="text-text-muted text-body-sm">No cards in this tier yet</p>
                        </div>
                    )}
                </div>
            )}

            {/* ╔══════════════════════════════════════════════════╗
               ║  ACHIEVEMENTS TAB                                ║
               ╚══════════════════════════════════════════════════╝ */}
            {activeTab === "achievements" && (
                <div>
                    {/* Stats summary */}
                    <div className="flex gap-4 mb-6 flex-wrap">
                        <div className="bg-dark-card border border-border rounded-lg-drd px-5 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center">
                                <Trophy size={18} className="text-success" />
                            </div>
                            <div>
                                <p className="text-h4 font-bold text-text-primary">{unlockedCount}/{achievementsData.length}</p>
                                <p className="text-caption text-text-muted">Unlocked</p>
                            </div>
                        </div>
                        <div className="bg-dark-card border border-border rounded-lg-drd px-5 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-tier-gold/15 flex items-center justify-center">
                                <Star size={18} className="text-accent" />
                            </div>
                            <div>
                                <p className="text-h4 font-bold text-text-primary">{achievementsData.filter(a=>a.featured).length}</p>
                                <p className="text-caption text-text-muted">Featured</p>
                            </div>
                        </div>
                        <div className="bg-dark-card border border-border rounded-lg-drd px-5 py-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                                <Target size={18} className="text-primary-light" />
                            </div>
                            <div>
                                <p className="text-h4 font-bold text-text-primary">
                                    {achievementsData.filter(a=>!a.unlocked && a.progress && a.progress >= 50).length}
                                </p>
                                <p className="text-caption text-text-muted">Almost There</p>
                            </div>
                        </div>
                    </div>
                    <AchievementGrid achievements={achievementsData} />
                </div>
            )}

            {/* ── Card Detail Modal ── */}
            <CardDetailModal
                isOpen={!!selectedCard}
                onClose={() => setSelectedCard(null)}
                card={selectedCard}
                onReviewMaterial={(card) => { console.log("Review:", card.title); setSelectedCard(null); }}
                onLike={(card) => console.log("Liked:", card.title)}
                onPinToggle={(card) => console.log("Pin toggle:", card.title)}
            />
        </div>
    );
};

export default KnowledgeProfilePage;
