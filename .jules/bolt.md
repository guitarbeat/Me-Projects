## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2024-06-12 - Intl API Overhead in Rendering Loops
**Learning:** `Date.prototype.toLocaleDateString()` triggers the browser's `Intl` formatting APIs, which are extremely slow and CPU-intensive. When used inside a grid or loop, such as rendering 28-31 days in a calendar, this can block the main thread and cause noticeable lag.
**Action:** When formatting dates for UI elements in a loop or frequently rendered component, use pre-computed array lookups (e.g., `['Sun', 'Mon', ...][date.getDay()]`) instead of `toLocaleDateString()` or `Intl.DateTimeFormat`.
