import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Target, Clock, Users, Swords } from "lucide-react";
import ChallengeWidget from "../components/social/ChallengeWidget";
import { useAuthStore } from "../stores/authStore";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import KnowledgeCard from "../components/profile/KnowledgeCard";
import LevelBadge from "../components/profile/LevelBadge";
import StreakDisplay from "../components/profile/StreakDisplay";
import ContentUploadModal from "../components/learning/ContentUploadModal";

// Demo data
const continueCards = [
    {
        id: 1,
        title: "Data Structures",
        subject: "Computer Science",
        progress: 65,
        sections: "4/7",
        type: "PDF",
    },
    {
        id: 2,
        title: "Linear Algebra",
        subject: "Mathematics",
        progress: 30,
        sections: "2/5",
        type: "PDF",
    },
    {
        id: 3,
        title: "React Patterns",
        subject: "Computer Science",
        progress: 80,
        sections: "6/8",
        type: "URL",
    },
];

const recentCards = [
    {
        title: "Binary Trees",
        subject: "Computer Science",
        mastery: 95,
        tier: "gold",
        quizScore: 96,
        focusScore: 94,
        timeSpent: 68,
        pinned: true,
        likes: 28,
    },
    {
        title: "Calculus II",
        subject: "Mathematics",
        mastery: 82,
        tier: "silver",
        quizScore: 85,
        focusScore: 88,
        timeSpent: 52,
        pinned: false,
        likes: 12,
    },
    {
        title: "Intro to Python",
        subject: "Computer Science",
        mastery: 73,
        tier: "bronze",
        quizScore: 78,
        focusScore: 82,
        timeSpent: 35,
        pinned: false,
        likes: 5,
    },
];

const activeSocial = [
    {
        id: 1,
        type: "raid",
        title: "Data Structures Raid",
        host: "Budi",
        players: 3,
        max: 5,
        progress: 45,
    },
    {
        id: 2,
        type: "room",
        title: "Focus Study Room",
        host: "Community",
        players: 12,
        max: 20,
        music: "Lo-fi",
    },
];

const DashboardPage = () => {
    const { user } = useAuthStore();
    const [uploadOpen, setUploadOpen] = useState(false);
    const name = user?.name || "Scholar";

    // Time-based greeting
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 18
              ? "Good afternoon"
              : "Good evening";

    return (
        <div className="px-4 lg:px-8 py-6 space-y-8 max-w-page mx-auto">
            {/* Welcome Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 font-heading text-text-primary">
                        {greeting}, {name}! 🔥
                    </h1>
                    <p className="text-body-sm text-text-secondary mt-1">
                        💡 Tip: Complete a section today to keep your streak
                        alive!
                    </p>
                </div>
                <Button onClick={() => setUploadOpen(true)}>
                    <Plus size={18} className="mr-1.5" />
                    Upload Material
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center gap-4">
                        <LevelBadge
                            level={28}
                            currentXP={4200}
                            nextLevelXP={5000}
                            size="sm"
                            showRank={false}
                            showXP={false}
                        />
                        <div>
                            <p className="text-caption text-text-muted uppercase tracking-wider">
                                Level
                            </p>
                            <p className="text-h4 font-bold text-text-primary">
                                28
                            </p>
                            <p className="text-caption text-primary-light">
                                📘 Scholar
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="text-2xl animate-flicker">🔥</div>
                        <div>
                            <p className="text-caption text-text-muted uppercase tracking-wider">
                                Streak
                            </p>
                            <p className="text-h4 font-bold text-text-primary">
                                14 days
                            </p>
                            <p className="text-caption text-success">Active</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="text-2xl">📚</div>
                        <div>
                            <p className="text-caption text-text-muted uppercase tracking-wider">
                                Cards This Week
                            </p>
                            <p className="text-h4 font-bold text-text-primary">
                                12
                            </p>
                            <p className="text-caption text-text-secondary">
                                +3 from last week
                            </p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-4">
                        <div className="text-2xl">🎯</div>
                        <div>
                            <p className="text-caption text-text-muted uppercase tracking-wider">
                                Focus Avg
                            </p>
                            <p className="text-h4 font-bold text-text-primary">
                                91%
                            </p>
                            <p className="text-caption text-success">
                                Excellent
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Continue Learning */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-h3 font-heading text-text-primary">
                        Continue Learning
                    </h2>
                    <Link
                        to="/library"
                        className="text-body-sm text-primary-light hover:text-primary transition-colors"
                    >
                        View Library →
                    </Link>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
                    {continueCards.map((c) => (
                        <Card key={c.id} hover className="shrink-0 w-[280px]">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-text-primary">
                                        {c.title}
                                    </h4>
                                    <p className="text-caption text-text-muted">
                                        {c.subject}
                                    </p>
                                </div>
                                <Badge variant="primary">{c.type}</Badge>
                            </div>

                            {/* Progress */}
                            <div className="mb-3">
                                <div className="flex justify-between text-caption mb-1">
                                    <span className="text-text-muted">
                                        Progress
                                    </span>
                                    <span className="text-text-secondary">
                                        {c.sections} sections
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all"
                                        style={{ width: `${c.progress}%` }}
                                    />
                                </div>
                            </div>

                            <Link to={`/learn/${c.id}`}>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                >
                                    Continue{" "}
                                    <ArrowRight size={14} className="ml-1" />
                                </Button>
                            </Link>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Weekly Challenge + Active Social */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Challenge */}
                <ChallengeWidget />

                {/* Active Social */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-h4 font-heading text-text-primary">
                            Active Social Sessions
                        </h3>
                        <Link
                            to="/social"
                            className="text-body-sm text-primary-light hover:text-primary transition-colors"
                        >
                            Social Hub →
                        </Link>
                    </div>

                    {activeSocial.map((s) => (
                        <Card
                            key={s.id}
                            hover
                            className="flex items-center gap-4"
                        >
                            <div className="w-10 h-10 rounded-md-drd bg-dark-secondary flex items-center justify-center shrink-0">
                                {s.type === "raid" ? (
                                    <Swords size={20} className="text-danger" />
                                ) : (
                                    <Users
                                        size={20}
                                        className="text-secondary"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-text-primary truncate">
                                        {s.title}
                                    </h4>
                                    <Badge variant="success">LIVE</Badge>
                                </div>
                                <p className="text-caption text-text-muted">
                                    {s.players}/{s.max}{" "}
                                    {s.type === "raid" ? "players" : "people"}
                                    {s.music ? ` · 🎵 ${s.music}` : ""}
                                </p>
                            </div>
                            <Button variant="secondary" size="sm">
                                Join
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Knowledge Cards */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-h3 font-heading text-text-primary">
                        Recent Knowledge Cards
                    </h2>
                    <Link
                        to="/profile"
                        className="text-body-sm text-primary-light hover:text-primary transition-colors"
                    >
                        View All →
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentCards.map((c, i) => (
                        <KnowledgeCard key={i} {...c} />
                    ))}
                </div>
            </section>

            {/* Upload Modal */}
            <ContentUploadModal
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUploadSuccess={() => {}}
            />
        </div>
    );
};

export default DashboardPage;
