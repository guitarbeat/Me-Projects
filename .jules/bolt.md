## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.

## 2024-06-09 - [Intl Object Allocation & Formatting Overhead]
**Learning:** Using `Date.prototype.toLocaleDateString()` inside frequently rendered loops or components (like grid cells in a calendar) introduces severe performance overhead due to the constant creation and processing of `Intl.DateTimeFormat` instances.
**Action:** When the locale and output format is known and fixed (e.g. `'en-US'` weekday or month names), replace the `toLocaleDateString` call with static pre-computed array lookups using `.getDay()` or `.getMonth()`.
