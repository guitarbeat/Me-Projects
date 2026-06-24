## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.
## 2024-06-24 - [Date Object Creation in Sort]
**Learning:** Creating `Date` objects within the `sort` comparator (e.g., `new Date(a.date).getTime() - new Date(b.date).getTime()`) adds massive performance overhead. Since ISO 8601 strings sort lexicographically, this is completely unnecessary.
**Action:** Compare date strings directly when they are formatted as ISO 8601 (YYYY-MM-DD), avoiding `new Date()` entirely inside sort loops.
