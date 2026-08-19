## 2024-08-05 - O(N²) Performance Bottleneck in React useMemo Chaining
**Learning:** Using chained array methods like `.filter`, `.reduce`, and nested array lookups like `.forEach` containing `.includes` or `.find` inside a `useMemo` block creates significant O(N²) CPU overhead, severely impacting rendering times on large arrays.
**Action:** When grouping or reducing large arrays in performance-critical components (like charts), replace chained array methods with a single O(N) `for` loop using object maps for tracking unique keys and state.
## 2024-08-19 - Avoid Repeated Date Instantiation in React loops
**Learning:** Instantiating `new Date()` and calling `.toISOString()` inside React `.map()`, `.filter()`, or `.forEach()` methods inside `useMemo` hooks causes severe memory allocation overhead and blocks the main UI thread.
**Action:** To optimize performance when filtering or searching arrays of ISO-formatted date strings (e.g., 'YYYY-MM-DD'), use string prefix matching (like `.startsWith()`) or `.substring()` rather than instantiating a `new Date()` object for every item.
