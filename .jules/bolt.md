## 2024-08-05 - O(N²) Performance Bottleneck in React useMemo Chaining
**Learning:** Using chained array methods like `.filter`, `.reduce`, and nested array lookups like `.forEach` containing `.includes` or `.find` inside a `useMemo` block creates significant O(N²) CPU overhead, severely impacting rendering times on large arrays.
**Action:** When grouping or reducing large arrays in performance-critical components (like charts), replace chained array methods with a single O(N) `for` loop using object maps for tracking unique keys and state.

## 2024-11-14 - Avoid Date.toISOString for local dates
**Learning:** Using new Date(year, month, day).toISOString() in React components to format dates strings causes performance overhead due to Date object allocation, and more importantly introduces bugs where local time zones shift the date to the previous/next day in UTC.
**Action:** Always use manual string padding (e.g., String(month).padStart(2, '0')) to format local dates for API consumption or state management without timezone artifacts.
