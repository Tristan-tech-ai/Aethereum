import React, { useState, useMemo } from 'react';

const HEATMAP_COLORS = [
  'bg-heatmap-0', // none
  'bg-heatmap-1', // low
  'bg-heatmap-2', // medium
  'bg-heatmap-3', // high
  'bg-heatmap-4', // max
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

/**
 * Generate demo heatmap data for a given number of weeks
 */
const generateDemoData = (weeks) => {
  const data = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - weeks * 7);

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);
      // Generate weighted random - more likely to have low or no activity
      const rand = Math.random();
      let level = 0;
      if (rand > 0.6) level = 1;
      if (rand > 0.75) level = 2;
      if (rand > 0.88) level = 3;
      if (rand > 0.95) level = 4;

      const sessions = level === 0 ? 0 : Math.ceil(level * 1.5);
      const minutes = level === 0 ? 0 : level * 30 + Math.floor(Math.random() * 30);

      week.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        level,
        sessions,
        minutes,
      });
    }
    data.push(week);
  }
  return data;
};

const LearningHeatmap = ({ weeks = 52, className = '' }) => {
  const [tooltip, setTooltip] = useState(null);
  const [view, setView] = useState('1Y');

  const viewWeeks = view === '3M' ? 13 : view === '6M' ? 26 : 52;
  const data = useMemo(() => generateDemoData(viewWeeks), [viewWeeks]);

  // Calculate month labels
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    data.forEach((week, i) => {
      const date = new Date(week[0]?.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({ index: i, label: MONTHS[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [data]);

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-h4 font-heading text-text-primary">Learning Activity</h3>
        <div className="flex gap-1">
          {['3M', '6M', '1Y'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 text-caption font-semibold rounded-full transition-colors duration-fast ${
                view === v
                  ? 'bg-primary/15 text-primary-light'
                  : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex ml-8 mb-1" style={{ gap: '3px' }}>
        {data.map((_, i) => {
          const label = monthLabels.find((m) => m.index === i);
          return (
            <div key={i} className="text-[10px] text-text-muted" style={{ width: '13px', textAlign: 'left' }}>
              {label ? label.label : ''}
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-0">
        {/* Day labels */}
        <div className="flex flex-col mr-1.5" style={{ gap: '3px' }}>
          {DAYS.map((day, i) => (
            <div key={i} className="text-[10px] text-text-muted leading-none" style={{ height: '13px', display: 'flex', alignItems: 'center' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap cells */}
        <div className="flex overflow-x-auto" style={{ gap: '3px' }}>
          {data.map((week, wi) => (
            <div key={wi} className="flex flex-col" style={{ gap: '3px' }}>
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`rounded-[2px] ${HEATMAP_COLORS[day.level]} transition-transform duration-fast hover:scale-150 cursor-pointer`}
                  style={{ width: '13px', height: '13px' }}
                  onMouseEnter={() => setTooltip({ x: wi, y: di, ...day })}
                  onMouseLeave={() => setTooltip(null)}
                  aria-label={`${day.date}: ${day.sessions} sessions, ${day.minutes} minutes`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span className="text-[10px] text-text-muted">Less</span>
        {HEATMAP_COLORS.map((color, i) => (
          <div key={i} className={`rounded-[2px] ${color}`} style={{ width: '13px', height: '13px' }} />
        ))}
        <span className="text-[10px] text-text-muted">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-2 px-3 py-2 bg-dark-elevated border border-border rounded-sm-drd text-caption text-text-secondary inline-block">
          <span className="text-text-primary font-semibold">{tooltip.date}</span> — {tooltip.sessions} sessions, {Math.floor(tooltip.minutes / 60)}h {tooltip.minutes % 60}m
        </div>
      )}
    </div>
  );
};

export default LearningHeatmap;
