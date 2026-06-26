## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.

## 2024-05-22 - [Performance: Fast Date Sorting]
**Learning:** To optimize JavaScript performance, prefer direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) over parsing into `Date` objects when sorting arrays by ISO 8601 formatted date strings.
**Action:** Always use string comparison for standard YYYY-MM-DD format sorting instead of `new Date().getTime()`, as it avoids significant object allocation overhead.
## 2026-06-26 - Hoisting loop invariants outside rendered components
**Learning:** Instantiating `new Date()` inside a child component's `useMemo` block creates a severe performance bottleneck when that child is rendered in a loop (like a 30-day calendar grid), even if the `useMemo` dependencies are stable. Changing the internal computation of the child from `new Date(year, month, day)` to `new Date(year, month, 1)` doesn't fix the problem, as it still allocates one `Date` object *per instance*.
**Action:** When a calculation is invariant across a loop (e.g., the first day of the month for all days in that month), hoist the calculation to the parent component and pass it down as a prop.
