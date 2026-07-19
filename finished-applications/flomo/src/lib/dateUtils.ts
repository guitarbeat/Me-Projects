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

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const getDaysInMonth = (date: Date): (number | null)[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay();

  // ⚡ Bolt: Optimize calculating days in month to avoid allocating `new Date(year, month + 1, 0)`
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = month === 1 && isLeap ? 29 : DAYS_IN_MONTH[month];

  // ⚡ Bolt: Pre-allocate array to avoid dynamic `.push()` reallocations
  const totalLength = startingDayOfWeek + daysInMonth;
  const days: (number | null)[] = new Array(totalLength);

  for (let i = 0; i < startingDayOfWeek; i++) {
    days[i] = null;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days[startingDayOfWeek + day - 1] = day;
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

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (dateStr: string): string => {
  // Fast path for YYYY-MM-DD (exactly 10 chars)
  if (dateStr.length === 10) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return `${SHORT_MONTHS[m]} ${d}`;
    }
  }
  // Fallback
  const date = new Date(dateStr);
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`;
};

export const getDaysUntilDate = (dateStr: string): number => {
  const today = new Date();
  const nextDate = new Date(dateStr);
  return Math.ceil(
    (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};
