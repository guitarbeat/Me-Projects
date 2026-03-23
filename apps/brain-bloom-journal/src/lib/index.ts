// Barrel exports for lib utilities

// Core utilities
export { cn } from './utils';

// Date formatting utilities
export { 
  formatTime, 
  formatDate, 
  formatShortDate, 
  getWeekRange 
} from '@/utils/date-format';

// Error handling - from local utils
export { ErrorType, ErrorSeverity } from '@/types/errors';
export type { AppError, ErrorContext, ErrorHandlerConfig, RetryOptions, ErrorNotification } from '@/types/errors';
export {
  errorHandler,
  createError,
  handleError,
  withRetry,
  withErrorBoundary,
  addErrorListener
} from '@/utils/errorHandler';

// Error logger
export { errorLogger } from '@/utils/errorLogger';

// Content utilities
export { 
  sanitizeContent,
  findLongestMessage
} from './content-utils';

// Component styles - Newsprint Design System
export { 
  animationStyles,
  // Newsprint Design System
  newsprintCardStyles,
  newsprintButtonStyles,
  newsprintTextStyles,
  newsprintInputStyles,
  newsprintBadgeStyles,
  newsprintLayoutStyles,
  newsprintSeparatorStyles
} from './component-styles';

// Type mappings
export { 
  getTypeIcon,
  getTypeColor
} from './type-mappings';

// Icons
export * from './icons/icon-imports';

// Helper functions for error handling compatibility
export function classifyError(error: Error): import('@/types/errors').ErrorType {
  const { ErrorType } = require('@/types/errors');
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return ErrorType.NETWORK;
  }
  if (error.message.includes('validation') || error.message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  return ErrorType.UNKNOWN;
}

export interface ErrorDetails {
  type: import('@/types/errors').ErrorType;
  message: string;
  retryable?: boolean;
  timestamp: string;
}

export function createErrorDetails(error: Error, context?: import('@/types/errors').ErrorContext): ErrorDetails {
  return {
    type: classifyError(error),
    message: error.message,
    retryable: true,
    timestamp: new Date().toISOString()
  };
}

export function logError(errorDetails: ErrorDetails, context?: import('@/types/errors').ErrorContext): void {
  console.error('[Error]', errorDetails.message, { ...errorDetails, context });
}

export function getUserFriendlyMessage(errorDetails: ErrorDetails): string {
  return errorDetails.message || 'An unexpected error occurred.';
}

export function shouldRetry(errorDetails: ErrorDetails): boolean {
  return errorDetails.retryable ?? false;
}

export function getErrorAction(errorDetails: ErrorDetails): string {
  return 'Retry';
}

export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: import('@/types/errors').ErrorContext
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const details = createErrorDetails(error as Error, context);
    logError(details, context);
    throw error;
  }
}
