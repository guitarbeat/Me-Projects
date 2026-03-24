# Design Document: Package Consolidation

## Overview

This design outlines the approach for consolidating the `packages/` directory structure into the main `src/` directory. The consolidation will be performed through a series of file system operations followed by import path updates across the codebase. The process prioritizes safety by detecting conflicts before making changes and preserving all existing functionality.

## Architecture

The consolidation follows a three-phase approach:

1. **Analysis Phase**: Scan both directory structures to identify conflicts and dependencies
2. **Migration Phase**: Move and merge files from packages to src
3. **Update Phase**: Update all import paths and clean up old structure

### Directory Mapping

```
packages/design-tokens/src/     → src/design-tokens/
packages/features/src/          → src/features/
packages/ui/src/                → src/components/ui/ (merge)
packages/hooks/src/             → src/hooks/ (merge)
packages/services/src/          → src/services/ (merge)
packages/styles/src/            → src/styles/ (merge)
packages/types/src/             → src/types/ (merge)
packages/utils/src/             → src/utils/ (merge)
packages/imported-project/      → (skip if empty)
```

## Components and Interfaces

### FileSystemAnalyzer

Responsible for scanning and analyzing the directory structures.

```typescript
interface FileConflict {
  packagePath: string;
  srcPath: string;
  fileName: string;
  conflictType: 'identical' | 'different';
}

interface AnalysisResult {
  uniquePackages: string[];
  conflictingDirectories: string[];
  fileConflicts: FileConflict[];
  emptyPackages: string[];
}

function analyzeDirectories(): AnalysisResult
```

### FileMigrator

Handles the actual file and directory operations.

```typescript
interface MigrationPlan {
  source: string;
  destination: string;
  operation: 'move' | 'merge' | 'skip';
}

function createMigrationPlan(analysis: AnalysisResult): MigrationPlan[]
function executeMigration(plan: MigrationPlan[]): MigrationResult
```

### ImportPathUpdater

Updates import statements across the codebase.

```typescript
interface ImportMapping {
  oldPath: string;
  newPath: string;
}

function generateImportMappings(): ImportMapping[]
function updateImportsInFile(filePath: string, mappings: ImportMapping[]): void
function updateAllImports(mappings: ImportMapping[]): void
```

## Data Models

### Package Structure

```typescript
interface PackageInfo {
  name: string;
  path: string;
  hasNodeModules: boolean;
  hasPackageJson: boolean;
  files: string[];
  subdirectories: string[];
}
```

### Migration Operation

```typescript
interface MigrationOperation {
  id: string;
  type: 'move' | 'merge' | 'update-imports' | 'cleanup';
  source?: string;
  destination?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  error?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: File Preservation
*For any* file in packages/*/src/, after migration that file's contents should exist in the corresponding location under src/ with identical content.
**Validates: Requirements 5.1**

### Property 2: No File Loss
*For any* file that exists before migration, after migration completes, that file should either exist in the new location or be documented as a conflict.
**Validates: Requirements 2.6, 5.1**

### Property 3: Import Path Consistency
*For any* valid import statement before migration, after import updates, the import should resolve to the same module.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Directory Structure Preservation
*For any* subdirectory structure within a package, after migration, that same structure should exist under the new parent directory.
**Validates: Requirements 5.3**

### Property 5: Cleanup Completeness
*For any* package directory, after successful migration and cleanup, the packages/ directory should not contain that package's src/ or node_modules/ directories.
**Validates: Requirements 4.1, 4.2, 4.3**

## Error Handling

### Conflict Detection

- Before any file operations, scan for naming conflicts
- If identical files exist in both locations, prefer src version and skip package version
- If different files have the same name, create a `.conflict` suffix and notify user
- Log all conflicts to a `migration-conflicts.log` file

### Rollback Strategy

- Create a backup list of all operations performed
- If critical error occurs, provide rollback instructions
- Do not attempt automatic rollback due to complexity
- Recommend using git to revert if needed

### Import Update Failures

- If an import cannot be updated automatically, log the file path
- Continue with other updates rather than failing completely
- Generate a report of files requiring manual review

## Testing Strategy

### Unit Tests

- Test file conflict detection with various scenarios
- Test import path transformation logic
- Test directory merging logic
- Test cleanup operations

### Property-Based Tests

- Generate random directory structures and verify Property 1 (File Preservation)
- Generate random file sets and verify Property 2 (No File Loss)
- Generate random import statements and verify Property 3 (Import Path Consistency)
- Generate random nested structures and verify Property 4 (Directory Structure Preservation)
- Verify Property 5 (Cleanup Completeness) after migration operations

### Integration Tests

- Test complete migration flow on a mock directory structure
- Verify import updates work across multiple file types (.ts, .tsx, .js, .jsx)
- Test handling of edge cases (empty directories, symlinks, etc.)

### Manual Verification

- After migration, run TypeScript compiler to check for import errors
- Run existing test suite to verify functionality preserved
- Manually inspect a sample of moved files
