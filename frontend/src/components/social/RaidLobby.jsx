import React, { useMemo, useState, useEffect } from "react";
import { Copy, Check, LogOut, Crown, Clock, Users, RefreshCw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

const RaidLobby = ({
    raid = {},
    isCreator = true,
    onStart,
    onLeave,
    onRefresh,
    className = "",
}) => {
    const inviteCode = raid?.invite_code || "--------";
    const contentTitle = raid?.content?.title || "Study Raid";
    const contentSubject = raid?.content?.subject_category || "General";
    const maxParticipants = raid?.max_participants || 5;

    const participants = useMemo(() => {
        const source = raid?.participants || [];
        return source.map((p) => ({
            id: p.id,
            name: p.name || p.username || "Member",
            role: p.pivot?.role || (p.id === raid?.creator_id ? "leader" : "member"),
            status: p.pivot?.status || "joined",
            progress: Number(p.pivot?.progress_percentage || 0),
        }));
    }, [raid]);

    const [codeCopied, setCodeCopied] = useState(false);
    const [countdown, setCountdown] = useState(null);

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

    const canStart = isCreator && participants.length >= 2;

    const renderStatus = (status) => {
        if (status === "completed") return <Badge variant="success">Completed</Badge>;
        if (status === "learning") return <Badge variant="primary">Learning</Badge>;
        if (status === "joined") return <Badge variant="success">Ready</Badge>;
        return <Badge variant="warning">{status || "Waiting"}</Badge>;
    };

    return (
        <div className={`space-y-5 ${className}`}>
            <div className="text-center py-4">
                <div className="text-4xl mb-3">⚔️</div>
                <h2 className="text-h2 font-heading text-text-primary mb-1">Raid Lobby</h2>
                <p className="text-sm text-text-secondary">{contentTitle}</p>
                <Badge variant="primary" className="mt-2">{contentSubject}</Badge>
            </div>

            <Card className="text-center">
                <p className="text-caption text-text-muted mb-2">Share this code with your team</p>
                <div className="inline-flex items-center gap-3 bg-dark-secondary border border-border rounded-md-drd px-5 py-3">
                    <span className="text-h2 font-mono text-text-primary tracking-[0.2em]">{inviteCode}</span>
                    <button
                        onClick={handleCopyCode}
                        className="p-1.5 text-text-muted hover:text-primary-light transition-colors"
                        title="Copy invite code"
                    >
                        {codeCopied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                    </button>
                </div>
                <p className="text-caption text-text-muted mt-3">Gunakan kode ini agar teman bisa join ke lobby yang sama.</p>
            </Card>

            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2">
                        <Users size={16} />
                        Raiders ({participants.length}/{maxParticipants})
                    </h3>
                    <div className="flex items-center gap-2">
                        {participants.length < maxParticipants && (
                            <span className="text-caption text-text-muted animate-pulse">Waiting for players...</span>
                        )}
                        <button
                            onClick={onRefresh}
                            className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-secondary transition-colors"
                        >
                            <RefreshCw size={12} /> Refresh
                        </button>
                    </div>
                </div>

                <div className="grid gap-2">
                    {participants.map((p) => (
                        <Card key={p.id} padding="compact" className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar name={p.name} size="sm" />
                                {(p.role === "leader" || p.role === "creator") && (
                                    <Crown size={12} className="absolute -top-1 -right-1 text-accent" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {p.name}
                                    {(p.role === "leader" || p.role === "creator") && (
                                        <span className="text-[10px] text-accent ml-1.5 font-normal">HOST</span>
                                    )}
                                </p>
                                <p className="text-[11px] text-text-muted">Progress {p.progress}%</p>
                            </div>
                            {renderStatus(p.status)}
                        </Card>
                    ))}

                    {Array.from({ length: Math.max(0, maxParticipants - participants.length) }).map((_, i) => (
                        <div
                            key={`empty-${i}`}
                            className="flex items-center justify-center h-[60px] border border-dashed border-border rounded-md-drd text-caption text-text-muted"
                        >
                            Waiting for player...
                        </div>
                    ))}
                </div>
            </div>

            {countdown !== null && (
                <div className="text-center py-4">
                    <p className="text-overline text-text-muted uppercase tracking-wider mb-2">Raid starting in</p>
                    <p className="text-6xl font-mono font-bold text-primary-light animate-pulse">{countdown}</p>
                </div>
            )}

            {countdown === null && (
                <div className="flex gap-3">
                    {isCreator ? (
                        <Button
                            className="flex-1"
                            onClick={() => setCountdown(3)}
                            disabled={!canStart}
                            title={participants.length < 2 ? "Need at least 2 raiders" : "Start the raid!"}
                        >
                            <Clock size={16} className="mr-1.5" />
                            Start Raid
                            {participants.length < 2 ? ` (${participants.length}/2 min)` : ""}
                        </Button>
                    ) : (
                        <div className="flex-1 text-center py-3">
                            <p className="text-sm text-text-secondary">Waiting for host to start...</p>
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
