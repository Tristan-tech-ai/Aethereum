import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Brain,
    ArrowLeft,
    Users,
    Trophy,
    Zap,
    Plus,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useSocialStore } from "../../stores/socialStore";
import { useContentStore } from "../../stores/contentStore";
import useArenaSocket from "../../hooks/useArenaSocket";

const QuizArenaPage = () => {
    const [joinCode, setJoinCode] = useState("");
    const [arenaPhase, setArenaPhase] = useState("browse");

    const {
        myArenas,
        currentArena,
        arenaLiveScore,
        arenaLoading,
        fetchMyArenas,
        createArena,
        joinArena,
        startArena,
    } = useSocialStore();
    const { contents, fetchContents } = useContentStore();

    useEffect(() => {
        fetchMyArenas();
        fetchContents();
    }, [fetchMyArenas, fetchContents]);

    useArenaSocket(
        currentArena?.id && (arenaPhase === "lobby" || arenaPhase === "inProgress") ? currentArena.id : null,
        {
            onCompleted: () => setArenaPhase("results"),
        },
    );

    const completedArenas = myArenas.filter((arena) => arena.status === "completed");
    const hasReadyContent = contents.some((content) => content.status === "ready");

    const myStats = {
        gamesPlayed: completedArenas.length,
        wins: completedArenas.filter((arena) => arena.my_rank === 1).length,
        avgRank: completedArenas.length > 0
            ? +(completedArenas.reduce((acc, arena) => acc + (arena.my_rank || 0), 0) / completedArenas.length).toFixed(1)
            : 0,
        totalXP: completedArenas.reduce((acc, arena) => acc + (Number(arena.xp_earned) || 0), 0),
    };

    const handleCreateArena = async () => {
        const readyContent = contents.find((content) => content.status === "ready");
        if (!readyContent) return;
        const arena = await createArena({
            content_id: readyContent.id,
            max_players: 5,
            question_count: 10,
            time_per_question: 30,
        });
        if (arena) setArenaPhase("lobby");
    };

    const handleJoinArena = async () => {
        if (!joinCode || joinCode.length < 4) return;
        const arena = await joinArena(joinCode);
        if (arena) { setJoinCode(""); setArenaPhase("lobby"); }
    };

    return (
        <div className="px-4 lg:px-8 py-6 max-w-page mx-auto">
            <div className="mb-6">
                <Link to="/community" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors mb-3">
                    <ArrowLeft size={14} /> Back to Community
                </Link>
                <div>
                    <h1 className="text-h2 font-heading text-text-primary flex items-center gap-2">
                        <Brain size={24} className="text-secondary" />
                        Quiz Arena
                    </h1>
                    <p className="text-body-sm text-text-secondary">
                        Quiz kompetitif 2-8 pemain secara live dari materi library.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Brain size={16} className="mx-auto text-secondary mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{myStats.gamesPlayed}</p>
                        <p className="text-[10px] text-text-muted">Games Played</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Trophy size={16} className="mx-auto text-accent mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">{myStats.wins}</p>
                        <p className="text-[10px] text-text-muted">Wins</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Users size={16} className="mx-auto text-primary-light mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">#{myStats.avgRank}</p>
                        <p className="text-[10px] text-text-muted">Avg Rank</p>
                    </div>
                    <div className="bg-dark-card border border-border/60 rounded-xl p-4 text-center">
                        <Zap size={16} className="mx-auto text-success mb-2" />
                        <p className="text-lg font-bold text-text-primary font-heading">+{myStats.totalXP}</p>
                        <p className="text-[10px] text-text-muted">XP Earned</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card padding="spacious" className="text-center">
                        <div className="text-3xl mb-3">??</div>
                        <h3 className="text-h4 font-heading text-text-primary mb-2">Host New Arena</h3>
                        <p className="text-body-sm text-text-secondary mb-4">
                            {hasReadyContent
                                ? "Use your latest ready material. AI generates questions for all players."
                                : "Upload and process a library item before hosting an arena."}
                        </p>
                        <Button className="w-full" onClick={handleCreateArena} disabled={arenaLoading || !hasReadyContent}>
                            <Plus size={16} className="mr-1.5" /> Create Arena
                        </Button>
                    </Card>

                    <Card padding="spacious" className="text-center">
                        <div className="text-3xl mb-3">??</div>
                        <h3 className="text-h4 font-heading text-text-primary mb-2">Join with Code</h3>
                        <p className="text-body-sm text-text-secondary mb-4">
                            Enter the room code shared by the host to join an active arena.
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter code..."
                                maxLength={8}
                                className="flex-1 bg-dark-secondary border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text-primary tracking-widest text-center placeholder:text-text-muted focus:outline-none focus:border-primary"
                            />
                            <Button variant="secondary" disabled={joinCode.length < 4 || arenaLoading} onClick={handleJoinArena}>
                                Join
                            </Button>
                        </div>
                    </Card>
                </div>

                {currentArena && arenaPhase === "lobby" && (
                    <Card>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-h4 font-heading text-text-primary mb-1">
                                    {currentArena.content?.title || currentArena.title || "Arena Lobby"}
                                </h3>
                                <p className="text-body-sm text-text-secondary">
                                    Room code: <span className="font-mono tracking-widest">{currentArena.room_code || "PENDING"}</span>
                                </p>
                            </div>
                            <Button onClick={async () => { const ok = await startArena(currentArena.id); if (ok) setArenaPhase("inProgress"); }}>
                                Start Arena
                            </Button>
                        </div>
                    </Card>
                )}

                {currentArena && arenaPhase === "inProgress" && (
                    <Card>
                        <h3 className="text-h4 font-heading text-text-primary mb-3">Arena Live</h3>
                        <div className="space-y-2">
                            {arenaLiveScore.length > 0 ? arenaLiveScore.map((entry, index) => (
                                <div key={entry.user_id || index} className="flex items-center justify-between rounded-lg border border-border/60 bg-dark-card/60 px-3 py-2">
                                    <span className="text-sm text-text-primary">{entry.name || `Player ${index + 1}`}</span>
                                    <span className="text-sm font-semibold text-primary-light">{entry.score || 0} pts</span>
                                </div>
                            )) : (
                                <p className="text-sm text-text-muted">Waiting for score updates...</p>
                            )}
                        </div>
                    </Card>
                )}

                <div>
                    <h3 className="text-h4 font-heading text-text-primary mb-3">Recent Games</h3>
                    <Card>
                        <div className="space-y-0">
                            {completedArenas.length > 0 ? completedArenas.map((arena) => {
                                const playerCount = arena.participants?.length || arena.player_count || 0;
                                const totalQuestions = arena.total_questions || arena.question_count || 0;
                                const date = arena.completed_at
                                    ? new Date(arena.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                    : "";
                                return (
                                    <div key={arena.id} className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0">
                                        <div>
                                            <span className="text-sm text-text-primary">{arena.content?.title || arena.title || "Quiz Arena"}</span>
                                            <span className="text-caption text-text-muted ml-2">by @{arena.host?.username || "host"}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-caption">
                                            <span className="font-semibold text-primary-light">#{arena.my_rank || "-"} of {playerCount}</span>
                                            <span className="text-text-muted">{totalQuestions} Q</span>
                                            <span className="text-text-muted">{date}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-6 text-center text-sm text-text-muted">No arena history yet.</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuizArenaPage;
