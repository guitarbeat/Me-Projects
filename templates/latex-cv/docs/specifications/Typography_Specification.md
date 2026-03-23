# CV Typography Specification Document

## Overview
This document provides comprehensive typography specifications for replicating the original Word CV document in LaTeX. All specifications are based on visual analysis of the original document and existing LaTeX implementations.

## Document Structure

### Base Document Settings
```latex
\documentclass[12pt]{article}
\usepackage[top=1in,bottom=1in,left=0.75in,right=0.75in]{geometry}
```

- **Document Class:** 12pt article
- **Page Geometry:** 1" top/bottom margins, 0.75" left/right margins
- **Base Font Size:** 12pt (standard academic document size)

## Font Specifications

### Primary Font Stack (Word-like)
```latex
\IfFontExistsTF{Calibri}{\setmainfont{Calibri}[Scale=MatchLowercase]}{%
  \IfFontExistsTF{Helvetica}{\setmainfont{Helvetica}[Scale=MatchLowercase]}{%
    \IfFontExistsTF{Arial}{\setmainfont{Arial}[Scale=MatchLowercase]}{\setmainfont{TeX Gyre Heros}[Scale=MatchLowercase]}%
  }%
}
```

**Font Priority:**
1. Calibri (Word default)
2. Helvetica
3. Arial
4. TeX Gyre Heros (fallback)

### Sans Serif Font Stack (for headings)
```latex
\IfFontExistsTF{Helvetica}{\setsansfont{Helvetica}[BoldFont=Helvetica-Bold, ItalicFont=Helvetica-Oblique]}{%
  \IfFontExistsTF{Arial}{\setsansfont{Arial}[BoldFont=Arial-BoldMT, ItalicFont=Arial-ItalicMT]}{\setsansfont{TeX Gyre Heros}}%
}
```

## Typography Hierarchy

### Level 1: Major Section Headers
- **Format:** All caps, bold, large size
- **Examples:** EDUCATION, PUBLICATIONS AND PATENTS, RESEARCH EXPERIENCE
- **LaTeX Implementation:**
  ```latex
  \newcommand{\sectionheading}[1]{%
    \vspace{1.2ex}%
    {\large\bfseries\MakeUppercase{#1}}\par\vspace{0.3ex}%
    {\color[gray]{0.6}\rule{0.98\linewidth}{0.3pt}}\vspace{0.6ex}%
  }
  ```
- **Spacing:** 1.2ex before, 0.3ex after title, 0.6ex after rule
- **Visual Element:** Gray horizontal rule (0.3pt, 98% line width) below title

### Level 2: Job/Position Titles
- **Format:** Bold, mixed case
- **Examples:** Graduate Student Researcher, Undergraduate Teaching Assistant
- **LaTeX Implementation:** `\textbf{Title}`
- **Spacing:** Standard paragraph spacing

### Level 3: Institution/Organization Names
- **Format:** Regular weight, mixed case
- **Examples:** University of Texas at Austin, Department of Biomedical Engineering
- **LaTeX Implementation:** Regular text
- **Spacing:** Standard paragraph spacing

### Level 4: Dates and Locations
- **Format:** Italic, right-aligned
- **Examples:** 2021 -- Present, Summer 2021
- **LaTeX Implementation:** `\textit{Date}` in tabular format
- **Alignment:** Right-aligned in tabular structure

## Body Text Specifications

### Line Spacing
```latex
\setstretch{1.15} % Word-like leading, 15% extra space
```

### Text Alignment
- **Primary:** Left-aligned throughout document
- **Special Cases:** Right-aligned dates in tabular format

### Paragraph Spacing
- **Standard:** LaTeX default paragraph spacing
- **Special:** Custom spacing for specific elements (see spacing specifications below)

## Special Typography Elements

### Bold Text Usage (`\textbf{}`)
1. **Name/Header:** `\textbf{Aaron Lorenzo Woods}` - Primary name emphasis
2. **Job Titles:** `\textbf{Graduate Student Researcher}` - Position titles
3. **Degree Titles:** `\textbf{Ph.D. Biomedical Engineering}` - Academic degrees
4. **Award Names:** `\textbf{Marvin & Ellie Selig Entrepreneurship Award}` - Award titles
5. **Author Names:** `\textbf{A.L. Woods}` - Author names in publications
6. **Special Terms:** `\textbf{Provisional Patent}` - Important document types

### Italic Text Usage (`\textit{}`)
1. **Dates:** `\textit{June 2026 (expected)}` - All dates and time periods
2. **GPA Information:** `\textit{GPA: 4.0}` - Grade point averages
3. **Journal Names:** `\textit{Applied Optics}` - Publication journal names
4. **Department/Advisor Info:** `\textit{Department of Biomedical Engineering | Advisor: Dr. Andrew Dunn}` - Institutional affiliations
5. **Poster Titles:** `\textit{Investigating Neurovascular Angiogenesis through Optical Imaging}` - Research presentation titles
6. **Organization Types:** `\textit{501(c)(3) Non-Profit}` - Legal entity descriptions

### Size Variations
- **`\large`** - Section headings (larger than body text)
- **`\small`** - Footer text and publication citations

## List and Bullet Point Specifications

### Bullet Point Configuration
```latex
\setlist[itemize]{noitemsep, topsep=0.5ex, itemsep=0pt, leftmargin=1.25em, labelsep=0.5em}
```

- **Bullet Spacing:** `topsep=0.5ex, itemsep=0pt` (minimal spacing between items)
- **Bullet Indentation:** `leftmargin=1.25em, labelsep=0.5em`
- **List Style:** Standard bullet points with consistent indentation

## Spacing Specifications

### Section Spacing
- **Before Section:** 1.2ex
- **After Section Title:** 0.3ex
- **After Section Rule:** 0.6ex

### Content Spacing
- **Publication Entries:** `\\[0.8ex]` - Extra spacing after publication entries
- **Standard Sections:** `\\[0.6ex]` - Standard section spacing
- **List Items:** `\\[0.4ex]` - Minimal spacing between list items

### Special Spacing Elements
- **Header Spacing:** `\vspace{1.2ex}` after contact information
- **Tabular Spacing:** Custom spacing for multi-column layouts

## Special Formatting Elements

### Alignment
- **`\hfill`** - Right alignment for dates and locations
- **`\newline`** - Line breaks within tabular cells

### Special Characters
- **`\;|\;`** - Separator between contact information
- **`~`** - Non-breaking spaces in dates and names
- **`--`** - En-dash for date ranges

### Footer Formatting
```latex
\fancyfoot[R]{\small A.L. Woods, \thepage}
```
- **Format:** "A.L. Woods, [page]" on right side
- **Font Size:** `\small` (smaller than body text)

## Implementation Guidelines

### Font Loading
- Use `fontspec` package for XeLaTeX/LuaLaTeX
- Implement font fallback hierarchy for cross-platform compatibility
- Use `Scale=MatchLowercase` for consistent sizing

### Section Headings
- Use custom `\sectionheading{}` command for consistent formatting
- Include gray horizontal rule for visual separation
- Maintain consistent spacing above and below

### Tabular Layouts
- Use `tabular*` with `\extracolsep{\fill}` for flexible column widths
- Right-align dates and locations
- Use `\hfill` for right alignment in single-line entries

### List Formatting
- Configure `enumitem` package for consistent bullet spacing
- Use minimal spacing between items for compact layout
- Maintain consistent indentation throughout document

## Quality Assurance

### Font Verification
- Test font availability on target systems
- Verify fallback fonts render correctly
- Ensure consistent sizing across different fonts

### Spacing Verification
- Check section spacing consistency
- Verify bullet point alignment
- Test tabular layout on different page sizes

### Typography Consistency
- Ensure bold/italic usage follows specification
- Verify date formatting consistency
- Check special character rendering

## Conclusion

This typography specification provides a complete foundation for LaTeX CV implementation that matches the original Word document's visual appearance. All specifications are based on analysis of the original document and existing LaTeX implementations, ensuring accurate replication of typography, spacing, and formatting elements.
