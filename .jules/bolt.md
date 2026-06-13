## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2024-05-18 - toLocaleDateString Loop Bottleneck
**Learning:** `Date.prototype.toLocaleDateString()` introduces severe performance overhead when executed inside frequently rendered components or loops (e.g., a React calendar grid). The underlying `Intl` API is very slow compared to simple property lookups on `Date` objects.
**Action:** Always prefer caching `Intl.DateTimeFormat` instances or using pre-computed arrays (like `['Sunday', 'Monday', ...]`) with `getDay()` and `getMonth()` when formatting local system dates in high-frequency render paths.
