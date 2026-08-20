console.time('new Date');
for (let i = 0; i < 10000; i++) {
  const formatDate = (y, m, d) => {
    const date = new Date(y, m, d);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };
  for (let d = 1; d <= 31; d++) {
    formatDate(2024, 6, d);
    formatDate(2024, 6, d - 1);
    formatDate(2024, 6, d + 1);
  }
}
console.timeEnd('new Date');

console.time('fastpath');
for (let i = 0; i < 10000; i++) {
  const formatDate = (y, m, d) => {
    // Fast path for valid days of most months (1-28)
    if (d > 0 && d <= 28) {
      const yy = y;
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    }
    const date = new Date(y, m, d);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  };
  for (let d = 1; d <= 31; d++) {
    formatDate(2024, 6, d);
    formatDate(2024, 6, d - 1);
    formatDate(2024, 6, d + 1);
  }
}
console.timeEnd('fastpath');
