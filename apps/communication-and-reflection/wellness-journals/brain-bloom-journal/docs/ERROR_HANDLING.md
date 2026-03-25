# Error Handling System

This document describes the comprehensive error handling system implemented to improve user experience and debugging capabilities.

## Overview

The error handling system provides:
- Centralized error classification and messaging
- User-friendly error messages with actionable guidance
- Comprehensive error logging and monitoring
- Retry mechanisms for recoverable errors
- Fallback states for better user experience
- Debug dashboard for development and monitoring

## Core Components



### 1. Error Classification (`/src/lib/error/error-handling.ts`)

The system classifies errors into specific types:

- **NETWORK**: Connection problems, fetch failures
- **AUTHENTICATION**: Auth failures, expired sessions
- **VALIDATION**: Input validation errors
- **PERMISSION**: Access denied errors
- **NOT_FOUND**: Resource not found (404)
- **RATE_LIMIT**: Too many requests (429)
- **SERVER**: Server-side errors (5xx)
- **CLIENT**: Client-side errors
- **UNKNOWN**: Unclassified errors

### 2. Error Details Structure

```typescript
interface ErrorDetails {
  type: ErrorType;
  code?: string;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  retryable: boolean;
  action?: string;
  timestamp: Date;
}
```

### 3. Error Handling Hook (`/src/hooks/error/use-error-handler.ts`)

Provides a consistent interface for error handling in React components:

```typescript
const { handleError, handleAsyncError, handleAsyncErrorWithRetry } = useErrorHandler({
  context: { component: 'MyComponent' }
});
```

### 4. Enhanced Error Boundary (`/src/components/common/ErrorBoundary.tsx`)

Features:
- Detailed error information with error IDs
- Recovery options (retry, reload, go home)
- Technical details for debugging
- Bug reporting capabilities
- Contextual error messages

### 5. Error Logging Service (`/src/lib/error/error-logger.ts`)

Comprehensive logging with:
- Error persistence in localStorage
- Error metrics and patterns
- Severity classification
- Export capabilities
- External service integration hooks

### 6. Retry Mechanisms



#### RetryButton Component (`/src/components/common/RetryButton.tsx`)

- Configurable retry attempts
- Exponential backoff
- Visual feedback
- Error state management

#### withRetry Utility

- Automatic retry for async operations
- Configurable retry logic
- Error classification for retry decisions

### 7. Fallback States (`/src/components/common/FallbackState.tsx`)

Contextual fallback UI for different error types:
- Network errors with connection tips
- Rate limit errors with wait guidance
- Permission errors with access information
- Generic errors with retry options

### 8. Debug Dashboard (`/src/components/debug/ErrorDashboard.tsx`)

Development tool for monitoring errors:
- Real-time error metrics
- Error pattern analysis
- Filtering and search capabilities
- Export functionality
- Error resolution tracking

## Usage Examples



### Basic Error Handling

```typescript
import { useErrorHandler } from '@/hooks/error/use-error-handler';

function MyComponent() {
  const { handleError, handleAsyncError } = useErrorHandler({
    context: { component: 'MyComponent' }
  });

  const handleAsyncOperation = async () => {
    const result = await handleAsyncError(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    });

    if (result.error) {
      // Error is automatically handled and logged
      return;
    }

    // Use result.data
  };
}
```

### Retry with Fallback

```typescript
const { handleAsyncErrorWithRetry } = useErrorHandler();

const result = await handleAsyncErrorWithRetry(
  async () => {
    return await criticalOperation();
  },
  3, // max retries
  { operation: 'criticalOperation' }
);
```

### Custom Error Messages

```typescript
import { useSpecificErrorHandler } from '@/hooks/error/use-error-handler';

function MyComponent() {
  const { handleNetworkError, handleValidationError } = useSpecificErrorHandler();

  const handleSubmit = async (data) => {
    try {
      await submitData(data);
    } catch (error) {
      if (error.name === 'NetworkError') {
        handleNetworkError(error);
      } else if (error.name === 'ValidationError') {
        handleValidationError(error, 'email');
      }
    }
  };
}
```

### Error Boundary with Custom Fallback

```typescript
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    // Custom error handling
    console.error('Custom error handler:', error, errorInfo);
  }}
  fallback={<CustomErrorFallback />}
>
  <MyComponent />
</ErrorBoundary>
```

## Configuration



### Environment Variables

- `NODE_ENV`: Controls error detail visibility and external service integration
- `REACT_APP_ERROR_SERVICE_URL`: Optional external error logging service

### Query Client Configuration

The React Query client is configured with:
- Smart retry logic (no retry for 4xx errors)
- Exponential backoff
- Error logging integration
- Automatic error classification

### Toast Configuration

Error toasts include:
- Contextual titles and messages
- Action buttons for recovery
- Severity-based styling
- Auto-dismissal for non-critical errors

## Best Practices



### 1. Error Context

Always provide meaningful context when handling errors:

```typescript
handleError(error, {
  component: 'UserProfile',
  operation: 'updateProfile',
  metadata: { userId: user.id }
});
```

### 2. User-Friendly Messages

Use the centralized error message system:

```typescript
const errorDetails = createErrorDetails(error);
const userMessage = getUserFriendlyMessage(errorDetails);
```

### 3. Retry Logic

Implement retry for recoverable operations:

```typescript
const result = await withRetry(
  () => fetchData(),
  3, // max retries
  1000, // base delay
  { operation: 'fetchData' }
);
```

### 4. Error Boundaries

Wrap components at appropriate levels:

```typescript
<ErrorBoundary context={{ component: 'FeatureSection' }}>
  <FeatureComponent />
</ErrorBoundary>
```

### 5. Logging

Use the error logger for monitoring:

```typescript
const { logError } = useErrorLogger();
logError(errorDetails, context);
```

## Monitoring and Debugging



### Development Mode

- Detailed error information in ErrorBoundary
- Console logging with error grouping
- Error dashboard for real-time monitoring

### Production Mode

- User-friendly error messages
- Error logging to external services
- Minimal technical details exposed to users

### Error Dashboard

Access the debug dashboard at `/debug/errors` (development only) to:
- View error metrics and trends
- Filter errors by component, type, or severity
- Export error logs
- Mark errors as resolved
- Analyze error patterns

## Integration with External Services

The system is designed to integrate with external error monitoring services:

```typescript
// In src/lib/error/error-logger.ts
private async sendToExternalService(logEntry: ErrorLogEntry): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    });
  }
}
```

## Error Recovery Strategies

1. **Network Errors**: Automatic retry with exponential backoff
2. **Authentication Errors**: Redirect to login or refresh token
3. **Validation Errors**: Highlight specific fields with guidance
4. **Permission Errors**: Show access denied message with contact info
5. **Server Errors**: Graceful degradation with retry options
6. **Rate Limit Errors**: Show wait time and retry after delay

## Testing Error Handling

Use the error dashboard to:
- Simulate different error types
- Test retry mechanisms
- Verify error messages
- Check error logging
- Validate recovery flows

This comprehensive error handling system ensures a better user experience while providing developers with the tools needed to debug and monitor application health.# Error Handling Documentation

This document describes the comprehensive error handling system implemented in the Tampana application.

## Overview

The error handling system provides:
- Centralized error management
- User-friendly error notifications
- Automatic retry logic
- Error logging and monitoring
- Graceful degradation
- Network error handling

## Architecture



### Core Components

1. **Error Types & Severity** (`src/types/errors.ts`)
2. **Error Handler** (`src/utils/errorHandler.ts`)
3. **Error Notifications** (`src/hooks/useErrorNotifications.ts`)
4. **Error Boundary** (`src/ErrorBoundary.tsx`)
5. **Storage Manager** (`src/utils/storage.ts`)
6. **Network Error Handler** (`src/utils/networkErrorHandler.ts`)
7. **Error Logger** (`src/utils/errorLogger.ts`)

## Error Types



### ErrorType Enum

- `NETWORK` - Network connectivity issues
- `VALIDATION` - Input validation errors
- `STORAGE` - Local storage failures
- `API` - API request/response errors
- `UNKNOWN` - Unclassified errors

### ErrorSeverity Enum

- `LOW` - Minor issues, non-blocking
- `MEDIUM` - Moderate issues, may affect functionality
- `HIGH` - Serious issues, significant impact
- `CRITICAL` - Critical issues, application may be unusable

## Usage Examples



### Basic Error Handling

```typescript
import { errorHandler, createError, ErrorType, ErrorSeverity } from './utils/errorHandler';

// Create an error
const error = createError(
  ErrorType.VALIDATION,
  'Invalid email format',
  ErrorSeverity.MEDIUM,
  {
    code: 'INVALID_EMAIL',
    details: { email: 'invalid-email' },
    context: 'UserRegistration',
    recoverable: true,
    retryable: false
  }
);

// Handle the error
errorHandler.handleError(error, {
  component: 'UserRegistration',
  action: 'validateEmail',
  userId: 'user123'
});
```

### Retry Logic

```typescript
import { withRetry } from './utils/errorHandler';

const result = await withRetry(
  () => fetch('/api/data'),
  { maxAttempts: 3, delay: 1000 },
  { component: 'DataFetcher', action: 'fetchData' }
);
```

### Error Boundary

- **ARIA Live Regions**: Error boundary uses `aria-live="assertive"` for critical errors
- **Keyboard Navigation**: All recovery buttons are keyboard accessible
- **Focus Indicators**: Clear focus indicators for keyboard users
- **Semantic HTML**: Proper heading structure and semantic elements

```typescript
import { withErrorBoundary } from './utils/errorHandler';

const safeFunction = withErrorBoundary(
  () => riskyOperation(),
  'fallback value',
  { component: 'RiskyComponent', action: 'performOperation' }
);
```

### Storage Operations

```typescript
import { getStorageItem, setStorageItem } from './utils/storage';

// Safe get operation
const result = getStorageItem<UserData>('userData', {
  defaultValue: { name: '', email: '' },
  fallbackToMemory: true,
  silent: false
});

if (result.success) {
  console.log('User data:', result.data);
} else {
  console.error('Failed to load user data:', result.error);
}

// Safe set operation
const saveResult = setStorageItem('userData', userData, {
  fallbackToMemory: true,
  silent: false
});
```

### Network Requests

```typescript
import { networkGet, networkPost, isOnline } from './utils/networkErrorHandler';

// Check connectivity
if (!isOnline()) {
  console.log('User is offline');
  return;
}

// Make requests with error handling
const response = await networkGet<UserData>('/api/user', {
  timeout: 5000,
  retries: 3,
  headers: { 'Authorization': 'Bearer token' }
});

if (response.success) {
  console.log('User data:', response.data);
} else {
  console.error('Request failed:', response.error);
}
```

### Error Notifications

- **ARIA Roles**: Notifications use `role="alert"` and `aria-live="polite"` for screen readers
- **Focus Management**: Buttons are keyboard accessible with proper focus indicators
- **Descriptive Labels**: All interactive elements have descriptive `aria-label` attributes
- **Screen Reader Support**: Error messages are announced to screen readers

```typescript
import { useErrorNotifications } from './hooks/useErrorNotifications';

function MyComponent() {
  const { showError, showSuccess, showWarning } = useErrorNotifications();

  const handleAction = async () => {
    try {
      await riskyOperation();
      showSuccess('Operation completed successfully');
    } catch (error) {
      showError(error);
    }
  };

  return (
    <button onClick={handleAction}>
      Perform Action
    </button>
  );
}
```

## Error Boundary Component

The `ErrorBoundary` component catches JavaScript errors anywhere in the component tree and displays a fallback UI.

### Features

- Automatic error logging
- Breadcrumb tracking
- Error statistics
- Export functionality
- Trend analysis

- Retry mechanism (up to 3 attempts)
- Detailed error information in development
- Multiple recovery options (retry, reload, reset)
- Automatic error logging

### Usage

```typescript
import { addBreadcrumb, getErrorStats, exportLogs } from './utils/errorLogger';

// Add breadcrumbs for debugging
addBreadcrumb('User clicked submit button', 'user-action');
addBreadcrumb('Form validation started', 'validation');

// Get error statistics
const stats = getErrorStats();
console.log('Total errors:', stats.totalErrors);

// Export error logs
const logsJson = exportLogs();
```

```tsx
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.log('Error caught by boundary:', error);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Error Logging

The error logging system automatically tracks all errors with context information.

### Features

- Automatic error logging
- Breadcrumb tracking
- Error statistics
- Export functionality
- Trend analysis

### Usage

```typescript
import { addBreadcrumb, getErrorStats, exportLogs } from './utils/errorLogger';

// Add breadcrumbs for debugging
addBreadcrumb('User clicked submit button', 'user-action');
addBreadcrumb('Form validation started', 'validation');

// Get error statistics
const stats = getErrorStats();
console.log('Total errors:', stats.totalErrors);

// Export error logs
const logsJson = exportLogs();
```

## Configuration



### Error Handler Configuration

```typescript
import { errorHandler } from './utils/errorHandler';

errorHandler.updateConfig({
  maxRetries: 5,
  retryDelay: 2000,
  showUserNotification: true,
  logToConsole: true,
  reportToService: true
});
```

### Network Handler Configuration

```typescript
import { setNetworkDefaults } from './utils/networkErrorHandler';

setNetworkDefaults({
  timeout: 15000,
  retries: 5,
  retryDelay: 2000
});
```

## Best Practices



### 1. Always Use Error Boundaries

Wrap components that might fail with error boundaries to prevent the entire app from crashing.

### 2. Provide Fallback Values

Always provide fallback values for operations that might fail.

### 3. Use Appropriate Error Severity

- Use `LOW` for minor issues that don't affect functionality
- Use `MEDIUM` for issues that affect some functionality
- Use `HIGH` for issues that significantly impact the user experience
- Use `CRITICAL` for issues that make the app unusable

### 4. Add Context Information

Always provide context when handling errors to help with debugging.

### 5. Use Retry Logic Appropriately

- Only retry operations that are idempotent
- Use exponential backoff for retries
- Set reasonable retry limits

### 6. Log Errors Appropriately

- Log errors with sufficient context
- Use breadcrumbs to track user actions
- Don't log sensitive information

### 7. Handle Network Errors Gracefully

- Check connectivity before making requests
- Provide offline functionality where possible
- Queue requests when offline

## Error Recovery Strategies



### 1. Automatic Retry

For transient errors, implement automatic retry with exponential backoff.

### 2. Fallback Data

Provide fallback data when primary data sources fail.

### 3. Graceful Degradation

Disable non-essential features when errors occur.

### 4. User Notification

Inform users about errors and provide recovery options.

### 5. Data Persistence

Save user data locally to prevent data loss during errors.

## Monitoring and Debugging



### Error Statistics

The system automatically tracks:
- Total error count
- Errors by type and severity
- Recent errors
- Error trends over time

### Error Export

Export error logs for analysis:
```typescript
const logs = exportLogs();
// Save or send logs for analysis
```

### Development Tools

In development mode, the error boundary shows detailed error information including:
- Error type and severity
- Stack trace
- Context information
- Recovery options

## Accessibility

The error handling system includes comprehensive accessibility features:

### Error Notifications

- **ARIA Roles**: Notifications use `role="alert"` and `aria-live="polite"` for screen readers
- **Focus Management**: Buttons are keyboard accessible with proper focus indicators
- **Descriptive Labels**: All interactive elements have descriptive `aria-label` attributes
- **Screen Reader Support**: Error messages are announced to screen readers

### Error Boundary

- **ARIA Live Regions**: Error boundary uses `aria-live="assertive"` for critical errors
- **Keyboard Navigation**: All recovery buttons are keyboard accessible
- **Focus Indicators**: Clear focus indicators for keyboard users
- **Semantic HTML**: Proper heading structure and semantic elements

### Best Practices

1. **Error Announcements**: Critical errors are announced immediately to screen readers
2. **Focus Management**: Focus is managed appropriately when errors occur
3. **High Contrast**: Error messages use high contrast colors for visibility
4. **Descriptive Text**: Error messages are clear and descriptive
5. **Recovery Options**: Multiple recovery options are provided with clear labels

## Testing Error Handling



### Unit Tests

Test error handling in isolation:
```typescript
import { errorHandler } from './utils/errorHandler';

test('handles validation error', () => {
  const error = createError(ErrorType.VALIDATION, 'Invalid input');
  const result = errorHandler.handleError(error);
  expect(result.type).toBe(ErrorType.VALIDATION);
});
```

### Integration Tests

Test error handling in component context:
```typescript
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

test('error boundary catches errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
});
```

### Accessibility Tests

Test accessibility features:
```typescript
import { render, screen } from '@testing-library/react';
import { useErrorNotifications } from './hooks/useErrorNotifications';

test('error notifications are accessible', () => {
  const { result } = renderHook(() => useErrorNotifications());
  
  result.current.showError({
    type: 'VALIDATION',
    severity: 'MEDIUM',
    message: 'Test error',
    timestamp: new Date().toISOString(),
    recoverable: true,
    retryable: false
  });

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByLabelText(/dismiss/i)).toBeInTheDocument();
});
```

## Troubleshooting



### Common Issues

1. **Errors not being caught**: Ensure error boundaries are properly placed
2. **Storage errors**: Check if localStorage is available and has space
3. **Network errors**: Verify connectivity and API endpoints
4. **Retry loops**: Check retry configuration and error types

### Debug Mode

Enable debug mode to see detailed error information:
```typescript
// In development
process.env.NODE_ENV = 'development';
```

This will show detailed error information in the error boundary and console logs.

# Error Handling Documentation

This document describes the comprehensive error handling system implemented in the Tampana application.
