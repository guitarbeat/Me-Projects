## 2024-05-20 - Date formatting overhead
**Learning:** Using `new Date(...).toISOString().split('T')[0]` inside React render loops causes significant performance overhead and potential timezone shift bugs when local dates fall on different UTC dates.
**Action:** Use manual string concatenation with `padStart` for local date formatting in loops.
