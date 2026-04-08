# Architecture Tests

This directory contains tests that verify the modular architecture of FlowMail.

## Test File

- **architecture.test.ts** - Comprehensive test suite for validating the plug-and-play feature architecture

## What These Tests Verify

### 1. Feature Configurations (Section 3.2)
- ✅ Email Inbox configuration validity
- ✅ Journal configuration validity  
- ✅ Year Grid configuration validity
- ✅ Configuration schema compliance (using Zod)
- ✅ Duplicate feature ID detection
- ✅ Unique route paths across features
- ✅ Valid semver versioning

### 2. Feature Exports (Section 3.3)
- ✅ Email Inbox exports all required components (InboxPage, LaterPage, CardStack, EmailListView, EmailFilters, BulkActions, EmailCard)
- ✅ Journal exports all required utilities (storage, export functions, types)
- ✅ Year Grid exports YearGridApp
- ✅ Type exports are accessible
- ✅ Feature configurations are exported

### 3. Integration Tests (Section 3.4)
- ✅ Features can be imported from their index files
- ✅ Routes are properly defined with valid paths
- ✅ Route components match exported components
- ✅ Navigation items are properly configured
- ✅ Navigation order numbers are unique
- ✅ Feature toggling works (conditional imports)
- ✅ Features are independent (can be imported separately)
- ✅ Dependencies are properly listed

## Running the Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Structure

The test suite is organized into three main sections:

### Feature Configurations
Tests that validate each feature's configuration object against the schema and check for:
- Required fields (id, name, version, description, routes, navigation, dependencies)
- Valid data types and formats
- Uniqueness constraints (IDs, routes)
- Feature-specific requirements (standalone flag, storage config, capabilities)

### Feature Exports
Tests that verify each feature exports its public API correctly:
- All components are exported and are functions
- Utility functions are exported
- Types are exported
- Configuration objects are exported

### Feature Integration
Tests that verify features integrate properly with the application:
- Import paths work correctly
- Routes are valid and properly formatted
- Navigation items are complete
- Features can be conditionally loaded
- Dependencies are documented

## Configuration Schema

The tests use Zod to validate feature configurations against this schema:

```typescript
interface FeatureConfig {
  id: string;                        // Unique identifier (kebab-case)
  name: string;                      // Display name
  version: string;                   // Semantic version (X.Y.Z)
  description: string;               // Brief description
  standalone?: boolean;              // Can run independently
  routes: RouteConfig[];             // Route definitions
  navigation: NavigationItem[];      // Nav menu items
  api?: {                            // API endpoints used
    endpoints: string[];
  };
  storage?: {                        // Storage requirements
    type: 'localStorage' | 'database';
    key?: string;
  };
  capabilities?: string[];           // Feature capabilities
  dependencies: string[];            // NPM dependencies
}
```

## Adding New Tests

When adding a new feature, add corresponding tests in each section:

1. **Configuration Test**: Validate the feature config against the schema
2. **Export Test**: Verify all public exports are accessible
3. **Integration Test**: Check routes, navigation, and dependencies

Example:

```typescript
describe('New Feature', () => {
  it('should have valid configuration', async () => {
    const { newFeature } = await import('../features/new-feature');
    const result = FeatureConfigSchema.safeParse(newFeature);
    expect(result.success).toBe(true);
  });

  it('should export required components', async () => {
    const { NewComponent } = await import('../features/new-feature');
    expect(NewComponent).toBeDefined();
  });
});
```

## Troubleshooting

### Import Errors
If you see import errors, verify:
- The feature's `index.ts` exports the component
- The import path is correct (relative to `client/src`)
- TypeScript compilation succeeds (`npm run check`)

### Schema Validation Errors
If configuration validation fails:
- Check the error output for missing/invalid fields
- Verify the feature config matches the schema
- Ensure version follows semver format (X.Y.Z)
- Check that IDs use kebab-case

### Test Failures
If tests fail unexpectedly:
- Run `npm run check` to verify TypeScript compilation
- Check that all features are properly structured
- Verify no cross-feature internal imports exist
- Run the verification script: `npm run verify-architecture`

## Related Documentation

- [Architecture Guide](../../../docs/ARCHITECTURE.md) - Overview of the modular architecture
- [Verification Script](../../../scripts/verify-architecture.ts) - Static analysis tool
- [Feature Template](../../../scripts/templates/feature-template/) - Boilerplate for new features

## Success Criteria

All tests should pass, indicating:
- ✅ Features follow the modular architecture pattern
- ✅ Configurations are valid and complete
- ✅ Public APIs are properly exported
- ✅ Features can be independently imported and toggled
- ✅ No cross-feature internal dependencies exist
