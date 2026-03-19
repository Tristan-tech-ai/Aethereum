import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, Trophy, ArrowLeft, Gift, TrendingUp, Users, Zap, Coins } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';

// Demo data
const challenge = {
  title: '📖 Read-a-thon',
  description: 'Community goal: Read 10,000 pages together this week! Every page you read in Document Dungeon counts towards the community goal.',
  communityProgress: 3456,
  communityGoal: 10000,
  myContribution: 45,
  contributionUnit: 'pages',
  totalParticipants: 128,
  startedAt: 'Mar 17, 2026',
};

const leaderboard = [
  { rank: 1, name: 'Siti Rahma', username: 'siti_r', contribution: 320, level: 31, badge: '🥇' },
  { rank: 2, name: 'Budi Santoso', username: 'budi_s', contribution: 285, level: 24, badge: '🥈' },
  { rank: 3, name: 'Maya Putri', username: 'maya_p', contribution: 240, level: 35, badge: '🥉' },
  { rank: 4, name: 'Arief Wicaksono', username: 'arief_w', contribution: 198, level: 18 },
  { rank: 5, name: 'Gita Lestari', username: 'gita_l', contribution: 175, level: 19 },
  { rank: 6, name: 'Dian Kusuma', username: 'dian_k', contribution: 150, level: 22 },
  { rank: 7, name: 'Eka Pratama', username: 'eka_p', contribution: 130, level: 20 },
  { rank: 8, name: 'You', username: 'you', contribution: 45, level: 28, isMe: true },
];

const rewards = [
  { tier: 'Participant', requirement: 'Contribute any amount', xp: 25, coins: 10, unlocked: true },
  { tier: 'Active Reader', requirement: 'Read 50+ pages', xp: 50, coins: 25, unlocked: false },
  { tier: 'Bookworm', requirement: 'Read 200+ pages', xp: 100, coins: 50, unlocked: false },
  { tier: 'Community MVP', requirement: 'Top 3 contributor', xp: 200, coins: 100, unlocked: false },
];

const pastChallenges = [
  { title: '🧠 Quiz Sprint', goal: '5,000 quizzes', result: '5,823 / 5,000', status: 'Complete', myContribution: '32 quizzes' },
  { title: '🔥 Streak Week', goal: '500 active streaks', result: '412 / 500', status: 'Incomplete', myContribution: '7-day streak' },
  { title: '⏱️ Focus Marathon', goal: '1,000 hours', result: '1,245 / 1,000', status: 'Complete', myContribution: '8.5 hours' },
];

const ChallengePage = () => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const calcTime = () => {
      const now = new Date();
      const monday = new Date(now);
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      monday.setDate(now.getDate() + daysUntilMonday);
      monday.setHours(0, 0, 0, 0);
      const diff = monday.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      if (days > 0) return `${days}d ${hours}h ${mins}m`;
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    };
    setTimeRemaining(calcTime());
    const i = setInterval(() => setTimeRemaining(calcTime()), 60000);
    return () => clearInterval(i);
  }, []);

  const progressPercent = Math.min((challenge.communityProgress / challenge.communityGoal) * 100, 100);

  return (
    <div className="px-4 lg:px-8 py-6 max-w-page mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-caption text-text-muted hover:text-text-secondary transition-colors mb-3">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2 font-heading text-text-primary flex items-center gap-3">
              <Target size={28} className="text-accent" /> Weekly Challenge
            </h1>
            <p className="text-text-secondary mt-1">Started {challenge.startedAt} · {challenge.totalParticipants} participants</p>
          </div>
          <Badge variant="warning" className="text-sm px-3 py-1">
            <Clock size={12} className="mr-1" /> {timeRemaining} left
          </Badge>
        </div>
      </div>

      {/* Challenge Card */}
      <Card className="relative overflow-hidden" padding="spacious">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-warning/5 pointer-events-none" />
        <div className="relative">
          <h2 className="text-h3 font-heading text-text-primary mb-2">{challenge.title}</h2>
          <p className="text-text-secondary mb-6">{challenge.description}</p>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-muted">Community Progress</span>
              <span className="text-accent font-bold text-lg">
                {challenge.communityProgress.toLocaleString()} / {challenge.communityGoal.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-4 bg-dark-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-warning rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-caption text-text-muted mt-1">{progressPercent.toFixed(1)}% complete</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-dark-secondary rounded-sm-drd">
              <p className="text-caption text-text-muted mb-0.5">Your Contribution</p>
              <p className="text-h4 font-bold text-primary-light">{challenge.myContribution}</p>
              <p className="text-[10px] text-text-muted">{challenge.contributionUnit}</p>
            </div>
            <div className="text-center p-3 bg-dark-secondary rounded-sm-drd">
              <p className="text-caption text-text-muted mb-0.5">Participants</p>
              <p className="text-h4 font-bold text-text-primary">{challenge.totalParticipants}</p>
              <p className="text-[10px] text-text-muted">active users</p>
            </div>
            <div className="text-center p-3 bg-dark-secondary rounded-sm-drd">
              <p className="text-caption text-text-muted mb-0.5">Avg / Person</p>
              <p className="text-h4 font-bold text-text-primary">
                {Math.round(challenge.communityProgress / challenge.totalParticipants)}
              </p>
              <p className="text-[10px] text-text-muted">{challenge.contributionUnit}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Leaderboard + Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-tier-gold" /> Top Contributors
            </h3>
            <div className="space-y-1">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm-drd transition-colors ${
                    entry.isMe ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Rank */}
                  <span className="w-8 text-center shrink-0">
                    {entry.badge ? (
                      <span className="text-lg">{entry.badge}</span>
                    ) : (
                      <span className="text-caption text-text-muted font-mono">#{entry.rank}</span>
                    )}
                  </span>

                  {/* Avatar + Info */}
                  <Avatar name={entry.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {entry.name} {entry.isMe && <span className="text-caption text-primary-light">(you)</span>}
                    </p>
                    <p className="text-[11px] text-text-muted">@{entry.username} · Lv.{entry.level}</p>
                  </div>

                  {/* Contribution */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">{entry.contribution}</p>
                    <p className="text-[10px] text-text-muted">{challenge.contributionUnit}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Rewards Preview */}
        <div>
          <Card>
            <h3 className="text-h4 font-heading text-text-primary flex items-center gap-2 mb-4">
              <Gift size={18} className="text-accent" /> Rewards
            </h3>
            <div className="space-y-3">
              {rewards.map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-sm-drd border transition-all ${
                    r.unlocked
                      ? 'bg-success/5 border-success/20'
                      : 'bg-dark-secondary border-border-subtle'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-semibold ${r.unlocked ? 'text-success' : 'text-text-primary'}`}>
                      {r.unlocked ? '✅ ' : '🔒 '}{r.tier}
                    </p>
                  </div>
                  <p className="text-[11px] text-text-muted mb-2">{r.requirement}</p>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-primary-light">
                      <Zap size={10} /> +{r.xp} XP
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-accent">
                      <Coins size={10} /> +{r.coins}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Past Challenges */}
          <Card className="mt-4">
            <h3 className="text-h4 font-heading text-text-primary mb-3">Past Challenges</h3>
            <div className="space-y-2">
              {pastChallenges.map((pc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                  <div>
                    <p className="text-sm text-text-primary">{pc.title}</p>
                    <p className="text-[10px] text-text-muted">{pc.result} · You: {pc.myContribution}</p>
                  </div>
                  <Badge variant={pc.status === 'Complete' ? 'success' : 'ghost'}>
                    {pc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
