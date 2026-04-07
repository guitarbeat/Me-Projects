# 2024-05-23 - React.useEffect dependency pitfalls with derived arrays

**Learning:** Derived arrays (like `const items = raw.map(...)`) created during render create new references every time. If these are passed to child components that use them in `useEffect` dependency arrays (even if checking for length), the effect will re-run on every parent render.
**Action:** Always wrap derived arrays/objects in `useMemo` if they are passed to children that use them in `useEffect` or `React.memo`, especially if the derivation is happening in a frequently re-rendered parent.

## 2024-05-23 - Stable Event Handlers & Focus Management

**Learning:** Event handlers that depend on frequently changing state (like `focusedDay` or `hoverIndex`) cause child components to re-render unnecessarily if passed as props. Even with `React.memo`, if the handler changes, the prop changes.
**Action:** Use `useRef` to store the changing value and access `ref.current` inside the handler to keep the handler function stable (same reference), preventing child re-renders.
