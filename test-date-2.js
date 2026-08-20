console.time('new Date');
for (let i = 0; i < 10000; i++) {
  const daysInMonth = new Date(2024, 2, 0).getDate(); // Get days in Feb 2024
}
console.timeEnd('new Date');

console.time('manual');
for (let i = 0; i < 10000; i++) {
  const year = 2024;
  const month = 1; // 0-indexed, so 1 is Feb
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = daysInMonths[month];
}
console.timeEnd('manual');
