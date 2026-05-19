## 2024-05-18 - Avoiding Date Object Creation in Rendering Loops
**Learning:** In React components with rendering loops (like calendar grids or transaction lists), repeatedly calling `new Date().toISOString().split('T')[0]` causes significant performance overhead and timezone shift bugs.
**Action:** Lift the calculation of the current date string outside the loop using `useMemo` or simple string concatenation/manual formatting when appropriate.
