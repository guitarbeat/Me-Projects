/**
 * Utilities for period tracking insights and pattern recognition
 */

interface PeriodInsights {
  daysThisMonth: number;
  totalDays: number;
  averageCycleLength: number | null;
  lastPeriodStart: Date | null;
  streak: number;
}

/**
 * Calculate insights from period entries
 */
export const calculatePeriodInsights = (
  entries: Record<string, boolean>,
  currentDate: Date
): PeriodInsights => {
  const allDates = Object.keys(entries)
    .filter((date) => entries[date])
    .sort();

  // Count days this month
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Optimize: Use string prefix matching instead of creating new Date() instances in loop
  const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const daysThisMonth = allDates.filter((date) => date.startsWith(prefix)).length;

  // Total days logged
  const totalDays = allDates.length;

  // Find period starts (first day after a gap)
  const periodStarts: Date[] = [];
  let lastDateMs: number | null = null;

  for (const dateStr of allDates) {
    const date = new Date(dateStr);
    const dateMs = date.getTime();
    if (
      lastDateMs === null ||
      (dateMs - lastDateMs) / (1000 * 60 * 60 * 24) > 7
    ) {
      // Gap of more than 7 days = new period
      periodStarts.push(date);
    }
    lastDateMs = dateMs;
  }

  // Calculate average cycle length
  let averageCycleLength: number | null = null;
  if (periodStarts.length >= 3) {
    const cycleLengths: number[] = [];
    for (let i = 1; i < periodStarts.length; i++) {
      const days = Math.round(
        (periodStarts[i].getTime() - periodStarts[i - 1].getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (days >= 20 && days <= 45) {
        // Only count reasonable cycle lengths
        cycleLengths.push(days);
      }
    }
    if (cycleLengths.length >= 2) {
      averageCycleLength = Math.round(
        cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
      );
    }
  }

  // Last period start
  const lastPeriodStart =
    periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : null;

  // Current streak (consecutive days ending today or yesterday)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Helper to format local date without new Date(...).toISOString().split('T')[0] timezone shift bugs and overhead
  const formatDateLocal = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let streak = 0;
  const todayStr = formatDateLocal(today);
  const checkDate = allDates.includes(todayStr)
    ? today
    : yesterday;

  // Optimize: Avoid allocating new Date objects and strings continuously in loop
  while (entries[formatDateLocal(checkDate)]) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return {
    daysThisMonth,
    totalDays,
    averageCycleLength,
    lastPeriodStart,
    streak,
  };
};

/**
 * Get a friendly message based on insights
 */
export const getInsightMessage = (insights: PeriodInsights): string | null => {
  if (insights.totalDays === 0) {
    return null;
  }

  if (insights.streak > 0) {
    return `${insights.streak} day${insights.streak > 1 ? 's' : ''} logged`;
  }

  if (insights.averageCycleLength) {
    return `~${insights.averageCycleLength} day cycle`;
  }

  if (insights.daysThisMonth > 0) {
    return `${insights.daysThisMonth} day${insights.daysThisMonth > 1 ? 's' : ''} this month`;
  }

  return null;
};
