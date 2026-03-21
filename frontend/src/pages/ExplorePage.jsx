import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Search,
    TrendingUp,
    Sparkles,
    Crown,
    BookOpen,
    ChevronRight,
    Loader2,
    Users,
    X,
} from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import UserMiniCard from "../components/social/UserMiniCard";

/* ───────────────────────── Subject tabs (PRD §6.1, DRD §5) ───────────────── */
const SUBJECTS = [
    { key: "all", label: "All Subjects", icon: "📚" },
    { key: "mathematics", label: "Mathematics", icon: "🔢" },
    { key: "physics", label: "Physics", icon: "⚛️" },
    { key: "chemistry", label: "Chemistry", icon: "🧪" },
    { key: "biology", label: "Biology", icon: "🧬" },
    { key: "computer_science", label: "Computer Science", icon: "💻" },
    { key: "history", label: "History", icon: "📜" },
    { key: "literature", label: "Literature", icon: "📖" },
    { key: "economics", label: "Economics", icon: "📊" },
    { key: "language", label: "Language", icon: "🗣️" },
];

/* ───────────────────────── Mock data generators ──────────────────────────── */
// These will be replaced when the backend endpoints (7.1) are implemented.
// They produce believable demo data so the UI is fully functional now.

const DEMO_NAMES = [
    "Andi Pratama",
    "Budi Wijaya",
    "Siti Nurhaliza",
    "Arief Hidayat",
    "Dewi Sartika",
    "Rizky Fadillah",
    "Maya Putri",
    "Fajar Nugroho",
    "Layla Asmara",
    "Dian Permata",
    "Kevin Sanjaya",
    "Nadia Hapsari",
    "Oscar Tandjung",
    "Rani Kusuma",
    "Taufik Ilham",
    "Gita Savitri",
    "Hadi Wibowo",
    "Indah Lestari",
    "Joko Susilo",
    "Kartika Dewi",
];

const SUBJECT_NAMES = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "History",
    "Literature",
    "Economics",
];

const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBetween = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const generateUser = (i, overrides = {}) => ({
    id: `user-${i}`,
    username: `user_${DEMO_NAMES[i % DEMO_NAMES.length].toLowerCase().replace(/\s/g, "_")}_${i}`,
    name: DEMO_NAMES[i % DEMO_NAMES.length],
    avatar_url: null,
    level: randomBetween(1, 80),
    xp: randomBetween(500, 50000),
    top_subject: randomPick(SUBJECT_NAMES),
    streak_count: randomBetween(0, 90),
    cards_count: randomBetween(3, 60),
    weekly_xp: randomBetween(200, 5000),
    ...overrides,
});

const generateTrending = () =>
    Array.from({ length: 10 }, (_, i) =>
        generateUser(i, {
            weekly_xp: randomBetween(2000, 8000),
            level: randomBetween(15, 75),
        }),
    ).sort((a, b) => b.weekly_xp - a.weekly_xp);

const generateRisingStars = () =>
    Array.from({ length: 8 }, (_, i) =>
        generateUser(i + 10, {
            level: randomBetween(1, 15),
            weekly_xp: randomBetween(1500, 4000),
        }),
    ).sort((a, b) => b.weekly_xp - a.weekly_xp);

const generateSages = () =>
    Array.from({ length: 6 }, (_, i) =>
        generateUser(i + 18, {
            level: randomBetween(76, 100),
            weekly_xp: randomBetween(3000, 10000),
            cards_count: randomBetween(40, 120),
        }),
    );

const generateBySubject = (subject) =>
    Array.from({ length: 5 }, (_, i) =>
        generateUser(i + 30 + SUBJECT_NAMES.indexOf(subject) * 5, {
            top_subject: subject,
            level: randomBetween(20, 80),
            weekly_xp: randomBetween(1000, 6000),
        }),
    ).sort((a, b) => b.weekly_xp - a.weekly_xp);

/* ───────────────────────── Horizontal scroll helper ──────────────────────── */
const HorizontalScrollSection = ({
    children,
    title,
    subtitle,
    icon: Icon,
    iconEmoji,
    variant,
}) => {
    const scrollRef = useRef(null);

    const titleColors = {
        trending: "from-primary to-primary-light",
        rising: "from-success to-emerald-400",
        sage: "from-warning to-amber-400",
        subject: "from-cyan-400 to-blue-400",
    };

    return (
        <section className="relative">
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {iconEmoji && <span className="text-xl">{iconEmoji}</span>}
                    {Icon && <Icon size={20} className="text-primary" />}
                    <h2
                        className={`text-h4 font-heading font-bold bg-gradient-to-r ${titleColors[variant] || titleColors.trending} bg-clip-text text-transparent`}
                    >
                        {title}
                    </h2>
                </div>
                {subtitle && (
                    <span className="text-caption text-text-muted hidden sm:block">
                        {subtitle}
                    </span>
                )}
            </div>

            {/* Scroll container */}
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide py-2 -mx-1 px-1 snap-x snap-mandatory"
            >
                {children}
            </div>
        </section>
    );
};

/* ───────────────────────── Search bar component ──────────────────────────── */
const SearchBar = ({ value, onChange, onSubmit }) => {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.();
            }}
            className="relative max-w-2xl mx-auto"
        >
            <div className="relative">
                <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Search learners by username or name..."
                    className="w-full pl-11 pr-4 py-3 bg-dark-card border border-border-subtle rounded-xl
            text-body-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
            transition-all duration-200"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </form>
    );
};

/* ───────────────────────── Search Results panel ──────────────────────────── */
const SearchResults = ({
    query,
    results,
    loading,
    onAddFriend,
    onChallenge,
    currentUserId,
}) => {
    if (!query) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
        >
            <h3 className="text-body-sm font-semibold text-text-secondary mb-3">
                Search results for "{query}"
            </h3>
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary" />
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-12">
                    <Search
                        size={40}
                        className="mx-auto text-text-muted/30 mb-3"
                    />
                    <p className="text-text-muted text-body-sm">
                        No users found matching "{query}"
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {results.map((user) => (
                        <UserMiniCard
                            key={user.id}
                            user={user}
                            variant="default"
                            onAddFriend={onAddFriend}
                            onChallenge={onChallenge}
                            isSelf={user.id === currentUserId}
                        />
                    ))}
                </div>
            )}
        </motion.section>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ExplorePage — DRD §7.8 Explore Page, PRD §6.1 Explore Page

   Layout:
   1. Search bar (prominent, top)
   2. Trending Learners carousel (horizontal scroll, UserMiniCards)
   3. Rising Stars section
   4. Hall of Sages showcase
   5. Top by Subject (tab per subject)
   ═══════════════════════════════════════════════════════════════════════════ */
const ExplorePage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    /* ─── State ─── */
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [trendingUsers, setTrendingUsers] = useState([]);
    const [risingStars, setRisingStars] = useState([]);
    const [sages, setSages] = useState([]);
    const [subjectLeaders, setSubjectLeaders] = useState({});
    const [activeSubject, setActiveSubject] = useState("all");
    const [loading, setLoading] = useState(true);

    /* ─── Fetch data ─── */
    useEffect(() => {
        const fetchExploreData = async () => {
            setLoading(true);
            try {
                // Try real API endpoints first — fall back to demo data
                const [trendingRes, risingRes, sagesRes] =
                    await Promise.allSettled([
                        api.get("/api/v1/explore/trending"),
                        api.get("/api/v1/explore/rising-stars"),
                        api.get("/api/v1/explore/hall-of-sages"),
                    ]);

                setTrendingUsers(
                    trendingRes.status === "fulfilled" &&
                        trendingRes.value?.data?.data
                        ? trendingRes.value.data.data
                        : generateTrending(),
                );
                setRisingStars(
                    risingRes.status === "fulfilled" &&
                        risingRes.value?.data?.data
                        ? risingRes.value.data.data
                        : generateRisingStars(),
                );
                setSages(
                    sagesRes.status === "fulfilled" &&
                        sagesRes.value?.data?.data
                        ? sagesRes.value.data.data
                        : generateSages(),
                );
            } catch {
                // Full fallback to demo
                setTrendingUsers(generateTrending());
                setRisingStars(generateRisingStars());
                setSages(generateSages());
            } finally {
                setLoading(false);
            }
        };

        fetchExploreData();
    }, []);

    /* ─── Subject leaders on tab change ─── */
    useEffect(() => {
        if (activeSubject === "all") return;
        const subjectName = SUBJECTS.find(
            (s) => s.key === activeSubject,
        )?.label;
        if (!subjectName || subjectLeaders[activeSubject]) return;

        const fetchSubjectLeaders = async () => {
            try {
                const res = await api.get(
                    `/api/v1/explore/by-subject/${activeSubject}`,
                );
                if (res.data?.data) {
                    setSubjectLeaders((prev) => ({
                        ...prev,
                        [activeSubject]: res.data.data,
                    }));
                    return;
                }
            } catch {
                // fallback
            }
            setSubjectLeaders((prev) => ({
                ...prev,
                [activeSubject]: generateBySubject(subjectName),
            }));
        };
        fetchSubjectLeaders();
    }, [activeSubject, subjectLeaders]);

    /* ─── Search with debounce ─── */
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await api.get(`/api/v1/users/search`, {
                    params: { q: searchQuery },
                });
                setSearchResults(res.data?.data || []);
            } catch {
                // Demo fallback
                const q = searchQuery.toLowerCase();
                const matched = [
                    ...trendingUsers,
                    ...risingStars,
                    ...sages,
                ].filter(
                    (u) =>
                        u.name?.toLowerCase().includes(q) ||
                        u.username?.toLowerCase().includes(q),
                );
                // deduplicate by id
                const seen = new Set();
                setSearchResults(
                    matched.filter((u) => {
                        if (seen.has(u.id)) return false;
                        seen.add(u.id);
                        return true;
                    }),
                );
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, trendingUsers, risingStars, sages]);

    /* ─── Action handlers ─── */
    const handleAddFriend = async (userId) => {
        try {
            await api.post(`/api/v1/friends/request/${userId}`);
        } catch {
            // silently fail — backend not ready yet
        }
    };

    const handleChallenge = (userId) => {
        navigate("/social", {
            state: { openDuel: true, targetUserId: userId },
        });
    };

    /* ─── Stagger animation ─── */
    const container = {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
    };
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2
                        size={32}
                        className="animate-spin text-primary mx-auto mb-3"
                    />
                    <p className="text-text-muted text-body-sm">
                        Loading explore...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
            {/* ─────────── Hero / Search ─────────── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-h2 font-heading font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
                    Explore Learners
                </h1>
                <p className="text-text-secondary text-body-sm max-w-lg mx-auto">
                    Discover trending learners, rising stars, and the wisest
                    Sages in the Aethereum.
                </p>
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </motion.div>

            {/* ─────────── Search Results ─────────── */}
            {searchQuery.trim() && (
                <SearchResults
                    query={searchQuery}
                    results={searchResults}
                    loading={searchLoading}
                    onAddFriend={handleAddFriend}
                    onChallenge={handleChallenge}
                    currentUserId={currentUser?.id}
                />
            )}

            {/* ─────────── Trending Learners (PRD §6.1 #1) ─────────── */}
            {!searchQuery.trim() && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <HorizontalScrollSection
                            title="Trending Learners"
                            subtitle="Most XP gained this week"
                            icon={TrendingUp}
                            variant="trending"
                        >
                            {trendingUsers.map((user, i) => (
                                <div
                                    key={user.id}
                                    className="snap-start shrink-0 w-[260px]"
                                >
                                    <UserMiniCard
                                        user={user}
                                        rank={i + 1}
                                        variant="trending"
                                        onAddFriend={handleAddFriend}
                                        onChallenge={handleChallenge}
                                        isSelf={user.id === currentUser?.id}
                                    />
                                </div>
                            ))}
                        </HorizontalScrollSection>
                    </motion.div>

                    {/* ─────────── Rising Stars (PRD §6.1 #2) ─────────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <HorizontalScrollSection
                            title="Rising Stars"
                            subtitle="New learners with highest growth rate"
                            icon={Sparkles}
                            variant="rising"
                        >
                            {risingStars.map((user, i) => (
                                <div
                                    key={user.id}
                                    className="snap-start shrink-0 w-[260px]"
                                >
                                    <UserMiniCard
                                        user={user}
                                        rank={i + 1}
                                        variant="rising"
                                        onAddFriend={handleAddFriend}
                                        onChallenge={handleChallenge}
                                        isSelf={user.id === currentUser?.id}
                                    />
                                </div>
                            ))}
                        </HorizontalScrollSection>
                    </motion.div>

                    {/* ─────────── Hall of Sages (PRD §6.1 #3) ─────────── */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">🏛️</span>
                            <h2 className="text-h4 font-heading font-bold bg-gradient-to-r from-warning to-amber-400 bg-clip-text text-transparent">
                                Hall of Sages
                            </h2>
                            <span className="text-caption text-text-muted ml-auto hidden sm:block">
                                Users who achieved Sage rank (Lv.76+)
                            </span>
                        </div>

                        {sages.length === 0 ? (
                            <div className="text-center py-12 bg-dark-card rounded-xl border border-border-subtle">
                                <Crown
                                    size={40}
                                    className="mx-auto text-warning/30 mb-3"
                                />
                                <p className="text-text-muted text-body-sm">
                                    No Sages yet — be the first!
                                </p>
                            </div>
                        ) : (
                            <motion.div
                                variants={container}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {sages.map((user) => (
                                    <motion.div key={user.id} variants={item}>
                                        <SageCard
                                            user={user}
                                            onAddFriend={handleAddFriend}
                                            onChallenge={handleChallenge}
                                            isSelf={user.id === currentUser?.id}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.section>

                    {/* ─────────── Top by Subject (PRD §6.1 #4) ─────────── */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen size={20} className="text-cyan-400" />
                            <h2 className="text-h4 font-heading font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                Top by Subject
                            </h2>
                        </div>

                        {/* Subject tabs */}
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 -mx-1 px-1">
                            {SUBJECTS.map((subject) => (
                                <button
                                    key={subject.key}
                                    onClick={() =>
                                        setActiveSubject(subject.key)
                                    }
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-caption font-medium whitespace-nowrap transition-all duration-200
                    ${
                        activeSubject === subject.key
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-dark-card text-text-muted border border-border-subtle hover:border-primary/20 hover:text-text-secondary"
                    }`}
                                >
                                    <span>{subject.icon}</span>
                                    {subject.label}
                                </button>
                            ))}
                        </div>

                        {/* Subject leaders grid */}
                        {activeSubject === "all" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                {SUBJECT_NAMES.slice(0, 4).map(
                                    (subjectName) => (
                                        <SubjectTopCard
                                            key={subjectName}
                                            subject={subjectName}
                                            users={generateBySubject(
                                                subjectName,
                                            ).slice(0, 3)}
                                            onViewMore={() => {
                                                const subj = SUBJECTS.find(
                                                    (s) =>
                                                        s.label === subjectName,
                                                );
                                                if (subj)
                                                    setActiveSubject(subj.key);
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                        ) : (
                            <motion.div
                                key={activeSubject}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4"
                            >
                                {(subjectLeaders[activeSubject] || []).map(
                                    (user, i) => (
                                        <UserMiniCard
                                            key={user.id}
                                            user={user}
                                            rank={i + 1}
                                            variant="default"
                                            onAddFriend={handleAddFriend}
                                            onChallenge={handleChallenge}
                                            isSelf={user.id === currentUser?.id}
                                        />
                                    ),
                                )}
                                {!subjectLeaders[activeSubject] && (
                                    <div className="col-span-full flex justify-center py-8">
                                        <Loader2
                                            size={24}
                                            className="animate-spin text-primary"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.section>

                    {/* ─────────── Community Stats Banner ─────────── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-primary/10 via-dark-card to-accent/10 border border-border-subtle rounded-xl p-6"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <StatBlock
                                icon="👥"
                                value={
                                    trendingUsers.length +
                                    risingStars.length +
                                    sages.length
                                }
                                label="Active Learners"
                            />
                            <StatBlock
                                icon="📚"
                                value={trendingUsers.reduce(
                                    (sum, u) => sum + (u.cards_count || 0),
                                    0,
                                )}
                                label="Cards Created"
                            />
                            <StatBlock
                                icon="🔥"
                                value={Math.max(
                                    ...trendingUsers.map(
                                        (u) => u.streak_count || 0,
                                    ),
                                    0,
                                )}
                                label="Longest Streak"
                            />
                            <StatBlock
                                icon="⚡"
                                value={trendingUsers
                                    .reduce(
                                        (sum, u) => sum + (u.weekly_xp || 0),
                                        0,
                                    )
                                    .toLocaleString()}
                                label="XP This Week"
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
};

/* ───────────────────────── SageCard — special showcase card ───────────────── */
const SageCard = ({ user, onAddFriend, onChallenge, isSelf }) => {
    const navigate = useNavigate();
    const level = user.level ?? 76;

    return (
        <motion.div
            className="relative bg-gradient-to-br from-dark-card via-dark-card to-warning/5 border border-warning/30 rounded-xl p-5 cursor-pointer
        hover:border-warning/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] transition-all duration-300"
            whileHover={{ scale: 1.01 }}
            onClick={() => navigate(`/u/${user.username}`)}
        >
            {/* Crown */}
            <div className="absolute -top-2 right-3">
                <Crown size={20} className="text-warning" fill="currentColor" />
            </div>

            <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="relative">
                    <div className="rounded-full p-0.5 bg-gradient-to-br from-warning to-amber-600">
                        <div className="rounded-full bg-dark-card p-0.5">
                            <img
                                src={
                                    user.avatar_url ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=1a1a2e&color=F59E0B&size=64`
                                }
                                alt={user.name}
                                className="w-14 h-14 rounded-full object-cover"
                            />
                        </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-base">
                        🏛️
                    </span>
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-body-sm font-bold text-text-primary truncate">
                        {user.name}
                    </h3>
                    <p className="text-caption text-text-muted">
                        @{user.username}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-caption font-semibold text-warning">
                            Lv.{level} Sage
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-caption text-text-muted">
                        <span>📚 {user.cards_count || 0} cards</span>
                        <span>🔥 {user.streak_count || 0}d</span>
                    </div>
                </div>
            </div>

            {/* Action row */}
            {!isSelf && (
                <div
                    className="flex items-center gap-2 mt-3 pt-3 border-t border-warning/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {onAddFriend && (
                        <button
                            onClick={() => onAddFriend(user.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-caption font-medium text-warning hover:text-warning/80 py-1.5 rounded-lg hover:bg-warning/10 transition-colors"
                        >
                            <Users size={13} /> Add Friend
                        </button>
                    )}
                    {onChallenge && (
                        <button
                            onClick={() => onChallenge(user.id)}
                            className="flex-1 flex items-center justify-center gap-1 text-caption font-medium text-primary hover:text-primary-light py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                        >
                            <BookOpen size={13} /> Challenge
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
};

/* ───────────────────────── SubjectTopCard — overview per subject ──────────── */
const SubjectTopCard = ({ subject, users, onViewMore }) => {
    const subjectInfo = SUBJECTS.find((s) => s.label === subject) || {};

    return (
        <div className="bg-dark-card border border-border-subtle rounded-xl p-4 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{subjectInfo.icon || "📚"}</span>
                <h3 className="text-body-sm font-semibold text-text-primary">
                    {subject}
                </h3>
            </div>

            <div className="space-y-2">
                {users.map((user, i) => (
                    <div key={user.id} className="flex items-center gap-2">
                        <span className="text-caption text-text-muted w-4">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                        </span>
                        <img
                            src={
                                user.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=1a1a2e&color=7C3AED&size=24`
                            }
                            alt=""
                            className="w-5 h-5 rounded-full"
                        />
                        <span className="text-caption text-text-secondary truncate flex-1">
                            {user.name}
                        </span>
                        <span className="text-caption text-primary font-medium">
                            +{user.weekly_xp || 0}
                        </span>
                    </div>
                ))}
            </div>

            <button
                onClick={onViewMore}
                className="w-full mt-3 pt-2 border-t border-border-subtle text-caption text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1"
            >
                View all <ChevronRight size={12} />
            </button>
        </div>
    );
};

/* ───────────────────────── StatBlock ─────────────────────────────────────── */
const StatBlock = ({ icon, value, label }) => (
    <div>
        <span className="text-2xl">{icon}</span>
        <p className="text-h4 font-bold text-text-primary mt-1">{value}</p>
        <p className="text-caption text-text-muted">{label}</p>
    </div>
);

export default ExplorePage;
