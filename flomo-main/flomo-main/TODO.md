# TODO - Duplicate State Management & Code Quality Issues

## 🔄 Duplicate State Management Issues

### 1. Multiple Loading States (8 instances)

**Problem**: Each component/hook manages its own loading state independently, leading to inconsistent UX and potential race conditions.

**Files affected:**

- `src/contexts/AuthContext.tsx` - `loading` state
- `src/hooks/useProfile.ts` - `loading` state
- `src/hooks/usePeriodTracking.ts` - `loading` state
- `src/hooks/useExistingUsers.ts` - `loading` state
- `src/components/AdminDashboard.tsx` - `loading` and `processing` states
- `src/components/Auth.tsx` - `loading` state
- `src/components/AICycleInsights.tsx` - `loading` state
- `src/components/DeleteAccountDialog.tsx` - `loading` state

**TODO:**

- [ ] Create centralized loading state management
- [ ] Implement global loading context or use state management library
- [ ] Remove duplicate loading states from individual components
- [ ] Ensure consistent loading UX across the app

### 2. Duplicate User Data Management

**Problem**: User data is scattered across multiple contexts and hooks, leading to potential inconsistencies and unnecessary re-fetches.

**Files affected:**

- `src/contexts/AuthContext.tsx` - Manages `user`, `session`, `isAdmin`
- `src/hooks/useProfile.ts` - Fetches and manages profile data separately
- `src/hooks/useExistingUsers.ts` - Manages user profiles list
- `src/components/AdminDashboard.tsx` - Has its own user management state

**TODO:**

- [ ] Consolidate all user data management into AuthContext
- [ ] Remove duplicate user state from useProfile hook
- [ ] Refactor AdminDashboard to use centralized user state
- [ ] Ensure single source of truth for user data

### 3. Duplicate Profile Fetching Logic

**Problem**: Profile data is fetched in multiple places, potentially causing unnecessary API calls.

**Files affected:**

- `src/hooks/useProfile.ts` - Fetches profile data
- `src/contexts/AuthContext.tsx` - Also has user data management
- `src/lib/authUtils.ts` - Has `get_user_profile_by_id` calls

**TODO:**

- [ ] Centralize profile fetching in AuthContext
- [ ] Remove duplicate profile fetching from useProfile
- [ ] Update authUtils to use centralized profile data
- [ ] Implement profile data caching to prevent unnecessary API calls

### 4. Inconsistent Error Handling Patterns

**Problem**: Inconsistent error handling leads to poor UX and makes debugging difficult.

**Files affected:**

- `src/components/Auth.tsx` - Uses `useState` for `errors` and `authError` states
- Various components - Some use toast notifications, others use local state
- No centralized error state management

**TODO:**

- [ ] Create centralized error management system
- [ ] Standardize error handling across all components
- [ ] Implement consistent error UI patterns
- [ ] Add error logging and monitoring

### 5. Duplicate Data Refresh Patterns

**Problem**: Multiple refresh functions doing similar data loading without coordination.

**Files affected:**

- `src/components/AdminDashboard.tsx` - `loadAllData()` function
- `src/hooks/useProfile.ts` - `fetchProfile()` function
- `src/hooks/usePeriodTracking.ts` - `loadPeriodData()` function
- `src/hooks/useProfile.ts` - `refreshProfile()` function

**TODO:**

- [ ] Create centralized data refresh system
- [ ] Implement coordinated data loading
- [ ] Remove duplicate refresh functions
- [ ] Add refresh state management

### 6. Duplicate Form State Management

**Problem**: Form state logic is duplicated instead of being abstracted into reusable hooks.

**Files affected:**

- `src/components/Auth.tsx` - Manages form data, errors, loading
- `src/components/ProfileEditor.tsx` - Similar form state management patterns

**TODO:**

- [ ] Create reusable form state management hooks
- [ ] Abstract common form patterns (validation, error handling, loading)
- [ ] Refactor Auth and ProfileEditor to use shared form hooks
- [ ] Implement form state persistence where needed

## 🏗️ Architectural Improvements

### 7. State Management Architecture

**TODO:**

- [ ] Evaluate need for state management library (Zustand, Redux Toolkit, etc.)
- [ ] Design centralized state architecture
- [ ] Implement state persistence strategy
- [ ] Add state debugging tools

### 8. API Data Management

**TODO:**

- [ ] Implement data caching strategy
- [ ] Add request deduplication
- [ ] Create API error retry logic
- [ ] Implement optimistic updates where appropriate

### 9. Component State Optimization

**TODO:**

- [ ] Audit component re-renders
- [ ] Implement React.memo where beneficial
- [ ] Optimize useEffect dependencies
- [ ] Add performance monitoring

## 🧪 Testing & Quality

### 10. State Management Testing

**TODO:**

- [ ] Add tests for centralized state management
- [ ] Test error handling scenarios
- [ ] Add integration tests for data flow
- [ ] Implement state management debugging tools

### 11. Code Quality Improvements

**TODO:**

- [ ] Add ESLint rules for state management patterns
- [ ] Create state management documentation
- [ ] Add code review checklist for state management
- [ ] Implement automated state management checks

## 📊 Priority Levels

**High Priority:**

- Duplicate loading states (causes UX issues)
- Duplicate user data management (causes data inconsistencies)
- Inconsistent error handling (affects debugging)

**Medium Priority:**

- Duplicate profile fetching (performance impact)
- Duplicate data refresh patterns (maintenance burden)
- Form state management abstraction (code reusability)

**Low Priority:**

- Architectural improvements
- Testing enhancements
- Code quality tooling

## 🎯 Success Criteria

- [ ] Single source of truth for all application state
- [ ] Consistent loading states across the application
- [ ] Centralized error handling with consistent UX
- [ ] Eliminated duplicate API calls and data fetching
- [ ] Reusable form state management patterns
- [ ] Improved code maintainability and debugging
- [ ] Better performance through optimized state management
