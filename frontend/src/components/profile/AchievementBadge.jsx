import React from 'react';

const AchievementBadge = ({
  name = 'Achievement',
  description = '',
  emoji = '🏆',
  unlocked = false,
  featured = false,
  progress = null, // null = no progress, 0-100 = near-complete
  unlockedDate = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) => {
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div className={`flex flex-col items-center gap-1.5 group ${className}`}>
      {/* Badge Circle */}
      <div className="relative">
        <div
          className={`
            ${sizes[size]} rounded-full flex items-center justify-center
            transition-all duration-200
            ${unlocked
              ? `bg-dark-elevated ${featured ? 'ring-2 ring-tier-gold shadow-glow-gold' : 'ring-1 ring-border'}`
              : 'bg-dark-secondary ring-1 ring-border-subtle grayscale opacity-40 blur-[1px]'
            }
          `}
        >
          <span className={unlocked ? '' : 'opacity-50'}>{emoji}</span>

          {/* Lock overlay */}
          {!unlocked && !progress && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm">🔒</span>
            </div>
          )}
        </div>

        {/* Progress ring for near-complete */}
        {!unlocked && progress !== null && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#1A1A2E" strokeWidth="3" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke="#7C3AED" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            />
          </svg>
        )}

        {/* Featured star */}
        {featured && unlocked && (
          <div className="absolute -top-1 -right-1 text-xs">⭐</div>
        )}
      </div>

      {/* Label */}
      <div className="text-center max-w-[80px]">
        <p className={`text-[10px] font-semibold leading-tight truncate ${
          unlocked ? 'text-text-primary' : 'text-text-muted'
        }`}>
          {name}
        </p>
        {unlocked && unlockedDate && (
          <p className="text-[9px] text-text-muted">{unlockedDate}</p>
        )}
        {!unlocked && progress !== null && (
          <p className="text-[9px] text-primary-light">{progress}%</p>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;
