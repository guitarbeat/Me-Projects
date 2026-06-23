## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.
## 2026-06-23 - [Date Parsing in Array Sorting]
**Learning:** Using `new Date().getTime()` inside `Array.prototype.sort()` for standard ISO 8601 formatted date strings is a severe performance bottleneck because it causes an object allocation and parsing per comparison. Local micro-benchmarks showed this was ~10x slower than simple string comparison.
**Action:** When sorting arrays by ISO date strings (like `YYYY-MM-DD`), prefer direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) to bypass the `Date` constructor overhead entirely.
