const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
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

console.time('new Date local');
for (let i = 0; i < 100000; i++) {
  const d = new Date(2024, 6, 15);
  const weekday = WEEKDAYS[d.getDay()];
  const month = MONTHS[d.getMonth()];
  const res = `${weekday}, ${month} 15, 2024`;
}
console.timeEnd('new Date local');

console.time('modulo fast');
for (let i = 0; i < 100000; i++) {
  const day = 15;
  const firstDayOfWeek = 1; // July 1 2024 is Monday (1)
  const monthIdx = 6;
  const weekday = WEEKDAYS[(firstDayOfWeek + day - 1) % 7];
  const month = MONTHS[monthIdx];
  const res = `${weekday}, ${month} ${day}, 2024`;
}
console.timeEnd('modulo fast');
