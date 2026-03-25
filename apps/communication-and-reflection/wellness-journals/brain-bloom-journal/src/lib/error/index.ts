// Barrel exports for error utilities
export {
  ErrorType,
  ErrorSeverity,
  classifyError,
  createErrorDetails,
  logError,
  getUserFriendlyMessage,
  shouldRetry,
  getErrorAction,
  withErrorHandling
} from '@/lib';

export { errorLogger } from '@/utils/errorLogger';
