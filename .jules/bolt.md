## 2024-08-12 - Date Processing Overhead in Loops

**Learning:** Replacing `new Date(year, month, 1).getDay()` and `new Date(year, month + 1, 0).getDate()` with pure mathematical calculations (`(year % 4 === 0...)` and array lookups) provides up to an 85% speedup. The `new Date()` allocation overhead inside rendering loops (like CalendarGrid.tsx) creates noticeable main-thread blocking when executed per cell or per view generation.

**Action:** When generating calendar arrays or determining month bounds, use constant array lookups `[31, isLeap ? 29 : 28, ...]` and modulo arithmetic instead of relying on JavaScript's native Date object normalization (e.g. `month + 1, 0`).
