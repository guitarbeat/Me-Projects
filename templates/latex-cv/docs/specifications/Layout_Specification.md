# CV Layout and Spacing Specification Document

## Overview
This document provides comprehensive layout and spacing specifications for replicating the original Word CV document in LaTeX. All specifications are based on visual analysis of the original document and existing LaTeX implementations.

## Document Structure

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

**Rationale:** Asymmetric margins (narrower left/right) provide more text width while maintaining professional appearance and print compatibility.

## Header and Footer Layout

### Header Structure
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

### Footer Structure
```latex
\fancyfoot[R]{\small A.L. Woods, \thepage}
```

**Footer Specifications:**
- **Content:** "A.L. Woods, [page]" right-aligned
- **Font Size:** `\small` (smaller than body text)
- **Position:** Right side only
- **Header Rule:** Disabled (`\headrulewidth{0pt}`)

## Tabular Layout Patterns

### Two-Column Content Layout
```latex
\begin{tabular*}{\textwidth}{@{}p{0.78\textwidth} p{0.21\textwidth}@{}}
  Content & Date/Location \\
\end{tabular*}
```

**Column Specifications:**
- **Content Column:** 78% of text width (`p{0.78\textwidth}`)
- **Date Column:** 21% of text width (`p{0.21\textwidth}`)
- **Usage:** Job titles, degree entries, funding information

### Flexible Content Layout
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

### Header Contact Layout
```latex
\begin{tabular*}{\textwidth}{@{\extracolsep{\fill}}l r}
  Name & Contact \\
\end{tabular*}
```

**Header Specifications:**
- **Name Column:** Left-aligned (`l`)
- **Contact Column:** Right-aligned (`r`)
- **Flexible Spacing:** `\extracolsep{\fill}` for automatic distribution

## Section Spacing Specifications

### Major Section Headers
```latex
\newcommand{\sectionheading}[1]{%
  \vspace{1.2ex}%                    % Space before section
  {\large\bfseries\MakeUppercase{#1}}\par\vspace{0.3ex}%  % Title + space after
  {\color[gray]{0.6}\rule{0.98\linewidth}{0.3pt}}\vspace{0.6ex}%  % Rule + space after
}
```

**Section Spacing Hierarchy:**
- **Before Section:** 1.2ex vertical space
- **After Title:** 0.3ex vertical space
- **After Rule:** 0.6ex vertical space
- **Total Section Spacing:** 2.1ex (1.2 + 0.3 + 0.6)

### Content Spacing Patterns

**Spacing Hierarchy (from largest to smallest):**
1. **1.3ex** - Header after contact information
2. **1.2ex** - Before major sections
3. **0.8ex** - Publication entries
4. **0.6ex** - Job titles, degree entries, standard sections
5. **0.4ex** - List items, funding entries
6. **0.3ex** - After section titles

**Specific Spacing Applications:**
- **Job Title Entries:** `\vspace{0.6ex}` after tabular job title entries
- **Publication Entries:** `\\[0.8ex]` - Extra spacing after publication entries
- **Standard Sections:** `\\[0.6ex]` - Standard spacing between major items
- **List Items:** `\\[0.4ex]` - Minimal spacing between list items
- **Multi-line Entries:** `\\[0.6ex]` - Spacing between multi-line tabular entries
- **Single Entries:** `\\[0.4ex]` - Spacing between single-line tabular entries

## List and Bullet Point Specifications

### Bullet Point Configuration
```latex
\setlist[itemize]{noitemsep, topsep=0.5ex, itemsep=0pt, leftmargin=1.25em, labelsep=0.5em}
```

**List Spacing Specifications:**
- **`noitemsep`** - No extra spacing between items
- **`topsep=0.5ex`** - Space before first item in list
- **`itemsep=0pt`** - No spacing between individual items
- **`leftmargin=1.25em`** - Left indentation for bullet points
- **`labelsep=0.5em`** - Space between bullet and text

### List Usage Patterns

**1. Research Experience Bullets:**
- **Context:** Under job titles and department information
- **Content:** Job responsibilities and achievements
- **Format:** Standard bullet points with consistent indentation

**2. Teaching Experience Bullets:**
- **Context:** Under teaching position and course information
- **Content:** Teaching responsibilities and activities
- **Format:** Same spacing and indentation as research bullets

**3. Poster Presentations:**
- **Context:** Standalone list section
- **Content:** Research presentation entries with full citations
- **Format:** Standard bullets with italicized presentation titles

**4. Academic Service Bullets:**
- **Context:** Under service position titles
- **Content:** Service activities and responsibilities
- **Format:** Consistent with other bullet lists

**5. Conference Participation:**
- **Context:** Standalone list section
- **Content:** Conference names with dates
- **Format:** Standard bullets with right-aligned dates using `\hfill`

### List Structure Patterns

**Standard List Structure:**
```latex
\begin{itemize}
  \item First bullet point
  \item Second bullet point
  \item Third bullet point
\end{itemize}
```

**List with Right-Aligned Elements:**
```latex
\begin{itemize}
  \item Conference Name \hfill Date
  \item Another Conference \hfill Date
\end{itemize}
```

## Content Organization Layout

### Header Section Layout
- **Contact Information:** Two-column tabular with flexible spacing
- **Address Block:** Left-aligned, stacked vertically
- **Spacing:** 1.3ex after contact information

### Education Section Layout
- **Degree Entries:** Two-column tabular (degree + date)
- **GPA Information:** Right-aligned in date column
- **Spacing:** 0.6ex between degree entries

### Research Experience Layout
- **Job Title:** Two-column tabular (title + date)
- **Department/Advisor:** Italic text below job title
- **Bullet Points:** Standard list format with 1.25em indentation
- **Spacing:** 0.6ex between job title and department

### Publications Section Layout
- **Citation Format:** Academic format with italic journal names
- **Author Names:** Bold formatting for CV author
- **Spacing:** 0.8ex between publication entries

### Funding/Awards Sections Layout
- **Entry Format:** Two-column tabular (award + date)
- **Description Lines:** Multi-column spanning for details
- **Spacing:** 0.4ex between entries

## Alignment and Positioning

### Text Alignment
- **Primary Alignment:** Left-aligned throughout document
- **Date Alignment:** Right-aligned in tabular format
- **Contact Alignment:** Right-aligned in header
- **Footer Alignment:** Right-aligned

### Special Alignment Elements
- **`\hfill`** - Right alignment for dates and locations
- **`\newline`** - Line breaks within tabular cells
- **`\noindent`** - Remove paragraph indentation for address blocks

### Indentation Patterns
- **Bullet Lists:** 1.25em left margin
- **Paragraph Text:** Standard LaTeX paragraph indentation
- **Address Block:** No indentation (`\noindent`)

## Implementation Guidelines

### Document Setup
```latex
\documentclass[12pt]{article}
\usepackage[top=1in,bottom=1in,left=0.75in,right=0.75in]{geometry}
\usepackage{fancyhdr}
\usepackage{enumitem}
\usepackage{xcolor}
\usepackage{setspace}
```

### Required Packages
- **`geometry`** - Page margins and layout
- **`fancyhdr`** - Header and footer formatting
- **`enumitem`** - List formatting control
- **`xcolor`** - Section rule coloring
- **`setspace`** - Line spacing control

### Layout Implementation
1. **Set up page geometry** with specified margins
2. **Configure header/footer** with fancyhdr
3. **Define section heading** command with spacing and rules
4. **Configure list formatting** with enumitem
5. **Implement tabular layouts** for content organization

### Quality Assurance

**Layout Verification:**
- Check margin consistency across all pages
- Verify tabular column widths and alignment
- Test bullet point indentation and spacing
- Confirm header/footer positioning

**Spacing Verification:**
- Measure section spacing consistency
- Verify bullet point spacing
- Check tabular content alignment
- Test page break behavior

**Content Organization:**
- Ensure consistent two-column layouts
- Verify date/location alignment
- Check bullet point hierarchy
- Confirm section header formatting

## Conclusion

This layout specification provides a complete foundation for LaTeX CV implementation that matches the original Word document's visual appearance. All specifications are based on analysis of the original document and existing LaTeX implementations, ensuring accurate replication of layout, spacing, and structural organization.

The specification covers all major layout elements including page geometry, header/footer structure, tabular layouts, section spacing, and list formatting, providing precise measurements and LaTeX implementation guidance for accurate CV replication.
