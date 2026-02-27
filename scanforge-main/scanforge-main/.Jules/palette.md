# Palette's Journal

## 2024-05-22 - [React Dropzone Accessibility]
**Learning:** `react-dropzone` containers default to `role="presentation"` and may lack proper focus styles, making them invisible to keyboard users unless explicitly configured with `role="button"` and `tabIndex={0}`.
**Action:** Always override `getRootProps({ role: 'button', 'aria-label': '...' })` and add `focus-visible` ring styles to ensure dropzones are accessible interactive elements.
