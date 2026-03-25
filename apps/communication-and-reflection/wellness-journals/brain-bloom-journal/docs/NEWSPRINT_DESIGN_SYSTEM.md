# Newsprint Design System Integration Guide

This document explains how to use the Newsprint design system in your codebase.

## Overview

The Newsprint design system is an editorial, newspaper-inspired design language featuring:
- **Sharp corners** (zero border radius)
- **High contrast** (black on off-white)
- **Typography-driven** (massive serif headlines, legible body text)
- **Grid-based layouts** (collapsed borders, column structure)
- **Editorial red accent** (used sparingly)

## Design Tokens

### Colors

All Newsprint colors are available via Tailwind classes:

```tsx
// Background
bg-newsprint-bg          // #F9F9F7 - Off-white paper

// Foreground
text-newsprint-foreground // #111111 - Ink black

// Muted/Divider
bg-newsprint-muted       // #E5E5E0 - Light grey
border-newsprint-border  // #111111 - Black borders

// Accent (use sparingly)
text-newsprint-accent    // #CC0000 - Editorial red

// Neutral shades
bg-newsprint-neutral-100 // #F5F5F5
bg-newsprint-neutral-200 // #E5E5E5
text-newsprint-neutral-500 // #737373
```

### Typography

Font families are available via Tailwind classes:

```tsx
font-newsprint-serif  // Playfair Display - for headlines
font-newsprint-body   // Lora - for body text
font-newsprint-sans   // Inter - for UI elements
font-newsprint-mono   // JetBrains Mono - for metadata/stats
```

## Component Styles

Import styles from `@/lib`:

```tsx
import { 
  newsprintCardStyles,
  newsprintButtonStyles,
  newsprintTextStyles,
  newsprintInputStyles,
  newsprintBadgeStyles,
  newsprintLayoutStyles,
  newsprintSeparatorStyles
} from '@/lib'
```

## Components

### Buttons

Use the Button component with Newsprint variants:

```tsx
import { Button } from '@/components/ui'

// Primary button (black background, white text)
<Button variant="newsprint">SUBMIT</Button>

// Outline button (transparent, black border)
<Button variant="newsprint-outline">CANCEL</Button>

// Ghost button (subtle hover)
<Button variant="newsprint-ghost">VIEW MORE</Button>

// Link button (red underline on hover)
<Button variant="newsprint-link">Read Article</Button>
```

### Cards

Use NewsprintCard for editorial-style containers:

```tsx
import { 
  NewsprintCard,
  NewsprintCardHeader,
  NewsprintCardTitle,
  NewsprintCardContent 
} from '@/components/ui'

<NewsprintCard variant="article">
  <NewsprintCardHeader>
    <NewsprintCardTitle>Breaking News</NewsprintCardTitle>
  </NewsprintCardHeader>
  <NewsprintCardContent>
    <p className="font-newsprint-body text-sm leading-relaxed">
      Article content here...
    </p>
  </NewsprintCardContent>
</NewsprintCard>
```

Card variants:
- `default` - Standard card with border
- `article` - Adds hover background
- `column` - For grid layouts (border-r and border-b)
- `hover` - Adds hard shadow hover effect
- `inverted` - Black background, white text

### Inputs

Use NewsprintInput for form fields:

```tsx
import { NewsprintInput, NewsprintTextarea } from '@/components/ui'

<NewsprintInput 
  placeholder="Enter text..."
  className="w-full"
/>

<NewsprintTextarea 
  placeholder="Enter description..."
  className="w-full"
/>
```

### Typography

Use Newsprint text styles:

```tsx
import { newsprintTextStyles } from '@/lib'

// Hero headline (massive)
<h1 className={newsprintTextStyles.h1}>
  All the News That's Fit to Print
</h1>

// Section header
<h2 className={newsprintTextStyles.h2}>
  BREAKING NEWS
</h2>

// Body text
<p className={newsprintTextStyles.body}>
  Long-form article content...
</p>

// Justified text (newspaper columns)
<p className={newsprintTextStyles.bodyJustified}>
  Multi-column justified text...
</p>

// Metadata
<span className={newsprintTextStyles.metadata}>
  VOL. 1 | JANUARY 2024 | NEW YORK EDITION
</span>
```

### Special Components

#### DropCap

```tsx
import { DropCap } from '@/components/newsprint'

<p>
  <DropCap letter="T" accent />
  his is the first paragraph with a drop cap...
</p>
```

#### EditionMetadata

```tsx
import { EditionMetadata } from '@/components/newsprint'

<EditionMetadata 
  volume={1}
  issue={42}
  date="January 15, 2024"
  location="New York"
/>
// Output: "Vol. 1 | No. 42 | January 15, 2024 | New York Edition"
```

#### MarqueeTicker

```tsx
import { MarqueeTicker } from '@/components/newsprint'

<MarqueeTicker speed="normal" direction="left">
  <span>BREAKING: </span>
  <span>Important news item 1</span>
  <span>•</span>
  <span>Important news item 2</span>
  <span>•</span>
  <span>Important news item 3</span>
</MarqueeTicker>
```

## Utility Classes

### Sharp Corners

```tsx
<div className="sharp-corners">
  {/* Forces border-radius: 0 */}
</div>
```

### Textures

```tsx
// Dot grid background
<div className="newsprint-dot-grid">
  {/* Subtle dot pattern */}
</div>

// Line grid overlay
<div className="newsprint-texture">
  {/* Fine graph-paper effect */}
</div>

// Halftone pattern (for images)
<div className="newsprint-halftone">
  {/* Radial dot pattern */}
</div>
```

### Hover Effects

```tsx
// Hard shadow hover (newspaper cutout effect)
<div className="hard-shadow-hover">
  {/* On hover: 4px offset shadow + translate */}
</div>
```

## Layout Patterns

### Grid System

```tsx
// 12-column grid with collapsed borders
<div className="grid grid-cols-12 gap-0">
  <div className="col-span-8 border-r border-b border-newsprint-border p-6">
    Main content
  </div>
  <div className="col-span-4 border-b border-newsprint-border p-6">
    Sidebar
  </div>
</div>
```

### Container

```tsx
<div className="max-w-screen-xl mx-auto px-4">
  {/* Content max-width 1280px, centered */}
</div>
```

### Section Spacing

```tsx
<section className="py-16">
  {/* Standard vertical padding */}
</section>
```

## Examples

### Complete Article Card

```tsx
import { NewsprintCard, NewsprintCardHeader, NewsprintCardTitle, NewsprintCardContent } from '@/components/ui'
import { DropCap } from '@/components/newsprint'
import { newsprintTextStyles } from '@/lib'

<NewsprintCard variant="article" className="hard-shadow-hover">
  <NewsprintCardHeader>
    <NewsprintCardTitle>
      Major Development in Technology Sector
    </NewsprintCardTitle>
    <p className={newsprintTextStyles.metadata}>
      TECHNOLOGY | JANUARY 15, 2024
    </p>
  </NewsprintCardHeader>
  <NewsprintCardContent>
    <p className={newsprintTextStyles.body}>
      <DropCap letter="I" />
      n a groundbreaking announcement today, industry leaders revealed...
    </p>
  </NewsprintCardContent>
</NewsprintCard>
```

### Inverted Section

```tsx
<section className="bg-newsprint-foreground text-newsprint-bg py-16">
  <div className="max-w-screen-xl mx-auto px-4">
    <h2 className="font-newsprint-serif text-4xl lg:text-5xl font-black uppercase mb-8">
      HOW IT WORKS
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {steps.map((step, i) => (
        <div key={i}>
          <span className="text-newsprint-accent font-newsprint-mono text-2xl">
            {i + 1}.
          </span>
          <p className="font-newsprint-body text-sm mt-2">
            {step.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Form with Newsprint Inputs

```tsx
import { NewsprintInput, NewsprintTextarea, Button } from '@/components/ui'
import { newsprintTextStyles } from '@/lib'

<form className="space-y-6">
  <div>
    <label className={newsprintTextStyles.label}>
      NAME
    </label>
    <NewsprintInput 
      className="w-full mt-2"
      placeholder="Enter your name"
    />
  </div>
  <div>
    <label className={newsprintTextStyles.label}>
      MESSAGE
    </label>
    <NewsprintTextarea 
      className="w-full mt-2"
      placeholder="Enter your message"
    />
  </div>
  <Button variant="newsprint">
    SUBMIT
  </Button>
</form>
```

## Best Practices

1. **Always use sharp corners** - Apply `sharp-corners` class or `borderRadius: 0` inline
2. **High contrast** - Use black (#111111) on off-white (#F9F9F7) for maximum readability
3. **Sparse red accent** - Use `newsprint-accent` only for breaking news, CTAs, or hover states
4. **Typography hierarchy** - Use massive headlines (up to text-9xl) with tight line-height
5. **Grid-based layouts** - Use collapsed borders (`border-r`, `border-b`) for newspaper columns
6. **Justified text** - Use `text-justify` for multi-column body text
7. **Metadata styling** - Use monospace, uppercase, wide tracking for labels/metadata
8. **No soft shadows** - Use hard offset shadows (`hard-shadow-hover`) instead

## Accessibility

- All interactive elements have minimum 44x44px touch targets
- High contrast ratios (AAA compliant: >17:1)
- Focus states use thick black ring with offset
- Semantic HTML structure maintained
- ARIA labels on icon-only buttons

## Responsive Behavior

- Headlines scale dramatically: `text-5xl sm:text-6xl lg:text-9xl`
- Grids collapse to single column on mobile
- Remove `border-r` on mobile, keep `border-b` for separators
- Padding reduces: `p-16` → `p-8` → `p-6`
- Buttons become full-width on mobile: `w-full md:w-auto`
