## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.

## 2024-05-25 - [Performance: ISO Date Sorting]
**Learning:** Instantiating `Date` objects inside of `Array.prototype.sort()` loops is a common and expensive JavaScript performance bottleneck due to continuous memory allocation and string parsing. If dates are strictly formatted as ISO 8601 strings (e.g., `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`), lexicographical string comparisons result in the same chronological ordering.
**Action:** Replace `new Date(a.date).getTime() - new Date(b.date).getTime()` with `a.date < b.date ? -1 : a.date > b.date ? 1 : 0` when sorting arrays by ISO date strings.
