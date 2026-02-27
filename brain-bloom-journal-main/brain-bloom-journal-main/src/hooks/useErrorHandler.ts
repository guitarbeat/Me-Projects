import { useCallback } from 'react';
import { errorHandler } from '../utils/errorHandler';
import { ErrorContext } from '../types/errors';
import { AppError, ErrorType, ErrorSeverity } from '../types/errors';

interface UseErrorHandlerOptions {
  component: string;
  defaultContext?: Partial<ErrorContext>;
}

interface UseErrorHandlerReturn {
  handleError: (error: Error | AppError, context?: Partial<ErrorContext>) => AppError;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    fallback?: T,
    context?: Partial<ErrorContext>
  ) => Promise<T | undefined>;
  createError: (
    type: ErrorType,
    message: string,
    severity?: ErrorSeverity,
    options?: {
      code?: string;
      details?: any;
      context?: string;
      recoverable?: boolean;
      retryable?: boolean;
    }
  ) => AppError;
  withRetry: <T>(
    fn: () => Promise<T>,
    options?: {
      maxAttempts?: number;
      delay?: number;
      backoffMultiplier?: number;
      maxDelay?: number;
    },
    context?: Partial<ErrorContext>
  ) => Promise<T>;
}

export const useErrorHandler = (options: UseErrorHandlerOptions): UseErrorHandlerReturn => {
  const { component, defaultContext = {} } = options;

  const handleError = useCallback((error: Error | AppError, context?: Partial<ErrorContext>): AppError => {
    const errorContext: ErrorContext = {
      component,
      ...defaultContext,
      ...context,
    };

    return errorHandler.handleError(error, errorContext);
  }, [component, defaultContext]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    fallback?: T,
    context?: Partial<ErrorContext>
  ): Promise<T | undefined> => {
    try {
      return await asyncFn();
    } catch (error) {
      const errorContext: ErrorContext = {
        component,
        ...defaultContext,
        ...context,
      };

      const appError = errorHandler.handleError(error as Error, errorContext);
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw appError;
    }
  }, [component, defaultContext]);

  const createError = useCallback((
    type: ErrorType,
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    options: {
      code?: string;
      details?: any;
      context?: string;
      recoverable?: boolean;
      retryable?: boolean;
    } = {}
  ): AppError => {
    return errorHandler.createError(type, message, severity, {
      ...options,
      context: options.context || component,
    });
  }, [component]);

  const withRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      delay?: number;
      backoffMultiplier?: number;
      maxDelay?: number;
    } = {},
    context?: Partial<ErrorContext>
  ): Promise<T> => {
    const errorContext: ErrorContext = {
      component,
      ...defaultContext,
      ...context,
    };

    return errorHandler.withRetry(fn, options, errorContext);
  }, [component, defaultContext]);

  return {
    handleError,
    handleAsyncError,
    createError,
    withRetry,
  };
};

export default useErrorHandler;