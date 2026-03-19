import React, { useState, useRef } from 'react';

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
  onClick,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef(null);

  const sizes = {
    sm: { container: 'w-12 h-12', emoji: 'text-xl', svgSize: 48 },
    md: { container: 'w-16 h-16', emoji: 'text-2xl', svgSize: 64 },
    lg: { container: 'w-20 h-20', emoji: 'text-3xl', svgSize: 80 },
  };

  const s = sizes[size] || sizes.md;
  const svgR = (s.svgSize / 2) - 4; // radius with padding

  return (
    <div
      className={`flex flex-col items-center gap-1.5 group relative ${className}`}
      onClick={onClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Badge Circle */}
      <div className="relative" ref={badgeRef}>
        <div
          className={`
            ${s.container} rounded-full flex items-center justify-center
            transition-all duration-200
            ${unlocked
              ? `bg-dark-elevated shadow-[0_0_12px_rgba(124,58,237,0.2)] ${
                  featured
                    ? 'ring-2 ring-tier-gold shadow-glow-gold'
                    : 'ring-1 ring-primary/30'
                }`
              : 'bg-dark-secondary ring-1 ring-border-subtle grayscale opacity-40 blur-[2px]'
            }
            ${unlocked ? 'hover:scale-110 hover:shadow-glow-primary cursor-pointer' : ''}
          `}
        >
          <span className={unlocked ? '' : 'opacity-50'}>{emoji}</span>

          {/* Lock overlay */}
          {!unlocked && progress === null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm drop-shadow-lg">🔒</span>
            </div>
          )}
        </div>

        {/* Progress ring for near-complete */}
        {!unlocked && progress !== null && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox={`0 0 ${s.svgSize} ${s.svgSize}`}
          >
            <circle
              cx={s.svgSize / 2}
              cy={s.svgSize / 2}
              r={svgR}
              fill="none"
              stroke="#1A1A2E"
              strokeWidth="3"
            />
            <circle
              cx={s.svgSize / 2}
              cy={s.svgSize / 2}
              r={svgR}
              fill="none"
              stroke="#7C3AED"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * svgR}`}
              strokeDashoffset={`${2 * Math.PI * svgR * (1 - progress / 100)}`}
              className="transition-all duration-500"
            />
          </svg>
        )}

        {/* Featured star */}
        {featured && unlocked && (
          <div className="absolute -top-1 -right-1 text-xs animate-pulse">⭐</div>
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
          <p className="text-[9px] text-primary-light font-medium">{progress}%</p>
        )}
      </div>

      {/* Hover Tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          style={{ whiteSpace: 'nowrap' }}
        >
          <div className="bg-dark-elevated border border-border rounded-sm-drd shadow-lg-drd px-3 py-2 text-center max-w-[200px]"
            style={{ whiteSpace: 'normal' }}
          >
            <p className="text-caption font-semibold text-text-primary">{name}</p>
            {description && (
              <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{description}</p>
            )}
            {unlocked && unlockedDate && (
              <p className="text-[10px] text-primary-light mt-1">🏆 Unlocked {unlockedDate}</p>
            )}
            {!unlocked && progress !== null && (
              <p className="text-[10px] text-text-muted mt-1">Progress: {progress}%</p>
            )}
            {!unlocked && progress === null && (
              <p className="text-[10px] text-text-muted mt-1">🔒 Locked</p>
            )}
          </div>
          {/* Tooltip arrow */}
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-dark-elevated border-r border-b border-border rotate-45 -mt-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;
