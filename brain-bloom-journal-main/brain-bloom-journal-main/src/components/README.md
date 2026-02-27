# Components Directory

This directory contains all React components for the Tampana application, organized by feature and functionality.

## Directory Structure

```
components/
├── ui/                  # shadcn/ui base components (STANDARD)
├── common/              # Common utilities and compatibility wrappers
├── emotion/             # Emotion tracking components
├── n8n/                 # N8N integration components
├── features/            # Feature-specific components
├── Calendar/            # Calendar components
├── layout/              # Layout components
└── __tests__/           # Component tests
```

## UI Component Standard

**⚠️ IMPORTANT**: This project uses **shadcn/ui** as the standard for all base UI components.

### Using UI Components

For all base UI components (buttons, cards, inputs, dialogs, etc.), **always import from `@/components/ui/`**:

```typescript
// ✅ Correct - Use shadcn/ui directly
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Enter text..." />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

### Deprecated Components

Components in `common/Button.tsx` and `common/Card.tsx` are **deprecated compatibility wrappers**:

```typescript
// ❌ Deprecated - Old styled-components version
import { Button } from '@/components/common/Button';

// ✅ Updated - Use shadcn/ui instead
import { Button } from '@/components/ui/button';
```

**Migration Guide**: See [docs/UI_COMPONENT_STANDARD.md](../../docs/UI_COMPONENT_STANDARD.md) for detailed migration instructions.

## Component Categories

### 1. UI Components (`ui/`)

**Standard base components from shadcn/ui**

Available components:
- `button.tsx` - Button with variants (default, destructive, outline, ghost, link)
- `card.tsx` - Card container with header, content, footer
- `input.tsx` - Text input field
- `dialog.tsx` - Modal dialog
- `dropdown-menu.tsx` - Dropdown menu
- `tabs.tsx` - Tab navigation
- `toast.tsx` - Toast notifications
- `tooltip.tsx` - Tooltips
- And more...

**Usage:**
```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

**Documentation**: [shadcn/ui docs](https://ui.shadcn.com/)

### 2. Common Components (`common/`)

**Shared utilities and compatibility wrappers**

- `ErrorBoundary.tsx` - Error boundary for React components
- `LoadingSpinner.tsx` - Loading spinner with fullScreen variant
- `Modal.tsx` - Modal component
- `Grid.tsx` - Grid layout component
- `GlobalTopProgressBar.tsx` - Top progress bar
- `OnlineStatusBadge.tsx` - Online/offline indicator
- `PullToRefreshIndicator.tsx` - Pull-to-refresh UI
- `Button.tsx` - ⚠️ **DEPRECATED** - Use `@/components/ui/button` instead
- `Card.tsx` - ⚠️ **DEPRECATED** - Use `@/components/ui/card` instead

### 3. Emotion Tracking (`emotion/`)

**Consolidated emotion tracking components**

Structure:
```
emotion/
├── EmotionTracker.tsx              # Core emotion logging UI
├── EmotionAnalytics.tsx            # Analytics and insights
├── EmotionTrackingDashboard.tsx    # Main dashboard orchestrator
└── shared/
    ├── EmotionGrid.tsx             # Shared emotion selection grid
    ├── PatternCard.tsx             # Shared pattern display card
    └── types.ts                    # Shared TypeScript types
```

**Usage:**
```typescript
import { EmotionTrackingDashboard } from '@/components/emotion/EmotionTrackingDashboard';

// Use the dashboard as the main entry point
<EmotionTrackingDashboard />
```

### 4. N8N Integration (`n8n/`)

**N8N workflow integration components**

Structure:
```
n8n/
├── N8NIntegration.tsx              # Unified dashboard + export + workflows
├── N8NConfigPanel.tsx              # Configuration panel
├── N8NDemo.tsx                     # Demo/landing page
└── shared/
    ├── N8NAlert.tsx                # Shared alert component
    ├── N8NStatus.tsx               # Shared status indicator
    └── mockData.ts                 # Mock data for demos
```

**Usage:**
```typescript
import { N8NIntegration } from '@/components/n8n/N8NIntegration';
import { N8NConfigPanel } from '@/components/n8n/N8NConfigPanel';

// Main integration component
<N8NIntegration />

// Configuration
<N8NConfigPanel />
```

### 5. Calendar Components (`Calendar/`)

**Calendar and event management**

- `Calendar.tsx` - Main calendar component (merged with EmotionalCalendar)
- `EmotionalCalendar.tsx` - Emotional calendar with event tracking
- `VueCalWrapper.tsx` - Vue Cal integration wrapper
- `EventModal.tsx` - Event creation/editing modal
- `Top.tsx` - Calendar header
- `Bottom.tsx` - Calendar footer

**Usage:**
```typescript
import { EmotionalCalendar } from '@/components/Calendar/EmotionalCalendar';

<EmotionalCalendar />
```

### 6. Feature Components (`features/`)

**Feature-specific components organized by domain**

Structure:
```
features/
├── archive/            # Archive functionality
├── chat/               # Chat features
├── compose/            # Content composition
├── digest/             # Content digests
├── navigation/         # Navigation components
├── newspaper/          # Newspaper view
└── theme/              # Theme switching
```

### 7. Layout Components (`layout/`)

**Page layout and structure**

- `AppLayout.tsx` - Main application layout
- `NewsprintPage.tsx` - Newsprint-style page layout

## Component Development Guidelines

### 1. Use shadcn/ui for Base Components

Always use shadcn/ui components for buttons, cards, inputs, etc.:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';

// ❌ Bad - Don't create custom buttons
const CustomButton = styled.button`...`;
```

### 2. Compose Complex Components

Build domain-specific components using shadcn/ui primitives:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function EmotionCard({ emotion, onSelect }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{emotion.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onSelect}>Select</Button>
      </CardContent>
    </Card>
  );
}
```

### 3. Organize by Feature

Place components in feature-specific directories:

```
emotion/          # Emotion tracking
n8n/              # N8N integration
features/chat/    # Chat features
```

### 4. Share Common Logic

Extract shared components to `shared/` subdirectories:

```
emotion/shared/EmotionGrid.tsx
n8n/shared/N8NAlert.tsx
```

### 5. Write Tests

All components should have corresponding tests in `__tests__/`:

```
__tests__/
├── Button.test.tsx
├── Card.test.tsx
├── EmotionalCalendar.test.tsx
└── N8NConfigPanel.test.tsx
```

## Adding New Components

### 1. For Base UI Components

Use the shadcn CLI to add new components:

```bash
npx shadcn-ui@latest add [component-name]
```

This adds the component to `src/components/ui/`.

### 2. For Feature Components

Create in the appropriate feature directory:

```typescript
// src/components/emotion/NewEmotionFeature.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function NewEmotionFeature() {
  // Implementation using shadcn/ui components
}
```

### 3. For Shared Components

Create in the `shared/` subdirectory of the feature:

```typescript
// src/components/emotion/shared/NewSharedComponent.tsx
export function NewSharedComponent() {
  // Shared logic
}
```

## Migration Status

### ✅ Completed
- Phase 1: Removed unnecessary wrappers (VueCalWrapper, ErrorBoundaryWrapper, LoadingScreen)
- Phase 2: Consolidated emotion and N8N components
- Phase 3: Created shadcn/ui compatibility wrappers

### 🔄 In Progress
- Gradual migration of imports from `common/` to `ui/`

### 📋 Future
- Remove deprecated compatibility wrappers once migration is complete

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [UI Component Standard](../../docs/UI_COMPONENT_STANDARD.md)
- [Project Structure](../../docs/PROJECT_STRUCTURE.md)
- [Contributing Guidelines](../../docs/CONTRIBUTING.md)

## Questions?

For questions about component usage or migration:
1. Check [docs/UI_COMPONENT_STANDARD.md](../../docs/UI_COMPONENT_STANDARD.md)
2. Review shadcn/ui documentation
3. Look at existing component examples
4. Create an issue on GitHub
