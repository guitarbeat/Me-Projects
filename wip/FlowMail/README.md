# FlowMail

![CI](https://github.com/your-username/flowmail/actions/workflows/ci.yml/badge.svg)

FlowMail is an email management application featuring a swipe-based interface for inbox triage and integrated journal reflection.

## Development

### Prerequisites

- Node.js (v20+)
- npm

### Installation

```bash
npm install
```

### Running

```bash
npm run dev
```

### Code Standards

This project uses ESLint (Airbnb rules) and Prettier.

- **Lint**: `npm run lint`
- **Fix Lint**: `npm run lint:fix`
- **Format**: `npm run format`
- **Check Format**: `npm run format:check`
- **Type Check**: `npm run check`

## Pre-commit Hooks

We use `pre-commit` to ensure code quality.

1. Install `pre-commit` (e.g., `pip install pre-commit` or `brew install pre-commit`).
2. Run `pre-commit install`.

## Architecture

FlowMail uses a modular, plug-and-play architecture. See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

### Creating a New Feature

Use the feature generator to quickly scaffold a new feature:

```bash
npm run create-feature my-feature-name
```

The feature name must be in kebab-case (e.g., `user-profile`, `data-export`).

This will create a new feature directory with the following structure:

```
client/src/features/my-feature-name/
├── components/          # Feature-specific components
├── pages/              # Feature pages
│   └── FeaturePage.tsx # Example page
├── lib/                # Feature utilities
├── types.ts            # Feature types
└── index.ts            # Public API + configuration
```

### Integrating Your Feature

After creating a feature, integrate it into the app:

1. **Import the feature in App.tsx:**
   ```typescript
   import { MyFeatureNamePage, myFeatureNameFeature } from './features/my-feature-name';
   ```

2. **Add the route:**
   ```typescript
   <Route path="/my-feature-name" component={MyFeatureNamePage} />
   ```

3. **Start building!** Add components, pages, and utilities to your feature directory.

### Feature Template Customization

The generated feature includes:

- **Example page** with basic UI structure
- **Type definitions** for your feature data
- **Feature configuration** with routes and navigation
- **Empty directories** for components and utilities

Customize the template by:

- Adding components to `components/`
- Creating utilities in `lib/`
- Defining types in `types.ts`
- Exporting public APIs in `index.ts`
- Updating the feature configuration with routes, navigation, and dependencies

### Example: Generated Feature

Running `npm run create-feature task-manager` creates:

**index.ts:**
```typescript
export { default as TaskManagerPage } from './pages/FeaturePage';
export type { TaskManagerConfig, TaskManagerData } from './types';

export const taskManagerFeature = {
  id: 'task-manager',
  name: 'Task Manager',
  version: '1.0.0',
  description: 'Description of Task Manager feature',
  routes: [
    { path: '/task-manager', component: 'TaskManagerPage' },
  ],
  navigation: [
    { path: '/task-manager', label: 'Task Manager', icon: 'Box', order: 10 },
  ],
  dependencies: [],
};
```

**pages/FeaturePage.tsx:**
```typescript
export default function FeaturePage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
          <CardDescription>Welcome to the Task Manager feature</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Start building your feature here!</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Verifying Architecture

Run the architecture verification script to ensure your feature follows the modular pattern:

```bash
npm run verify-architecture
```

This checks:
- Feature structure and naming conventions
- Import patterns (no cross-feature internal imports)
- Configuration validity
- TypeScript compilation
