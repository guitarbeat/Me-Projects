## 2025-12-15 - Memoizing SongwritingBoard List Items
**Learning:** `SongwritingBoard` was re-rendering every `LyricsBlock` (child component) on every keystroke because the parent `progression` state updated, and the `onChange` handler was an unstable inline function. This caused O(N) re-renders for every character typed.
**Action:** Wrapped `LyricsBlock` in `React.memo` and stabilized `handleLyricChange` and `handleSelect` using `useCallback` (accessing state via `useStore.getState()` to avoid dependency on the changing `progression` array). This ensures only the modified chord block re-renders.

## 2025-12-15 - Stabilizing Sequencer Selection Handler
**Learning:** `TimelineNode` components were re-rendering unnecessarily because `handleSelect` (passed as a prop) had a dependency on `progression`. Even though `TimelineNode` was memoized, the changing function reference broke memoization whenever the progression changed (e.g. typing lyrics).
**Action:** Refactored `handleSelect` to access `progression` via `useStore.getState()` instead of closure capture. Removed `progression` from the dependency array, stabilizing the handler reference and enabling O(1) selection updates.

## 2025-12-15 - Optimizing List Reconciliation with Stable IDs
**Learning:** Using array indices as keys in the `Sequencer` component's `TimelineNode` list caused React to destroy and recreate components during drag-and-drop reordering. This led to unnecessary re-renders and potential internal state loss.
**Action:** Added a unique `id` property to the `Chord` interface and updated data factories to generate it using `crypto.randomUUID()`. Updated `Sequencer` to use `key={chord.id}`, allowing React to move existing DOM nodes instead of recreating them, significantly improving reordering performance and state preservation.
