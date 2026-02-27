## 2024-05-23 - [Optimize Makefile]
**Learning:** LaTeX builds often run `xelatex` multiple times unnecessarily. `latexmk` handles this automatically, but adding it as a dependency isn't always feasible. A simple bash script or makefile logic can check the log file for "Rerun" warnings to conditionally trigger a second pass.
**Action:** When working with raw Makefiles for LaTeX, always implement conditional re-runs instead of hardcoded multiple passes.

## 2024-05-23 - [Optimize XeLaTeX Fonts]
**Learning:** `xelatex` attempts to generate font metrics (`mktextfm`) for missing fonts (like Calibri or Arial on Linux) which can significantly slow down the build (up to 40% slower on cold builds). Setting `MKTEXTFM=0` prevents this futile attempt without breaking the build (assuming fallback fonts are handled in LaTeX).
**Action:** When running `xelatex` in CI/CD or Linux environments where proprietary fonts might be missing, set `MKTEXTFM=0` to speed up the build.

## 2026-01-14 - [Cache Expensive Extractions]
**Learning:** Utility scripts that perform heavy conversions (like `pandoc` or `pdftotext`) often re-run redundantly. Implementing simple timestamp checks (using `-nt` in bash) can significantly speed up developer workflows by skipping unnecessary work.
**Action:** Always check if the output is newer than the input before running expensive conversion commands in shell scripts.

## 2026-05-21 - [Optimize LaTeX Tables]
**Learning:** `tabularray` is significantly slower than `tabularx` for simple tables because it performs multiple passes for width calculation. For repeated simple lists (like CV entries), replacing `tblr` with `tabularx` can reduce compilation time by ~10-30%. Note that `tabularx` requires the `environ` package to be robustly wrapped in a custom environment.
**Action:** Use `tabularx` for standard, repetitive table structures in LaTeX documents, reserving `tabularray` only for complex layouts that require its advanced features.
