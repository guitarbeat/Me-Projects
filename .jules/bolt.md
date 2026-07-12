## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.

## 2024-05-22 - [Performance: Fast Date Sorting]
**Learning:** To optimize JavaScript performance, prefer direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) over parsing into `Date` objects when sorting arrays by ISO 8601 formatted date strings.
**Action:** Always use string comparison for standard YYYY-MM-DD format sorting instead of `new Date().getTime()`, as it avoids significant object allocation overhead.

## 2024-07-12 - Date Object Instantiation Overhead for Days in Month
**Learning:** Instantiating `new Date(year, month + 1, 0).getDate()` to find the number of days in a month is significantly slower (~6x slower in V8) than using a simple array lookup combined with a mathematical leap year check. The `Date` constructor involves heavy internal calendrical math and bounds-checking that is unnecessary for simple array lookups.
**Action:** When calculating the number of days in a month in hot paths or tight loops, prefer `const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0; const days = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];` over object instantiation.
