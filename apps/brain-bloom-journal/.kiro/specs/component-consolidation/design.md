# Design Document: Component Consolidation

## Overview

This design implements a phased approach to consolidating duplicate and similar components, starting with quick wins (wrappers and simple merges) and progressing to more complex consolidations (emotion tracking, N8N components).

## Consolidation Strategy

### Phase 1: Quick Wins (Low Risk, High Impact)
Remove unnecessary wrappers and merge simple duplicates.

### Phase 2: Component Merges (Medium Risk, High Impact)
Consolidate emotion tracking and N8N components.

### Phase 3: Standardization (High Risk, Very High Impact)
Standardize on single UI component library.

## Phase 1: Quick Wins

### 1.1 Remove VueCalWrapper Re-export

**Current State:**
```
src/components/VueCalWrapper.tsx (1 line - re-export)
src/components/Calendar/VueCalWrapper.tsx (actual implementation)
```

**Action:**
- Delete `src/components/VueCalWrapper.tsx`
- Update imports from `../VueCalWrapper` to `../Calendar/VueCalWrapper`

**Files to Update:**
- Search for: `from ['"].*VueCalWrapper['"]`
- Update to: `from './Calendar/VueCalWrapper'` or appropriate relative path

### 1.2 Remove ErrorBoundaryWrapper

**Current State:**
```typescript
// ErrorBoundaryWrapper.tsx - thin wrapper
export const ErrorBoundaryWrapper = (Component) => (props) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);
```

**Action:**
- Delete `src/components/ErrorBoundaryWrapper.tsx`
- Export HOC directly from `common/ErrorBoundary.tsx`
- Update imports

### 1.3 Consolidate Loading Components

**Current State:**
- `LoadingScreen.tsx` - Full screen loading
- `common/LoadingSpinner.tsx` - Inline spinner

**New Implementation:**
```typescript
// common/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  size = 'md',
  message
}) => {
  if (fullScreen) {
    return (
      <FullScreenContainer>
        <Spinner size={size} />
        {message && <Message>{message}</Message>}
      </FullScreenContainer>
    );
  }
  
  return <Spinner size={size} />;
};
```

**Action:**
- Add `fullScreen` prop to LoadingSpinner
- Delete `LoadingScreen.tsx`
- Update imports: `LoadingScreen` → `LoadingSpinner` with `fullScreen` prop

### 1.4 Merge Calendar Components

**Current State:**
- `Calendar/Calendar.tsx` - Simple wrapper
- `Calendar/EmotionalCalendar.tsx` - Full implementation with forwardRef

**Action:**
- Merge functionality into `Calendar/EmotionalCalendar.tsx`
- Rename to `Calendar/Calendar.tsx`
- Delete old Calendar.tsx
- Update imports

## Phase 2: Component Merges

### 2.1 Consolidate Emotion Tracking Components

**Target Structure:**
```
src/components/emotion/
├── EmotionTracker.tsx          # Core logging UI
├── EmotionAnalytics.tsx        # Analytics and insights
├── EmotionTrackingDashboard.tsx # Orchestrator
└── shared/
    ├── EmotionGrid.tsx         # Shared emotion selection UI
    ├── PatternCard.tsx         # Shared styled components
    └── types.ts                # Shared types
```

**EmotionTracker.tsx** (Consolidates AdvancedEmotionTracker + PerformanceOptimizedEmotionTracker):
- Emotion selection grid
- Intensity slider
- Performance optimizations (debounce, throttle)
- Event logging

**EmotionAnalytics.tsx** (Consolidates EmotionInsights + analytics from others):
- Pattern detection
- Statistics display
- Insights generation
- Trend analysis

**EmotionTrackingDashboard.tsx** (Keep as orchestrator):
- Tab navigation
- Imports EmotionTracker and EmotionAnalytics
- Manages state coordination

### 2.2 Consolidate N8N Components

**Target Structure:**
```
src/components/n8n/
├── N8NConfigPanel.tsx          # Configuration (keep as-is)
├── N8NIntegration.tsx          # Unified dashboard + export + workflows
├── N8NDemo.tsx                 # Demo/landing (keep as-is)
└── shared/
    ├── N8NAlert.tsx            # Shared alert component
    ├── N8NStatus.tsx           # Shared status indicator
    └── mockData.ts             # Mock data generator
```

**N8NIntegration.tsx** (Merges N8NDashboard + N8NDataExport + N8NWorkflowManager):
- Tab-based interface
- Export functionality
- Workflow management
- Status display
- Quick actions

## Phase 3: UI Component Standardization

### 3.1 Choose Standard: shadcn/ui

**Rationale:**
- Modern, accessible components
- Tailwind-based (matches project)
- Better TypeScript support
- Active maintenance
- Composable architecture

**Migration Strategy:**
```typescript
// common/Button.tsx - Compatibility wrapper
import { Button as UIButton } from '../ui/button';

/**
 * @deprecated Use Button from '@/components/ui/button' instead
 */
export const Button = UIButton;
```

### 3.2 Deprecation Path

1. **Phase 3.1:** Create compatibility wrappers
2. **Phase 3.2:** Add deprecation warnings (console.warn in dev)
3. **Phase 3.3:** Update documentation
4. **Phase 3.4:** Gradual migration of imports
5. **Phase 3.5:** Remove deprecated components

## File Movement Plan

### Deletions
- `src/components/VueCalWrapper.tsx`
- `src/components/ErrorBoundaryWrapper.tsx`
- `src/components/LoadingScreen.tsx`
- `src/components/Calendar/Calendar.tsx` (after merge)

### Moves
- `AdvancedEmotionTracker.tsx` → `emotion/EmotionTracker.tsx` (refactored)
- `EmotionInsights.tsx` → `emotion/EmotionAnalytics.tsx` (refactored)
- `PerformanceOptimizedEmotionTracker.tsx` → (merged into EmotionTracker)
- `EmotionTrackingDashboard.tsx` → `emotion/EmotionTrackingDashboard.tsx`
- `N8NDashboard.tsx` → `n8n/N8NIntegration.tsx` (refactored)
- `N8NDataExport.tsx` → (merged into N8NIntegration)
- `N8NWorkflowManager.tsx` → (merged into N8NIntegration)

### New Files
- `emotion/shared/EmotionGrid.tsx`
- `emotion/shared/PatternCard.tsx`
- `emotion/shared/types.ts`
- `n8n/shared/N8NAlert.tsx`
- `n8n/shared/N8NStatus.tsx`
- `n8n/shared/mockData.ts`

## Import Update Strategy

### Automated Updates
Use `smartRelocate` for file moves to auto-update imports.

### Manual Updates Required
- Component renames (e.g., LoadingScreen → LoadingSpinner)
- Prop changes (e.g., adding `fullScreen` prop)
- Merged components (multiple imports → single import)

### Search Patterns
```bash
# Find VueCalWrapper imports
from ['"].*VueCalWrapper['"]

# Find LoadingScreen imports
from ['"].*LoadingScreen['"]

# Find ErrorBoundaryWrapper imports
from ['"].*ErrorBoundaryWrapper['"]

# Find emotion component imports
from ['"].*AdvancedEmotionTracker['"]
from ['"].*EmotionInsights['"]
from ['"].*PerformanceOptimizedEmotionTracker['"]

# Find N8N component imports
from ['"].*N8NDashboard['"]
from ['"].*N8NDataExport['"]
from ['"].*N8NWorkflowManager['"]
```

## Testing Strategy

### Phase 1 Testing
- Run existing tests after each deletion/merge
- Update test mocks for consolidated components
- Verify no broken imports

### Phase 2 Testing
- Update emotion tracking tests
- Update N8N component tests
- Add integration tests for consolidated components

### Phase 3 Testing
- Test compatibility wrappers
- Verify gradual migration doesn't break existing code
- Update all component tests to use new imports

## Risk Mitigation

1. **Incremental Changes:** One consolidation at a time
2. **Git Commits:** Commit after each successful consolidation
3. **Test Coverage:** Run tests after each change
4. **Rollback Plan:** Each phase can be reverted independently
5. **Documentation:** Update docs as components change

## Success Metrics

- **Code Reduction:** 30-40% fewer lines in components/
- **File Reduction:** 40+ files → 28-32 files
- **Test Coverage:** Maintain or improve current coverage
- **Build Time:** No significant increase
- **Zero Regressions:** All existing functionality preserved
