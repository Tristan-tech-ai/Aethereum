import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    ClipboardCheck,
    Zap,
    Swords,
    Users,
    Clock,
    Target,
    BookOpen,
    ChevronRight,
    Shield,
    Loader2,
    Pause,
    Play,
    Trophy,
    ArrowRight,
    ExternalLink,
} from "lucide-react";
import { useTaskStore } from "../stores/taskStore";

/* ═══════════════════════════════════════════
   TAB DEFINITIONS
   ═══════════════════════════════════════════ */

const TAB_KEYS = ["all", "learning", "quizzes", "duels", "activities"];

const tabMeta = {
    all:        { label: "All Tasks",        icon: ClipboardCheck },
    learning:   { label: "Active Learning",  icon: BookOpen },
    quizzes:    { label: "Quiz & Review",    icon: Zap },
    duels:      { label: "Active Duels",     icon: Swords },
    activities: { label: "My Activities",    icon: Users },
};

/* ═══════════════════════════════════════════
   HELPER: format seconds → human readable
   ═══════════════════════════════════════════ */
const formatTime = (seconds) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/* ═══════════════════════════════════════════
   CARD COMPONENTS
   ═══════════════════════════════════════════ */

/** Active learning session card */
const SessionCard = ({ session }) => {
    const progress = session.total_sections
        ? Math.round((session.current_section / session.total_sections) * 100)
        : 0;

    return (
        <div className="bg-dark-card border border-border/60 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <BookOpen size={18} className="text-primary-light" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                {session.content?.title || "Untitled Content"}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                                <span>{session.content?.subject_category || "General"}</span>
                                <span>·</span>
                                <span className="capitalize">{session.content?.content_type || "document"}</span>
                            </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            session.status === "paused"
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-primary/15 text-primary-light"
                        }`}>
                            {session.status === "paused" ? "Paused" : "In Progress"}
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 mb-2">
                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-text-muted">
                                Section {session.current_section + 1} of {session.total_sections}
                            </span>
                            <span className="font-semibold text-text-secondary">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-[11px] text-text-muted">
                            <span className="flex items-center gap-1">
                                <Shield size={12} />
                                Focus: {Math.round(session.focus_integrity || 0)}%
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {formatTime(session.total_focus_time)}
                            </span>
                            {session.xp_earned > 0 && (
                                <span className="flex items-center gap-1">
                                    <Zap size={12} className="text-accent" />
                                    {session.xp_earned} XP
                                </span>
                            )}
                        </div>
                        <Link
                            to={`/learn/${session.content_id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary-light hover:bg-primary/20 transition-colors"
                        >
                            {session.status === "paused" ? <Play size={12} /> : <ArrowRight size={12} />}
                            {session.status === "paused" ? "Resume" : "Continue"}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Quiz review card (sections from active sessions that need quiz retry) */
const QuizReviewCard = ({ session }) => {
    const progressData = session.progress_data || {};
    const sectionsCompleted = progressData.sections_completed || [];
    const quizScore = session.quiz_avg_score;

    return (
        <div className="bg-dark-card border border-border/60 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500/10">
                    <Zap size={18} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                {session.content?.title || "Untitled Content"}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                                <span>Section {session.current_section + 1}</span>
                                <span>·</span>
                                <span>{session.content?.subject_category || "General"}</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400">
                            Quiz Pending
                        </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-[11px] text-text-muted">
                            <span className="flex items-center gap-1">
                                <Target size={12} />
                                Avg score: {quizScore != null ? `${Math.round(quizScore)}%` : "N/A"}
                            </span>
                            <span className="flex items-center gap-1">
                                <ClipboardCheck size={12} />
                                {sectionsCompleted.length} of {session.total_sections} sections done
                            </span>
                        </div>
                        <Link
                            to={`/learn/${session.content_id}`}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                        >
                            Retry Quiz
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Duel card */
const DuelCard = ({ duel, userId }) => {
    const isChallenger = duel.challenger?.id === userId;
    const opponent = isChallenger ? duel.opponent : duel.challenger;
    const initials = opponent?.name
        ? opponent.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
        : "??";

    const statusMap = {
        pending:  { label: "Pending", color: "text-amber-400", bg: "bg-amber-500/15" },
        accepted: { label: "Accepted", color: "text-primary-light", bg: "bg-primary/15" },
        active:   { label: "Active", color: "text-success", bg: "bg-success/15" },
    };
    const st = statusMap[duel.status] || statusMap.pending;

    return (
        <div className="bg-dark-card border border-border/60 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-danger/10">
                    <Swords size={18} className="text-danger" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                Focus Duel vs {opponent?.name || "Unknown"}
                            </h3>
                            <div className="text-[11px] text-text-muted mt-0.5">
                                {duel.duration_minutes} min duel
                            </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${st.bg} ${st.color}`}>
                            {st.label}
                        </span>
                    </div>

                    {/* Opponent preview */}
                    <div className="flex items-center gap-3 mt-3 p-2.5 rounded-lg bg-dark-secondary/30 border border-border/20">
                        <div className="w-7 h-7 rounded-full bg-dark-secondary flex items-center justify-center text-[10px] font-bold text-text-secondary">
                            {initials}
                        </div>
                        <div className="text-[11px]">
                            <span className="text-text-primary font-medium">vs {opponent?.name || "Unknown"}</span>
                            {duel.status === "active" && (
                                <span className="text-text-muted ml-2">
                                    — You: {Math.round(isChallenger ? duel.challenger_focus_integrity : duel.opponent_focus_integrity || 0)}%
                                    vs {Math.round(isChallenger ? duel.opponent_focus_integrity : duel.challenger_focus_integrity || 0)}%
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-[11px] text-text-muted">
                            {duel.expires_at && (
                                <span className="flex items-center gap-1">
                                    <Clock size={12} />
                                    Expires: {new Date(duel.expires_at).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                        <Link
                            to="/community/duels"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                        >
                            {duel.status === "pending" && !isChallenger ? "Accept / Decline" : "View Duel"}
                            <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Raid card */
const RaidCard = ({ raid }) => {
    const participantCount = raid.participants?.length || 0;

    return (
        <div className="bg-dark-card border border-border/60 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-success/10">
                    <Users size={18} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                Study Raid {raid.content?.title ? `— ${raid.content.title}` : ""}
                            </h3>
                            <div className="text-[11px] text-text-muted mt-0.5">
                                {participantCount}/{raid.max_participants} participants
                            </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            raid.status === "active" ? "bg-success/15 text-success" : "bg-primary/15 text-primary-light"
                        }`}>
                            {raid.status === "active" ? "In Progress" : "In Lobby"}
                        </span>
                    </div>
                    <div className="flex items-center justify-end mt-3">
                        <Link
                            to="/community/raids"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors"
                        >
                            View Raid
                            <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** Challenge card */
const ChallengeCard = ({ challenge }) => {
    const progress = challenge.goal_value
        ? Math.round(((challenge.current_value || 0) / challenge.goal_value) * 100)
        : 0;

    return (
        <div className="bg-dark-card border border-border/60 rounded-xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent/10">
                    <Trophy size={18} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                            <h3 className="text-sm font-semibold text-text-primary">
                                {challenge.title || "Weekly Challenge"}
                            </h3>
                            <div className="text-[11px] text-text-muted mt-0.5">
                                {challenge.description?.slice(0, 80) || "Community challenge"}
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-accent/15 text-accent">
                            Challenge
                        </span>
                    </div>

                    <div className="mt-3 mb-2">
                        <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-text-muted">Community progress</span>
                            <span className="font-semibold text-text-secondary">{progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-accent transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-3">
                        <Link
                            to="/challenge"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                        >
                            View Challenge
                            <ExternalLink size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════ */

/** Section label used inside the "All" tab to separate content types */
const TabSectionLabel = ({ icon: Icon, label, count }) => (
    <div className="flex items-center gap-2 pt-3 pb-0.5">
        <Icon size={13} className="text-text-muted/60" />
        <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-text-muted/50">
            {label}
        </span>
        <span className="text-[11px] text-text-muted/35">({count})</span>
        <div className="flex-1 h-px bg-border/25 ml-1" />
    </div>
);

/** Empty state shown per-tab when there is no data */
const EmptyTabState = ({ icon: Icon, title, description }) => (
    <div className="text-center py-14 bg-dark-card border border-border/50 rounded-xl">
        <Icon size={34} className="mx-auto text-text-muted/25 mb-3" />
        <p className="text-sm font-medium text-text-secondary mb-1.5">{title}</p>
        <p className="text-xs text-text-muted max-w-xs mx-auto leading-relaxed">{description}</p>
    </div>
);

/* ═══════════════════════════════════════════
   TASKS PAGE
   ═══════════════════════════════════════════ */

const TasksPage = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get("tab") || "all";
    const [activeTab, setActiveTab] = useState(
        TAB_KEYS.includes(initialTab) ? initialTab : "all"
    );

    const {
        activeSessions,
        activeDuels,
        activeRaids,
        currentChallenge,
        summary,
        loading,
        fetchAll,
    } = useTaskStore();

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Derive quiz-review items: sessions still in progress where quiz wasn't perfect
    const quizReviewSessions = activeSessions.filter(
        (s) => s.quiz_avg_score != null && s.quiz_avg_score < 100
    );

    // Build tab counts
    const tabCounts = {
        learning:   activeSessions.length,
        quizzes:    quizReviewSessions.length,
        duels:      activeDuels.length,
        activities: activeRaids.length + (currentChallenge ? 1 : 0),
    };
    tabCounts.all = tabCounts.learning + tabCounts.duels + tabCounts.activities;

    // Get authenticated user id from first duel (if available)
    const userId = activeDuels[0]?.challenger?.id || activeDuels[0]?.opponent?.id || null;

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6 max-w-page mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading font-bold text-text-primary">
                        My Tasks
                    </h1>
                    <p className="text-body-sm text-text-secondary mt-1">
                        Track your active sessions, quizzes, duels, and activities
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <BookOpen size={18} className="mx-auto text-primary-light mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{summary.active_sessions}</p>
                    <p className="text-[10px] text-text-muted">Active Sessions</p>
                </div>
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <Swords size={18} className="mx-auto text-danger mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{summary.pending_duels}</p>
                    <p className="text-[10px] text-text-muted">Active Duels</p>
                </div>
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <Users size={18} className="mx-auto text-success mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{summary.active_raids}</p>
                    <p className="text-[10px] text-text-muted">Active Raids</p>
                </div>
                <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                    <Trophy size={18} className="mx-auto text-accent mb-2" />
                    <p className="text-xl font-bold text-text-primary font-heading">{summary.active_challenge}</p>
                    <p className="text-[10px] text-text-muted">Challenge</p>
                </div>
            </div>

            {/* Tab Filter */}
            <div className="flex items-center gap-1 p-1 bg-dark-card border border-border/40 rounded-lg overflow-x-auto">
                {TAB_KEYS.map((key) => {
                    const meta = tabMeta[key];
                    const count = tabCounts[key] || 0;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                                activeTab === key
                                    ? "bg-primary text-white"
                                    : "text-text-secondary hover:text-text-primary hover:bg-dark-secondary"
                            }`}
                        >
                            {meta.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                activeTab === key ? "bg-white/20" : "bg-dark-secondary"
                            }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex items-center justify-center gap-2 py-16 bg-dark-card border border-border/50 rounded-xl">
                    <Loader2 size={22} className="animate-spin text-primary-light" />
                    <span className="text-sm text-text-muted">Memuat tugas…</span>
                </div>
            )}

            {/* ── Content (only after loading finished) ── */}
            {!loading && (
                <div className="space-y-3">

                    {/* ─── ALL TAB ─── */}
                    {activeTab === "all" && (
                        tabCounts.all === 0 ? (
                            <EmptyTabState
                                icon={ClipboardCheck}
                                title="Belum ada tugas aktif"
                                description="Mulai belajar dari Library untuk melihat sesi aktif, atau tantang teman di Community."
                            />
                        ) : (
                            <>
                                {activeSessions.length > 0 && (
                                    <>
                                        <TabSectionLabel icon={BookOpen} label="Active Learning" count={activeSessions.length} />
                                        {activeSessions.map((s) => <SessionCard key={s.id} session={s} />)}
                                    </>
                                )}
                                {activeDuels.length > 0 && (
                                    <>
                                        <TabSectionLabel icon={Swords} label="Active Duels" count={activeDuels.length} />
                                        {activeDuels.map((d) => <DuelCard key={d.id} duel={d} userId={userId} />)}
                                    </>
                                )}
                                {(activeRaids.length > 0 || currentChallenge) && (
                                    <>
                                        <TabSectionLabel icon={Users} label="My Activities" count={activeRaids.length + (currentChallenge ? 1 : 0)} />
                                        {activeRaids.map((r) => <RaidCard key={r.id} raid={r} />)}
                                        {currentChallenge && <ChallengeCard challenge={currentChallenge} />}
                                    </>
                                )}
                            </>
                        )
                    )}

                    {/* ─── LEARNING TAB ─── */}
                    {activeTab === "learning" && (
                        activeSessions.length === 0 ? (
                            <EmptyTabState
                                icon={BookOpen}
                                title="Tidak ada sesi aktif"
                                description={(
                                    <>
                                        Buka{" "}
                                        <Link to="/library" className="text-primary-light hover:underline">Library</Link>
                                        {" "}dan mulai kursus untuk melihat sesi di sini.
                                    </>
                                )}
                            />
                        ) : (
                            activeSessions.map((s) => <SessionCard key={s.id} session={s} />)
                        )
                    )}

                    {/* ─── QUIZZES TAB ─── */}
                    {activeTab === "quizzes" && (
                        quizReviewSessions.length === 0 ? (
                            <EmptyTabState
                                icon={Zap}
                                title="Tidak ada quiz untuk direview"
                                description="Selesaikan section dalam sesi aktif untuk membuka review quiz."
                            />
                        ) : (
                            quizReviewSessions.map((s) => <QuizReviewCard key={`quiz-${s.id}`} session={s} />)
                        )
                    )}

                    {/* ─── DUELS TAB ─── */}
                    {activeTab === "duels" && (
                        activeDuels.length === 0 ? (
                            <EmptyTabState
                                icon={Swords}
                                title="Tidak ada duel aktif"
                                description={(
                                    <>
                                        Tantang teman dari halaman{" "}
                                        <Link to="/community/duels" className="text-primary-light hover:underline">Focus Duels</Link>.
                                    </>
                                )}
                            />
                        ) : (
                            activeDuels.map((d) => <DuelCard key={d.id} duel={d} userId={userId} />)
                        )
                    )}

                    {/* ─── ACTIVITIES TAB ─── */}
                    {activeTab === "activities" && (
                        (activeRaids.length === 0 && !currentChallenge) ? (
                            <EmptyTabState
                                icon={Users}
                                title="Tidak ada aktivitas aktif"
                                description={(
                                    <>
                                        Bergabung ke{" "}
                                        <Link to="/community/raids" className="text-primary-light hover:underline">Study Raid</Link>
                                        {" "}atau ikut weekly challenge dari Community.
                                    </>
                                )}
                            />
                        ) : (
                            <>
                                {activeRaids.map((r) => <RaidCard key={r.id} raid={r} />)}
                                {currentChallenge && <ChallengeCard challenge={currentChallenge} />}
                            </>
                        )
                    )}

                </div>
            )}
        </div>
    );
};

export default TasksPage;
