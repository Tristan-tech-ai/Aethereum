import React, { useState } from 'react';
import { Trophy, Coins, Zap, ThumbsUp, ArrowLeft } from 'lucide-react';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Card from '../ui/Card';

const DuelResults = ({
  myName = 'You',
  opponent = { name: 'Budi Santoso', level: 24 },
  myScore = { focus: 92, hearts: 3, distractions: 0 },
  opScore = { focus: 78, hearts: 1, distractions: 3 },
  rewards = { xp: 50, coins: 25 },
  onClose,
  onRematch,
  className = '',
}) => {
  const [ggSent, setGgSent] = useState(false);
  const iWon = myScore.focus > opScore.focus;
  const isDraw = myScore.focus === opScore.focus;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Winner Announcement */}
      <div className="text-center py-6">
        <div className="text-5xl mb-4">
          {isDraw ? '🤝' : iWon ? '🏆' : '💪'}
        </div>
        <h2 className="text-h2 font-heading text-text-primary mb-1">
          {isDraw ? "It's a Draw!" : iWon ? 'You Win!' : 'Good Effort!'}
        </h2>
        <p className="text-text-secondary text-sm">
          {isDraw
            ? 'Both of you stayed equally focused. Impressive!'
            : iWon
            ? 'Your focus was superior. Great discipline!'
            : `${opponent.name} had better focus this time. Try again!`}
        </p>
      </div>

      {/* Score Comparison */}
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* My Score */}
        <Card className={`text-center ${iWon ? 'ring-1 ring-tier-gold/30' : ''}`}>
          <Avatar name={myName} size="lg" className="mx-auto mb-2" />
          <p className="text-sm font-semibold text-text-primary mb-0.5">{myName}</p>
          <p className={`text-3xl font-bold font-mono ${iWon ? 'text-success' : 'text-text-secondary'}`}>
            {myScore.focus}%
          </p>
          <p className="text-caption text-text-muted mt-1">Focus Score</p>

          <div className="mt-3 pt-3 border-t border-border-subtle space-y-1">
            <div className="flex justify-between text-caption">
              <span className="text-text-muted">Hearts</span>
              <span className="text-text-primary">{'❤️'.repeat(myScore.hearts)}{'🖤'.repeat(3 - myScore.hearts)}</span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-text-muted">Distractions</span>
              <span className={myScore.distractions === 0 ? 'text-success' : 'text-warning'}>{myScore.distractions}</span>
            </div>
          </div>
        </Card>

        {/* VS */}
        <div className="text-center">
          <p className="text-h3 font-heading text-text-muted">VS</p>
        </div>

        {/* Opponent Score */}
        <Card className={`text-center ${!iWon && !isDraw ? 'ring-1 ring-tier-gold/30' : ''}`}>
          <Avatar name={opponent.name} size="lg" className="mx-auto mb-2" />
          <p className="text-sm font-semibold text-text-primary mb-0.5">{opponent.name}</p>
          <p className={`text-3xl font-bold font-mono ${!iWon && !isDraw ? 'text-success' : 'text-text-secondary'}`}>
            {opScore.focus}%
          </p>
          <p className="text-caption text-text-muted mt-1">Focus Score</p>

          <div className="mt-3 pt-3 border-t border-border-subtle space-y-1">
            <div className="flex justify-between text-caption">
              <span className="text-text-muted">Hearts</span>
              <span className="text-text-primary">{'❤️'.repeat(opScore.hearts)}{'🖤'.repeat(3 - opScore.hearts)}</span>
            </div>
            <div className="flex justify-between text-caption">
              <span className="text-text-muted">Distractions</span>
              <span className={opScore.distractions === 0 ? 'text-success' : 'text-warning'}>{opScore.distractions}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards */}
      <Card className="bg-gradient-to-r from-primary/5 via-dark-elevated to-secondary/5">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
              <Zap size={16} className="text-primary-light" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-light">+{rewards.xp} XP</p>
              <p className="text-[10px] text-text-muted">Experience</p>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
              <Coins size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-accent">+{rewards.coins}</p>
              <p className="text-[10px] text-text-muted">Aether Coins</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant={ggSent ? 'ghost' : 'secondary'}
          className="flex-1"
          onClick={() => setGgSent(true)}
          disabled={ggSent}
        >
          <ThumbsUp size={16} className="mr-2" />
          {ggSent ? 'GG Sent! 🤝' : 'Good Game!'}
        </Button>
        <Button variant="primary" className="flex-1" onClick={onRematch}>
          🥊 Rematch
        </Button>
        <Button variant="ghost" className="flex-1" onClick={onClose}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
      </div>
    </div>
  );
};

export default DuelResults;
