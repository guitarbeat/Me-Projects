const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
console.time('new Date local');
for (let i = 0; i < 10000; i++) {
  const d = new Date('2024-06-15');
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
console.timeEnd('new Date local');

console.time('fast string split');
for (let i = 0; i < 10000; i++) {
  const dateString = '2024-06-15';
  if (dateString.length === 10) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const res = `${SHORT_MONTHS[m]} ${d}`;
    }
  }
}
console.timeEnd('fast string split');
