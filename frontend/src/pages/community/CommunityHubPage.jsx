import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Swords,
    Timer,
    Brain,
    BookOpen,
    Repeat,
    Target,
    Users,
    ArrowRight,
    Flame,
    Trophy,
    Zap,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import CommunityFeed from "../../components/social/CommunityFeed";
import FriendsList from "../../components/social/FriendsList";
import { useFriendStore } from "../../stores/friendStore";
import { useSocialStore } from "../../stores/socialStore";
import { useChallengeStore } from "../../stores/challengeStore";
import { useAuthStore } from "../../stores/authStore";
import useNotifications from "../../hooks/useNotifications";

const activities = [
    {
        key: "raids",
        to: "/community/raids",
        icon: Swords,
        label: "Study Raids",
        desc: "Belajar bareng 2–5 orang secara real-time",
        accent: "#7C3AED",
    },
    {
        key: "duels",
        to: "/community/duels",
        icon: Timer,
        label: "Focus Duels",
        desc: "Tantang teman adu fokus belajar",
        accent: "#EF4444",
    },
    {
        key: "arena",
        to: "/community/arena",
        icon: Brain,
        label: "Quiz Arena",
        desc: "Quiz kompetitif 2–8 pemain live",
        accent: "#06B6D4",
    },
    {
        key: "rooms",
        to: "/community/rooms",
        icon: BookOpen,
        label: "Study Rooms",
        desc: "Ruang belajar virtual bareng teman",
        accent: "#22C55E",
    },
    {
        key: "relay",
        to: "/community/relay",
        icon: Repeat,
        label: "Learning Relay",
        desc: "Bagi materi panjang ke beberapa orang",
        accent: "#F59E0B",
    },
    {
        key: "challenge",
        to: "/challenge",
        icon: Target,
        label: "Weekly Challenge",
        desc: "Tantangan mingguan untuk seluruh komunitas",
        accent: "#F59E0B",
    },
];

const CommunityHubPage = () => {
    const user = useAuthStore(s => s.user);
    const { friends, fetchFriends } = useFriendStore();
    const { myRaids, pendingDuels, fetchMyRaids, fetchMyDuels } = useSocialStore();
    const { currentChallenge, fetchCurrentChallenge } = useChallengeStore();

    // Subscribe to personal notifications (XP, achievements, etc.)
    useNotifications(user?.id);

    useEffect(() => {
        fetchFriends();
        fetchMyRaids();
        fetchMyDuels();
        fetchCurrentChallenge();
    }, []);

    const activeRaidCount = myRaids.filter(r => r.status === 'active' || r.status === 'lobby').length;
    const pendingDuelCount = pendingDuels.length;
    const onlineFriendsCount = friends.filter(f => f.online || f.is_learning_now).length;
    const challengeProgress = currentChallenge
        ? `${currentChallenge.current_value ?? 0} / ${currentChallenge.goal_value ?? '?'}`
        : '—';

    const activityStats = {
        raids: activeRaidCount > 0 ? `${activeRaidCount} Active` : "No Active",
        duels: pendingDuelCount > 0 ? `${pendingDuelCount} Pending` : "No Pending",
        arena: "Ready",
        rooms: onlineFriendsCount > 0 ? `${onlineFriendsCount} Online` : "0 Online",
        relay: "Ready",
        challenge: challengeProgress,
    };

    const activityStatColors = {
        raids: activeRaidCount > 0 ? "text-success" : "text-text-muted",
        duels: pendingDuelCount > 0 ? "text-accent" : "text-text-muted",
        arena: "text-text-muted",
        rooms: onlineFriendsCount > 0 ? "text-success" : "text-text-muted",
        relay: "text-text-muted",
        challenge: "text-accent",
    };

    const quickStats = [
        { icon: Swords, label: "Active Raids", value: String(activeRaidCount), color: "text-primary-light" },
        { icon: Timer, label: "Pending Duels", value: String(pendingDuelCount), color: "text-danger" },
        { icon: Users, label: "Friends Online", value: String(onlineFriendsCount), color: "text-success" },
        { icon: Flame, label: "Streak", value: user?.streak_days ? `${user.streak_days}d` : "0d", color: "text-accent" },
    ];
    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-h2 font-heading text-text-primary">Community</h1>
                <p className="text-body-sm text-text-secondary">
                    Learn together, grow together — pilih aktivitas sosial di bawah
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {quickStats.map((s) => (
                    <div
                        key={s.label}
                        className="bg-dark-card border border-border/60 rounded-xl p-4 flex items-center gap-3"
                    >
                        <s.icon size={18} className={s.color} />
                        <div>
                            <p className="text-lg font-bold text-text-primary font-heading">{s.value}</p>
                            <p className="text-[10px] text-text-muted">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-column: Activities + Friends sidebar */}
            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Activity Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activities.map((a) => (
                            <Link
                                key={a.key}
                                to={a.to}
                                className="group bg-dark-card border border-border/60 rounded-xl p-5
                                    hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg
                                    transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ background: `${a.accent}18` }}
                                    >
                                        <a.icon size={20} style={{ color: a.accent }} />
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-text-muted group-hover:text-primary-light
                                            group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                                <h3 className="text-sm font-semibold text-text-primary mb-1">
                                    {a.label}
                                </h3>
                                <p className="text-[11px] text-text-muted mb-3 leading-relaxed">
                                    {a.desc}
                                </p>
                                <span className={`text-[11px] font-semibold ${activityStatColors[a.key] || "text-text-muted"}`}>
                                    {activityStats[a.key] || "—"}
                                </span>
                            </Link>
                        ))}
                    </div>

                    {/* Community Feed */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-h3 font-heading text-text-primary">
                                Community Feed
                            </h2>
                        </div>
                        <CommunityFeed />
                    </div>
                </div>

                {/* Friends Sidebar */}
                <div className="hidden lg:block w-72 shrink-0 overflow-hidden">
                    <FriendsList onAddFriend={() => {}} />
                </div>
            </div>
        </div>
    );
};

export default CommunityHubPage;
