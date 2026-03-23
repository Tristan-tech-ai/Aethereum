import React, { useState, useEffect } from "react";
import { Copy, Check, LogOut, Crown, Clock, Users } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

// Demo participants — in production, populated from WebSocket events
const initialParticipants = [
    { id: "creator", name: "You", role: "creator", status: "ready", level: 22 },
];

const RaidLobby = ({
    raid = {},
    isCreator = true,
    onStart,
    onLeave,
    className = "",
}) => {
    const {
        inviteCode = "AXKM42ZR",
        contentTitle = "Data Structures & Algorithms",
        contentSubject = "Computer Science",
        maxParticipants = 5,
    } = raid;

    const [participants, setParticipants] = useState(initialParticipants);
    const [codeCopied, setCodeCopied] = useState(false);
    const [countdown, setCountdown] = useState(null); // null = not starting, number = seconds

    // Simulate other players joining over time
    useEffect(() => {
        const demoJoiners = [
            {
                id: "p2",
                name: "Budi Santoso",
                role: "member",
                status: "ready",
                level: 24,
            },
            {
                id: "p3",
                name: "Siti Rahma",
                role: "member",
                status: "waiting",
                level: 31,
            },
            {
                id: "p4",
                name: "Arief Wicaksono",
                role: "member",
                status: "ready",
                level: 18,
            },
        ];

        const timers = demoJoiners.map((joiner, i) =>
            setTimeout(
                () => {
                    setParticipants((prev) => {
                        if (prev.length >= maxParticipants) return prev;
                        if (prev.find((p) => p.id === joiner.id)) return prev;
                        return [...prev, joiner];
                    });

                    // Mark 'waiting' participants as 'ready' after a delay
                    if (joiner.status === "waiting") {
                        setTimeout(() => {
                            setParticipants((prev) =>
                                prev.map((p) =>
                                    p.id === joiner.id
                                        ? { ...p, status: "ready" }
                                        : p,
                                ),
                            );
                        }, 3000);
                    }
                },
                (i + 1) * 2500,
            ),
        );

        return () => timers.forEach(clearTimeout);
    }, [maxParticipants]);

    // Countdown before start
    useEffect(() => {
        if (countdown === null || countdown <= 0) return;
        const timer = setTimeout(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    onStart?.({ participants });
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown, onStart, participants]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(inviteCode);
        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
    };

    const handleStart = () => {
        setCountdown(3);
    };

    const canStart =
        isCreator &&
        participants.length >= 2 &&
        participants.every((p) => p.status === "ready");

    return (
        <div className={`space-y-5 ${className}`}>
            {/* Header */}
            <div className="text-center py-4">
                <div className="text-4xl mb-3">⚔️</div>
                <h2 className="text-h2 font-heading text-text-primary mb-1">
                    Raid Lobby
                </h2>
                <p className="text-sm text-text-secondary">{contentTitle}</p>
                <Badge variant="primary" className="mt-2">
                    {contentSubject}
                </Badge>
            </div>

            {/* Invite Code */}
            <Card className="text-center">
                <p className="text-caption text-text-muted mb-2">
                    Share this code with your team
                </p>
                <div className="inline-flex items-center gap-3 bg-dark-secondary border border-border rounded-md-drd px-5 py-3">
                    <span className="text-h2 font-mono text-text-primary tracking-[0.2em]">
                        {inviteCode}
                    </span>
                    <button
                        onClick={handleCopyCode}
                        className="p-1.5 text-text-muted hover:text-primary-light transition-colors"
                        title="Copy invite code"
                    >
                        {codeCopied ? (
                            <Check size={18} className="text-success" />
                        ) : (
                            <Copy size={18} />
                        )}
                    </button>
                </div>
            </Card>

            {/* Participants */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2">
                        <Users size={16} />
                        Raiders ({participants.length}/{maxParticipants})
                    </h3>
                    {participants.length < maxParticipants && (
                        <span className="text-caption text-text-muted animate-pulse">
                            Waiting for players...
                        </span>
                    )}
                </div>

                <div className="grid gap-2">
                    {participants.map((p) => (
                        <Card
                            key={p.id}
                            padding="compact"
                            className="flex items-center gap-3"
                        >
                            <div className="relative">
                                <Avatar name={p.name} size="sm" />
                                {p.role === "creator" && (
                                    <Crown
                                        size={12}
                                        className="absolute -top-1 -right-1 text-accent"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {p.name}
                                    {p.role === "creator" && (
                                        <span className="text-[10px] text-accent ml-1.5 font-normal">
                                            HOST
                                        </span>
                                    )}
                                </p>
                                <p className="text-[11px] text-text-muted">
                                    Lv.{p.level}
                                </p>
                            </div>
                            <Badge
                                variant={
                                    p.status === "ready" ? "success" : "warning"
                                }
                            >
                                {p.status === "ready"
                                    ? "✓ Ready"
                                    : "Joining..."}
                            </Badge>
                        </Card>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({
                        length: maxParticipants - participants.length,
                    }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex items-center justify-center h-[60px] border border-dashed border-border rounded-md-drd text-caption text-text-muted"
                        >
                            Waiting for player...
                        </div>
                    ))}
                </div>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
                <div className="text-center py-4">
                    <p className="text-overline text-text-muted uppercase tracking-wider mb-2">
                        Raid starting in
                    </p>
                    <p className="text-6xl font-mono font-bold text-primary-light animate-pulse">
                        {countdown}
                    </p>
                </div>
            )}

            {/* Actions */}
            {countdown === null && (
                <div className="flex gap-3">
                    {isCreator ? (
                        <Button
                            className="flex-1"
                            onClick={handleStart}
                            disabled={!canStart}
                            title={
                                participants.length < 2
                                    ? "Need at least 2 raiders"
                                    : !participants.every(
                                            (p) => p.status === "ready",
                                        )
                                      ? "Waiting for all raiders to be ready"
                                      : "Start the raid!"
                            }
                        >
                            <Clock size={16} className="mr-1.5" />
                            Start Raid
                            {participants.length < 2
                                ? ` (${participants.length}/2 min)`
                                : ""}
                        </Button>
                    ) : (
                        <div className="flex-1 text-center py-3">
                            <p className="text-sm text-text-secondary">
                                Waiting for host to start...
                            </p>
                        </div>
                    )}
                    <Button variant="ghost" onClick={onLeave}>
                        <LogOut size={16} className="mr-1.5" /> Leave
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RaidLobby;
