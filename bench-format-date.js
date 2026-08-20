console.time('original');
for(let i=0; i<10000; i++) {
  const formatDate = (y, m, d) => {
    const date = new Date(y, m, d);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };
  for(let day=1; day<=31; day++) {
    formatDate(2024, 5, day);
    formatDate(2024, 5, day - 1);
    formatDate(2024, 5, day + 1);
  }
}
console.timeEnd('original');

console.time('optimized');
for(let i=0; i<10000; i++) {
  const formatDate = (y, m, d) => {
    // ⚡ Bolt: Fast path for valid days (1-28) to bypass expensive Date instantiation
    if (d > 0 && d <= 28) {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    }
    const date = new Date(y, m, d);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };
  for(let day=1; day<=31; day++) {
    formatDate(2024, 5, day);
    formatDate(2024, 5, day - 1);
    formatDate(2024, 5, day + 1);
  }
}
console.timeEnd('optimized');
