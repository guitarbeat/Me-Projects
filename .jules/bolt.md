## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-11 - Memoizing Expensive Local Computations in Render Loop
**Learning:** Even 'small' array iterations and date instantiations (like `calculatePeriodInsights`) become bottlenecks if placed directly in the main render body of frequently-updated parent components.
**Action:** Use `useMemo` for any calculation involving loops, `Object.keys()`, or repeated `new Date()` calls when placed inside top-level components like `Calendar` that may re-render due to unrelated state changes (e.g. typing in a child component).
