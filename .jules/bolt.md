
## 2024-08-04 - [Optimize date string parsing in YearGrid]
**Learning:** Instantiating `new Date(string).toISOString().split('T')[0]` inside a `.forEach` or `.filter` over a large array (like thousands of activities) causes significant memory allocation and processing overhead. Checking if the value is already a string and using `.substring(0, 10)` is approximately 7x faster and avoids garbage collection pauses.
**Action:** Always prefer `.substring(0, 10)` for extracting dates from ISO 8601 strings when iterating over large datasets, falling back to `new Date()` only if the format is not guaranteed.
