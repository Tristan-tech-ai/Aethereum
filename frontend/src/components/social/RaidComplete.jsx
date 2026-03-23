import React, { useState, useEffect } from "react";
import {
    Trophy,
    Zap,
    Coins,
    Star,
    Share2,
    ArrowLeft,
    Medal,
} from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import Avatar from "../ui/Avatar";

/**
 * RaidComplete — team results + rewards screen per DRD §9.1 & PRD §7.
 *
 * Shows: team score display, individual performance, XP & coin rewards,
 * special badge if team score > 90%, share result button.
 */

// Demo data for participants — in prod, comes from backend response
const demoResults = [
    {
        id: "me",
        name: "You",
        level: 22,
        quizScore: 90,
        focusIntegrity: 95,
        sectionsCompleted: 5,
        isMe: true,
    },
    {
        id: "p2",
        name: "Budi Santoso",
        level: 24,
        quizScore: 85,
        focusIntegrity: 88,
        sectionsCompleted: 5,
        isMe: false,
    },
    {
        id: "p3",
        name: "Siti Rahma",
        level: 31,
        quizScore: 95,
        focusIntegrity: 92,
        sectionsCompleted: 5,
        isMe: false,
    },
];

const RaidComplete = ({
    contentTitle = "Data Structures & Algorithms",
    results: externalResults,
    onClose,
    onPlayAgain,
    className = "",
}) => {
    const results = externalResults || demoResults;

    const [showCelebration, setShowCelebration] = useState(true);
    const [revealedCards, setRevealedCards] = useState(0);
    const [shareClicked, setShareClicked] = useState(false);

    // Calculate team score (average quiz score)
    const teamScore = Math.round(
        results.reduce((sum, r) => sum + r.quizScore, 0) / results.length,
    );

    const isExcellent = teamScore >= 90;

    // XP and coin rewards — raid bonus +50% as per PRD §5.2
    const baseXP = 50;
    const raidBonusMultiplier = 1.5;
    const rewardXP = Math.round(baseXP * raidBonusMultiplier);
    const rewardCoins = isExcellent ? 40 : 25;

    // Reveal animation — stagger cards
    useEffect(() => {
        const timer = setInterval(() => {
            setRevealedCards((prev) => {
                if (prev >= results.length) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, 400);

        // Hide celebration after 3s
        const celebTimer = setTimeout(() => setShowCelebration(false), 3000);

        return () => {
            clearInterval(timer);
            clearTimeout(celebTimer);
        };
    }, [results.length]);

    // Sort by quiz score descending for ranking
    const ranked = [...results].sort((a, b) => b.quizScore - a.quizScore);
    const getRankEmoji = (idx) => {
        if (idx === 0) return "🥇";
        if (idx === 1) return "🥈";
        if (idx === 2) return "🥉";
        return `#${idx + 1}`;
    };

    const handleShare = () => {
        const text = `⚔️ Just completed a Study Raid on "${contentTitle}" with a team score of ${teamScore}%! ${isExcellent ? "🏆 Excellent!" : ""} #Aethereum`;
        navigator.clipboard.writeText(text);
        setShareClicked(true);
        setTimeout(() => setShareClicked(false), 2500);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* ── Celebration Header ── */}
            <div className="text-center py-6 relative">
                {showCelebration && isExcellent && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {/* Simple sparkle particles */}
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-1.5 h-1.5 bg-accent rounded-full animate-ping"
                                style={{
                                    left: `${10 + Math.random() * 80}%`,
                                    top: `${10 + Math.random() * 80}%`,
                                    animationDelay: `${Math.random() * 1.5}s`,
                                    animationDuration: `${1 + Math.random()}s`,
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="text-5xl mb-3">
                    {isExcellent ? "🏆" : teamScore >= 70 ? "⚔️" : "💪"}
                </div>
                <h2 className="text-h2 font-heading text-text-primary mb-1">
                    Raid Complete!
                </h2>
                <p className="text-sm text-text-secondary">
                    {isExcellent
                        ? "Outstanding teamwork! Your team achieved an excellent score!"
                        : teamScore >= 70
                          ? "Good job raiders! Your team learned together effectively."
                          : "The raid is over. Keep practicing to improve!"}
                </p>
            </div>

            {/* ── Team Score ── */}
            <Card className="text-center bg-gradient-to-br from-primary/5 via-dark-card to-secondary/5">
                <p className="text-overline text-text-muted uppercase tracking-wider mb-2">
                    Team Score
                </p>
                <div className="relative inline-block">
                    <p
                        className={`text-6xl font-bold font-mono ${
                            isExcellent
                                ? "text-accent"
                                : teamScore >= 70
                                  ? "text-success"
                                  : "text-warning"
                        }`}
                    >
                        {teamScore}%
                    </p>
                    {isExcellent && (
                        <Star
                            size={20}
                            className="absolute -top-1 -right-6 text-accent animate-bounce"
                        />
                    )}
                </div>
                <p className="text-sm text-text-secondary mt-2">
                    {contentTitle}
                </p>
                {isExcellent && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-accent/10 text-accent text-caption font-semibold px-3 py-1.5 rounded-full">
                        <Medal size={12} /> Special Bonus Unlocked!
                    </div>
                )}
            </Card>

            {/* ── Individual Rankings ── */}
            <div>
                <h3 className="text-h4 font-heading text-text-primary mb-3">
                    Individual Performance
                </h3>
                <div className="space-y-2">
                    {ranked.map((member, idx) => (
                        <Card
                            key={member.id}
                            padding="compact"
                            className={`transition-all duration-500 ${
                                idx < revealedCards
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-4"
                            } ${member.isMe ? "ring-1 ring-primary/30" : ""}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Rank */}
                                <span className="text-lg w-8 text-center shrink-0">
                                    {getRankEmoji(idx)}
                                </span>

                                {/* Avatar + Name */}
                                <Avatar name={member.name} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        {member.name}
                                        {member.isMe && (
                                            <span className="text-[10px] text-primary-light ml-1.5 font-normal">
                                                (YOU)
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-[11px] text-text-muted">
                                        Lv.{member.level}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                        <p
                                            className={`text-sm font-bold font-mono ${
                                                member.quizScore >= 90
                                                    ? "text-accent"
                                                    : member.quizScore >= 70
                                                      ? "text-success"
                                                      : "text-warning"
                                            }`}
                                        >
                                            {member.quizScore}%
                                        </p>
                                        <p className="text-[9px] text-text-muted">
                                            Quiz
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`text-sm font-bold font-mono ${
                                                member.focusIntegrity >= 90
                                                    ? "text-success"
                                                    : member.focusIntegrity >=
                                                        70
                                                      ? "text-warning"
                                                      : "text-danger"
                                            }`}
                                        >
                                            {member.focusIntegrity}%
                                        </p>
                                        <p className="text-[9px] text-text-muted">
                                            Focus
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* ── Rewards ── */}
            <Card className="bg-gradient-to-r from-primary/5 via-dark-elevated to-secondary/5">
                <p className="text-center text-caption text-text-muted mb-3 uppercase tracking-wider">
                    Rewards Earned
                </p>
                <div className="flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <Zap size={18} className="text-primary-light" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary-light">
                                +{rewardXP} XP
                            </p>
                            <p className="text-[10px] text-text-muted">
                                Includes 50% raid bonus
                            </p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                            <Coins size={18} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-accent">
                                +{rewardCoins}
                            </p>
                            <p className="text-[10px] text-text-muted">
                                Focus Coins
                            </p>
                        </div>
                    </div>
                </div>

                {isExcellent && (
                    <div className="mt-4 pt-3 border-t border-border-subtle text-center">
                        <div className="inline-flex items-center gap-2 bg-accent/10 rounded-md-drd px-4 py-2">
                            <Trophy size={16} className="text-accent" />
                            <span className="text-sm font-semibold text-accent">
                                Team Excellence Badge Earned!
                            </span>
                        </div>
                    </div>
                )}
            </Card>

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={handleShare}
                >
                    <Share2 size={16} className="mr-2" />
                    {shareClicked ? "Copied to Clipboard!" : "Share Result"}
                </Button>
                <Button
                    variant="primary"
                    className="flex-1"
                    onClick={onPlayAgain}
                >
                    ⚔️ Raid Again
                </Button>
                <Button variant="ghost" className="flex-1" onClick={onClose}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Hub
                </Button>
            </div>
        </div>
    );
};

export default RaidComplete;
