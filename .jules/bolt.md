## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2024-05-22 - [Optimizing Date Sorting in JavaScript]
**Learning:** Parsing `Date` strings (e.g. `new Date(a.date).getTime()`) inside a `.sort()` function introduces significant performance overhead due to object allocation.
**Action:** For ISO 8601 formatted date strings or 'YYYY-MM-DD', use direct string comparison instead (`a.date < b.date ? -1 : a.date > b.date ? 1 : 0`). This reduces sorting time drastically (e.g. ~20x faster on large datasets) while preserving the same order.
