import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Timer,
    Swords,
    ArrowLeft,
    Trophy,
    Zap,
    Shield,
    Target,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ChallengeDuelModal from "../../components/social/ChallengeDuelModal";
import PendingDuels from "../../components/social/PendingDuels";
import DuelInProgress from "../../components/social/DuelInProgress";
import DuelResults from "../../components/social/DuelResults";
import { useSocialStore } from "../../stores/socialStore";
import { useAuthStore } from "../../stores/authStore";
import useDuelSocket from "../../hooks/useDuelSocket";

const FocusDuelsPage = () => {
    const [showChallenge, setShowChallenge] = useState(false);
    const [duelPhase, setDuelPhase] = useState("idle"); // 'idle' | 'inProgress' | 'results'
    const user = useAuthStore((state) => state.user);

    const {
        myDuels, currentDuel, pendingDuels, duelLoading,
        fetchMyDuels, challengeFriend, acceptDuel, declineDuel,
        startDuel, completeDuel, setCurrentDuel,
    } = useSocialStore();

    useEffect(() => { fetchMyDuels(); }, []);

    useDuelSocket(
        currentDuel?.id && duelPhase === 'inProgress' ? currentDuel.id : null,
        {
            onCompleted: () => setDuelPhase("results"),
        },
    );

    const incomingPendingDuels = pendingDuels.filter((d) => d.opponent_id === user?.id);
    const outgoingPendingDuels = myDuels.filter((d) => d.status === 'pending' && d.challenger_id === user?.id);
    const activeDuel = myDuels.find((d) => d.status === 'active');
    const pastDuels = myDuels.filter(d => d.status === 'completed');

    useEffect(() => {
        if (activeDuel && duelPhase === 'idle') {
            setCurrentDuel(activeDuel);
            setDuelPhase('inProgress');
        }
    }, [activeDuel?.id, duelPhase, setCurrentDuel]);

    const myStats = {
        completed: pastDuels.length,
        wins: pastDuels.filter((d) => d.winner_id && d.winner_id === user?.id).length,
        avgFocus: pastDuels.length > 0
            ? Math.round(pastDuels.reduce((acc, d) => {
                const myFocus = d.challenger_id === user?.id
                    ? parseFloat(d.challenger_focus_integrity)
                    : parseFloat(d.opponent_focus_integrity);
                return acc + (myFocus || 0);
            }, 0) / pastDuels.length)
            : 0,
        totalXP: 0, // XP not stored directly on duel model
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
                            <Timer size={24} className="text-danger" />
                            Focus Duels
                        </h1>
                        <p className="text-body-sm text-text-secondary">
                            Tantang teman untuk adu fokus — siapa yang paling disiplin belajar
                        </p>
                    </div>
                    {duelPhase === "idle" && (
                        <Button onClick={() => setShowChallenge(true)}>
                            <Swords size={16} className="mr-1.5" /> Challenge
                        </Button>
                    )}
                </div>
            </div>

            {/* Idle Phase */}
            {duelPhase === "idle" && (
                <div className="space-y-6">
                    {/* My Duel Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Trophy size={16} className="mx-auto text-primary-light mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">{myStats.completed}</p>
                            <p className="text-[10px] text-text-muted">Duels Completed</p>
                        </div>
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Zap size={16} className="mx-auto text-success mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">{myStats.wins}</p>
                            <p className="text-[10px] text-text-muted">Duels Won</p>
                        </div>
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Shield size={16} className="mx-auto text-secondary mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">{myStats.avgFocus}%</p>
                            <p className="text-[10px] text-text-muted">Avg Focus Score</p>
                        </div>
                        <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                            <Target size={16} className="mx-auto text-accent mb-2" />
                            <p className="text-lg font-bold text-text-primary font-heading">+{myStats.totalXP}</p>
                            <p className="text-[10px] text-text-muted">XP from Duels</p>
                        </div>
                    </div>

                    {/* Pending Challenges */}
                    {incomingPendingDuels.length > 0 && (
                        <div>
                            <h2 className="text-h3 font-heading text-text-primary mb-3">
                                Pending Challenges
                            </h2>
                            <PendingDuels
                                duels={incomingPendingDuels.map(d => ({
                                    id: d.id,
                                    challenger: d.challenger?.name || d.challenger?.username || 'Someone',
                                    duration: d.duration_minutes,
                                    time: d.created_at ? new Date(d.created_at).toLocaleString() : '',
                                    online: true,
                                    level: d.challenger?.level || 1,
                                }))}
                                onAccept={async (id) => {
                                    const ok = await acceptDuel(id);
                                    if (ok) {
                                        const started = await startDuel(id);
                                        if (started) {
                                            await fetchMyDuels(true);
                                            setDuelPhase("inProgress");
                                        }
                                    }
                                }}
                                onDecline={async (id) => {
                                    await declineDuel(id);
                                }}
                            />
                        </div>
                    )}

                    {outgoingPendingDuels.length > 0 && (
                        <Card>
                            <div className="space-y-2">
                                <h3 className="text-h4 font-heading text-text-primary">Outgoing Challenges</h3>
                                {outgoingPendingDuels.map((d) => (
                                    <div key={d.id} className="text-sm text-text-secondary">
                                        Waiting for <span className="text-text-primary font-medium">{d.opponent?.name || d.opponent?.username || 'opponent'}</span> to accept your duel.
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Past Duels */}
                    {pastDuels.length > 0 && (
                    <div>
                        <h3 className="text-h4 font-heading text-text-primary mb-3">Duel History</h3>
                        <Card>
                            <div className="space-y-0">
                                {pastDuels.map((d) => {
                                    const amChallenger = d.challenger_id === user?.id;
                                    const myFocus = amChallenger ? (parseFloat(d.challenger_focus_integrity) || 0) : (parseFloat(d.opponent_focus_integrity) || 0);
                                    const oppFocus = amChallenger ? (parseFloat(d.opponent_focus_integrity) || 0) : (parseFloat(d.challenger_focus_integrity) || 0);
                                    const won = d.winner_id && d.winner_id === user?.id;
                                    const opponentName = amChallenger
                                        ? (d.opponent?.name || d.opponent?.username || 'Opponent')
                                        : (d.challenger?.name || d.challenger?.username || 'Opponent');
                                    const date = d.completed_at ? new Date(d.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
                                    return (
                                        <div
                                            key={d.id}
                                            className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                    won ? "bg-success/15 text-success" : "bg-danger/15 text-danger"
                                                }`}>
                                                    {won ? "WIN" : "LOSS"}
                                                </span>
                                                <span className="text-sm text-text-primary">vs {opponentName}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-caption">
                                                <span className="text-text-secondary">
                                                    {myFocus}% vs {oppFocus}%
                                                </span>
                                                <span className="text-text-muted">{d.duration_minutes}min</span>
                                                <span className="text-text-muted">{date}</span>
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

            {/* In-Progress Phase */}
            {duelPhase === "inProgress" && currentDuel && (
                <DuelInProgress
                    opponent={{
                        name: currentDuel.opponent?.name || currentDuel.challenger?.name || 'Opponent',
                        level: currentDuel.opponent?.level || currentDuel.challenger?.level || 1,
                    }}
                    duration={currentDuel.duration_minutes || 25}
                    onComplete={async (focusIntegrity) => {
                        await completeDuel(currentDuel.id, focusIntegrity || 100);
                        setDuelPhase("results");
                    }}
                />
            )}

            {/* Results Phase */}
            {duelPhase === "results" && currentDuel && (
                <DuelResults
                    opponent={{
                        name: currentDuel.opponent?.name || currentDuel.challenger?.name || 'Opponent',
                        level: currentDuel.opponent?.level || currentDuel.challenger?.level || 1,
                    }}
                    onClose={() => { setDuelPhase("idle"); fetchMyDuels(); }}
                    onRematch={() => setDuelPhase("inProgress")}
                />
            )}

            {/* Challenge Duel Modal */}
            <ChallengeDuelModal
                isOpen={showChallenge}
                onClose={() => setShowChallenge(false)}
                onSendChallenge={async ({ friend, duration }) => {
                    const duel = await challengeFriend(friend.id, duration);
                    if (duel) {
                        setCurrentDuel(duel);
                        setShowChallenge(false);
                        setDuelPhase("idle");
                        await fetchMyDuels(true);
                    }
                }}
            />
        </div>
    );
};

export default FocusDuelsPage;
