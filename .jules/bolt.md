## 2024-03-20 - [Calendar Date Parsing Overhead]
**Learning:** In tight rendering loops like Calendar grids (where days check previous/next days), using `new Date()` multiple times per element to stringify dates creates massive main thread overhead.
**Action:** Fast-path date formatting strings via simple math and string padding (`y, m, d`) if they are guaranteed safe bounds (e.g. `d > 0 && d < 29`) to bypass `new Date` allocation completely.
