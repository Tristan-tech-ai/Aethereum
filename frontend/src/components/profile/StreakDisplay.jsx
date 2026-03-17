import React from 'react';

const StreakDisplay = ({
  count = 0,
  bestStreak = 0,
  status = 'active', // 'active' | 'at-risk' | 'broken'
  weeklyGoal = 5,
  weeklyProgress = 3,
  compact = false,
  className = '',
}) => {
  const statusConfig = {
    active: { label: 'Active', color: 'text-success', bgColor: 'bg-success/10' },
    'at-risk': { label: 'At Risk ⚠️', color: 'text-warning', bgColor: 'bg-warning/10' },
    broken: { label: 'Broken 💔', color: 'text-danger', bgColor: 'bg-danger/10' },
  };
  const s = statusConfig[status] || statusConfig.active;

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        <span className={`${status === 'active' ? 'animate-flicker' : ''}`}>🔥</span>
        <span className="font-bold text-text-primary">{count}</span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {/* Flame + Count */}
        <div className="flex items-center gap-1.5">
          <span className={`text-xl ${status === 'active' ? 'animate-flicker' : ''}`}>🔥</span>
          <span className="text-xl font-bold text-text-primary">{count}</span>
          <span className="text-body-sm text-text-secondary">day streak</span>
        </div>

        {/* Status pill */}
        <span className={`text-caption font-semibold px-2 py-0.5 rounded-full ${s.color} ${s.bgColor}`}>
          {s.label}
        </span>
      </div>

      {/* Best streak */}
      <p className="text-caption text-text-muted mb-2">Best: {bestStreak} days</p>

      {/* Weekly Goal */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-caption text-text-muted">Weekly Goal</span>
          <span className="text-caption text-text-secondary">{weeklyProgress}/{weeklyGoal} days</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: weeklyGoal }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < weeklyProgress ? 'bg-success' : 'bg-dark-secondary'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
