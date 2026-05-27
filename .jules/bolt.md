## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2024-05-27 - [Array Sorting Optimization: Direct String Comparison for ISO 8601 Dates]
**Learning:** Parsing strings into `Date` objects inside array `.sort()` comparators introduces significant overhead, especially for larger arrays, due to constant object allocation and parsing logic.
**Action:** Use direct string comparison (e.g., `a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) when sorting arrays by ISO 8601 formatted date strings. This is a functionally equivalent optimization that is approximately ~40x faster than `Date` parsing.
