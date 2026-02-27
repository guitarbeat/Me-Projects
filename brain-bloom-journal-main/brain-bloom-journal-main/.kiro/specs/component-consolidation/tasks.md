# Implementation Plan: Component Consolidation

## Overview

This plan consolidates duplicate and similar components in three phases: Quick Wins (wrappers), Component Merges (emotion/N8N), and Standardization (UI components).

## Tasks

- [x] Phase 1: Quick Wins
  - [x] 1.1 Remove VueCalWrapper re-export
    - Delete src/components/VueCalWrapper.tsx
    - Find all imports of VueCalWrapper
    - Update imports to use Calendar/VueCalWrapper directly
    - Run tests to verify no broken imports
    - _Requirements: 1.1, 1.3, 7.1_
  
  - [x] 1.2 Remove ErrorBoundaryWrapper
    - Export HOC from common/ErrorBoundary.tsx
    - Delete src/components/ErrorBoundaryWrapper.tsx
    - Find and update all imports
    - Update tests
    - _Requirements: 1.1, 1.3, 7.1_
  
  - [x] 1.3 Consolidate loading components
    - Add fullScreen prop to common/LoadingSpinner.tsx
    - Update LoadingSpinner to support both variants
    - Delete src/components/LoadingScreen.tsx
    - Find and update all LoadingScreen imports
    - Update tests
    - _Requirements: 3.1, 3.2, 3.3, 7.1_
  
  - [x] 1.4 Merge calendar components
    - Merge Calendar.tsx functionality into EmotionalCalendar.tsx
    - Rename EmotionalCalendar.tsx to Calendar.tsx
    - Delete old Calendar.tsx
    - Update imports
    - Update tests
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1_
  
  - [x] 1.5 Verify Phase 1
    - Run full test suite
    - Run build
    - Verify no broken imports
    - Commit Phase 1 changes
    - _Requirements: 7.3, 8.2_

- [ ] Phase 2: Component Merges
  - [x] 2.1 Create emotion component structure
    - Create src/components/emotion/ directory
    - Create emotion/shared/ subdirectory
    - _Requirements: 5.1_
  
  - [x] 2.2 Extract shared emotion components
    - Create emotion/shared/EmotionGrid.tsx
    - Create emotion/shared/PatternCard.tsx
    - Create emotion/shared/types.ts
    - Extract common styled components
    - _Requirements: 5.5_
  
  - [x] 2.3 Consolidate emotion tracker
    - Merge AdvancedEmotionTracker + PerformanceOptimizedEmotionTracker
    - Create emotion/EmotionTracker.tsx
    - Use shared EmotionGrid component
    - Include performance optimizations
    - _Requirements: 5.1, 5.2_
  
  - [x] 2.4 Consolidate emotion analytics
    - Merge EmotionInsights + analytics from other components
    - Create emotion/EmotionAnalytics.tsx
    - Use shared PatternCard component
    - _Requirements: 5.1, 5.3_
  
  - [x] 2.5 Update emotion dashboard
    - Move EmotionTrackingDashboard to emotion/
    - Update imports to use new consolidated components
    - _Requirements: 5.4_
  
  - [x] 2.6 Delete old emotion components
    - Delete AdvancedEmotionTracker.tsx
    - Delete EmotionInsights.tsx
    - Delete PerformanceOptimizedEmotionTracker.tsx
    - _Requirements: 5.1_
  
  - [x] 2.7 Update emotion component imports
    - Find all imports of old emotion components
    - Update to use new consolidated components
    - Update props if needed
    - _Requirements: 7.1, 7.2_
  
  - [x] 2.8 Update emotion tests
    - Update or merge test files
    - Update test mocks
    - Ensure all tests pass
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 2.9 Create N8N component structure
    - Create src/components/n8n/ directory
    - Create n8n/shared/ subdirectory
    - _Requirements: 6.1_
  
  - [x] 2.10 Extract shared N8N components
    - Create n8n/shared/N8NAlert.tsx
    - Create n8n/shared/N8NStatus.tsx
    - Create n8n/shared/mockData.ts
    - _Requirements: 6.2_
  
  - [x] 2.11 Consolidate N8N integration
    - Merge N8NDashboard + N8NDataExport + N8NWorkflowManager
    - Create n8n/N8NIntegration.tsx
    - Use shared Alert and Status components
    - _Requirements: 6.1, 6.3, 6.4_
  
  - [x] 2.12 Move N8N config and demo
    - Move N8NConfigPanel to n8n/
    - Move N8NDemo to n8n/
    - _Requirements: 6.1_
  
  - [x] 2.13 Delete old N8N components
    - Delete N8NDashboard.tsx
    - Delete N8NDataExport.tsx
    - Delete N8NWorkflowManager.tsx
    - _Requirements: 6.1_
  
  - [x] 2.14 Update N8N component imports
    - Find all imports of old N8N components
    - Update to use new consolidated components
    - _Requirements: 7.1, 7.2_
  
  - [x] 2.15 Update N8N tests
    - Update or merge test files
    - Update test mocks
    - Ensure all tests pass
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 2.16 Verify Phase 2
    - Run full test suite
    - Run build
    - Verify no broken imports
    - Commit Phase 2 changes
    - _Requirements: 7.3, 8.2_

- [ ] Phase 3: UI Component Standardization
  - [x] 3.1 Document UI component standard
    - Document decision to use shadcn/ui
    - Create migration guide
    - Update PROJECT_STRUCTURE.md
    - _Requirements: 4.3_
  
  - [x] 3.2 Create compatibility wrappers
    - Create common/Button.tsx wrapper
    - Create common/Card.tsx wrapper
    - Add deprecation warnings
    - _Requirements: 4.2_
  
  - [x] 3.3 Update component documentation
    - Add JSDoc deprecation notices
    - Update README with new component usage
    - Document migration path
    - _Requirements: 4.4_
  
  - [ ] 3.4 Gradual migration (optional)
    - Identify high-priority files to migrate
    - Update imports to use ui/ components
    - Test each migration
    - _Requirements: 4.1_
  
  - [x] 3.5 Verify Phase 3
    - Run full test suite
    - Run build
    - Verify compatibility wrappers work
    - Commit Phase 3 changes
    - _Requirements: 7.3, 8.2_

- [ ] Final Verification
  - [x] 4.1 Run complete test suite
    - Ensure all tests pass
    - Verify test coverage maintained
    - _Requirements: 8.2, 8.3_
  
  - [x] 4.2 Run build and typecheck
    - Verify TypeScript compilation
    - Verify production build
    - _Requirements: 7.3_
  
  - [x] 4.3 Update documentation
    - Update component documentation
    - Update import examples
    - Document new structure
    - _Requirements: 4.3, 4.4_
  
  - [x] 4.4 Create consolidation summary
    - Document files deleted
    - Document files moved
    - Document code reduction metrics
    - _Requirements: All_

## Notes

- Each phase should be committed separately
- Run tests after each task
- Phase 1 is low-risk and should be completed first
- Phase 2 requires more careful testing
- Phase 3 can be done gradually over time
- Use smartRelocate for file moves when possible
- Update tests immediately after component changes
