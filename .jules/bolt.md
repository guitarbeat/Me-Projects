## 2024-05-07 - React.memo Optimization on Calendar Components
**Learning:** Static presentational components within interactive grids (like `WeekdayHeaders` and `CalendarHeader` inside `UserCalendar`) re-render unnecessarily when grid state changes (e.g., keyboard navigation or toggling).
**Action:** Use `React.memo` to wrap static presentational components in grids, and extract constant arrays/objects outside the component scope to avoid unneeded allocation.
