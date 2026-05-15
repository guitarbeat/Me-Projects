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

import { formatLocalYYYYMMDD } from './dateUtils';

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
  const daysThisMonth = allDates.filter((date) => {
    const d = new Date(date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Total days logged
  const totalDays = allDates.length;

  // Find period starts (first day after a gap)
  const periodStarts: Date[] = [];
  let lastDate: Date | null = null;

  for (const dateStr of allDates) {
    const date = new Date(dateStr);
    if (
      !lastDate ||
      (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24) > 7
    ) {
      // Gap of more than 7 days = new period
      periodStarts.push(date);
    }
    lastDate = date;
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

  let streak = 0;
  const checkDate = allDates.includes(formatLocalYYYYMMDD(today))
    ? today
    : yesterday;

  while (entries[formatLocalYYYYMMDD(checkDate)]) {
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
