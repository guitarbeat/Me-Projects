# Complete CV Design Specification Document

## Overview
This document provides comprehensive design specifications for replicating the original Word CV document in LaTeX. It integrates visual analysis findings, typography specifications, and layout specifications into a unified reference for complete LaTeX implementation.

## Table of Contents
1. [Document Structure](#document-structure)
2. [Typography Specifications](#typography-specifications)
3. [Layout and Spacing Specifications](#layout-and-spacing-specifications)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Quality Assurance](#quality-assurance)
6. [Reference Materials](#reference-materials)

---

## Document Structure

### Overall Document Layout
- **Document Type:** Academic CV/Resume
- **Total Pages:** 5 pages with natural section breaks
- **Page Distribution:** 
  - Page 1: Header + Education + Publications (largest content density)
  - Page 2: Research Experience + Research Funding
  - Page 3: Academic Appointments + Teaching + Honors & Awards
  - Page 4: Poster Presentations + Academic Service + Professional Experience
  - Page 5: Conference Participation (shortest page)

### Content Hierarchy
1. **Header Section:** Name, contact info, affiliation
2. **Major Sections:** All caps headings (EDUCATION, PUBLICATIONS AND PATENTS, etc.)
3. **Subsections:** Bold job titles, institution names, dates
4. **Content Items:** Bullet points, publication entries, descriptions

### Section Organization
**12 Major Sections:**
1. Education
2. Publications and Patents
3. Research Experience
4. Research Funding
5. Academic Appointments
6. Teaching Experience
7. Honors & Awards
8. Poster Presentations
9. Academic Service
10. Professional Experience
11. Conference Participation

---

## Typography Specifications

### Font Hierarchy and Specifications

#### Primary Font Stack (Word-like)
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

#### Sans Serif Font Stack (for headings)
```latex
\IfFontExistsTF{Helvetica}{\setsansfont{Helvetica}[BoldFont=Helvetica-Bold, ItalicFont=Helvetica-Oblique]}{%
  \IfFontExistsTF{Arial}{\setsansfont{Arial}[BoldFont=Arial-BoldMT, ItalicFont=Arial-ItalicMT]}{\setsansfont{TeX Gyre Heros}}%
}
```

### Typography Hierarchy

#### Level 1: Major Section Headers
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

#### Level 2: Job/Position Titles
- **Format:** Bold, mixed case
- **Examples:** Graduate Student Researcher, Undergraduate Teaching Assistant
- **LaTeX Implementation:** `\textbf{Title}`
- **Spacing:** Standard paragraph spacing

#### Level 3: Institution/Organization Names
- **Format:** Regular weight, mixed case
- **Examples:** University of Texas at Austin, Department of Biomedical Engineering
- **LaTeX Implementation:** Regular text
- **Spacing:** Standard paragraph spacing

#### Level 4: Dates and Locations
- **Format:** Italic, right-aligned
- **Examples:** 2021 -- Present, Summer 2021
- **LaTeX Implementation:** `\textit{Date}` in tabular format
- **Alignment:** Right-aligned in tabular structure

### Special Typography Elements

#### Bold Text Usage (`\textbf{}`)
1. **Name/Header:** `\textbf{Aaron Lorenzo Woods}` - Primary name emphasis
2. **Job Titles:** `\textbf{Graduate Student Researcher}` - Position titles
3. **Degree Titles:** `\textbf{Ph.D. Biomedical Engineering}` - Academic degrees
4. **Award Names:** `\textbf{Marvin & Ellie Selig Entrepreneurship Award}` - Award titles
5. **Author Names:** `\textbf{A.L. Woods}` - Author names in publications
6. **Special Terms:** `\textbf{Provisional Patent}` - Important document types

#### Italic Text Usage (`\textit{}`)
1. **Dates:** `\textit{June 2026 (expected)}` - All dates and time periods
2. **GPA Information:** `\textit{GPA: 4.0}` - Grade point averages
3. **Journal Names:** `\textit{Applied Optics}` - Publication journal names
4. **Department/Advisor Info:** `\textit{Department of Biomedical Engineering | Advisor: Dr. Andrew Dunn}` - Institutional affiliations
5. **Poster Titles:** `\textit{Investigating Neurovascular Angiogenesis through Optical Imaging}` - Research presentation titles
6. **Organization Types:** `\textit{501(c)(3) Non-Profit}` - Legal entity descriptions

#### Size Variations
- **`\large`** - Section headings (larger than body text)
- **`\small`** - Footer text and publication citations

---

## Layout and Spacing Specifications

### Page Geometry and Margins
```latex
\usepackage[top=1in,bottom=1in,left=0.75in,right=0.75in]{geometry}
```

**Margin Specifications:**
- **Top Margin:** 1 inch (2.54 cm)
- **Bottom Margin:** 1 inch (2.54 cm)
- **Left Margin:** 0.75 inch (1.91 cm)
- **Right Margin:** 0.75 inch (1.91 cm)
- **Document Class:** 12pt article
- **Page Size:** Standard letter size (8.5" × 11")

### Header and Footer Layout

#### Header Structure
```latex
\noindent\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}l r}
  {\textbf{Aaron Lorenzo Woods}} & alwoods@utexas.edu \;|\; aaronwoods.info \\
\end{tabular*}
\vspace{1.3ex}
\noindent Department of Biomedical Engineering\\
\noindent Cockrell School of Engineering\\
\noindent The University of Texas at Austin\\
\noindent Austin, TX 78712
```

**Header Layout Specifications:**
- **Name Position:** Left-aligned in tabular column
- **Contact Position:** Right-aligned in tabular column
- **Column Distribution:** Flexible with `\extracolsep{\fill}`
- **Address Block:** Left-aligned, stacked vertically
- **Header Spacing:** 1.3ex after contact information
- **Address Spacing:** No extra spacing between address lines

#### Footer Structure
```latex
\fancyfoot[R]{\small A.L. Woods, \thepage}
```

**Footer Specifications:**
- **Content:** "A.L. Woods, [page]" right-aligned
- **Font Size:** `\small` (smaller than body text)
- **Position:** Right side only
- **Header Rule:** Disabled (`\headrulewidth{0pt}`)

### Tabular Layout Patterns

#### Two-Column Content Layout
```latex
\begin{tabular*}{\textwidth}{@{}p{0.78\textwidth} p{0.21\textwidth}@{}}
  Content & Date/Location \\
\end{tabular*}
```

**Column Specifications:**
- **Content Column:** 78% of text width (`p{0.78\textwidth}`)
- **Date Column:** 21% of text width (`p{0.21\textwidth}`)
- **Usage:** Job titles, degree entries, funding information

#### Flexible Content Layout
```latex
\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}p{0.78\textwidth}r}
  Content & Date/Location \\
\end{tabular*}
```

**Flexible Specifications:**
- **Content Column:** 78% of text width
- **Date Column:** Right-aligned (`r`)
- **Flexible Spacing:** `\extracolsep{\fill}` for automatic spacing
- **Usage:** Awards, appointments, service positions

### Spacing Specifications

#### Spacing Hierarchy (from largest to smallest)
1. **1.3ex** - Header after contact information
2. **1.2ex** - Before major sections
3. **0.8ex** - Publication entries
4. **0.6ex** - Job titles, degree entries, standard sections
5. **0.4ex** - List items, funding entries
6. **0.3ex** - After section titles

#### Specific Spacing Applications
- **Job Title Entries:** `\vspace{0.6ex}` after tabular job title entries
- **Publication Entries:** `\\[0.8ex]` - Extra spacing after publication entries
- **Standard Sections:** `\\[0.6ex]` - Standard spacing between major items
- **List Items:** `\\[0.4ex]` - Minimal spacing between list items
- **Multi-line Entries:** `\\[0.6ex]` - Spacing between multi-line tabular entries
- **Single Entries:** `\\[0.4ex]` - Spacing between single-line tabular entries

### List and Bullet Point Specifications

#### Bullet Point Configuration
```latex
\setlist[itemize]{noitemsep, topsep=0.5ex, itemsep=0pt, leftmargin=1.25em, labelsep=0.5em}
```

**List Spacing Specifications:**
- **`noitemsep`** - No extra spacing between items
- **`topsep=0.5ex`** - Space before first item in list
- **`itemsep=0pt`** - No spacing between individual items
- **`leftmargin=1.25em`** - Left indentation for bullet points
- **`labelsep=0.5em`** - Space between bullet and text

#### List Usage Patterns
1. **Research Experience Bullets:** Under job titles and department information
2. **Teaching Experience Bullets:** Under teaching position and course information
3. **Poster Presentations:** Standalone list section with italicized titles
4. **Academic Service Bullets:** Under service position titles
5. **Conference Participation:** Standalone list with right-aligned dates

---

## Implementation Guidelines

### Document Setup
```latex
\documentclass[12pt]{article}
\usepackage[top=1in,bottom=1in,left=0.75in,right=0.75in]{geometry}
\usepackage{fancyhdr}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{setspace}
\usepackage{fontspec}
\usepackage{hyperref}
```

### Required Packages
- **`geometry`** - Page margins and layout
- **`fancyhdr`** - Header and footer formatting
- **`enumitem`** - List formatting control
- **`xcolor`** - Section rule coloring
- **`setspace`** - Line spacing control
- **`fontspec`** - Font loading (XeLaTeX/LuaLaTeX)
- **`hyperref`** - Hyperlink support

### Line Spacing Configuration
```latex
\setstretch{1.15} % Word-like leading, 15% extra space
```

### Header and Footer Setup
```latex
\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\fancyfoot[R]{\small A.L. Woods, \thepage}
```

### Section Heading Command
```latex
\newcommand{\sectionheading}[1]{%
  \vspace{1.2ex}%
  {\large\bfseries\MakeUppercase{#1}}\par\vspace{0.3ex}%
  {\color[gray]{0.6}\rule{0.98\linewidth}{0.3pt}}\vspace{0.6ex}%
}
```

### List Configuration
```latex
\setlist[itemize]{noitemsep, topsep=0.5ex, itemsep=0pt, leftmargin=1.25em, labelsep=0.5em}
```

### Implementation Workflow
1. **Set up document class and packages**
2. **Configure page geometry and margins**
3. **Set up fonts with fallback hierarchy**
4. **Configure line spacing and list formatting**
5. **Define section heading command**
6. **Set up header and footer**
7. **Implement content with specified layouts**

---

## Quality Assurance

### Typography Verification
- **Font Loading:** Test font availability on target systems
- **Font Fallbacks:** Verify fallback fonts render correctly
- **Size Consistency:** Ensure consistent sizing across different fonts
- **Bold/Italic Usage:** Verify emphasis follows specification patterns

### Layout Verification
- **Margin Consistency:** Check margin consistency across all pages
- **Tabular Layouts:** Verify column widths and alignment
- **Header/Footer:** Confirm positioning and content
- **Page Breaks:** Test natural page break behavior

### Spacing Verification
- **Section Spacing:** Measure section spacing consistency
- **Bullet Spacing:** Verify bullet point spacing and indentation
- **Content Spacing:** Check spacing between different content types
- **Tabular Spacing:** Verify tabular content alignment

### Content Organization
- **Section Headers:** Ensure consistent formatting and rules
- **Date Alignment:** Verify right alignment in tabular format
- **Bullet Hierarchy:** Check bullet point consistency
- **Content Flow:** Confirm logical content organization

### Cross-Reference Validation
- **Typography ↔ Layout:** Ensure typography specifications align with layout requirements
- **Spacing ↔ Content:** Verify spacing specifications work with content organization
- **Font ↔ Spacing:** Confirm font choices work with specified spacing
- **Layout ↔ Typography:** Validate layout supports typography hierarchy

---

## Reference Materials

### Specification Cross-References
- **Typography Specifications:** See [Typography Specifications](#typography-specifications) for font hierarchy and formatting
- **Layout Specifications:** See [Layout and Spacing Specifications](#layout-and-spacing-specifications) for margins and structure
- **Implementation Guidelines:** See [Implementation Guidelines](#implementation-guidelines) for LaTeX code examples

### Key LaTeX Commands Reference
```latex
% Document setup
\documentclass[12pt]{article}
\usepackage[top=1in,bottom=1in,left=0.75in,right=0.75in]{geometry}

% Font setup
\setmainfont{Calibri}[Scale=MatchLowercase]
\setsansfont{Helvetica}[BoldFont=Helvetica-Bold]

% Spacing setup
\setstretch{1.15}
\setlist[itemize]{noitemsep, topsep=0.5ex, itemsep=0pt, leftmargin=1.25em, labelsep=0.5em}

% Section heading
\newcommand{\sectionheading}[1]{%
  \vspace{1.2ex}%
  {\large\bfseries\MakeUppercase{#1}}\par\vspace{0.3ex}%
  {\color[gray]{0.6}\rule{0.98\linewidth}{0.3pt}}\vspace{0.6ex}%
}

% Header layout
\noindent\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}l r}
  {\textbf{Name}} & contact@email.com \\
\end{tabular*}

% Content layout
\begin{tabular*}{\textwidth}{@{}p{0.78\textwidth} p{0.21\textwidth}@{}}
  Content & Date \\
\end{tabular*}
```

### Spacing Reference Table
| Element | Spacing | LaTeX Command |
|---------|---------|---------------|
| Header after contact | 1.3ex | `\vspace{1.3ex}` |
| Before major sections | 1.2ex | `\vspace{1.2ex}` |
| Publication entries | 0.8ex | `\\[0.8ex]` |
| Job titles, degrees | 0.6ex | `\vspace{0.6ex}` |
| List items, funding | 0.4ex | `\\[0.4ex]` |
| After section titles | 0.3ex | `\vspace{0.3ex}` |

### Font Hierarchy Reference
| Priority | Font | Usage |
|----------|------|-------|
| 1 | Calibri | Primary body text |
| 2 | Helvetica | Fallback body text |
| 3 | Arial | Secondary fallback |
| 4 | TeX Gyre Heros | Final fallback |

---

## Conclusion

This complete design specification document provides a comprehensive foundation for LaTeX CV implementation that accurately matches the original Word document's visual appearance. The specification integrates all aspects of document design including typography, layout, spacing, and formatting to ensure precise replication of the original document.

All specifications are based on detailed analysis of the original document and existing LaTeX implementations, providing both theoretical understanding and practical implementation guidance. The document serves as a complete reference for CV replication with clear organization, cross-references, and comprehensive LaTeX implementation guidance.

**Implementation Priority:**
1. Set up document structure and packages
2. Configure typography and fonts
3. Implement layout and spacing
4. Apply content formatting
5. Validate and refine implementation
