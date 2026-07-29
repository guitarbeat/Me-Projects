# Component Documentation

This document describes the main React components used in Flo and Tell.

## Core Components

### `Calendar` (`src/components/Calendar.tsx`)

The main calendar component that displays the period tracking interface.

**Features:**

- Monthly calendar view with navigation
- Click-to-toggle period days
- Visual indicators for period days vs regular days
- Integration with user authentication and data persistence

**Props:** None (accesses data through context)

**Dependencies:**

- UI primitives like `Card`, `Button`, `GradientButton`, and `LoadingSpinner`
- Icons from `lucide-react` (`Eye`, `EyeOff`)
- `showSuccessToast` helper for feedback messaging
- `useAuth` and `useProfile` contexts for user data
- `usePeriodTracking` hook for cycle data management
- `useExistingUsers` and `useCalendarNavigation` hooks for supporting data and navigation
- Child components including `ProfileEditor`, `FloatingUserBubbles`, `UserCalendar`, and `PeriodStatusCard`

### `Auth` (`src/components/Auth.tsx`)

Handles user authentication and account creation.

**Features:**

- Anonymous authentication flow
- Username selection and display name setup
- Profile creation and management
- Sign-in/sign-out functionality

### `AdminDashboard` (`src/components/AdminDashboard.tsx`)

Admin-only interface for user management and data overview.

**Features:**

- User list with role management
- Bulk user operations (delete, role changes)
- Calendar view for any user's data
- User statistics and analytics

**Access:** Requires admin role

### `ProfileEditor` (`src/components/ProfileEditor.tsx`)

User profile editing interface.

**Features:**

- Display name editing
- Avatar selection from cat options
- Profile picture updates
- Account deletion functionality

## UI Components

### Calendar Components

#### `CalendarHeader` (`src/components/CalendarHeader.tsx`)

Navigation header for the calendar view.

**Props:**

- `currentDate: Date` - Currently displayed month
- `onNavigate: (date: Date) => void` - Navigation callback
- `onToday: () => void` - Today button callback

#### `WeekdayHeaders` (`src/components/WeekdayHeaders.tsx`)

Displays weekday labels above the calendar grid.

**Features:**

- Responsive design
- Internationalization support
- Proper accessibility labels

### Interactive Components

#### `FloatingUserBubbles` (`src/components/FloatingUserBubbles.tsx`)

Animated floating bubbles showing user avatars.

**Features:**

- Physics-based animation system
- Mouse interaction and hover effects
- Performance monitoring and debugging
- Responsive design for mobile/desktop

**Props:**

- `userProfiles?: UserProfile[]` - Array of user profiles to display
- `onAutofill?: (username: string) => void` - Callback triggered when a username should be autofilled

### Utility Components

#### `DarkModeToggle` (`src/components/DarkModeToggle.tsx`)

Theme switching component.

**Features:**

- Light/dark mode toggle
- Persistent theme preference
- System theme detection
- Smooth transitions

#### `LazyComponents` (`src/components/LazyComponents.tsx`)

Lazy-loaded component definitions for performance optimization.

**Exported Components:**

- `LazyAdminDashboard` - Lazy-loaded admin dashboard
- `LazyProfileEditor` - Lazy-loaded profile editor
- `LazyBubblePerformanceMonitor` - Lazy-loaded performance monitor

## Bubble System Components

### `FloatingBubble` (`src/components/bubbles/FloatingBubble.tsx`)

Individual bubble component with physics and animations.

**Props:**

- `bubble: BubbleState` - Bubble state and properties
- `profile: UserProfile` - Profile information used to render the bubble content
- `onAutofill: (username: string) => void` - Callback invoked when the bubble is clicked

**Features:**

- CSS transforms for positioning
- Hover state management
- Performance optimized rendering
- Accessibility support

### Physics and Debug Components

#### `BubblePerformanceMonitor` (`src/components/BubblePerformanceMonitor.tsx`)

Development tool for monitoring bubble physics performance.

**Features:**

- Real-time metrics display
- Performance graphs and charts
- Debug information overlay
- Test scenario execution

#### `DebugPanel` (`src/components/DebugPanel.tsx`)

Comprehensive debugging interface for development.

**Features:**

- Log viewing and filtering
- Component state inspection
- Performance metrics
- Network request monitoring

## Context Providers

### `AuthContext` (`src/contexts/AuthContext.tsx`)

Provides authentication state and functions throughout the app.

**Exported:**

- `AuthProvider` - Context provider component
- `useAuth` - Hook to access auth context

**State:**

- `user: User | null` - Current authenticated user
- `profile: Profile | null` - User profile data
- `loading: boolean` - Authentication loading state

## Custom Hooks

### `usePeriodTracking` (`src/hooks/usePeriodTracking.ts`)

Manages period tracking data and operations.

**Returns:**

- `periodDays: string[]` - Array of period dates
- `togglePeriodDay: (date: string) => void` - Toggle function
- `loading: boolean` - Loading state
- `error: Error | null` - Error state

### `useProfile` (`src/hooks/useProfile.ts`)

Exposes the authenticated user's profile data that is maintained by `AuthContext`.

**Returns:**

- `profile: UserProfile | null` - Current profile derived from the signed-in user
- `loading: boolean` - Loading state shared with the auth provider
- `refreshProfile: () => void` - Re-syncs profile data from persisted auth state

### `useExistingUsers` (`src/hooks/useExistingUsers.ts`)

Fetches and manages the list of existing users for bubbles.

**Returns:**

- `users: UserProfile[]` - Array of user profiles
- `loading: boolean` - Loading state
- `refetch: () => void` - Manual refetch function

## Styling and Theming

### CSS Classes

The app uses Tailwind CSS with custom design tokens:

**Colors:**

- `rose-pink` - Primary brand color (#FFB6C1)
- `cream` - Secondary background (#F5F5DC)
- `mint` - Accent color (#98FB98)

**Fonts:**

- `font-quicksand` - Primary font family (Quicksand)

### Dark Mode

- All components support dark mode through CSS classes
- Theme switching handled by `next-themes`
- Custom dark mode color variations

## Accessibility

### Standards Compliance

- WCAG 2.1 AA compliance target
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support

### Screen Reader Support

- Descriptive alt text for images
- Proper heading hierarchy
- Live regions for dynamic content updates
- Form labels and error messages

## Performance Considerations

### Optimization Techniques

- Lazy loading for non-critical components
- React.memo for expensive renders
- Virtual scrolling for large lists
- Efficient state management

### Bundle Splitting

- Admin dashboard loaded separately
- Debug components excluded from production
- UI components tree-shaken automatically

## Testing

### Test Coverage

- Unit tests for utility functions
- Component tests with React Testing Library
- Integration tests for user flows
- E2E tests for critical paths

### Test Utilities

See `src/test/test-utils.tsx` for testing helpers that provide:

- AuthProvider wrapper
- QueryClient setup
- Mock data generators

## Development Guidelines

### Component Creation

1. Use TypeScript interfaces for props
2. Include JSDoc comments for complex components
3. Handle loading and error states
4. Follow accessibility best practices
5. Include unit tests

### Performance Best Practices

1. Use React.memo for expensive components
2. Minimize prop drilling with context
3. Lazy load non-critical components
4. Optimize images and assets
5. Monitor bundle size

---

_For component-specific implementation details, see the source code and inline comments._
_For testing components, see [CONTRIBUTING.md](../CONTRIBUTING.md)._
