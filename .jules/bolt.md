## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.

## 2024-05-22 - [Performance: Fast Date Sorting]
**Learning:** To optimize JavaScript performance, prefer direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) over parsing into `Date` objects when sorting arrays by ISO 8601 formatted date strings.
**Action:** Always use string comparison for standard YYYY-MM-DD format sorting instead of `new Date().getTime()`, as it avoids significant object allocation overhead.
## 2026-07-28 - [Performance: Optimizing Date Calculations in Loops]
**Learning:** Functions that perform structural date derivations (like calculating the number of days in a month) inside loops frequently instantiate multiple `Date` objects and dynamically grow arrays, causing significant garbage collection overhead.
**Action:** Replace `Date` instantiations with simple mathematical calculations (e.g., leap year `(year % 4 === 0 && year % 100 !== 0) || year % 400 === 0`) and static array lookups for month lengths. Always pre-allocate arrays (e.g., `new Array(size)`) when the final length is deterministic to prevent underlying memory reallocation.
