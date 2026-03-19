import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Clock, TrendingUp, ArrowRight, Trophy } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

// Demo challenge data
const challengeData = {
  title: '📖 Read-a-thon',
  description: 'Community goal: Read 10,000 pages together this week!',
  communityProgress: 3456,
  communityGoal: 10000,
  myContribution: 45,
  contributionUnit: 'pages',
  resetDay: 'Monday', // next Monday
  rewards: { xp: 100, coins: 50 },
  topContributor: { name: 'Siti Rahma', amount: 320 },
};

/**
 * ChallengeWidget — Dashboard/Homepage weekly challenge widget
 */
const ChallengeWidget = ({
  challenge = challengeData,
  className = '',
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

  // ── Countdown to Monday reset ──
  useEffect(() => {
    const calcTimeRemaining = () => {
      const now = new Date();
      const monday = new Date(now);
      // Find next monday
      const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
      monday.setDate(now.getDate() + daysUntilMonday);
      monday.setHours(0, 0, 0, 0);

      const diff = monday.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    };

    setTimeRemaining(calcTimeRemaining());
    const interval = setInterval(() => setTimeRemaining(calcTimeRemaining()), 60000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.min((challenge.communityProgress / challenge.communityGoal) * 100, 100);
  const isComplete = challenge.communityProgress >= challenge.communityGoal;

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-warning/5 pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-accent" />
            <h3 className="text-h4 font-heading text-text-primary">Weekly Challenge</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isComplete ? 'success' : 'warning'}>
              {isComplete ? '✅ Complete!' : (
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {timeRemaining} left
                </span>
              )}
            </Badge>
          </div>
        </div>

        {/* Challenge Info */}
        <h4 className="text-sm font-semibold text-text-primary mb-1">{challenge.title}</h4>
        <p className="text-caption text-text-secondary mb-4">{challenge.description}</p>

        {/* Community Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-caption mb-1.5">
            <span className="text-text-muted">Community Progress</span>
            <span className="text-accent font-semibold">
              {challenge.communityProgress.toLocaleString()} / {challenge.communityGoal.toLocaleString()} {challenge.contributionUnit}
            </span>
          </div>
          <div className="w-full h-3 bg-dark-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isComplete
                  ? 'bg-gradient-to-r from-success to-info'
                  : 'bg-gradient-to-r from-accent to-warning'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* My Contribution + Link */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-caption text-text-muted">
              Your contribution: <span className="text-text-primary font-semibold">{challenge.myContribution} {challenge.contributionUnit}</span> 🎉
            </p>
            {challenge.topContributor && (
              <span className="text-[10px] text-text-muted flex items-center gap-1">
                <Trophy size={10} className="text-tier-gold" />
                Top: {challenge.topContributor.name} ({challenge.topContributor.amount})
              </span>
            )}
          </div>
          <Link
            to="/challenge"
            className="text-caption text-primary-light hover:text-primary flex items-center gap-1 transition-colors"
          >
            Details <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ChallengeWidget;
