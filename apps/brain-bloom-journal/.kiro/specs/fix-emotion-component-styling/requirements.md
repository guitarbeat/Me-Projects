# Fix Emotion Component Styling - Requirements

## Overview
After the component consolidation, the emotion tracking components have styling issues because they're using the deprecated Button/Card wrappers incorrectly with styled-components and not following the shadcn/ui component structure.

## Problem Statement
1. Components use `styled(Card)` which doesn't work properly with the React wrapper component
2. Components use `<Card>` directly without proper shadcn/ui structure (CardContent, etc.)
3. Styled-components are trying to extend wrapper components instead of base components
4. CSS variables are now properly imported, but component usage needs fixing

## User Stories

### 1. Proper Component Usage
**As a** developer  
**I want** emotion components to use shadcn/ui components correctly  
**So that** styling works as expected

**Acceptance Criteria:**
- 1.1 All `styled(Card)` instances are replaced with direct styled divs or proper shadcn/ui usage
- 1.2 All `<Card>` usage follows shadcn/ui structure with CardContent
- 1.3 Button components use correct props and variants
- 1.4 No styled-components extending wrapper components

### 2. Visual Consistency
**As a** user  
**I want** emotion tracking components to be properly styled  
**So that** the interface is usable and visually appealing

**Acceptance Criteria:**
- 2.1 All cards render with proper backgrounds and borders
- 2.2 All buttons render with correct colors and hover states
- 2.3 Typography is properly styled
- 2.4 Layout and spacing are correct

### 3. No Regressions
**As a** developer  
**I want** all existing functionality to work  
**So that** the fix doesn't break anything

**Acceptance Criteria:**
- 3.1 All TypeScript compiles without errors
- 3.2 All tests pass
- 3.3 Build completes successfully
- 3.4 No console errors in browser

## Technical Requirements

### Components to Fix
1. `src/components/emotion/EmotionTracker.tsx`
   - Replace `styled(Card)` with styled div
   - Keep all existing styled-components functionality

2. `src/components/emotion/EmotionAnalytics.tsx`
   - Replace `styled(Card)` usage
   - Fix direct `<Card>` usage to use CardContent
   - Update Button usage to use correct variants

3. `src/components/emotion/EmotionTrackingDashboard.tsx`
   - Replace `styled(Card)` with styled div
   - Fix Button component usage

### Approach
- Replace `styled(Card)` with `styled.div` and apply card styling manually
- Use shadcn/ui Card with CardContent for proper structure
- Ensure all existing styles are preserved
- Maintain all existing functionality

## Out of Scope
- Redesigning the components
- Changing functionality
- Adding new features
- Modifying other components

## Success Metrics
- Build succeeds without errors
- Dev server runs without console errors
- All components render with proper styling
- No visual regressions from original design
