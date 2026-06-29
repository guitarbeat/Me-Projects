## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.

## 2024-05-22 - [Performance: Fast Date Sorting]
**Learning:** To optimize JavaScript performance, prefer direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) over parsing into `Date` objects when sorting arrays by ISO 8601 formatted date strings.
**Action:** Always use string comparison for standard YYYY-MM-DD format sorting instead of `new Date().getTime()`, as it avoids significant object allocation overhead.

## 2026-06-29 - [Date Allocation Overhead in Render Loops]
**Learning:** Instantiating `new Date()` objects repeatedly during a calendar grid render loop (e.g. 35-42 times) just to calculate the day of the week creates unnecessary garbage collection overhead and blocking main thread times, increasing array loop timing significantly.
**Action:** Replace `new Date()` allocations in loops with mathematical computations using modulo arithmetic and pre-computed first-day-of-month offsets, avoiding O(N) object instantiations.
## 2026-06-29 - [Loop Optimizations and React Components]
**Learning:** In React, optimizing object instantiations (like `new Date()`) inside a child component's `useMemo` does not prevent per-instance allocation overhead when rendering a list of those components. The calculation will still run for every instance.
**Action:** To actually achieve loop-level performance gains, hoist the calculation to the parent component (so it runs once for the whole loop) or place it completely outside the component if it relies only on static data.
