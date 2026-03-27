import React from "react";
import { Trophy, Zap, Coins, Share2, ArrowLeft, Medal } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";

const RaidComplete = ({
    contentTitle = "Study Raid",
    results,
    teamScore: externalTeamScore,
    onClose,
    onPlayAgain,
    className = "",
}) => {
    const participants = Array.isArray(results?.participants) ? results.participants : [];
    const normalized = participants.map((p) => ({
        id: p.user_id || p.id,
        name: p.name || "Member",
        quizScore: Number(p.quiz_score || 0),
        progress: Number(p.progress_percentage || 0),
        xpEarned: Number(p.xp_earned || 0),
        coinsEarned: Number(p.coins_earned || 0),
        avatar_url: p.avatar_url,
    }));

    const ranked = [...normalized].sort((a, b) => b.quizScore - a.quizScore);
    const avgScore = normalized.length > 0
        ? Math.round(normalized.reduce((sum, item) => sum + item.quizScore, 0) / normalized.length)
        : 0;

    const teamScore = Math.round(Number(externalTeamScore ?? results?.team_score ?? avgScore));
    const totalXp = normalized.reduce((sum, item) => sum + item.xpEarned, 0);
    const totalCoins = normalized.reduce((sum, item) => sum + item.coinsEarned, 0);
    const isExcellent = teamScore >= 90;

    const getRankEmoji = (idx) => {
        if (idx === 0) return "🥇";
        if (idx === 1) return "🥈";
        if (idx === 2) return "🥉";
        return `#${idx + 1}`;
    };

    const handleShare = () => {
        const text = `⚔️ Study Raid selesai! "${contentTitle}" · Team score ${teamScore}% · Total reward ${totalXp} XP / ${totalCoins} coins.`;
        navigator.clipboard.writeText(text);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="text-center py-6">
                <div className="text-5xl mb-3">{isExcellent ? "🏆" : "⚔️"}</div>
                <h2 className="text-h2 font-heading text-text-primary mb-1">Raid Complete!</h2>
                <p className="text-sm text-text-secondary">
                    {isExcellent
                        ? "Outstanding teamwork!"
                        : "Great effort! Keep improving together."}
                </p>
            </div>

            <Card className="text-center bg-gradient-to-br from-primary/5 via-dark-card to-secondary/5">
                <p className="text-overline text-text-muted uppercase tracking-wider mb-2">Team Score</p>
                <p className={`text-6xl font-bold font-mono ${isExcellent ? "text-accent" : "text-success"}`}>{teamScore}%</p>
                <p className="text-sm text-text-secondary mt-2">{contentTitle}</p>
                {isExcellent && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-accent/10 text-accent text-caption font-semibold px-3 py-1.5 rounded-full">
                        <Medal size={12} /> Special Bonus Unlocked!
                    </div>
                )}
            </Card>

            <div>
                <h3 className="text-h4 font-heading text-text-primary mb-3">Individual Performance</h3>
                <div className="space-y-2">
                    {ranked.map((member, idx) => (
                        <Card key={member.id || idx} padding="compact">
                            <div className="flex items-center gap-3">
                                <span className="text-lg w-8 text-center shrink-0">{getRankEmoji(idx)}</span>
                                <Avatar name={member.name} src={member.avatar_url} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
                                    <p className="text-[11px] text-text-muted">Progress {member.progress}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-text-primary font-mono">{member.quizScore}%</p>
                                    <p className="text-[9px] text-text-muted">Quiz</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <Card className="bg-gradient-to-r from-primary/5 via-dark-elevated to-secondary/5">
                <p className="text-center text-caption text-text-muted mb-3 uppercase tracking-wider">Rewards Earned</p>
                <div className="flex items-center justify-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <Zap size={18} className="text-primary-light" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-primary-light">+{totalXp} XP</p>
                            <p className="text-[10px] text-text-muted">Total team XP</p>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                            <Coins size={18} className="text-accent" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-accent">+{totalCoins}</p>
                            <p className="text-[10px] text-text-muted">Total coins</p>
                        </div>
                    </div>
                </div>

                {isExcellent && (
                    <div className="mt-4 pt-3 border-t border-border-subtle text-center">
                        <div className="inline-flex items-center gap-2 bg-accent/10 rounded-md-drd px-4 py-2">
                            <Trophy size={16} className="text-accent" />
                            <span className="text-sm font-semibold text-accent">Team Excellence Badge Earned!</span>
                        </div>
                    </div>
                )}
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" className="flex-1" onClick={handleShare}>
                    <Share2 size={16} className="mr-2" /> Share Result
                </Button>
                <Button variant="primary" className="flex-1" onClick={onPlayAgain}>⚔️ Raid Again</Button>
                <Button variant="ghost" className="flex-1" onClick={onClose}>
                    <ArrowLeft size={16} className="mr-2" /> Back to Hub
                </Button>
            </div>
        </div>
    );
};

export default RaidComplete;
