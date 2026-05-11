export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const getDaysInMonth = (date: Date): (number | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days: (number | null)[] = [];

  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return days;
};

export const adjustMonth = (date: Date, direction: 'prev' | 'next'): Date => {
  const newDate = new Date(date);
  if (direction === 'prev') {
    newDate.setMonth(date.getMonth() - 1);
  } else {
    newDate.setMonth(date.getMonth() + 1);
  }
  return newDate;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getDaysUntilDate = (dateStr: string): number => {
  const today = new Date();
  const nextDate = new Date(dateStr);
  return Math.ceil(
    (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * High-performance formatter to get YYYY-MM-DD from year, month (0-11), and day.
 * Avoids the overhead and timezone shift bugs of `new Date(...).toISOString().split('T')[0]`.
 */
export const formatDateComponents = (
  year: number,
  month: number, // 0-based
  day: number
): string => {
  const m = month + 1;
  return `${year}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
};

/**
 * High-performance formatter to get local YYYY-MM-DD from a Date object.
 */
export const toLocalDateString = (date: Date = new Date()): string => {
  return formatDateComponents(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};
