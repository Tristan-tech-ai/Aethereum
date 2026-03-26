import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, Sparkles, Crown, BookOpen, Loader2, Users, X } from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../stores/authStore";
import UserMiniCard from "../components/social/UserMiniCard";

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

const ExplorePage = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const [trendingUsers, setTrendingUsers] = useState([]);
    const [risingStars, setRisingStars] = useState([]);
    const [sages, setSages] = useState([]);
    const [subjectLeaders, setSubjectLeaders] = useState({});
    const [activeSubject, setActiveSubject] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExploreData = async () => {
            setLoading(true);
            try {
                const [trendingRes, risingRes, sagesRes] = await Promise.all([
                    api.get("/v1/explore/trending"),
                    api.get("/v1/explore/rising-stars"),
                    api.get("/v1/explore/hall-of-sages"),
                ]);

                setTrendingUsers((trendingRes.data?.data ?? trendingRes.data)?.users ?? []);
                setRisingStars((risingRes.data?.data ?? risingRes.data)?.users ?? []);
                setSages((sagesRes.data?.data ?? sagesRes.data)?.users ?? []);
            } catch {
                setTrendingUsers([]);
                setRisingStars([]);
                setSages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchExploreData();
    }, []);

    useEffect(() => {
        if (activeSubject === "all" || subjectLeaders[activeSubject]) return;

        const fetchSubjectLeaders = async () => {
            try {
                const res = await api.get(`/v1/explore/by-subject/${activeSubject}`);
                const users = (res.data?.data ?? res.data)?.users ?? [];
                setSubjectLeaders((prev) => ({ ...prev, [activeSubject]: users }));
            } catch {
                setSubjectLeaders((prev) => ({ ...prev, [activeSubject]: [] }));
            }
        };
        fetchSubjectLeaders();
    }, [activeSubject, subjectLeaders]);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await api.get(`/v1/users/search`, { params: { q: searchQuery } });
                setSearchResults((res.data?.data ?? res.data)?.users ?? []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleAddFriend = async (userId) => {
        try {
            await api.post(`/v1/friends/request/${userId}`);
        } catch {}
    };

    const handleChallenge = (userId) => {
        navigate("/social", { state: { openDuel: true, targetUserId: userId } });
    };

    const activeUsers = useMemo(() => {
        if (activeSubject === "all") return [];
        return subjectLeaders[activeSubject] ?? [];
    }, [activeSubject, subjectLeaders]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                <h1 className="text-h2 font-heading font-bold bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">Explore Learners</h1>
                <p className="text-text-secondary text-body-sm max-w-lg mx-auto">Discover trending learners, rising stars, and the wisest Sages in Nexera.</p>
                <form className="relative max-w-2xl mx-auto" onSubmit={(e) => e.preventDefault()}>
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search learners by username or name..."
                        className="w-full pl-11 pr-10 py-3 bg-dark-card border border-border-subtle rounded-xl text-body-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50"
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                            <X size={16} />
                        </button>
                    )}
                </form>
            </motion.div>

            {searchQuery.trim() ? (
                <section>
                    <h3 className="text-body-sm font-semibold text-text-secondary mb-3">Search results for "{searchQuery}"</h3>
                    {searchLoading ? (
                        <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-primary" /></div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center py-10 text-text-muted">No users found.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {searchResults.map((u) => (
                                <UserMiniCard key={u.id} user={u} onAddFriend={handleAddFriend} onChallenge={handleChallenge} isSelf={u.id === currentUser?.id} />
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                <>
                    <section>
                        <h2 className="text-h4 font-heading font-bold mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-primary" /> Trending Learners</h2>
                        {trendingUsers.length === 0 ? <div className="text-text-muted">No trending users yet.</div> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {trendingUsers.map((u, i) => (
                                    <UserMiniCard key={u.id} user={u} rank={i + 1} variant="trending" onAddFriend={handleAddFriend} onChallenge={handleChallenge} isSelf={u.id === currentUser?.id} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-h4 font-heading font-bold mb-4 flex items-center gap-2"><Sparkles size={20} className="text-success" /> Rising Stars</h2>
                        {risingStars.length === 0 ? <div className="text-text-muted">No rising stars yet.</div> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {risingStars.map((u, i) => (
                                    <UserMiniCard key={u.id} user={u} rank={i + 1} variant="rising" onAddFriend={handleAddFriend} onChallenge={handleChallenge} isSelf={u.id === currentUser?.id} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-h4 font-heading font-bold mb-4 flex items-center gap-2"><Crown size={20} className="text-warning" /> Hall of Sages</h2>
                        {sages.length === 0 ? <div className="text-text-muted">No sages yet.</div> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sages.map((u) => (
                                    <div key={u.id} className="bg-dark-card border border-warning/30 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-text-primary">{u.name}</p>
                                        <p className="text-caption text-text-muted">@{u.username}</p>
                                        <p className="text-caption text-warning mt-1">Lv.{u.level}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-h4 font-heading font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-cyan-400" /> Top by Subject</h2>
                        <div className="flex gap-2 overflow-x-auto pb-3">
                            {SUBJECTS.map((s) => (
                                <button key={s.key} onClick={() => setActiveSubject(s.key)} className={`px-3 py-1.5 rounded-lg text-caption font-medium whitespace-nowrap ${activeSubject === s.key ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-dark-card text-text-muted border border-border-subtle'}`}>
                                    {s.icon} {s.label}
                                </button>
                            ))}
                        </div>

                        {activeSubject === "all" ? (
                            <div className="text-text-muted mt-2">Select a subject tab to view rankings.</div>
                        ) : activeUsers.length === 0 ? (
                            <div className="text-text-muted mt-2">No users in this subject yet.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                {activeUsers.map((u, i) => (
                                    <UserMiniCard key={u.id} user={u} rank={i + 1} onAddFriend={handleAddFriend} onChallenge={handleChallenge} isSelf={u.id === currentUser?.id} />
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="bg-gradient-to-r from-primary/10 via-dark-card to-accent/10 border border-border-subtle rounded-xl p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <StatBlock icon="👥" value={trendingUsers.length + risingStars.length + sages.length} label="Active Learners" />
                            <StatBlock icon="📚" value={trendingUsers.reduce((sum, u) => sum + Number(u.total_knowledge_cards ?? u.cards_count ?? 0), 0)} label="Cards Created" />
                            <StatBlock icon="🔥" value={Math.max(...trendingUsers.map((u) => Number(u.current_streak ?? u.streak_count ?? 0)), 0)} label="Longest Streak" />
                            <StatBlock icon="⚡" value={trendingUsers.reduce((sum, u) => sum + Number(u.weekly_xp ?? 0), 0).toLocaleString()} label="XP This Week" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const StatBlock = ({ icon, value, label }) => (
    <div>
        <span className="text-2xl">{icon}</span>
        <p className="text-h4 font-bold text-text-primary mt-1">{value}</p>
        <p className="text-caption text-text-muted">{label}</p>
    </div>
);

export default ExplorePage;
