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

  // ⚡ Bolt: Optimize by avoiding new Date() allocations
  // Calculate days in month mathematically
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonthArray = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = daysInMonthArray[month];

  // ⚡ Bolt: Calculate starting day of week mathematically from current date
  let startingDayOfWeek = (date.getDay() - (date.getDate() - 1)) % 7;
  if (startingDayOfWeek < 0) {
    startingDayOfWeek += 7;
  }

  // ⚡ Bolt: Pre-allocate array to avoid .push() reallocation overhead
  const totalLength = startingDayOfWeek + daysInMonth;
  const days = new Array(totalLength);

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
