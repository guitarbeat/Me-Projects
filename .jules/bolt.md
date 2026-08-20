## 2024-05-15 - Array Method Chaining Overhead
**Learning:** Chaining array methods like `.filter()`, `.reduce()`, or using `.includes()` inside `.forEach()` inside a React `useMemo` block creates severe O(N²) CPU overhead on large datasets.
**Action:** Replace chained array methods and nested array lookups with a single-pass O(N) `for` loop using object maps for tracking state. This significantly reduces main-thread blocking time during re-renders.
