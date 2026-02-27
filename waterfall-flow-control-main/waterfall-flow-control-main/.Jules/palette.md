## 2024-05-22 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons (like Trash/Delete in cards) were missing `aria-label`s, making them inaccessible to screen readers.
**Action:** Always check icon-only buttons for `aria-label` or `aria-labelledby` and ensure they are wrapped in Tooltips for desktop users.

## 2024-05-22 - Misleading UI Hints
**Learning:** The UI contained a "Swipe left to delete" hint for a component that did not support swipe gestures.
**Action:** Verify interaction hints against actual component implementation before displaying them.
