const y = 2024;
const m = 6;
const d = 15;

console.time('new Date');
for (let i = 0; i < 100000; i++) {
  const date = new Date(y, m, d);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const result = yy + '-' + mm + '-' + dd;
}
console.timeEnd('new Date');

console.time('manual');
for (let i = 0; i < 100000; i++) {
  const yy = y;
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  const result = yy + '-' + mm + '-' + dd;
}
console.timeEnd('manual');
