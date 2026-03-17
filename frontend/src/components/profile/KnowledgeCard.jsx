import React from 'react';
import Badge from '../ui/Badge';

const tierConfig = {
  bronze: {
    border: 'border-tier-bronze',
    glow: '',
    label: '🥉 Bronze',
    barColor: 'bg-tier-bronze',
    animation: '',
  },
  silver: {
    border: 'border-tier-silver',
    glow: 'shadow-glow-silver',
    label: '🥈 Silver',
    barColor: 'bg-tier-silver',
    animation: '',
  },
  gold: {
    border: 'border-tier-gold',
    glow: 'shadow-glow-gold',
    label: '🥇 Gold',
    barColor: 'bg-tier-gold',
    animation: 'animate-shimmer-glow',
  },
  diamond: {
    border: 'border-tier-diamond',
    glow: 'shadow-glow-diamond',
    label: '💎 Diamond',
    barColor: 'bg-gradient-to-r from-tier-diamond via-primary-light to-pink-300',
    animation: 'animate-sparkle',
  },
};

const subjectIcons = {
  'Computer Science': { emoji: '💻', color: 'text-subject-cs' },
  'Mathematics': { emoji: '📐', color: 'text-subject-math' },
  'Physics': { emoji: '⚛️', color: 'text-subject-physics' },
  'Biology': { emoji: '🧬', color: 'text-subject-biology' },
  'Chemistry': { emoji: '🧪', color: 'text-subject-chemistry' },
  'Literature': { emoji: '📖', color: 'text-subject-literature' },
  'History': { emoji: '🏛️', color: 'text-subject-history' },
  'Economics': { emoji: '📊', color: 'text-subject-economics' },
  'Languages': { emoji: '🌏', color: 'text-subject-languages' },
  'Art & Design': { emoji: '🎨', color: 'text-subject-art' },
  'General': { emoji: '📚', color: 'text-subject-general' },
};

const KnowledgeCard = ({
  title = 'Untitled',
  subject = 'General',
  mastery = 75,
  tier = 'bronze',
  quizScore = 80,
  focusScore = 85,
  timeSpent = 45,
  pinned = false,
  likes = 0,
  onClick,
  className = '',
}) => {
  const config = tierConfig[tier] || tierConfig.bronze;
  const subjectInfo = subjectIcons[subject] || subjectIcons['General'];

  return (
    <div
      onClick={onClick}
      className={`
        relative w-full max-w-[280px] bg-dark-card border-2 ${config.border}
        rounded-md-drd overflow-hidden cursor-pointer
        transition-all duration-200 ease-in-out
        hover:-translate-y-0.5 hover:scale-[1.02]
        ${config.glow} ${config.animation}
        ${className}
      `}
    >
      {/* Diamond sparkle dots */}
      {tier === 'diamond' && (
        <>
          <div className="absolute top-2 right-3 w-1.5 h-1.5 bg-tier-diamond rounded-full animate-sparkle" />
          <div className="absolute top-4 right-6 w-1 h-1 bg-primary-light rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-6 left-3 w-1 h-1 bg-pink-300 rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg shrink-0">{subjectInfo.emoji}</span>
            <h4 className="text-sm font-semibold text-text-primary truncate">{title}</h4>
          </div>
          <Badge variant="primary" className="shrink-0 text-[10px]">{config.label}</Badge>
        </div>
        <span className="text-caption text-text-muted mt-0.5 block">{subject}</span>
      </div>

      {/* Mastery Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-caption text-text-muted">Mastery</span>
          <span className="text-caption font-semibold text-text-primary">{mastery}%</span>
        </div>
        <div className="w-full h-1.5 bg-dark-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${config.barColor} transition-all duration-500`}
            style={{ width: `${mastery}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-2 flex flex-wrap gap-x-3 gap-y-1">
        <span className="text-caption text-text-muted">🎯 {quizScore}% quiz</span>
        <span className="text-caption text-text-muted">⚡ {focusScore}% focus</span>
        <span className="text-caption text-text-muted">⏱️ {timeSpent}m</span>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between">
        {pinned ? (
          <span className="text-caption text-primary-light">📌 Pinned</span>
        ) : (
          <span />
        )}
        <span className="text-caption text-text-muted">❤️ {likes}</span>
      </div>
    </div>
  );
};

export default KnowledgeCard;
