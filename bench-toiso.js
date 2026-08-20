console.time('original toISOString');
for(let i=0; i<10000; i++) {
  const d = new Date().toISOString().split('T')[0];
}
console.timeEnd('original toISOString');

console.time('optimized manual formatting');
for(let i=0; i<10000; i++) {
  const date = new Date();
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const d = `${yy}-${mm}-${dd}`;
}
console.timeEnd('optimized manual formatting');
