## 2024-05-24 - Grouping arrays in React useMemo
**Learning:** Chaining array methods like `.filter()`, `.reduce()`, or nested `.forEach()` containing `.includes()` inside a `useMemo` block creates severe O(N²) CPU overhead.
**Action:** Replace them with a single-pass O(N) `for` loop using object maps for tracking state.
