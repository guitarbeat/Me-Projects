## 2024-05-21 - [Timezone Shift & Performance: Local Date Formatting]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` for local date formatting in JavaScript loops introduces a timezone shift bug (since it converts to UTC before extracting the string) and has significant performance overhead due to object allocation and string parsing.
**Action:** Use manual string concatenation and manual formatting to pad and format the year, month, and day based on local time. This avoids creating unnecessary Date instances inside loops and prevents timezone shifting errors.
## 2026-06-17 - [Date Formatting Overhead]
**Learning:** `Date.prototype.toLocaleDateString()` has severe performance overhead (~25-100x slower) compared to array lookups and simple string splitting. Using it inside frequently rendered components (like Calendar grids) causes unnecessary main-thread blocking.
**Action:** Prefer pre-computed array lookups for weekdays/months when formatting dates locally, especially in loops.
## 2024-06-20 - Fast Path Date Formatting Optimization
**Learning:** In React, optimizing object instantiations (like `new Date()`) inside a child component's `useMemo` does not prevent per-instance allocation overhead when rendering a list of those components (it's a placebo optimization). However, implementing a fast-path pattern `if (d >= 1 && d <= 28)` with string padding in utility functions safely avoids expensive `new Date(y, m, d)` allocations in hot loops, while correctly handling month boundary edge cases.
**Action:** Always measure optimizations carefully and remember that `useMemo` is scoped per-component instance. Hoist calculations or use fast-paths in shared utilities to achieve real loop-level performance gains.
