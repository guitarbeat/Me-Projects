# Typography System

A comprehensive, modern typography system built with React and styled-components, designed to provide consistent, readable, and beautiful text throughout the application.

## Features

- **Modern Typefaces**: Inter for UI text, JetBrains Mono for code
- **Consistent Scale**: 12-point typography scale with proper line heights and spacing
- **Responsive Design**: Automatically adapts to different screen sizes
- **Accessibility**: High contrast support, reduced motion support, focus indicators
- **Performance**: Optimized font loading and rendering
- **Flexible**: Easy to customize and extend

## Installation

The typography system is already integrated into the project. It includes:

1. **Typography Components** (`Typography.tsx`) - React components for consistent text styling
2. **Typography CSS** (`typography.css`) - Global CSS with CSS custom properties
3. **Tailwind Integration** - Custom Tailwind configuration with typography utilities

## Usage

### Importing Components

```tsx
import {
  H1, H2, H3, H4, H5, H6,
  BodyLarge, Body, BodySmall, Caption,
  Display, Lead, Code, Link,
  TextMuted, TextAccent, TextSuccess, TextError, TextWarning,
  List, OrderedList, Blockquote
} from './components/Typography';
```

### Basic Usage

```tsx
import { H1, Body, Link } from './components/Typography';

function MyComponent() {
  return (
    <div>
      <H1>Welcome to Our App</H1>
      <Body>
        This is the main content area with proper typography and spacing.
        The text is optimized for readability and user experience.
      </Body>
      <Link href="/learn-more">Learn more about our features</Link>
    </div>
  );
}
```

## Component Reference

### Headings

| Component | Size | Weight | Use Case |
|-----------|------|--------|----------|
| `H1` | 3rem (48px) | 700 | Page titles, main headings |
| `H2` | 2.25rem (36px) | 600 | Section headings |
| `H3` | 1.875rem (30px) | 600 | Subsection headings |
| `H4` | 1.5rem (24px) | 500 | Card headings |
| `H5` | 1.125rem (18px) | 500 | Small headings |
| `H6` | 1rem (16px) | 500 | Tiny headings |

### Body Text

| Component | Size | Weight | Use Case |
|-----------|------|--------|----------|
| `BodyLarge` | 1.125rem (18px) | 400 | Lead paragraphs, important content |
| `Body` | 1rem (16px) | 400 | Default body text |
| `BodySmall` | 0.875rem (14px) | 400 | Captions, metadata |
| `Caption` | 0.75rem (12px) | 500 | Labels, small text |

### Special Text

| Component | Description | Use Case |
|-----------|-------------|----------|
| `Display` | Large, bold text with gradient | Hero sections, main titles |
| `Lead` | Larger body text | Introduction paragraphs |
| `Code` | Monospace inline code | Code snippets, technical terms |
| `Link` | Styled links | Navigation, external links |

### Utility Text

| Component | Color | Use Case |
|-----------|-------|----------|
| `TextMuted` | Muted white | Secondary information |
| `TextAccent` | Yellow | Highlighted text |
| `TextSuccess` | Green | Success messages |
| `TextError` | Red | Error messages |
| `TextWarning` | Yellow | Warning messages |

### Lists and Quotes

| Component | Description | Use Case |
|-----------|-------------|----------|
| `List` | Unordered list | Bullet points |
| `OrderedList` | Ordered list | Numbered steps |
| `Blockquote` | Styled quote | Testimonials, quotes |

## CSS Custom Properties

The system uses CSS custom properties for consistent theming:

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Monaco, Consolas, monospace;
  --font-display: 'Inter', system-ui, sans-serif;
  
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Letter Spacing */
  --tracking-tighter: -0.05em;
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;
  --tracking-wider: 0.05em;
  --tracking-widest: 0.1em;
  
  /* Colors */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-accent: #fbbf24;
  --text-success: #34d399;
  --text-error: #f87171;
  --text-warning: #fbbf24;
  --text-info: #60a5fa;
}
```

## Tailwind Integration

The system includes custom Tailwind utilities:

```tsx
// Text gradients
<div className="text-gradient">Gradient Text</div>

// Text shadows
<div className="text-shadow">Shadowed Text</div>
<div className="text-shadow-lg">Large Shadow Text</div>

// Glass morphism
<div className="glass">Glass Effect</div>
<div className="glass-dark">Dark Glass Effect</div>

// Animations
<div className="animate-fade-in">Fade In</div>
<div className="animate-slide-up">Slide Up</div>
<div className="animate-scale-in">Scale In</div>
```

## Responsive Behavior

The typography system automatically adapts to different screen sizes:

- **Desktop**: Full-size typography
- **Tablet**: Slightly reduced sizes for better fit
- **Mobile**: Optimized sizes for small screens

## Accessibility Features

- **High Contrast Support**: Automatically adapts to high contrast mode
- **Reduced Motion**: Respects user's motion preferences
- **Focus Indicators**: Clear focus states for keyboard navigation
- **Screen Reader Support**: Proper semantic markup and ARIA labels

## Best Practices

### 1. Use Semantic Components

```tsx
// ✅ Good - Use semantic components
<H1>Page Title</H1>
<Body>Content here</Body>

// ❌ Bad - Don't override with custom styles
<h1 style={{ fontSize: '48px' }}>Page Title</h1>
```

### 2. Maintain Hierarchy

```tsx
// ✅ Good - Proper heading hierarchy
<H1>Main Title</H1>
<H2>Section Title</H2>
<H3>Subsection Title</H3>

// ❌ Bad - Skipping levels
<H1>Main Title</H1>
<H3>Subsection Title</H3> // Missing H2
```

### 3. Use Appropriate Text Sizes

```tsx
// ✅ Good - Appropriate text sizes
<BodyLarge>Important information</BodyLarge>
<Body>Regular content</Body>
<BodySmall>Secondary details</BodySmall>

// ❌ Bad - Inconsistent sizing
<Body style={{ fontSize: '20px' }}>Overridden size</Body>
```

### 4. Leverage Utility Classes

```tsx
// ✅ Good - Use utility classes for variations
<Body className="text-gradient">Special text</Body>
<H2 className="text-shadow">Enhanced heading</H2>

// ❌ Bad - Custom inline styles
<Body style={{ background: 'linear-gradient(...)' }}>Custom styling</Body>
```

## Customization

### Adding New Text Variants

```tsx
// In Typography.tsx
export const CustomText = styled.span`
  ${baseTextStyles}
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-accent);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
`;
```

### Modifying Existing Components

```tsx
// Create a custom variant
const CustomH1 = styled(H1)`
  color: var(--text-accent);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;
```

## Performance Considerations

- **Font Loading**: Fonts are loaded from Google Fonts with display=swap
- **CSS Variables**: Efficient theming without CSS-in-JS overhead
- **Minimal Bundle**: Only necessary styles are included
- **Optimized Rendering**: Hardware-accelerated animations and transitions

## Browser Support

- **Modern Browsers**: Full support (Chrome 88+, Firefox 85+, Safari 14+)
- **CSS Custom Properties**: IE11+ with polyfill
- **CSS Grid**: IE11+ with polyfill
- **Backdrop Filter**: Modern browsers with fallbacks

## Troubleshooting

### Common Issues

1. **Fonts Not Loading**: Check network connectivity and Google Fonts availability
2. **CSS Variables Not Working**: Ensure the typography.css is imported
3. **Responsive Issues**: Check viewport meta tag and CSS media queries
4. **Performance Issues**: Verify font loading strategy and CSS optimization

### Debug Mode

Enable debug mode to see typography boundaries:

```css
.debug-typography * {
  outline: 1px solid rgba(255, 0, 0, 0.2);
}
```

## Contributing

When contributing to the typography system:

1. Follow the existing naming conventions
2. Test across different screen sizes
3. Ensure accessibility compliance
4. Update documentation
5. Add examples to the demo component

## License

This typography system is part of the main project and follows the same license terms.