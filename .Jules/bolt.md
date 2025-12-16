## 2025-12-15 - Memoizing SongwritingBoard List Items
**Learning:** `SongwritingBoard` was re-rendering every `LyricsBlock` (child component) on every keystroke because the parent `progression` state updated, and the `onChange` handler was an unstable inline function. This caused O(N) re-renders for every character typed.
**Action:** Wrapped `LyricsBlock` in `React.memo` and stabilized `handleLyricChange` and `handleSelect` using `useCallback` (accessing state via `useStore.getState()` to avoid dependency on the changing `progression` array). This ensures only the modified chord block re-renders.

## 2025-12-15 - Stabilizing Sequencer Selection Handler
**Learning:** `TimelineNode` components were re-rendering unnecessarily because `handleSelect` (passed as a prop) had a dependency on `progression`. Even though `TimelineNode` was memoized, the changing function reference broke memoization whenever the progression changed (e.g. typing lyrics).
**Action:** Refactored `handleSelect` to access `progression` via `useStore.getState()` instead of closure capture. Removed `progression` from the dependency array, stabilizing the handler reference and enabling O(1) selection updates.
