## 2024-08-05 - O(N²) Performance Bottleneck in React useMemo Chaining
**Learning:** Using chained array methods like `.filter`, `.reduce`, and nested array lookups like `.forEach` containing `.includes` or `.find` inside a `useMemo` block creates significant O(N²) CPU overhead, severely impacting rendering times on large arrays.
**Action:** When grouping or reducing large arrays in performance-critical components (like charts), replace chained array methods with a single O(N) `for` loop using object maps for tracking unique keys and state.

## 2026-08-29 - [YearGrid Performance & Props Optimization]
**Learning:** In highly iterated `useMemo` blocks handling loops (like YearGrids mapping all 365 days), re-creating an object instance every loop using `Date.prototype.toLocaleDateString()` induces severe layout/blocking overhead compared to pre-caching a single `Intl.DateTimeFormat` object.
**Action:** When mapping hundreds of items inside a functional React component, ensure any heavy formatters or objects are cached outside the iteration loop to mitigate main-thread blocking times.
