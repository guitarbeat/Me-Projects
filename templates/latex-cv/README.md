# LaTeX CV

A professionally formatted LaTeX CV template matching the visual style and layout of the original document.

## Structure

```
latex-cv/
├── methods/latex/CV.tex    # Main LaTeX source file
├── reference/               # Original reference documents
├── docs/specifications/     # Design specifications
├── scripts/                 # Utility scripts
└── Makefile                # Build configuration
```

## Building

To compile the CV:

```bash
make
```

The PDF output will be in `build/latex/CV.pdf`.

## Requirements

- XeLaTeX (for font support)
- Required LaTeX packages (see CV.tex for package list)

## Utilities

Extract text from reference document:
```bash
make extract
```

Validate compiled PDF against original:
```bash
make validate
```

Clean build artifacts:
```bash
make clean
```


