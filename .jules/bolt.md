## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.
## 2026-06-21 - [React Memoization De-optimization with Inline Defaults]
**Learning:** When destructuring props in a \`React.memo\` component, setting an inline default object (e.g., \`{ activityMap = {} }\`) creates a new reference on every render when the prop is omitted. If this prop is used in a dependency array (like \`useMemo\`), it completely breaks memoization and forces expensive calculations to re-run.
**Action:** Always declare empty default objects or arrays as constants *outside* the component definition (e.g., \`const EMPTY_MAP = {};\`) to maintain stable references across renders.
