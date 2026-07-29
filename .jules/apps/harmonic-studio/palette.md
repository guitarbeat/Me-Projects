## 2025-12-15 - Icon Button Accessibility
**Learning:** `IconButton` components are frequently used without `aria-label` or `title` props, making them inaccessible to screen readers.
**Action:** Always verify `IconButton` usage includes a descriptive `aria-label` or `title`.

## 2025-05-18 - Keyboard Reveal Pattern
**Learning:** Elements hidden by `opacity-0` and revealed on hover (`group-hover:opacity-100`) are inaccessible to keyboard users unless also revealed on focus (`focus:opacity-100`).
**Action:** Always pair `group-hover:opacity-100` with `focus:opacity-100` (or `group-focus-within:opacity-100`) for action buttons in lists.
