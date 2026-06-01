## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2025-06-01 - [Performance: ISO Date Sorting]
**Learning:** Creating `Date` objects inside a `sort` loop for ISO 8601 date strings is extremely slow due to repeated parsing.
**Action:** Use direct string comparison (`a.date < b.date ? -1 : a.date > b.date ? 1 : 0`) for ISO date strings, which is ~10x faster and maintains correct sorting order.
