## 2024-05-04 - CalendarDay Re-render Optimization
**Learning:** React.memo() relies on shallow comparison. In components receiving object props (like `Date`), recreating the object in the parent causes child components to re-render even if the underlying data values haven't changed. In `CalendarDay`, the `currentDate` object was causing unnecessary re-renders of the entire grid.
**Action:** When using `React.memo()` with complex object props that often change reference but not meaning, implement a custom `areEqual` function to check the specific fields that determine the component's output.
