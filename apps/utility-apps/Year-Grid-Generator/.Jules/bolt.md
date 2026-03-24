## 2026-02-22 - Debounce Expensive Syncs
**Learning:** `window.history.replaceState` and `localStorage.setItem` are synchronous operations that can block the main thread, causing jank during rapid UI updates (e.g., dragging sliders).
**Action:** Always debounce effects that persist state to the URL or LocalStorage if the state can change rapidly (high-frequency events).
