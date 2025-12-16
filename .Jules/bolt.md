## 2025-12-15 - React.memo and Callback Stability
**Learning:** When using `React.memo` on list items (`TimelineNode`), it is critical to ensure all callback props are stable (using `useCallback`). Inline arrow functions in the parent render method break memoization, rendering the optimization useless.
**Action:** Always refactor inline handlers to `useCallback` when introducing `React.memo` to list components.
