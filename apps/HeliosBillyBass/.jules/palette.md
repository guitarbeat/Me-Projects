# Palette's Journal

## 2025-10-25 - [Accessibility Improvements]
**Learning:** Icon-only buttons using `title` attribute for tooltips are insufficient for screen readers; explicit `aria-label` is required. Material Icons should be hidden from screen readers using `aria-hidden="true"` to prevent reading ligature text.
**Action:** Always pair icon-only buttons with `aria-label` and hide decorative icons. Ensure custom macros enforce these patterns.

## 2025-10-26 - [Form Tooltip Pattern]
**Learning:** Legacy help buttons were nested inside `<label>` elements, creating invalid HTML and accessibility issues.
**Action:** Refactored to use a side-by-side flex pattern where the help button is a sibling of the label. Updated `toggleTooltip` JS to support finding the tooltip container from this new structure. Use `label_with_help` macro to enforce this valid pattern.

## 2025-10-27 - [Accessible Collapsible Sections]
**Learning:** Collapsible sections used non-semantic `<h3>` elements as click targets, making them inaccessible to keyboard users and screen readers.
**Action:** Refactored `section_card` macro to use a semantic `<button>` inside the header with `aria-expanded` and `aria-controls` attributes. Updated JavaScript to toggle ARIA states and handle the new structure while maintaining backward compatibility.

## 2025-10-28 - [Dynamic Icon Button Accessibility]
**Learning:** Buttons generated dynamically via JavaScript (e.g., service controls, wake-up list) often lack accessible names when they rely on `title` or hidden text spans. Material Icons' ligature text (e.g., "play_arrow") can be read aloud by screen readers if not hidden.
**Action:** When creating buttons in JS, explicitly set `aria-label` matching the visual tooltip/label. Always add `aria-hidden="true"` to the icon element to prevent confusing announcements.

## 2025-11-20 - [Dynamic UI Accessibility]
**Learning:** UI components generated dynamically via JavaScript (e.g., personality sliders, service buttons) often lacked the semantic structure (like `<input type="range">` or `aria-label`) present in their static HTML counterparts, leading to hidden accessibility failures.
**Action:** When porting or generating UI in JS, rigorously replicate the accessible HTML structure used in static templates, especially for custom controls like sliders.

## 2025-11-21 - [Tooltip ARIA Connection]
**Learning:** Help buttons toggled tooltips purely visually (via CSS classes) without communicating the state or relationship to assistive technology, leaving screen reader users unaware of the revealed content.
**Action:** Implemented `aria-expanded` on the toggle button and `aria-controls` pointing to the tooltip's ID, ensuring the interaction and content location are programmatically explicit.

## 2025-11-21 - [Empty States in Dynamic Lists]
**Learning:** Dynamic lists (like "Backstory" or "Wake-up Sounds") can leave users confused when empty. A clear, descriptive empty state message provides necessary guidance and improves the overall polish of the interface.
**Action:** Always check for empty states in dynamic lists and render a helpful message that guides the user on how to add items or explains the default behavior.

## 2025-02-18 - [Custom Input Interaction]
**Learning:** Custom visual inputs (like sliders built with divs) that overlay native `sr-only` inputs must explicitly transfer focus to the native input on click. Without this, mouse users who click to set a value cannot immediately use keyboard controls (like arrow keys) for fine adjustments, breaking the expected interaction model.
**Action:** Always add `input.focus()` to the `mousedown` or `click` handler of custom visual controls that proxy to a hidden native input.

## 2024-05-18 - Accessible Dropdown Menus & File Inputs
**Learning:** Custom dropdown menus implemented with `hidden` classes lack `aria-expanded` state management and `role="menu"` structure, confusing screen readers. Also, wrapping a `hidden` file input in a clickable label is not keyboard-accessible by default.
**Action:** When refactoring custom dropdowns, always toggle `aria-expanded` on the trigger and add `role="menu"`/`role="menuitem"`. For file inputs inside labels, ensure the label is focusable (`tabindex="0"`) and add a `keydown` handler (Enter/Space) to trigger the input click programmatically.
