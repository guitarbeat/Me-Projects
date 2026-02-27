# UI Component Standard

## Overview

This project uses **shadcn/ui** as the standard UI component library for all base UI components (buttons, cards, inputs, etc.). This decision was made to:

- Ensure consistent styling across the application
- Leverage modern, accessible components
- Utilize Tailwind CSS for maintainability
- Benefit from TypeScript support and active maintenance
- Use a composable architecture that fits our needs

## Component Library: shadcn/ui

**Location:** `src/components/ui/`

shadcn/ui components are:
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS
- Fully customizable and owned by the project
- TypeScript-first with excellent type safety

### Available Components

- `button.tsx` - Button component with variants
- `card.tsx` - Card container component
- `input.tsx` - Text input component
- `dialog.tsx` - Modal dialog component
- `dropdown-menu.tsx` - Dropdown menu component
- `tabs.tsx` - Tab navigation component
- `toast.tsx` - Toast notification component
- `tooltip.tsx` - Tooltip component
- And more...

## Compatibility Wrappers

**Location:** `src/components/common/`

For gradual migration, compatibility wrappers exist in `src/components/common/`:

```typescript
// src/components/common/Button.tsx
import { Button as UIButton } from '../ui/button';

/**
 * @deprecated Use Button from '@/components/ui/button' instead
 * This wrapper exists for backward compatibility and will be removed in a future version.
 */
export const Button = UIButton;
```

These wrappers:
- Re-export shadcn/ui components
- Include deprecation warnings in development
- Allow existing code to continue working
- Provide a clear migration path

## Migration Guide

### For New Code

Always import from `@/components/ui/`:

```typescript
// ✅ Correct - Use shadcn/ui directly
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function MyComponent() {
  return (
    <Card>
      <Button>Click me</Button>
    </Card>
  );
}
```

### For Existing Code

Gradually update imports from `common/` to `ui/`:

```typescript
// ❌ Deprecated - Old import
import { Button } from '@/components/common/Button';

// ✅ Updated - New import
import { Button } from '@/components/ui/button';
```

### Migration Steps

1. **Identify usage:** Search for imports from `@/components/common/Button` or `@/components/common/Card`
2. **Update import:** Change to `@/components/ui/button` or `@/components/ui/card`
3. **Test functionality:** Ensure the component works as expected
4. **Check styling:** Verify visual appearance matches design
5. **Commit changes:** Commit the migration for that file

### Bulk Migration

For bulk updates, use find-and-replace:

```bash
# Find all Button imports from common
grep -r "from '@/components/common/Button'" src/

# Find all Card imports from common
grep -r "from '@/components/common/Card'" src/
```

## Component Usage Examples

### Button

```typescript
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Custom Components

For domain-specific components (emotion tracking, N8N integration, etc.), continue using the organized structure:

- `src/components/emotion/` - Emotion tracking components
- `src/components/n8n/` - N8N integration components
- `src/components/features/` - Feature-specific components

These components should use shadcn/ui components internally for consistency.

## Deprecation Timeline

1. **Phase 1 (Current):** Compatibility wrappers created with deprecation warnings
2. **Phase 2 (Ongoing):** Gradual migration of existing code to use `ui/` imports
3. **Phase 3 (Future):** Remove compatibility wrappers once migration is complete

## Adding New shadcn/ui Components

To add a new shadcn/ui component:

```bash
# Using the shadcn CLI
npx shadcn-ui@latest add [component-name]

# Example: Add a new select component
npx shadcn-ui@latest add select
```

This will:
- Download the component to `src/components/ui/`
- Update `components.json` configuration
- Install any required dependencies

## Best Practices

1. **Always use shadcn/ui for base UI components** - Don't create custom buttons, cards, inputs, etc.
2. **Customize through Tailwind** - Use Tailwind classes for styling variations
3. **Compose complex components** - Build domain components using shadcn/ui primitives
4. **Maintain accessibility** - shadcn/ui components are accessible by default, preserve this
5. **Follow naming conventions** - Use PascalCase for components, kebab-case for files

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- Project configuration: `config/components.json`
