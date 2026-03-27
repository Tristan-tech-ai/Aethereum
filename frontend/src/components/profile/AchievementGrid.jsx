import React, { useState, useMemo } from 'react';
import AchievementBadge from './AchievementBadge';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'learning', label: '📚 Learning' },
  { key: 'social', label: '🤝 Social' },
  { key: 'streak', label: '🔥 Streak' },
  { key: 'special', label: '✨ Special' },
];

const AchievementGrid = ({
  achievements = [],
  className = '',
  showFilter = true,
  showCount = true,
  badgeSize = 'md',
}) => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter by category
  const filtered = useMemo(() => {
    const list = activeCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

    // Sort: unlocked first, then by progress (near-complete before locked)
    return [...list].sort((a, b) => {
      if (a.unlocked && !b.unlocked) return -1;
      if (!a.unlocked && b.unlocked) return 1;
      // Both locked — sort by progress desc
      if (!a.unlocked && !b.unlocked) {
        const pa = a.progress ?? -1;
        const pb = b.progress ?? -1;
        return pb - pa;
      }
      return 0;
    });
  }, [achievements, activeCategory]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        {showCount && (
          <div className="flex items-center gap-3">
            <h3 className="text-h4 font-heading text-text-primary">Achievements</h3>
            <span className="text-caption text-text-muted bg-dark-secondary px-2.5 py-0.5 rounded-full">
              {unlockedCount}/{totalCount} Unlocked
            </span>
          </div>
        )}

        {/* Category Filter */}
        {showFilter && (
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1 text-caption font-semibold rounded-full transition-all duration-fast ${
                  activeCategory === cat.key
                    ? 'bg-primary/15 text-primary-light'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Badge Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 sm:gap-5">
          {filtered.map((achievement, i) => (
            <AchievementBadge
              key={achievement.id || i}
              name={achievement.name}
              description={achievement.description}
              emoji={achievement.emoji}
              icon={achievement.icon}
              unlocked={achievement.unlocked}
              featured={achievement.featured}
              progress={achievement.progress}
              unlockedDate={achievement.unlockedDate}
              size={badgeSize}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">🏆</p>
          <p className="text-text-secondary text-sm">No achievements in this category yet.</p>
          <p className="text-text-muted text-caption mt-1">Keep learning to unlock achievements!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementGrid;
