## 2024-05-17 - Date string sorting optimization
**Learning:** In JavaScript, using string comparison (`a < b ? -1 : a > b ? 1 : 0`) for ISO 8601 date strings is significantly faster than parsing them into `Date` objects (`new Date(a).getTime() - new Date(b).getTime()`) for sorting, and avoids memory allocation overhead for new objects.
**Action:** Always prefer direct string comparison when sorting arrays by ISO 8601 formatted date strings.
