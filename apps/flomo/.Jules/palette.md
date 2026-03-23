## 2026-01-01 - Interactive Elements Must Be Buttons

**Learning:** `div` elements with `onClick` handlers are inaccessible to keyboard users and screen readers. They lack semantic meaning, focus states, and keyboard activation support.
**Action:** Always replace `div` with `button type="button"` for interactive elements. Ensure default browser styles are reset (e.g., `bg-transparent border-0 p-0`) if the design requires a custom look, and always include `aria-label` if the button has no text content.

## 2024-05-22 - Selection State for Image Buttons

**Learning:** When using image buttons for selection (like avatars), visual cues (borders/colors) are insufficient for screen readers.
**Action:** Use `aria-pressed={isSelected}` on the `<button>` element to programmatically communicate the selection state to assistive technology.

## 2026-01-01 - Skip to Content Link

**Learning:** Single Page Applications (SPAs) often lack a "Skip to Content" link, forcing keyboard users to tab through navigation on every page.
**Action:** Always add a hidden-until-focused anchor link (`href="#main-content"`) as the first child of the body or main container, ensuring the main content wrapper has the corresponding ID and `tabIndex="-1"` for programmatic focus.
