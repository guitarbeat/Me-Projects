## 2024-02-14 - Broken Entry Point and A11y
**Learning:** React applications using Vite may fail to render if index.html lacks the entry script tag, causing a blank screen. This is a critical first check before debugging logic.
**Action:** Always verify index.html includes <script type='module' src='/index.tsx'> (or similar) before verifying functionality.

## 2024-02-15 - Limited Color Input Control
**Learning:** Native `input type="color"` does not allow users to paste or type specific hex codes (e.g., brand colors) easily in all browsers. This limits precision.
**Action:** Always pair `input type="color"` with a synchronized text input for better accessibility and usability.

## 2026-02-20 - Invisible Features Need Hints
**Learning:** Keyboard shortcuts like `+` and `-` are powerful but invisible. Adding them to button tooltips (e.g., "Zoom In (Plus)") makes them discoverable without cluttering the UI.
**Action:** Always include keyboard shortcuts in `title` attributes for corresponding icon buttons.

## 2026-02-23 - Invisible Focus States on Dark Mode
**Learning:** Tailwind's preflight (loaded via CDN) removes default button outlines. Coupled with a dark background, this makes keyboard navigation impossible as focus states are invisible.
**Action:** Always explicitly add `focus-visible` classes (e.g., `focus-visible:ring-2`) to all interactive elements to ensure keyboard accessibility.
## 2026-02-24 - Missing Focus Indicators with Tailwind CDN
**Learning:** Projects using Tailwind via CDN often reset default browser focus rings (preflight) without providing a replacement, leaving interactive elements inaccessible to keyboard users.
**Action:** Always verify keyboard navigation and explicitly add `focus-visible` utility classes (e.g., `focus-visible:ring-2`) to all interactive elements.

## 2026-03-01 - Disconnected Labels in Custom Components
**Learning:** Custom form components (like `ColorInput`) that render inputs internally often break the implicit or explicit label association, leaving users unable to click labels to focus inputs.
**Action:** Use `React.useId()` in custom components to generate unique IDs and explicitly link internal `<label>` to `<input>` via `htmlFor`.
