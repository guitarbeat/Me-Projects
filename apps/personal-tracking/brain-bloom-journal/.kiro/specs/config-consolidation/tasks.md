# Implementation Plan: Config Consolidation

## Overview

This implementation consolidates duplicate configuration files by removing wrapper files, merging vite configurations, updating tool references, and validating configuration discovery. The approach is incremental, building from analysis through consolidation to validation.

## Tasks

- [ ] 1. Set up project structure and core interfaces
  - Create directory structure for analyzer, consolidator, updater, and validator modules
  - Define TypeScript interfaces for ConfigFileInfo, ConfigReference, ConfigMapping
  - Set up testing framework (Jest with fast-check for property-based testing)
  - _Requirements: All requirements (foundation)_

- [ ] 2. Implement configuration file analyzer
  - [ ] 2.1 Create ConfigFileAnalyzer class
    - Implement analyzeFile() to read and parse config files
    - Implement isWrapperFile() to detect re-export patterns
    - Implement findDuplicates() to identify root/config pairs
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 2.2 Write property test for wrapper file identification
    - **Property 1: Wrapper File Identification**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ] 2.3 Create DependencyScanner class
    - Implement scanPackageJson() to find config references in scripts
    - Implement scanSourceFiles() to find import statements
    - Implement findAllReferences() to aggregate all references
    - _Requirements: 4.1_
  
  - [ ]* 2.4 Write unit tests for DependencyScanner
    - Test package.json script parsing
    - Test source file scanning
    - _Requirements: 4.1_

- [ ] 3. Implement wrapper file removal
  - [ ] 3.1 Create WrapperRemover class
    - Implement removeWrappers() to delete wrapper files
    - Implement validateRemoval() to check target files remain
    - Add backup mechanism before removal
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 3.2 Write property test for wrapper removal
    - **Property 2: Wrapper Removal Preserves Targets**
    - **Validates: Requirements 1.3, 1.4**

- [ ] 4. Checkpoint - Ensure analyzer and remover tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Vite configuration merger
  - [ ] 5.1 Create ViteConfigMerger class
    - Implement compareConfigs() to identify differences
    - Implement mergeConfigs() to combine configurations
    - Implement preserveFeatures() to ensure no feature loss
    - Handle plugins, server, resolve, build, and optimizeDeps sections
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 5.2 Write property test for config difference detection
    - **Property 3: Config Difference Detection**
    - **Validates: Requirements 2.1**
  
  - [ ]* 5.3 Write property test for merge feature preservation
    - **Property 4: Merge Preserves All Features**
    - **Validates: Requirements 2.2, 7.1, 7.2, 7.3, 7.4**
  
  - [ ]* 5.4 Write property test for conflict resolution
    - **Property 5: Conflict Resolution Consistency**
    - **Validates: Requirements 7.5**
  
  - [ ]* 5.5 Write unit tests for Vite config merger
    - Test PWA configuration preservation
    - Test build optimization settings
    - Test plugin combination
    - _Requirements: 2.3_

- [ ] 6. Implement TypeScript configuration adjuster
  - [ ] 6.1 Create TsConfigAdjuster class
    - Implement adjustPaths() to transform path aliases based on location
    - Implement validatePaths() to check path correctness
    - Handle project references validation
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 6.2 Write property test for path adjustment
    - **Property 7: TypeScript Path Adjustment**
    - **Validates: Requirements 5.2**
  
  - [ ]* 6.3 Write property test for project reference validation
    - **Property 8: Project Reference Validation**
    - **Validates: Requirements 5.3**
  
  - [ ]* 6.4 Write unit tests for edge cases
    - Test various path alias formats
    - Test missing reference files
    - _Requirements: 5.2, 5.3_

- [ ] 7. Checkpoint - Ensure merger and adjuster tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement package.json and tool config updaters
  - [ ] 8.1 Create PackageJsonUpdater class
    - Implement updateScripts() to transform config paths in scripts
    - Implement addToolConfigs() to add fallback configurations
    - Preserve script functionality while updating paths
    - _Requirements: 4.2, 3.6_
  
  - [ ]* 8.2 Write property test for package.json path updates
    - **Property 6: Package.json Path Updates**
    - **Validates: Requirements 4.1, 4.2**
  
  - [ ] 8.3 Create ToolConfigUpdater class
    - Implement configureEslint() to set ESLint config path
    - Implement configureVite() to set Vite config path
    - Implement configureTailwind() to set Tailwind config path
    - Implement configurePostCSS() to set PostCSS config path
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  
  - [ ]* 8.4 Write property test for fallback configuration
    - **Property 10: Fallback Configuration Completeness**
    - **Validates: Requirements 3.6**

- [ ] 9. Implement configuration discovery validator
  - [ ] 9.1 Create ConfigDiscoveryValidator class
    - Implement validateEslint() to check ESLint config discovery
    - Implement validateVite() to check Vite config discovery
    - Implement validateTypeScript() to check TS config discovery
    - Implement validatePostCSS() to check PostCSS config discovery
    - Implement validateTailwind() to check Tailwind config discovery
    - Implement validateAll() to run all validations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 9.2 Write property test for tool configuration validation
    - **Property 9: Tool Configuration Validation**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6**
  
  - [ ]* 9.3 Write unit tests for validation error reporting
    - Test error messages for missing configs
    - Test success cases for found configs
    - _Requirements: 6.6_

- [ ] 10. Implement main consolidation orchestrator
  - [ ] 10.1 Create ConsolidationOrchestrator class
    - Wire together analyzer, remover, merger, adjuster, updater, and validator
    - Implement main consolidate() method with step-by-step execution
    - Add backup and rollback mechanism
    - Implement error handling and reporting
    - _Requirements: All requirements_
  
  - [ ] 10.2 Add logging and progress reporting
    - Log each consolidation step
    - Report files being processed
    - Show validation results
    - _Requirements: All requirements_

- [ ] 11. Create CLI interface
  - [ ] 11.1 Implement command-line interface
    - Add argument parsing for dry-run mode
    - Add interactive confirmation prompts
    - Display consolidation plan before execution
    - Show validation results after consolidation
    - _Requirements: All requirements_
  
  - [ ]* 11.2 Write integration tests for CLI
    - Test dry-run mode
    - Test full consolidation workflow
    - Test rollback on validation failure
    - _Requirements: All requirements_

- [ ] 12. Final checkpoint - Run full integration tests
  - Ensure all tests pass, ask the user if questions arise.
  - Verify consolidation works on test project structure
  - Verify all tools can discover configurations
  - Test rollback mechanism

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations each
- Unit tests validate specific examples and edge cases
- Integration tests verify the complete workflow with actual tools
