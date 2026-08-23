## 2024-08-05 - O(N²) Performance Bottleneck in React useMemo Chaining
**Learning:** Using chained array methods like `.filter`, `.reduce`, and nested array lookups like `.forEach` containing `.includes` or `.find` inside a `useMemo` block creates significant O(N²) CPU overhead, severely impacting rendering times on large arrays.
**Action:** When grouping or reducing large arrays in performance-critical components (like charts), replace chained array methods with a single O(N) `for` loop using object maps for tracking unique keys and state.

## 2024-08-23 - Date fast path optimization boundary issues
**Learning:** When creating fast paths for JavaScript Date allocations that rely on string formatting (e.g. `const mm = String(m + 1).padStart(2, '0')`), blindly trusting user inputs can cause major bugs. Calendar components frequently pass out-of-bounds month indices (`m = -1` or `m = 12`) to trigger native Date rollovers.
**Action:** When implementing bypasses for `new Date(y, m, d)`, always add explicit boundary bounds checks (e.g., `m >= 0 && m <= 11`) to ensure edge cases naturally fall back to the native `Date` object's robust handling of overflows.
