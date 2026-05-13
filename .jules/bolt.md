## 2024-05-13 - [Format local dates efficiently]
**Learning:** Using `new Date(...).toISOString().split('T')[0]` introduces timezone shift bugs and significant performance overhead, especially in loops and component renders.
**Action:** Use manual formatting with `String(date.getFullYear()) + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')` or a helper function instead.
