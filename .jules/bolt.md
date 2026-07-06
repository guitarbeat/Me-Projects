## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.

## 2024-05-22 - [Performance: Fast Date Sorting]
**Learning:** To optimize JavaScript performance, prefer direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) over parsing into `Date` objects when sorting arrays by ISO 8601 formatted date strings.
**Action:** Always use string comparison for standard YYYY-MM-DD format sorting instead of `new Date().getTime()`, as it avoids significant object allocation overhead.
## 2024-05-23 - [Timezone Shift & Performance: UTC Date Formatting]
**Learning:** `new Date('YYYY-MM-DD')` inherently parses as UTC. Using `.getMonth()` on this object returns the *local* month, which causes time shift bugs depending on the user's timezone. Replacing this parsing with strict string prefix matching alters the logic because prefix matching has no timezone concept. Furthermore, using `toISOString().split('T')[0]` correctly fetches the UTC date but introduces significant overhead.
**Action:** When optimizing date loops that require strict UTC semantics, replace `toISOString().split('T')[0]` with manual formatting using `.getUTCFullYear()`, `.getUTCMonth()`, and `.getUTCDate()`. Do not replace `new Date(date)` filtering with `.startsWith()` if the original logic relies on evaluating local time from a UTC-parsed date object, unless the intention is explicitly to fix a timezone bug.
