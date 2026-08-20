console.time('original');
for(let i=0; i<10000; i++) {
  const year = 2024;
  const month = 5;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
}
console.timeEnd('original');

console.time('optimized');
for(let i=0; i<10000; i++) {
  const year = 2024;
  const month = 5;
  const firstDay = new Date(year, month, 1).getDay();
  // ⚡ Bolt: Fast leap year check and array lookup instead of expensive Date parsing
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const daysInMonth = daysInMonths[month];
}
console.timeEnd('optimized');
