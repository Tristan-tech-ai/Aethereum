import { useMemo } from 'react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Transform raw backend data into the 52×7 grid format.
 * Expected rawData format: [{ date: 'YYYY-MM-DD', sessions: number, minutes: number }, ...]
 */
const transformBackendData = (rawData, weeks) => {
  const dataMap = new Map();
  (rawData ?? []).forEach((entry) => {
    dataMap.set(entry.date, entry);
  });

  const grid = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (weeks * 7) + 1);

  for (let w = 0; w < weeks; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + w * 7 + d);

      const isFuture = date > today;
      const key = date.toISOString().split('T')[0];
      const entry = dataMap.get(key);

      let level = 0;
      const mins = entry?.minutes || 0;
      if (mins > 0 && mins < 30) level = 1;
      else if (mins >= 30 && mins < 60) level = 2;
      else if (mins >= 60 && mins <= 120) level = 3;
      else if (mins > 120) level = 4;

      const dayName = DAYS_FULL[date.getDay()];
      const monthName = MONTHS[date.getMonth()];
      const dayNum = date.getDate();
      const year = date.getFullYear();

      week.push({
        date: new Date(date),
        dateFormatted: `${monthName} ${dayNum}, ${year}`,
        dateAccessible: `${dayName}, ${monthName} ${dayNum}, ${year}`,
        level: isFuture ? 0 : level,
        sessions: isFuture ? 0 : (entry?.sessions || 0),
        minutes: isFuture ? 0 : mins,
        isFuture,
      });
    }
    grid.push(week);
  }

  return grid;
};

/**
 * Custom hook for heatmap data
 *
 * @param {Object} options
 * @param {'3M'|'6M'|'1Y'} options.viewMode - Time range to display
 * @param {Array|null} options.rawData - Optional backend data array
 * @returns {{ grid, monthLabels, totalSessions, totalMinutes, weeks }}
 */
export const useHeatmapData = ({ viewMode = '1Y', rawData = null } = {}) => {
  const weeks = viewMode === '3M' ? 13 : viewMode === '6M' ? 26 : 52;

  const grid = useMemo(() => {
    return transformBackendData(rawData, weeks);
  }, [weeks, rawData]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    grid.forEach((week, i) => {
      // Use the first day of the week (Sunday at index 0)
      const date = week[0]?.date;
      if (date) {
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ weekIndex: i, label: MONTHS[month] });
          lastMonth = month;
        }
      }
    });
    return labels;
  }, [grid]);

  const { totalSessions, totalMinutes } = useMemo(() => {
    let sessions = 0;
    let minutes = 0;
    grid.forEach((week) => {
      week.forEach((day) => {
        sessions += day.sessions;
        minutes += day.minutes;
      });
    });
    return { totalSessions: sessions, totalMinutes: minutes };
  }, [grid]);

  return { grid, monthLabels, totalSessions, totalMinutes, weeks };
};

export default useHeatmapData;
