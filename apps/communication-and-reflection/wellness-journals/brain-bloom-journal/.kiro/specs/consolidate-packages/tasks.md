# Implementation Plan: Package Consolidation

## Overview

This plan outlines the step-by-step implementation for consolidating the packages directory into src. The approach prioritizes safety by analyzing the structure first, then performing migrations with conflict detection, and finally updating all import paths.

## Tasks

- [x] 1. Analyze current package and src structure
  - Create a script to scan packages/ and src/ directories
  - Identify all files in each package
  - Detect naming conflicts between packages and src
  - Generate a report of what will be moved/merged
  - _Requirements: 2.6, 5.1_

- [ ]* 1.1 Write property test for conflict detection
  - **Property 2: No File Loss**
  - **Validates: Requirements 2.6, 5.1**

- [x] 2. Move unique packages to src
  - [x] 2.1 Move design-tokens package
    - Copy all files from packages/design-tokens/src/ to src/design-tokens/
    - Verify all files copied successfully
    - _Requirements: 1.1_

  - [x] 2.2 Move features package
    - Copy all files from packages/features/src/ to src/features/
    - Verify all files copied successfully
    - _Requirements: 1.2_

  - [x] 2.3 Handle imported-project package
    - Check if packages/imported-project/ is empty
    - If not empty, determine appropriate destination
    - _Requirements: 1.4_

- [ ]* 2.4 Write property test for file preservation
  - **Property 1: File Preservation**
  - **Validates: Requirements 5.1**

- [x] 3. Merge conflicting directories
  - [x] 3.1 Merge hooks directory
    - Compare packages/hooks/src/ with src/hooks/
    - Copy non-conflicting files
    - Flag any conflicts for manual review
    - _Requirements: 2.1_

  - [x] 3.2 Merge services directory
    - Compare packages/services/src/ with src/services/
    - Copy non-conflicting files
    - Flag any conflicts for manual review
    - _Requirements: 2.2_

  - [x] 3.3 Merge styles directory
    - Compare packages/styles/src/ with src/styles/
    - Copy non-conflicting files
    - Flag any conflicts for manual review
    - _Requirements: 2.3_

  - [x] 3.4 Merge types directory
    - Compare packages/types/src/ with src/types/
    - Copy non-conflicting files
    - Flag any conflicts for manual review
    - _Requirements: 2.4_

  - [x] 3.5 Merge utils directory
    - Compare packages/utils/src/ with src/utils/
    - Copy non-conflicting files
    - Flag any conflicts for manual review
    - _Requirements: 2.5_

  - [x] 3.6 Merge ui package into components/ui
    - Compare packages/ui/src/ with src/components/ui/
    - Copy non-conflicting files
    - Flag any conflicts for manual review
    - _Requirements: 1.3_

- [ ]* 3.7 Write property test for directory structure preservation
  - **Property 4: Directory Structure Preservation**
  - **Validates: Requirements 5.3**

- [x] 4. Checkpoint - Review conflicts and verify file integrity
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update import paths across codebase
  - [x] 5.1 Create import path mapping
    - Generate list of old package paths to new src paths
    - Account for all moved packages
    - _Requirements: 3.1, 3.3_

  - [x] 5.2 Update imports in TypeScript files
    - Search all .ts and .tsx files for package imports
    - Replace old paths with new src paths
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.3 Update imports in JavaScript files
    - Search all .js and .jsx files for package imports
    - Replace old paths with new src paths
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 5.4 Update imports in configuration files
    - Check vite.config.ts, tsconfig.json, etc.
    - Update any path aliases or references
    - _Requirements: 3.1, 3.4_

- [ ]* 5.5 Write property test for import path consistency
  - **Property 3: Import Path Consistency**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 6. Handle package-specific dependencies
  - [x] 6.1 Check for package.json files in packages
    - Identify any package-specific dependencies
    - Document dependencies that need to be added to root
    - _Requirements: 6.1, 6.2_

  - [x] 6.2 Update root package.json if needed
    - Add any missing dependencies to root package.json
    - Run package manager to install
    - _Requirements: 6.2_

- [x] 7. Clean up packages directory
  - [x] 7.1 Remove package src directories
    - Delete packages/*/src/ directories
    - Verify directories are empty before deletion
    - _Requirements: 4.1_

  - [x] 7.2 Remove package node_modules
    - Delete packages/*/node_modules/ directories
    - _Requirements: 4.2, 6.3_

  - [x] 7.3 Remove packages directory
    - Delete the packages/ directory itself
    - Verify all contents have been migrated
    - _Requirements: 4.3_

- [ ]* 7.4 Write property test for cleanup completeness
  - **Property 5: Cleanup Completeness**
  - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 8. Final verification
  - [x] 8.1 Run TypeScript compiler
    - Execute tsc to check for type errors
    - Verify no import resolution errors
    - _Requirements: 3.1_

  - [x] 8.2 Run existing test suite
    - Execute all existing tests
    - Verify functionality is preserved
    - _Requirements: 5.1_

  - [x] 8.3 Manual inspection
    - Review a sample of moved files
    - Check that directory structure is clean
    - Verify no orphaned files remain
    - _Requirements: 5.1, 5.3_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster completion
- Each merge operation should preserve existing src files when conflicts occur
- All import path updates should be done with search and replace to ensure consistency
- The packages directory should only be deleted after successful verification
- Git should be used to track all changes for easy rollback if needed
