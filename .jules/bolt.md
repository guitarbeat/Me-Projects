## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-16 - [Intl.DateTimeFormat & React Performance]
**Learning:** Recreating `Intl.DateTimeFormat` instances (or using `Date.prototype.toLocaleDateString()`) inside a frequently rendered React component (like items in a calendar grid) creates massive performance overhead due to repeated object allocation and format string parsing by the JS engine.
**Action:** When a formatted date string is needed inside loops or mapped components (like grids/lists), cache the `Intl.DateTimeFormat` object globally outside the component to drastically reduce formatting overhead from ~2ms per item to near 0.
