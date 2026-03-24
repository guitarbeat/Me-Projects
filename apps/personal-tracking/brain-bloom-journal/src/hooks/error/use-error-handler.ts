import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  createErrorDetails, 
  logError, 
  getUserFriendlyMessage, 
  getErrorAction,
  withErrorHandling,
  withRetry
} from '@/lib';
import type { ErrorDetails, ErrorContext } from '@/lib';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logErrors?: boolean;
  context?: ErrorContext;
}

interface UseErrorHandlerReturn {
  handleError: (error: any, customContext?: ErrorContext) => ErrorDetails;
  handleAsyncError: <T>(
    operation: () => Promise<T>,
    customContext?: ErrorContext
  ) => Promise<{ data?: T; error?: ErrorDetails }>;
  handleAsyncErrorWithRetry: <T>(
    operation: () => Promise<T>,
    maxRetries?: number,
    customContext?: ErrorContext
  ) => Promise<{ data?: T; error?: ErrorDetails }>;
  isHandlingError: boolean;
  lastError: ErrorDetails | null;
  clearError: () => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}): UseErrorHandlerReturn {
  const { showToast = true, logErrors = true, context } = options;
  const { toast } = useToast();
  const [isHandlingError, setIsHandlingError] = useState(false);
  const [lastError, setLastError] = useState<ErrorDetails | null>(null);

  const handleError = useCallback((error: any, customContext?: ErrorContext): ErrorDetails => {
    setIsHandlingError(true);
    
    const errorDetails = createErrorDetails(error, customContext || context);
    setLastError(errorDetails);

    if (logErrors) {
      logError(errorDetails, customContext || context);
    }

    if (showToast) {
      const userMessage = getUserFriendlyMessage(errorDetails);
      const action = getErrorAction(errorDetails);

      toast({
        title: errorDetails.type === 'NETWORK' ? 'Connection Problem' :
               errorDetails.type === 'AUTHENTICATION' ? 'Authentication Required' :
               errorDetails.type === 'VALIDATION' ? 'Invalid Input' :
               errorDetails.type === 'PERMISSION' ? 'Access Denied' :
               errorDetails.type === 'NOT_FOUND' ? 'Not Found' :
               errorDetails.type === 'RATE_LIMIT' ? 'Too Many Requests' :
               errorDetails.type === 'SERVER' ? 'Server Error' :
               'Something went wrong',
        description: userMessage,
        variant: errorDetails.type === 'VALIDATION' ? 'default' : 'destructive'
      });
    }

    setIsHandlingError(false);
    return errorDetails;
  }, [showToast, logErrors, context, toast]);

  const handleAsyncError = useCallback(async <T>(
    operation: () => Promise<T>,
    customContext?: ErrorContext
  ): Promise<{ data?: T; error?: ErrorDetails }> => {
    return withErrorHandling(operation, customContext || context);
  }, [context]);

  const handleAsyncErrorWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    customContext?: ErrorContext
  ): Promise<{ data?: T; error?: ErrorDetails }> => {
    return withRetry(operation, maxRetries, 1000, customContext || context);
  }, [context]);

  const clearError = useCallback(() => {
    setLastError(null);
    setIsHandlingError(false);
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleAsyncErrorWithRetry,
    isHandlingError,
    lastError,
    clearError
  };
}