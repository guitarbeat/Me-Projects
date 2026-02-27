# Implementation Plan: Documentation Consolidation

## Overview

This plan implements a TypeScript-based consolidation script that analyzes, merges, and removes duplicate ERROR_HANDLING.md files. The script will be executable via Node.js and will handle all aspects of the consolidation process including file comparison, content merging, reference updates, and verification.

## Tasks

- [x] 1. Set up project structure and core types
  - Create scripts/consolidate-docs.ts file
  - Define TypeScript interfaces for ComparisonResult, ConsolidationResult, UpdateResult, and VerificationResult
  - Set up file path constants
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 2. Implement File Analyzer
  - [x] 2.1 Create file comparison function
    - Implement compareFiles function that reads both files
    - Compare content and identify differences
    - Return ComparisonResult with identical flag and differences list
    - _Requirements: 1.1, 1.3_
  
  - [ ]* 2.2 Write property test for file comparison
    - **Property 1: File comparison identifies all differences**
    - **Validates: Requirements 1.1, 1.3**
  
  - [ ]* 2.3 Write unit tests for file comparison
    - Test identical files return identical: true
    - Test different files return differences list
    - Test file not found error handling
    - _Requirements: 1.1, 1.3_

- [ ] 3. Implement File Consolidator
  - [x] 3.1 Create content merging logic
    - Implement consolidate function
    - Handle identical files (keep target, remove source)
    - Handle different files (merge unique content)
    - Preserve markdown formatting
    - _Requirements: 2.1, 2.3, 2.4_
  
  - [x] 3.2 Implement file and directory removal
    - Remove source file after successful merge
    - Check if src/docs directory is empty
    - Remove empty directory safely
    - Verify no other files exist before removal
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 3.3 Write property test for content merging
    - **Property 2: Content merging preserves all unique content**
    - **Validates: Requirements 2.1**
  
  - [ ]* 3.4 Write property test for formatting preservation
    - **Property 3: Formatting preservation during consolidation**
    - **Validates: Requirements 2.4**
  
  - [ ]* 3.5 Write property test for safe directory removal
    - **Property 4: Safe directory removal**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 3.6 Write unit tests for consolidation
    - Test empty directory removal
    - Test non-empty directory preservation
    - Test error handling for permission errors
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Checkpoint - Ensure core consolidation logic works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement Reference Updater
  - [x] 5.1 Create reference search function
    - Implement findReferences function
    - Scan all project files for old path references
    - Exclude node_modules, .git, build directories
    - Handle markdown, TypeScript, JavaScript, and config files
    - _Requirements: 4.1, 4.3_
  
  - [x] 5.2 Create reference update function
    - Implement updateReferences function
    - Replace old path with new path in found files
    - Preserve surrounding context and formatting
    - Return UpdateResult with files updated count
    - _Requirements: 4.2, 4.4_
  
  - [ ]* 5.3 Write property test for reference search
    - **Property 5: Reference search completeness**
    - **Validates: Requirements 4.1, 4.3**
  
  - [ ]* 5.4 Write property test for reference updates
    - **Property 6: Reference update correctness**
    - **Validates: Requirements 4.2**
  
  - [ ]* 5.5 Write unit tests for reference updater
    - Test no references found case
    - Test references in different file types
    - Test error handling for file read/write errors
    - _Requirements: 4.1, 4.2, 4.4_

- [ ] 6. Implement Verification Module
  - [x] 6.1 Create verification function
    - Implement verify function
    - Check target file exists and has content
    - Check source file is removed
    - Check src/docs directory is removed
    - Check no old path references remain
    - Return VerificationResult with all checks
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 6.2 Write property test for verification
    - **Property 7: Verification completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
  
  - [ ]* 6.3 Write unit tests for verification
    - Test successful verification
    - Test failed verification scenarios
    - Test partial completion detection
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7. Implement main script orchestration
  - [x] 7.1 Create main execution function
    - Implement main function that orchestrates all steps
    - Add error handling and rollback logic
    - Add logging for each step
    - Add command-line interface for dry-run mode
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
  
  - [x] 7.2 Add comprehensive error handling
    - Handle file system errors (not found, permissions)
    - Handle encoding errors
    - Implement rollback on failure
    - Log all operations for debugging
    - _Requirements: All_
  
  - [ ]* 7.3 Write integration tests
    - Test complete consolidation workflow
    - Test rollback on errors
    - Test dry-run mode
    - _Requirements: All_

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add script execution setup
  - Add npm script to package.json for running consolidation
  - Add README section documenting how to run the script
  - Test script execution from command line
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations each
- Unit tests validate specific examples and edge cases
- The script should support a --dry-run flag to preview changes without making them
- All file operations should be logged for debugging and verification
