import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Swords, Plus, ArrowLeft, Users, Clock, Trophy } from "lucide-react";
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
    const [raidPhase, setRaidPhase] = useState("browse"); // browse | lobby | inProgress | complete
    const [joinCode, setJoinCode] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [raidResult, setRaidResult] = useState(null);

    const user = useAuthStore((state) => state.user);

    const {
        myRaids,
        currentRaid,
        raidLoading,
        error,
        fetchMyRaids,
        createRaid,
        joinRaid,
        fetchRaid,
        startRaid,
        updateRaidProgress,
        sendRaidChat,
        completeRaid,
        fetchRaidResults,
        setCurrentRaid,
    } = useSocialStore();

    useEffect(() => {
        fetchMyRaids();
    }, [fetchMyRaids]);

    useEffect(() => {
        if (!currentRaid) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (currentRaid.status === "completed") setRaidPhase("complete");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        else if (currentRaid.status === "active") setRaidPhase("inProgress");
        // eslint-disable-next-line react-hooks/set-state-in-effect
        else setRaidPhase("lobby");
    }, [currentRaid]);

    useEffect(() => {
        if (!currentRaid?.id || raidPhase === "browse") return;
        const interval = setInterval(() => fetchRaid(currentRaid.id), 12000);
        return () => clearInterval(interval);
    }, [currentRaid, raidPhase, fetchRaid]);

    const handleSocketProgress = useCallback((data) => {
        setCurrentRaid((prev) => {
            if (!prev?.participants) return prev;
            const participants = prev.participants.map((participant) => {
                if (String(participant.id) !== String(data?.participant_id)) return participant;
                return {
                    ...participant,
                    pivot: {
                        ...(participant.pivot || {}),
                        progress_percentage: Number(data?.progress_percentage || 0),
                    },
                };
            });
            return { ...prev, participants };
        });
    }, [setCurrentRaid]);

    const handleSocketChat = useCallback((data) => {
        setChatMessages((prev) => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                user_id: data?.user_id,
                user_name: data?.user_name,
                message: data?.message,
            },
        ]);
    }, []);

    const handleSocketCompleted = useCallback(async () => {
        if (!currentRaid?.id) return;
        const results = await fetchRaidResults(currentRaid.id);
        setRaidResult(results);
        setRaidPhase("complete");
    }, [currentRaid, fetchRaidResults]);

    useRaidSocket(
        currentRaid?.id && (raidPhase === "lobby" || raidPhase === "inProgress") ? currentRaid.id : null,
        {
            onProgress: handleSocketProgress,
            onChat: handleSocketChat,
            onCompleted: handleSocketCompleted,
        },
    );

    const activeRaids = myRaids.filter((r) => r.status === "active" || r.status === "lobby");
    const pastRaids = myRaids.filter((r) => r.status === "completed");

    const myStats = {
        completed: pastRaids.length,
        avgTeamScore: pastRaids.length > 0
            ? Math.round(pastRaids.reduce((acc, r) => acc + (parseFloat(r.team_score) || 0), 0) / pastRaids.length)
            : 0,
        totalXP: pastRaids.reduce((acc, r) => {
            const p = r.participants?.find((participant) => String(participant.id) === String(user?.id));
            return acc + (p?.pivot?.xp_earned || 0);
        }, 0),
        bestRaid: pastRaids.length > 0
            ? pastRaids.reduce((best, r) => (parseFloat(r.team_score) || 0) > (parseFloat(best.team_score) || 0) ? r : best, pastRaids[0])?.content?.title || "—"
            : "—",
    };

    const handleJoinRaid = async () => {
        if (!joinCode || joinCode.length < 4) return;
        const raid = await joinRaid(joinCode);
        if (raid) {
            setJoinCode("");
            setChatMessages([]);
            setRaidResult(null);
            setRaidPhase(raid.status === "active" ? "inProgress" : "lobby");
            fetchMyRaids(true);
        }
    };

    const handleSendRaidChat = async (message) => {
        if (!currentRaid?.id) return null;
        const sent = await sendRaidChat(currentRaid.id, message);
        return sent;
    };

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
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
                        <p className="text-body-sm text-text-secondary">Belajar bareng 2–7 orang secara real-time.</p>
                    </div>
                    {raidPhase === "browse" && (
                        <Button onClick={() => setShowCreateRaid(true)}>
                            <Plus size={16} className="mr-1.5" /> Create Raid
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <Card className="mb-4 border-danger/30 bg-danger/5 text-danger text-sm">{error}</Card>
            )}

            {raidPhase === "browse" && (
                <div className="space-y-6">
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
                                                    <h4 className="text-sm font-semibold text-text-primary">{raid.content?.title || "Study Raid"}</h4>
                                                    <p className="text-caption text-text-muted">by @{raid.creator?.username || "host"} · {raid.content?.subject_category || "General"}</p>
                                                </div>
                                                {isFull ? <Badge variant="danger">FULL</Badge> : <Badge variant="success">OPEN</Badge>}
                                            </div>

                                            <div className="flex items-center gap-1 mb-3">
                                                {participants.slice(0, 5).map((p) => (
                                                    <Avatar key={p.id} name={p.name} src={p.avatar_url} size="xs" />
                                                ))}
                                                <span className="text-caption text-text-muted ml-1">{participantCount}/{maxP}</span>
                                            </div>

                                            {progress > 0 && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-caption mb-1">
                                                        <span className="text-text-muted">Team Score</span>
                                                        <span className="text-text-secondary">{progress}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-dark-secondary rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${progress}%` }} />
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
                                                        const fullRaid = await fetchRaid(raid.id);
                                                        if (fullRaid) {
                                                            setChatMessages([]);
                                                            setRaidResult(null);
                                                            setRaidPhase((fullRaid.status || raid.status) === "active" ? "inProgress" : "lobby");
                                                        }
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

                        <div className="flex gap-2 mt-4">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter invite code…"
                                maxLength={8}
                                className="flex-1 bg-dark-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary tracking-widest text-center placeholder:text-text-muted focus:outline-none focus:border-primary"
                            />
                            <Button variant="secondary" disabled={joinCode.length < 4 || raidLoading} onClick={handleJoinRaid}>Join</Button>
                        </div>
                    </div>
                </div>
            )}

            {raidPhase === "lobby" && currentRaid && (
                <RaidLobby
                    raid={currentRaid}
                    isCreator={currentRaid.creator_id === user?.id}
                    onRefresh={() => fetchRaid(currentRaid.id)}
                    onStart={async () => {
                        const ok = await startRaid(currentRaid.id);
                        if (ok) {
                            const fullRaid = await fetchRaid(currentRaid.id);
                            if (fullRaid) setRaidPhase("inProgress");
                        }
                    }}
                    onLeave={() => {
                        setRaidPhase("browse");
                        setCurrentRaid(null);
                        setChatMessages([]);
                    }}
                />
            )}

            {raidPhase === "inProgress" && currentRaid && (
                <RaidInProgress
                    raid={currentRaid}
                    participants={currentRaid.participants || []}
                    chatMessages={chatMessages}
                    onProgressUpdate={(progress) => updateRaidProgress(currentRaid.id, progress)}
                    onSendChat={handleSendRaidChat}
                    onComplete={async (data) => {
                        try {
                            // Pass quiz score and focus integrity to completeRaid
                            await completeRaid(currentRaid.id, data?.quizScore, data?.focusIntegrity);
                        } catch (err) {
                            console.error("Failed to complete raid:", err);
                        }
                        const results = await fetchRaidResults(currentRaid.id);
                        setRaidResult(results);
                        setRaidPhase("complete");
                    }}
                />
            )}

            {raidPhase === "complete" && (
                <RaidComplete
                    contentTitle={currentRaid?.content?.title || "Study Raid"}
                    results={raidResult}
                    teamScore={raidResult?.team_score || currentRaid?.team_score}
                    onClose={() => {
                        setRaidPhase("browse");
                        setCurrentRaid(null);
                        setRaidResult(null);
                        setChatMessages([]);
                        fetchMyRaids(true);
                    }}
                    onPlayAgain={() => setRaidPhase("browse")}
                />
            )}

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
                        setRaidResult(null);
                        setChatMessages([]);
                        setRaidPhase("lobby");
                        fetchMyRaids(true);
                    }
                }}
            />
        </div>
    );
};

export default StudyRaidsPage;
