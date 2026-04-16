import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Swords,
    Plus,
    ArrowLeft,
    Users,
    Clock,
    Trophy,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Avatar from "../../components/ui/Avatar";
import CreateRaidModal from "../../components/social/CreateRaidModal";
import RaidLobby from "../../components/social/RaidLobby";
import RaidInProgress from "../../components/social/RaidInProgress";
import RaidComplete from "../../components/social/RaidComplete";
import { useSocialStore } from "../../stores/socialStore";
import { useAuthStore } from "../../stores/authStore";
import useRaidSocket from "../../hooks/useRaidSocket";

const StudyRaidsPage = () => {
    const [showCreateRaid, setShowCreateRaid] = useState(false);
    const [raidPhase, setRaidPhase] = useState("browse"); // 'browse' | 'lobby' | 'inProgress' | 'complete'
    const [joinCode, setJoinCode] = useState("");
    const user = useAuthStore((state) => state.user);

    const {
        myRaids, currentRaid, raidLoading, error,
        fetchMyRaids, createRaid, joinRaid, fetchRaid,
        startRaid, completeRaid, fetchRaidResults,
        setCurrentRaid,
    } = useSocialStore();

    // Fetch raids on mount
    useEffect(() => { fetchMyRaids(); }, []);

    // WebSocket for active raid
    useRaidSocket(
        currentRaid?.id && (raidPhase === 'lobby' || raidPhase === 'inProgress') ? currentRaid.id : null,
        {
            onCompleted: () => setRaidPhase("complete"),
        },
    );

    const activeRaids = myRaids.filter(r => r.status === 'active' || r.status === 'lobby');
    const pastRaids = myRaids.filter(r => r.status === 'completed');

    const myStats = {
        completed: pastRaids.length,
        avgTeamScore: pastRaids.length > 0
            ? Math.round(pastRaids.reduce((acc, r) => acc + (parseFloat(r.team_score) || 0), 0) / pastRaids.length)
            : 0,
        totalXP: pastRaids.reduce((acc, r) => {
            const p = r.participants?.find((participant) => participant.id === user?.id);
            return acc + (p?.pivot?.xp_earned || 0);
        }, 0),
        bestRaid: pastRaids.length > 0
            ? pastRaids.reduce((best, r) => (parseFloat(r.team_score) || 0) > (parseFloat(best.team_score) || 0) ? r : best, pastRaids[0])?.content?.title || '—'
            : '—',
    };

    const handleJoinRaid = async () => {
        if (!joinCode || joinCode.length < 4) return;
        const raid = await joinRaid(joinCode);
        if (raid) {
            setJoinCode("");
            setRaidPhase("lobby");
        }
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
                            <Swords size={24} className="text-primary-light" />
                            Study Raids
                        </h1>
                        <p className="text-body-sm text-text-secondary">
                            Belajar bareng 2–5 orang secara real-time, seperti dungeon raid
                        </p>
                    </div>
                    {raidPhase === "browse" && (
                        <Button onClick={() => setShowCreateRaid(true)}>
                            <Plus size={16} className="mr-1.5" /> Create Raid
                        </Button>
                    )}
                </div>
            </div>

            {/* Browse Phase */}
            {raidPhase === "browse" && (
                <div className="space-y-6">
                    {/* My Raid Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Trophy size={16} className="mx-auto text-primary-light mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">{myStats.completed}</p>
                            <p className="text-[10px] text-text-muted">Raids Completed</p>
                        </div>
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Users size={16} className="mx-auto text-success mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">{myStats.avgTeamScore}%</p>
                            <p className="text-[10px] text-text-muted">Avg Team Score</p>
                        </div>
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Swords size={16} className="mx-auto text-accent mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">+{myStats.totalXP}</p>
                            <p className="text-[10px] text-text-muted">XP from Raids</p>
                        </div>
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Clock size={16} className="mx-auto text-secondary mb-2" />
                            <p className="text-sm font-bold text-text-primary font-heading">{myStats.bestRaid}</p>
                            <p className="text-[10px] text-text-muted">Best Raid</p>
                        </div>
                    </div>

                    {/* Active Raids */}
                    <div>
                        <h2 className="text-h3 font-heading text-text-primary mb-3">Active Raids</h2>
                        {activeRaids.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {activeRaids.map((raid) => {
                                    const participants = raid.participants || [];
                                    const participantCount = participants.length;
                                    const maxP = raid.max_participants || 5;
                                    const isFull = participantCount >= maxP;
                                    const progress = parseFloat(raid.team_score) || 0;

                                    return (
                                        <Card key={raid.id} hover>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-text-primary">
                                                        {raid.content?.title || "Study Raid"}
                                                    </h4>
                                                    <p className="text-caption text-text-muted">
                                                        by @{raid.creator?.username || "host"} · {raid.content?.subject_category || "General"}
                                                    </p>
                                                </div>
                                                {isFull ? (
                                                    <Badge variant="danger">FULL</Badge>
                                                ) : (
                                                    <Badge variant="success">OPEN</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 mb-3">
                                                {participants.slice(0, 5).map((p) => (
                                                    <Avatar key={p.id} name={p.name} size="xs" />
                                                ))}
                                                <span className="text-caption text-text-muted ml-1">
                                                    {participantCount}/{maxP}
                                                </span>
                                            </div>

                                            {progress > 0 && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-caption mb-1">
                                                        <span className="text-text-muted">Team Progress</span>
                                                        <span className="text-text-secondary">{progress}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <Button
                                                variant={isFull ? "ghost" : "secondary"}
                                                size="sm"
                                                className="w-full"
                                                disabled={isFull}
                                                onClick={async () => {
                                                    if (!isFull) {
                                                        await fetchRaid(raid.id);
                                                        setRaidPhase("lobby");
                                                    }
                                                }}
                                            >
                                                {isFull ? "Full" : "View Raid"}
                                            </Button>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card>
                                <div className="text-center py-6">
                                    <Swords size={24} className="mx-auto text-text-muted/30 mb-2" />
                                    <p className="text-sm text-text-muted">No active raids. Create one or join with a code!</p>
                                </div>
                            </Card>
                        )}

                        {/* Join with Code */}
                        <div className="flex gap-2 mt-4">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter invite code…"
                                maxLength={8}
                                className="flex-1 bg-dark-secondary border border-border rounded-lg px-3 py-2.5
                                    text-sm font-mono text-text-primary tracking-widest text-center
                                    placeholder:text-text-muted focus:outline-none focus:border-primary"
                            />
                            <Button variant="secondary" disabled={joinCode.length < 4} onClick={handleJoinRaid}>
                                Join
                            </Button>
                        </div>
                    </div>

                    {/* Past Raids */}
                    {pastRaids.length > 0 && (
                        <div>
                            <h3 className="text-h4 font-heading text-text-primary mb-3">Past Raids</h3>
                            <Card>
                                <div className="space-y-0">
                                    {pastRaids.map((r) => {
                                        const score = parseFloat(r.team_score) || 0;
                                        const date = r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                                        return (
                                            <div
                                                key={r.id}
                                                className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0"
                                            >
                                                <span className="text-sm text-text-primary">{r.content?.title || "Study Raid"}</span>
                                                <div className="flex items-center gap-4">
                                                    <Badge variant={score >= 90 ? "success" : "primary"}>
                                                        {score}%
                                                    </Badge>
                                                    <span className="text-caption text-text-muted">{date}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}

            {/* Lobby Phase */}
            {raidPhase === "lobby" && currentRaid && (
                <RaidLobby
                    raid={currentRaid}
                    isCreator={currentRaid.creator_id === user?.id}
                    onStart={async () => {
                        await startRaid(currentRaid.id);
                        setRaidPhase("inProgress");
                    }}
                    onLeave={() => { setRaidPhase("browse"); setCurrentRaid(null); }}
                />
            )}

            {/* In-Progress Phase */}
            {raidPhase === "inProgress" && currentRaid && (
                <RaidInProgress
                    raid={currentRaid}
                    onComplete={async () => {
                        await completeRaid(currentRaid.id);
                        await fetchRaidResults(currentRaid.id);
                        setRaidPhase("complete");
                    }}
                />
            )}

            {/* Complete Phase */}
            {raidPhase === "complete" && (
                <RaidComplete
                    contentTitle={currentRaid?.content?.title || "Study Raid"}
                    onClose={() => { setRaidPhase("browse"); setCurrentRaid(null); fetchMyRaids(); }}
                    onPlayAgain={() => setRaidPhase("lobby")}
                />
            )}

            {/* Create Raid Modal */}
            <CreateRaidModal
                isOpen={showCreateRaid}
                onClose={() => setShowCreateRaid(false)}
                onCreateRaid={async ({ content, maxParticipants }) => {
                    const raid = await createRaid({
                        content_id: content?.id,
                        max_participants: maxParticipants,
                        duration_minutes: 30,
                    });
                    if (raid) {
                        setShowCreateRaid(false);
                        setRaidPhase("lobby");
                    }
                }}
            />
        </div>
    );
};

export default StudyRaidsPage;
