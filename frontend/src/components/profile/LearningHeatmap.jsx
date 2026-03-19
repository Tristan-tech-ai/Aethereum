import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useHeatmapData } from '../../hooks/useHeatmapData';

const HEATMAP_LEVELS = [
  { bg: 'var(--heatmap-0)', label: 'No activity' },
  { bg: 'var(--heatmap-1)', label: 'Less than 30 min' },
  { bg: 'var(--heatmap-2)', label: '30–60 min' },
  { bg: 'var(--heatmap-3)', label: '60–120 min' },
  { bg: 'var(--heatmap-4)', label: 'More than 120 min' },
];

const DAY_LABELS = [
  { index: 0, label: '' },
  { index: 1, label: 'Mon' },
  { index: 2, label: '' },
  { index: 3, label: 'Wed' },
  { index: 4, label: '' },
  { index: 5, label: 'Fri' },
  { index: 6, label: '' },
];

const VIEW_OPTIONS = ['3M', '6M', '1Y'];

/**
 * Format minutes as "Xh Ym"
 */
const formatMinutes = (mins) => {
  if (mins === 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/**
 * Get responsive default view based on window width
 */
const getDefaultView = () => {
  if (typeof window === 'undefined') return '1Y';
  const w = window.innerWidth;
  if (w < 768) return '3M';
  if (w < 1024) return '6M';
  return '1Y';
};

const LearningHeatmap = ({ className = '', rawData = null }) => {
  const [view, setView] = useState(getDefaultView);
  const [tooltip, setTooltip] = useState(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);

  const { grid, monthLabels, totalSessions, totalMinutes } = useHeatmapData({
    viewMode: view,
    rawData,
  });

  // Position tooltip near the hovered cell
  const handleCellHover = useCallback((e, day) => {
    if (day.isFuture) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const cellRect = e.currentTarget.getBoundingClientRect();
    const x = cellRect.left - containerRect.left + cellRect.width / 2;
    const y = cellRect.top - containerRect.top - 8;

    setTooltip({
      x,
      y,
      date: day.dateFormatted,
      sessions: day.sessions,
      minutes: day.minutes,
      level: day.level,
    });
  }, []);

  const handleCellLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  // Adjust tooltip position to prevent overflow
  useEffect(() => {
    if (tooltip && tooltipRef.current && containerRef.current) {
      const ttEl = tooltipRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();
      const ttWidth = ttEl.offsetWidth;

      // Center the tooltip horizontally, but clamp to container bounds
      let left = tooltip.x - ttWidth / 2;
      if (left < 0) left = 0;
      if (left + ttWidth > containerRect.width) left = containerRect.width - ttWidth;

      ttEl.style.left = `${left}px`;
    }
  }, [tooltip]);

  const weeks = grid.length;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-h4 font-heading text-text-primary">Learning Activity</h3>
          <p className="text-caption text-text-muted mt-0.5">
            {totalSessions} sessions · {formatMinutes(totalMinutes)} total
          </p>
        </div>
        <div className="flex gap-1 bg-dark-secondary/50 rounded-full p-0.5">
          {VIEW_OPTIONS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-caption font-semibold rounded-full transition-all duration-fast ${
                view === v
                  ? 'bg-primary/15 text-primary-light shadow-sm'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
              aria-label={`Show ${v === '3M' ? '3 months' : v === '6M' ? '6 months' : '1 year'}`}
              aria-pressed={view === v}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Area */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Month Labels */}
        <div
          className="grid mb-1.5"
          style={{
            gridTemplateColumns: `28px repeat(${weeks}, var(--heatmap-cell))`,
            gap: `0 var(--heatmap-gap)`,
          }}
        >
          {/* Empty cell for day label column */}
          <div />
          {Array.from({ length: weeks }, (_, i) => {
            const monthLabel = monthLabels.find((m) => m.weekIndex === i);
            return (
              <div
                key={i}
                className="text-overline text-text-muted whitespace-nowrap overflow-hidden"
                style={{ fontSize: '10px', letterSpacing: '0.02em', fontWeight: 500 }}
              >
                {monthLabel ? monthLabel.label : ''}
              </div>
            );
          })}
        </div>

        {/* Main Grid: Day labels + Heatmap cells */}
        <div
          className="grid"
          role="grid"
          aria-label="Learning activity heatmap"
          style={{
            gridTemplateColumns: `28px repeat(${weeks}, var(--heatmap-cell))`,
            gridTemplateRows: `repeat(7, var(--heatmap-cell))`,
            gap: 'var(--heatmap-gap)',
          }}
        >
          {/* Render row by row (day 0-6) for proper CSS grid fill */}
          {Array.from({ length: 7 }, (_, dayIndex) => (
            <React.Fragment key={`row-${dayIndex}`}>
              {/* Day label */}
              <div
                className="flex items-center text-text-muted select-none"
                style={{ fontSize: '10px', height: 'var(--heatmap-cell)' }}
              >
                {DAY_LABELS[dayIndex].label}
              </div>

              {/* Cells for this day across all weeks */}
              {grid.map((week, weekIndex) => {
                const day = week[dayIndex];
                if (!day) return <div key={`${weekIndex}-${dayIndex}`} />;

                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    role="gridcell"
                    className="rounded-[2px] cursor-pointer heatmap-cell"
                    style={{
                      backgroundColor: day.isFuture
                        ? 'var(--heatmap-0)'
                        : `var(--heatmap-${day.level})`,
                      width: 'var(--heatmap-cell)',
                      height: 'var(--heatmap-cell)',
                      opacity: day.isFuture ? 0.3 : 1,
                      transition: 'transform 150ms ease-out, box-shadow 150ms ease-out',
                    }}
                    onMouseEnter={(e) => handleCellHover(e, day)}
                    onMouseLeave={handleCellLeave}
                    aria-label={
                      day.isFuture
                        ? `${day.dateAccessible}: No data yet`
                        : `${day.dateAccessible}: ${day.sessions} session${day.sessions !== 1 ? 's' : ''}, ${formatMinutes(day.minutes)}`
                    }
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-caption text-text-muted hidden sm:inline">
          Hover over a square to see details
        </span>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-text-muted font-medium">Less</span>
          {HEATMAP_LEVELS.map((lvl, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{
                width: 'var(--heatmap-cell)',
                height: 'var(--heatmap-cell)',
                backgroundColor: lvl.bg,
              }}
              title={lvl.label}
              aria-label={`Level ${i}: ${lvl.label}`}
            />
          ))}
          <span className="text-[10px] text-text-muted font-medium">More</span>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none z-50 px-3 py-2 bg-dark-elevated border border-border rounded-sm-drd shadow-lg-drd"
          style={{
            top: `${tooltip.y}px`,
            left: `${tooltip.x}px`,
            transform: 'translateX(-50%) translateY(-100%)',
            whiteSpace: 'nowrap',
          }}
        >
          <div className="text-caption text-text-primary font-semibold">
            {tooltip.date}
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">
            {tooltip.sessions === 0
              ? 'No learning activity'
              : `${tooltip.sessions} session${tooltip.sessions !== 1 ? 's' : ''} · ${formatMinutes(tooltip.minutes)}`}
          </div>
        </div>
      )}

      {/* Inline styles for hover effect + responsive cell sizing + reduced motion */}
      <style>{`
        .heatmap-cell:hover {
          transform: scale(1.5);
          box-shadow: 0 0 6px rgba(124, 58, 237, 0.25);
          z-index: 10;
          position: relative;
        }

        @media (max-width: 767px) {
          :root {
            --heatmap-cell: var(--heatmap-cell-mobile);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .heatmap-cell:hover {
            transform: none !important;
            box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.5) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LearningHeatmap;
