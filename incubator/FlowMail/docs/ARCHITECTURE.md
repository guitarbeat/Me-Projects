# FlowMail Architecture Guide

## Overview

FlowMail is built using a **modular, plug-and-play architecture** where features are self-contained, independently maintainable modules. Each feature encapsulates its own components, pages, utilities, and configuration, making it easy to add, remove, or modify features without affecting the rest of the application.

This architecture provides:

- **Feature Independence**: Each feature is self-contained with clear boundaries
- **Easy Maintenance**: Changes to one feature don't impact others
- **Simple Integration**: Features declare their routes and navigation in configuration
- **Scalability**: New features can be added without modifying existing code
- **Developer Experience**: Consistent structure makes navigation intuitive

## Core Principles

### 1. Feature Isolation
Features are isolated modules that:
- Live in their own directory under `client/src/features/`
- Export a single public API through `index.ts`
- Don't import from other features' internals
- Declare all dependencies explicitly

### 2. Configuration-Driven
Features are self-describing through configuration objects that declare:
- Routes and navigation items
- API endpoints used
- Storage requirements
- Capabilities provided
- NPM dependencies

### 3. Plug-and-Play
Features can be:
- Added by creating a new directory and importing in App.tsx
- Removed by deleting the directory and removing the import
- Toggled on/off by commenting out a single import line

## Directory Structure

```
FlowMail/
├── client/src/
│   ├── features/                    # Feature modules (plug-and-play)
│   │   ├── email-inbox/
│   │   │   ├── components/          # Feature-specific components
│   │   │   │   ├── BulkActions.tsx
│   │   │   │   ├── CardStack.tsx
│   │   │   │   ├── EmailCard.tsx
│   │   │   │   ├── EmailFilters.tsx
│   │   │   │   └── EmailListView.tsx
│   │   │   ├── pages/               # Feature pages
│   │   │   │   ├── InboxPage.tsx
│   │   │   │   └── LaterPage.tsx
│   │   │   └── index.ts             # Public API + configuration
│   │   │
│   │   ├── journal/
│   │   │   ├── components/          # Feature-specific components
│   │   │   │   ├── journal-event-dialog.tsx
│   │   │   │   └── journal-export-menu.tsx
│   │   │   ├── lib/                 # Feature utilities
│   │   │   │   ├── export.ts
│   │   │   │   ├── n8n-client.ts
│   │   │   │   └── storage.ts
│   │   │   ├── types.ts             # Feature types
│   │   │   └── index.ts             # Public API + configuration
│   │   │
│   │   └── year-grid/
│   │       ├── App.tsx              # Standalone app component
│   │       └── index.ts             # Public API + configuration
│   │
│   ├── components/                  # Shared UI components
│   ├── lib/                         # Shared utilities
│   ├── hooks/                       # Shared hooks
│   └── App.tsx                      # Feature integration point
│
├── scripts/
│   └── verify-architecture.ts       # Architecture verification script
│
└── docs/
    └── ARCHITECTURE.md              # This file
```

## Feature Module Pattern

### Feature Structure

Each feature follows a consistent structure:

```
feature-name/
├── components/          # Feature-specific components (optional)
│   └── *.tsx
├── pages/              # Feature pages (optional)
│   └── *.tsx
├── lib/                # Feature utilities (optional)
│   └── *.ts
├── types.ts            # Feature types (optional)
└── index.ts            # Public API + configuration (required)
```

### Feature Index File

The `index.ts` file is the **only required file** and serves as the feature's public API. It must:

1. Export all public components, pages, and utilities
2. Export types that external code needs
3. Export a feature configuration object

Example structure:

```typescript
// Export public components
export { ComponentA } from './components/ComponentA';
export { ComponentB } from './components/ComponentB';

// Export pages
export { default as FeaturePage } from './pages/FeaturePage';

// Export utilities (if any)
export { utilityFunction } from './lib/utils';

// Export types
export type { FeatureType } from './types';

// Export feature configuration
export const featureConfig = {
  id: 'feature-name',
  name: 'Feature Name',
  version: '1.0.0',
  description: 'Brief description of the feature',
  routes: [
    { path: '/feature', component: 'FeaturePage' }
  ],
  navigation: [
    { path: '/feature', label: 'Feature', icon: 'Icon', order: 1 }
  ],
  dependencies: ['dependency-name'],
};
```

## Feature Configuration Schema

### Complete Schema

```typescript
interface FeatureConfig {
  // Required fields
  id: string;                        // Unique identifier (kebab-case)
  name: string;                      // Display name
  version: string;                   // Semantic version (e.g., "1.0.0")
  description: string;               // Brief description
  routes: RouteConfig[];             // Route definitions
  navigation: NavigationItem[];      // Navigation menu items
  dependencies: string[];            // NPM package dependencies

  // Optional fields
  standalone?: boolean;              // Can run independently
  api?: {                            // API endpoints used
    endpoints: string[];
  };
  storage?: {                        // Storage requirements
    type: 'localStorage' | 'database';
    key?: string;
  };
  capabilities?: string[];           // Feature capabilities
}

interface RouteConfig {
  path: string;                      // Route path (e.g., "/inbox")
  component: string;                 // Component name
  exact?: boolean;                   // Exact path match
}

interface NavigationItem {
  path: string;                      // Navigation path
  label: string;                     // Display label
  icon: string;                      // Icon name (Lucide React)
  order: number;                     // Display order
}
```

### Field Descriptions

#### Required Fields

- **id**: Unique identifier in kebab-case (e.g., `email-inbox`, `journal`)
- **name**: Human-readable display name (e.g., `Email Inbox`, `Journal`)
- **version**: Semantic version following semver (e.g., `1.0.0`)
- **description**: Brief description of what the feature does
- **routes**: Array of route configurations for the feature
- **navigation**: Array of navigation items to display in the app menu
- **dependencies**: List of NPM packages the feature depends on

#### Optional Fields

- **standalone**: Set to `true` if the feature can run independently (e.g., Year Grid)
- **api**: Object describing API endpoints the feature uses
- **storage**: Object describing storage requirements (localStorage or database)
- **capabilities**: Array of strings describing feature capabilities

## Current Features

### 1. Email Inbox Feature

**Purpose**: Email triage with swipe interface and list view

**Location**: `client/src/features/email-inbox/`

**Exports**:
- `InboxPage` - Main inbox page component
- `LaterPage` - Later/snoozed emails page
- `CardStack` - Swipeable card stack component
- `EmailListView` - List view of emails
- `EmailFilters` - Email filtering component
- `BulkActions` - Bulk action toolbar
- `EmailCard` - Individual email card
- `EmailFilterOptions` (type)

**Configuration**:
```typescript
{
  id: 'email-inbox',
  name: 'Email Inbox',
  version: '1.0.0',
  routes: [
    { path: '/', component: 'InboxPage', exact: true },
    { path: '/inbox', component: 'InboxPage' },
    { path: '/later', component: 'LaterPage' }
  ],
  navigation: [
    { path: '/inbox', label: 'Inbox', icon: 'Inbox', order: 1 },
    { path: '/later', label: 'Later', icon: 'Clock', order: 2 }
  ],
  api: {
    endpoints: [
      '/api/emails',
      '/api/emails/status/:status',
      '/api/emails/:id',
      '/api/stats'
    ]
  },
  dependencies: ['@tanstack/react-query', 'framer-motion']
}
```

### 2. Journal Feature

**Purpose**: Reflection planner with emotion tracking and exports

**Location**: `client/src/features/journal/`

**Exports**:
- `JournalPage` - Main journal page component
- `loadJournalEvents` - Load events from storage
- `saveJournalEvents` - Save events to storage
- `buildExportData` - Build export data structure
- `buildEmotionSummary` - Generate emotion summary
- `buildCsv` - Build CSV export
- `downloadTextFile` - Download utility
- `copyTextToClipboard` - Clipboard utility
- Types: `JournalEntry`, `JournalEmotion`, `StoredJournalEntry`, `JournalSettings`, `JournalView`
- `emotionMeta` - Emotion metadata

**Configuration**:
```typescript
{
  id: 'journal',
  name: 'Journal',
  version: '1.0.0',
  routes: [
    { path: '/journal', component: 'JournalPage' }
  ],
  navigation: [
    { path: '/journal', label: 'Journal', icon: 'NotebookPen', order: 3 }
  ],
  storage: {
    type: 'localStorage',
    key: 'flowmail-journal-events'
  },
  capabilities: [
    'emotion-tracking',
    'export-json',
    'export-csv',
    'export-markdown',
    'n8n-integration'
  ],
  dependencies: ['date-fns']
}
```

### 3. Year Grid Feature

**Purpose**: Visual year/day/week grid generator with customization

**Location**: `client/src/features/year-grid/`

**Exports**:
- `YearGridApp` - Standalone year grid application

**Configuration**:
```typescript
{
  id: 'year-grid',
  name: 'Year Grid',
  version: '1.0.0',
  standalone: true,
  routes: [],
  navigation: [],
  capabilities: [
    'day-view',
    'week-view',
    'month-view',
    'export-png',
    'theme-presets',
    'shareable-links'
  ],
  dependencies: ['html2canvas']
}
```

## Architecture Diagrams

### Feature Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                          App.tsx                            │
│                                                             │
│  import { InboxPage, emailInboxFeature }                   │
│    from './features/email-inbox'                           │
│  import { JournalPage, journalFeature }                    │
│    from './features/journal'                               │
│  import { YearGridApp, yearGridFeature }                   │
│    from './features/year-grid'                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Routes (from feature.routes)                       │  │
│  │  - /inbox → InboxPage                               │  │
│  │  - /later → LaterPage                               │  │
│  │  - /journal → JournalPage                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Navigation (from feature.navigation)               │  │
│  │  - Inbox (order: 1)                                 │  │
│  │  - Later (order: 2)                                 │  │
│  │  - Journal (order: 3)                               │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Feature Isolation

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Email Inbox     │     │     Journal      │     │    Year Grid     │
│    Feature       │     │     Feature      │     │     Feature      │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ components/      │     │ components/      │     │ App.tsx          │
│ pages/           │     │ lib/             │     │ index.ts         │
│ index.ts         │     │ types.ts         │     │                  │
│                  │     │ index.ts         │     │                  │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │ exports only           │ exports only           │ exports only
         │ public API             │ public API             │ public API
         │                        │                        │
         └────────────────────────┴────────────────────────┘
                                  │
                                  ▼
                          ┌───────────────┐
                          │   App.tsx     │
                          │               │
                          │ Imports from  │
                          │ feature index │
                          │ files only    │
                          └───────────────┘
```

### Import Rules

```
✅ ALLOWED:
  App.tsx → features/email-inbox/index.ts
  App.tsx → features/journal/index.ts
  Feature → components/ (shared)
  Feature → lib/ (shared)
  Feature → hooks/ (shared)

❌ NOT ALLOWED:
  App.tsx → features/email-inbox/components/EmailCard.tsx
  Feature A → features/feature-b/components/Component.tsx
  Feature A → features/feature-b/lib/utils.ts
```

## Best Practices

### Do's ✅

1. **Export through index.ts**: Always export components through the feature's index file
2. **Use configuration**: Declare routes and navigation in the feature configuration
3. **Keep features isolated**: Don't import from other features' internals
4. **Follow naming conventions**: Use kebab-case for feature directories
5. **Document dependencies**: List all NPM dependencies in the configuration
6. **Version your features**: Use semantic versioning for feature versions
7. **Write clear descriptions**: Make feature purposes obvious in configuration

### Don'ts ❌

1. **Don't bypass index files**: Never import directly from feature internals
2. **Don't create cross-feature dependencies**: Features should be independent
3. **Don't use global state**: Keep feature state contained
4. **Don't hardcode routes**: Use feature configuration for routes
5. **Don't skip configuration**: Every feature needs a complete configuration object
6. **Don't use inconsistent structure**: Follow the standard feature structure
7. **Don't forget exports**: Export everything that App.tsx or other code needs

### Common Pitfalls

#### 1. Direct Internal Imports

**Problem**:
```typescript
// ❌ BAD: Importing from feature internals
import { EmailCard } from './features/email-inbox/components/EmailCard';
```

**Solution**:
```typescript
// ✅ GOOD: Importing from feature index
import { EmailCard } from './features/email-inbox';
```

#### 2. Cross-Feature Dependencies

**Problem**:
```typescript
// ❌ BAD: Feature A importing from Feature B internals
import { JournalEntry } from '../journal/types';
```

**Solution**:
```typescript
// ✅ GOOD: Feature B exports types through index
import { JournalEntry } from '../journal';
```

#### 3. Missing Exports

**Problem**:
```typescript
// Component exists but not exported from index.ts
// App.tsx tries to import it → Error!
```

**Solution**:
```typescript
// Add to feature's index.ts
export { MyComponent } from './components/MyComponent';
```

#### 4. Incomplete Configuration

**Problem**:
```typescript
// ❌ BAD: Missing required fields
export const myFeature = {
  id: 'my-feature',
  name: 'My Feature',
  // Missing: version, description, routes, navigation, dependencies
};
```

**Solution**:
```typescript
// ✅ GOOD: Complete configuration
export const myFeature = {
  id: 'my-feature',
  name: 'My Feature',
  version: '1.0.0',
  description: 'Description of my feature',
  routes: [{ path: '/my-feature', component: 'MyFeaturePage' }],
  navigation: [{ path: '/my-feature', label: 'My Feature', icon: 'Icon', order: 4 }],
  dependencies: [],
};
```

## Architecture Verification

FlowMail includes an automated verification script that checks the architecture integrity.

### Running Verification

```bash
npm run verify-architecture
```

### What It Checks

1. **Feature Structure**: Verifies each feature has required files and follows naming conventions
2. **Import Patterns**: Detects cross-feature internal imports that bypass feature index
3. **Configuration Validation**: Validates feature configurations against schema
4. **TypeScript Compilation**: Runs `tsc --noEmit` to verify type safety

### Example Output

```
🔍 Starting architecture verification...

======================================================================
  ARCHITECTURE VERIFICATION REPORT
======================================================================

Total Checks: 4
✅ Passed: 4

✅ Feature Structure: All 3 features have proper structure

✅ Import Patterns: No cross-feature internal imports detected

✅ Configuration Validation: All 3 feature configurations are valid

✅ TypeScript Compilation: TypeScript compilation successful

======================================================================
✨ All checks passed! Architecture is valid.
======================================================================
```

### CI/CD Integration

The verification script should be run in your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Verify Architecture
  run: npm run verify-architecture
```

## Troubleshooting

### Import Errors

**Symptom**: `Cannot find module './features/x'`

**Causes**:
- Feature index.ts doesn't exist
- Component not exported from index.ts
- Typo in import path

**Solution**:
1. Check that `features/x/index.ts` exists
2. Verify the component is exported in index.ts
3. Check import path spelling

### Type Errors

**Symptom**: TypeScript compilation errors related to feature imports

**Causes**:
- Types not exported from feature index
- Circular dependencies
- Missing type definitions

**Solution**:
1. Export types from feature index.ts
2. Check for circular imports
3. Ensure all types are properly defined

### Route Conflicts

**Symptom**: Routes not working as expected

**Causes**:
- Duplicate route paths
- Route order issues
- Missing route configuration

**Solution**:
1. Check for duplicate paths in feature configurations
2. Verify route order in App.tsx
3. Ensure routes are defined in feature configuration

### Configuration Errors

**Symptom**: Verification script reports configuration issues

**Causes**:
- Missing required fields
- Invalid field values
- Duplicate feature IDs

**Solution**:
1. Compare configuration against schema
2. Ensure all required fields are present
3. Check for duplicate IDs across features

## Future Enhancements

### Planned Improvements

1. **Automated Feature Registry**: Auto-discover features without manual imports
2. **Dynamic Route Registration**: Register routes automatically from configurations
3. **Feature Marketplace**: Share features between projects
4. **Hot Module Replacement**: Reload features without full refresh
5. **Feature Analytics**: Track feature usage and performance
6. **Dependency Resolution**: Automatic dependency management
7. **Version Compatibility**: Check feature version compatibility

### Contributing

When adding new features or modifying the architecture:

1. Follow the feature module pattern
2. Run verification script before committing
3. Update this documentation if adding new patterns
4. Add tests for new features
5. Document any new configuration fields

## Summary

The modular architecture makes FlowMail:

- **Maintainable**: Features are isolated and easy to understand
- **Scalable**: New features can be added without complexity growth
- **Flexible**: Features can be toggled, removed, or replaced easily
- **Developer-Friendly**: Consistent structure and clear boundaries

By following this architecture guide, you can confidently add, modify, or remove features while maintaining code quality and application stability.

---

**Last Updated**: 2024
**Version**: 1.0.0
