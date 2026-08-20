console.time('count days');
for(let i=0; i<10000; i++) {
  const arr = [null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  const daysInMonthCount = arr.filter(d => d !== null).length;
}
console.timeEnd('count days');

console.time('precalc array');
for(let i=0; i<10000; i++) {
  const arr = [null, null, null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  let daysInMonthCount = 0;
  for (let j=arr.length-1; j>=0; j--) {
    if (arr[j] !== null) {
      daysInMonthCount = arr[j];
      break;
    }
  }
}
console.timeEnd('precalc array');
