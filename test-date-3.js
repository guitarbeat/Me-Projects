console.time('new Date weekday');
for (let i = 0; i < 10000; i++) {
  const firstDay = new Date(2024, 1, 1).getDay(); // Feb 1 2024
}
console.timeEnd('new Date weekday');
