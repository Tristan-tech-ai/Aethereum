import React from 'react';

const rankConfig = {
  seedling: { name: 'Seedling', emoji: '🌱', color: '#22C55E', min: 1, max: 5 },
  learner: { name: 'Learner', emoji: '📗', color: '#3B82F6', min: 6, max: 15 },
  scholar: { name: 'Scholar', emoji: '📘', color: '#8B5CF6', min: 16, max: 30 },
  researcher: { name: 'Researcher', emoji: '🔬', color: '#06B6D4', min: 31, max: 50 },
  expert: { name: 'Expert', emoji: '🎓', color: '#F59E0B', min: 51, max: 75 },
  sage: { name: 'Sage', emoji: '🏛️', color: '#EF4444', min: 76, max: 100 },
};

const getRank = (level) => {
  for (const [key, config] of Object.entries(rankConfig)) {
    if (level >= config.min && level <= config.max) return { key, ...config };
  }
  return { key: 'seedling', ...rankConfig.seedling };
};

const LevelBadge = ({
  level = 1,
  currentXP = 0,
  nextLevelXP = 100,
  size = 'md',
  showRank = true,
  showXP = true,
  className = '',
}) => {
  const rank = getRank(level);
  const progress = nextLevelXP > 0 ? (currentXP / nextLevelXP) * 100 : 0;

  const sizes = {
    sm: { ring: 48, stroke: 3, text: 'text-sm', label: 'text-[9px]' },
    md: { ring: 80, stroke: 4, text: 'text-2xl', label: 'text-caption' },
    lg: { ring: 96, stroke: 5, text: 'text-3xl', label: 'text-body-sm' },
  };
  const s = sizes[size] || sizes.md;
  const radius = (s.ring - s.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {/* SVG Ring */}
      <div className="relative" style={{ width: s.ring, height: s.ring }}>
        <svg width={s.ring} height={s.ring} className="-rotate-90">
          {/* Track */}
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke="#1A1A2E"
            strokeWidth={s.stroke}
          />
          {/* Progress */}
          <circle
            cx={s.ring / 2}
            cy={s.ring / 2}
            r={radius}
            fill="none"
            stroke={rank.color}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-500"
            style={{ filter: `drop-shadow(0 0 6px ${rank.color}40)` }}
          />
        </svg>
        {/* Level Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`${s.text} font-bold text-text-primary`}>{level}</span>
        </div>
      </div>

      {/* Rank Name */}
      {showRank && (
        <div className="flex items-center gap-1">
          <span className="text-sm">{rank.emoji}</span>
          <span className={`${s.label} font-semibold`} style={{ color: rank.color }}>
            {rank.name}
          </span>
        </div>
      )}

      {/* XP Progress */}
      {showXP && (
        <div className="w-full max-w-[120px]">
          <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: rank.color }}
            />
          </div>
          <p className="text-[10px] text-text-muted text-center mt-0.5">
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
          </p>
        </div>
      )}
    </div>
  );
};

export { getRank, rankConfig };
export default LevelBadge;
