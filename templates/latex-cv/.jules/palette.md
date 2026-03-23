# Palette Journal

## 2026-01-08 - Accessible PDF Metadata & Links
**Learning:** In LaTeX documents (like CVs), visual structure does not equal accessibility. `\href` and `\hypersetup` metadata are critical for screen readers and searchability, even if the visual output (black text) remains unchanged. `pdfinfo` is a vital tool for verifying "invisible" UX.
**Action:** Always verify `pdftitle`, `pdflang` (for screen readers), and clickable `\href` links in LaTeX templates, ensuring `colorlinks=true, linkcolor=black` maintains design integrity.

## 2026-01-12 - PDF Outline and Navigation
**Learning:** Custom section commands in LaTeX (like `\sectionheading`) do not generate PDF bookmarks by default, making navigation difficult for screen readers and reviewers. Adding `\phantomsection` and `\addcontentsline` manually is required.
**Action:** When creating custom headings in LaTeX, always pair them with PDF bookmark generation code and verify using `*.out` files.

## 2026-01-13 - Window Title for PDFs
**Learning:** By default, PDF viewers display the filename (e.g., `CV.pdf`) in the window title bar, which is unhelpful and poor for accessibility. Adding `pdfdisplaydoctitle=true` to `\hypersetup` forces the viewer to use the metadata Title (e.g., "Curriculum Vitae - Name"), which is WCAG compliant and more professional.
**Action:** Always include `pdfdisplaydoctitle=true` in `\hypersetup` configuration for LaTeX documents intended for digital distribution.

## 2026-01-25 - Enhanced Mailto Links
**Learning:** Adding query parameters like `?subject=` to `mailto:` links provides a delightful micro-UX by pre-filling context for the recipient, but requires careful escaping of `%` characters (`\%`) in LaTeX to avoid compilation errors.
**Action:** Use `\href{mailto:email?subject=...\%20...}{email}` for contact links in CVs.

## 2026-05-21 - Visual Scannability in Text-Heavy Lists
**Learning:** In text-dense documents like CVs, consistent visual highlighting (bolding) of the subject's name in citation lists significantly improves scannability for recruiters. Inconsistency (bolding in one section but not another) creates cognitive friction.
**Action:** Ensure consistent formatting of key entities (like author names) across all sections of a document to maintain visual rhythm and aid quick scanning.
