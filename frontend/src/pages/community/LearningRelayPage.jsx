import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Repeat,
    ArrowLeft,
    Users,
    BookOpen,
    Zap,
    Trophy,
    Plus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useSocialStore } from "../../stores/socialStore";
import { useContentStore } from "../../stores/contentStore";

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */

const LearningRelayPage = () => {
    const [joinCode, setJoinCode] = useState("");
    const {
        myRelays,
        relayLoading,
        fetchMyRelays,
        createRelay,
        joinRelay,
    } = useSocialStore();
    const { contents, fetchContents } = useContentStore();

    useEffect(() => {
        fetchMyRelays();
        fetchContents();
    }, [fetchMyRelays, fetchContents]);

    const pastRelays = myRelays.filter((relay) => relay.status === "completed");

    const myStats = {
        completed: pastRelays.length,
        avgTeamScore: pastRelays.length > 0
            ? Math.round(pastRelays.reduce((acc, relay) => acc + (Number(relay.team_score) || 0), 0) / pastRelays.length)
            : 0,
        sectionsLearned: pastRelays.reduce((acc, relay) => {
            const mine = (relay.participants || []).find((participant) => participant.pivot?.section_index !== undefined);
            return acc + (mine ? 1 : 0);
        }, 0),
        totalXP: pastRelays.reduce((acc, relay) => acc + (Number(relay.xp_earned) || 0), 0),
    };

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
            {/* Back + Header */}
            <div className="mb-6">
                <Link
                    to="/community"
                    className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mb-3"
                >
                    <ArrowLeft size={14} /> Back to Community
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h2 font-heading text-text-primary flex items-center gap-2">
                            <Repeat size={24} className="text-accent" />
                            Learning Relay
                        </h1>
                        <p className="text-body-sm text-text-secondary">
                            {contents.some((content) => content.status === "ready")
                                ? "Bagi materi panjang ke 2–7 orang — setiap orang belajar 1 bagian, lalu tulis summary"
                                : "Siapkan minimal satu materi library berstatus ready untuk membuat relay baru."}
                        </p>
                    </div>
                    <Button
                        onClick={async () => {
                            const readyContent = contents.find((content) => content.status === "ready");
                            if (!readyContent) {
                                return;
                            }

                            const relay = await createRelay({
                                content_id: readyContent.id,
                                max_participants: 4,
                            });
                            if (relay) {
                                fetchMyRelays();
                            }
                        }}
                        disabled={relayLoading || !contents.some((content) => content.status === "ready")}
                    >
                        <Plus size={16} className="mr-1.5" /> Create Relay
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Repeat size={16} className="mx-auto text-accent mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{myStats.completed}</p>
                        <p className="text-[10px] text-text-muted">Relays Completed</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Trophy size={16} className="mx-auto text-primary-light mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{myStats.avgTeamScore}%</p>
                        <p className="text-[10px] text-text-muted">Avg Team Score</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <BookOpen size={16} className="mx-auto text-success mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{myStats.sectionsLearned}</p>
                        <p className="text-[10px] text-text-muted">Sections Learned</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Zap size={16} className="mx-auto text-secondary mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">+{myStats.totalXP}</p>
                        <p className="text-[10px] text-text-muted">XP Earned</p>
                    </div>
                </div>

                {/* How It Works */}
                <Card padding="spacious">
                    <h3 className="text-h4 font-heading text-text-primary mb-4">How It Works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {[
                            { step: "1", icon: "📖", title: "Upload Material", desc: "Creator uploads a long material (e.g. textbook)" },
                            { step: "2", icon: "✂️", title: "AI Splits Sections", desc: "AI divides into N sections, one per person" },
                            { step: "3", icon: "✍️", title: "Learn & Summarize", desc: "Each person studies their section & writes a summary" },
                            { step: "4", icon: "🧠", title: "Team Quiz", desc: "Everyone reads summaries, then takes the full quiz" },
                        ].map((s) => (
                            <div key={s.step} className="text-center">
                                <div className="text-2xl mb-2">{s.icon}</div>
                                <p className="text-xs font-semibold text-text-primary mb-1">{s.title}</p>
                                <p className="text-[11px] text-text-muted leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex-1">
                            <h3 className="text-h4 font-heading text-text-primary mb-1">Join Relay</h3>
                            <p className="text-body-sm text-text-secondary">
                                Masukkan invite code untuk ikut relay yang sedang dibuka.
                            </p>
                        </div>
                        <div className="flex gap-2 sm:w-[360px]">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Invite code"
                                maxLength={8}
                                className="flex-1 bg-dark-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary tracking-widest text-center placeholder:text-text-muted focus:outline-none focus:border-primary"
                            />
                            <Button
                                variant="secondary"
                                disabled={joinCode.length < 4 || relayLoading}
                                onClick={async () => {
                                    const relay = await joinRelay(joinCode);
                                    if (relay) {
                                        setJoinCode("");
                                        fetchMyRelays();
                                    }
                                }}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Past Relays */}
                {pastRelays.length > 0 && (
                    <div>
                        <h3 className="text-h4 font-heading text-text-primary mb-3">Past Relays</h3>
                        <Card>
                            <div className="space-y-0">
                                {pastRelays.map((r) => (
                                    <div
                                        key={r.id}
                                        className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0"
                                    >
                                        <div>
                                            <span className="text-sm text-text-primary">{r.content?.title || r.title || "Learning Relay"}</span>
                                            <span className="text-caption text-text-muted ml-2">
                                                My section: {(((r.participants || []).find((participant) => participant.pivot?.section_content)?.pivot?.section_content) || "Assigned section").slice(0, 32)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-caption">
                                            <span className="text-text-secondary">
                                                <Users size={12} className="inline mr-1" />{r.participants?.length || 0} members
                                            </span>
                                            <Badge variant={(Number(r.team_score) || 0) >= 90 ? "success" : "primary"}>
                                                {Number(r.team_score) || 0}%
                                            </Badge>
                                            <span className="text-text-muted">{r.completed_at ? new Date(r.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {pastRelays.length === 0 && (
                    <Card>
                        <div className="py-6 text-center text-sm text-text-muted">No relay history yet.</div>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default LearningRelayPage;
