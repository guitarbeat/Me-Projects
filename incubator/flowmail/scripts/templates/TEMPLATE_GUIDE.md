# Feature Template Guide

This guide explains how to use the FlowMail feature template to create new modular features.

## Quick Start

Create a new feature with a single command:

```bash
npm run create-feature my-feature-name
```

**Important:** Feature names must be in kebab-case (lowercase with hyphens).

### Valid Feature Names
- `user-profile`
- `task-manager`
- `data-export`
- `notification-center`

### Invalid Feature Names
- `UserProfile` (PascalCase)
- `user_profile` (snake_case)
- `userProfile` (camelCase)
- `User Profile` (spaces)

## What Gets Generated

The template creates a complete feature structure:

```
client/src/features/my-feature-name/
├── components/          # Feature-specific components (empty)
│   └── .gitkeep
├── pages/              # Feature pages
│   └── FeaturePage.tsx # Example page with basic UI
├── lib/                # Feature utilities (empty)
│   └── .gitkeep
├── types.ts            # TypeScript type definitions
└── index.ts            # Public API and feature configuration
```

## Template Files Explained

### index.ts - Feature Entry Point

This is the **most important file**. It defines:


1. **Public Exports** - What other parts of the app can import
2. **Feature Configuration** - Routes, navigation, dependencies

Example generated `index.ts`:

```typescript
// Export pages
export { default as MyFeatureNamePage } from './pages/FeaturePage';

// Export types
export type { MyFeatureNameConfig, MyFeatureNameData } from './types';

// Feature configuration
export const myFeatureNameFeature = {
  id: 'my-feature-name',
  name: 'My Feature Name',
  version: '1.0.0',
  description: 'Description of My Feature Name feature',
  routes: [
    { path: '/my-feature-name', component: 'MyFeatureNamePage' },
  ],
  navigation: [
    { path: '/my-feature-name', label: 'My Feature Name', icon: 'Box', order: 10 },
  ],
  dependencies: [],
};
```

### pages/FeaturePage.tsx - Example Page

A starter page component with:
- Basic card layout using shadcn/ui components
- Placeholder content
- Proper TypeScript typing

You can rename this file or add more pages as needed.

### types.ts - Type Definitions

Defines TypeScript types for your feature:
- Configuration types
- Data types
- Component prop types

### components/ - Feature Components

Empty directory for your feature-specific components. Add components here and export them in `index.ts`.

### lib/ - Feature Utilities

Empty directory for utility functions, helpers, and business logic specific to your feature.

## Customization Guide

### Step 1: Update Feature Configuration

Edit `index.ts` to customize your feature:

```typescript
export const myFeatureFeature = {
  id: 'my-feature',
  name: 'My Feature',
  version: '1.0.0',
  description: 'A clear description of what this feature does',
  
  // Define your routes
  routes: [
    { path: '/my-feature', component: 'MyFeaturePage' },
    { path: '/my-feature/settings', component: 'SettingsPage' },
  ],
  
  // Define navigation items
  navigation: [
    { path: '/my-feature', label: 'My Feature', icon: 'Star', order: 5 },
  ],
  
  // List NPM dependencies
  dependencies: ['date-fns', '@tanstack/react-query'],
  
  // Optional: API endpoints
  api: {
    endpoints: ['/api/my-feature', '/api/my-feature/:id'],
  },
  
  // Optional: Storage requirements
  storage: {
    type: 'localStorage',
    key: 'my-feature-data',
  },
  
  // Optional: Feature capabilities
  capabilities: ['export', 'import', 'search'],
};
```

### Step 2: Add Components

Create components in the `components/` directory:

```typescript
// components/MyComponent.tsx
export function MyComponent() {
  return <div>My Component</div>;
}
```

Export them in `index.ts`:

```typescript
export { MyComponent } from './components/MyComponent';
```

### Step 3: Add Utilities

Create utility functions in the `lib/` directory:

```typescript
// lib/utils.ts
export function myUtility() {
  // Your utility logic
}
```

Export them in `index.ts`:

```typescript
export { myUtility } from './lib/utils';
```

### Step 4: Define Types

Add your feature's types to `types.ts`:

```typescript
export interface MyFeatureConfig {
  setting1: string;
  setting2: number;
}

export interface MyFeatureData {
  id: string;
  name: string;
  createdAt: Date;
}

export interface MyComponentProps {
  data: MyFeatureData;
  onUpdate: (data: MyFeatureData) => void;
}
```

### Step 5: Create Additional Pages

Add more pages to the `pages/` directory:

```typescript
// pages/SettingsPage.tsx
export default function SettingsPage() {
  return <div>Settings</div>;
}
```

Export and configure them:

```typescript
// In index.ts
export { default as SettingsPage } from './pages/SettingsPage';

// Update routes in feature configuration
routes: [
  { path: '/my-feature', component: 'MyFeaturePage' },
  { path: '/my-feature/settings', component: 'SettingsPage' },
],
```

## Integration with App

After creating your feature, integrate it into the main app:

### 1. Import in App.tsx

```typescript
import { 
  MyFeatureNamePage, 
  myFeatureNameFeature 
} from './features/my-feature-name';
```

### 2. Add Routes

Using Wouter (FlowMail's router):

```typescript
<Route path="/my-feature-name" component={MyFeatureNamePage} />
```

### 3. Add Navigation (Optional)

If you want the feature in the sidebar:

```typescript
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <Link href="/my-feature-name">
      <Box className="h-4 w-4" />
      <span>My Feature Name</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
```

## Best Practices

### Do's ✅

1. **Export through index.ts** - Always export public APIs through the feature's index file
2. **Keep features isolated** - Don't import from other features' internals
3. **Use descriptive names** - Make component and function names clear
4. **Document complex logic** - Add comments for non-obvious code
5. **Follow TypeScript** - Define types for all data structures
6. **Update configuration** - Keep the feature config accurate

### Don'ts ❌

1. **Don't bypass index.ts** - Never import directly from feature internals
2. **Don't create cross-feature dependencies** - Features should be independent
3. **Don't use global state** - Keep feature state contained
4. **Don't hardcode routes** - Use feature configuration
5. **Don't skip types** - Always define TypeScript types
6. **Don't forget exports** - Export everything that needs to be public

## Examples

### Example 1: Simple Feature

A basic feature with one page:

```typescript
// index.ts
export { default as AboutPage } from './pages/AboutPage';

export const aboutFeature = {
  id: 'about',
  name: 'About',
  version: '1.0.0',
  description: 'About page for the application',
  routes: [{ path: '/about', component: 'AboutPage' }],
  navigation: [{ path: '/about', label: 'About', icon: 'Info', order: 99 }],
  dependencies: [],
};
```

### Example 2: Feature with Components

A feature with reusable components:

```typescript
// index.ts
export { default as DashboardPage } from './pages/DashboardPage';
export { StatsCard } from './components/StatsCard';
export { ChartWidget } from './components/ChartWidget';
export type { DashboardData, ChartConfig } from './types';

export const dashboardFeature = {
  id: 'dashboard',
  name: 'Dashboard',
  version: '1.0.0',
  description: 'Analytics dashboard with charts and stats',
  routes: [{ path: '/dashboard', component: 'DashboardPage' }],
  navigation: [{ path: '/dashboard', label: 'Dashboard', icon: 'BarChart', order: 1 }],
  dependencies: ['recharts', 'date-fns'],
};
```

### Example 3: Feature with Storage

A feature that uses localStorage:

```typescript
// index.ts
export { default as NotesPage } from './pages/NotesPage';
export { loadNotes, saveNotes } from './lib/storage';
export type { Note, NotesConfig } from './types';

export const notesFeature = {
  id: 'notes',
  name: 'Notes',
  version: '1.0.0',
  description: 'Simple note-taking feature',
  routes: [{ path: '/notes', component: 'NotesPage' }],
  navigation: [{ path: '/notes', label: 'Notes', icon: 'FileText', order: 3 }],
  storage: {
    type: 'localStorage',
    key: 'flowmail-notes',
  },
  dependencies: [],
};
```

## Placeholder Reference

The template uses these placeholders that get replaced:

| Placeholder | Example Input | Example Output |
|------------|---------------|----------------|
| `{{FEATURE_ID}}` | `task-manager` | `task-manager` |
| `{{FEATURE_NAME}}` | `task-manager` | `Task Manager` |
| `{{FEATURE_NAME_PASCAL}}` | `task-manager` | `TaskManager` |
| `{{FEATURE_NAME_CAMEL}}` | `task-manager` | `taskManager` |

## Troubleshooting

### Error: Feature name must be in kebab-case

**Problem:** You used an invalid feature name format.

**Solution:** Use lowercase letters and hyphens only (e.g., `my-feature`).

### Error: Feature already exists

**Problem:** A feature with that name already exists.

**Solution:** Choose a different name or delete the existing feature directory.

### Import errors after creating feature

**Problem:** TypeScript can't find your feature exports.

**Solution:** 
1. Check that you exported the component in `index.ts`
2. Verify the import path in App.tsx
3. Run `npm run check` to see specific errors

### Routes not working

**Problem:** Feature routes don't navigate correctly.

**Solution:**
1. Verify routes are defined in feature configuration
2. Check that routes are added to the router in App.tsx
3. Ensure route paths match exactly

## Advanced Usage

### Creating Feature Variants

You can create multiple features from the template and customize them differently:

```bash
npm run create-feature user-profile
npm run create-feature admin-panel
npm run create-feature reports
```

Each will be independent and follow the same structure.

### Sharing Code Between Features

If multiple features need the same functionality:

1. Create shared utilities in `client/src/lib/`
2. Create shared components in `client/src/components/`
3. Import from shared locations in your features

```typescript
// In your feature
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
```

### Feature Versioning

Update the version in your feature configuration when making changes:

```typescript
export const myFeature = {
  version: '1.1.0', // Increment on changes
  // ...
};
```

Follow semantic versioning:
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

## Next Steps

After creating your feature:

1. **Read the Architecture Guide**: See [ARCHITECTURE.md](../../docs/ARCHITECTURE.md)
2. **Run Verification**: `npm run verify-architecture`
3. **Write Tests**: Add tests for your feature components
4. **Update Documentation**: Document your feature's purpose and usage

## Support

For more information:
- See [ARCHITECTURE.md](../../docs/ARCHITECTURE.md) for architecture details
- Check existing features for examples
- Run `npm run verify-architecture` to validate your feature

---

**Happy Feature Building! 🚀**
