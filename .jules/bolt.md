## 2024-08-05 - O(N²) Performance Bottleneck in React useMemo Chaining
**Learning:** Using chained array methods like `.filter`, `.reduce`, and nested array lookups like `.forEach` containing `.includes` or `.find` inside a `useMemo` block creates significant O(N²) CPU overhead, severely impacting rendering times on large arrays.
**Action:** When grouping or reducing large arrays in performance-critical components (like charts), replace chained array methods with a single O(N) `for` loop using object maps for tracking unique keys and state.
