import { AppError, ErrorType, ErrorSeverity, ErrorHandlerConfig, RetryOptions, ErrorContext } from '../types/errors';
import { errorLogger } from './errorLogger';

class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorListeners: Array<(error: AppError) => void> = [];

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      showUserNotification: true,
      logToConsole: true,
      reportToService: false,
      ...config
    };
  }

  /**
   * Create a standardized error object
   */
  createError(
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
  ): AppError {
    return {
      type,
      severity,
      message,
      code: options.code,
      details: options.details,
      timestamp: new Date().toISOString(),
      context: options.context,
      recoverable: options.recoverable ?? true,
      retryable: options.retryable ?? false,
    };
  }

  /**
   * Handle an error with appropriate logging and notifications
   */
  handleError(error: Error | AppError, context?: ErrorContext): AppError {
    let appError: AppError;

    if (this.isAppError(error)) {
      appError = error;
    } else {
      appError = this.createError(
        this.categorizeError(error),
        error.message,
        ErrorSeverity.MEDIUM,
        {
          details: error.stack,
          context: context?.component,
        }
      );
    }

    // Add context information
    if (context) {
      appError.context = context.component;
      appError.details = {
        ...appError.details,
        ...context.metadata,
        userId: context.userId,
        sessionId: context.sessionId,
        action: context.action,
      };
    }

    // Log error
    if (this.config.logToConsole) {
      this.logError(appError);
    }

    // Log the error
    errorLogger.logError(appError, {
      userId: context?.userId,
      sessionId: context?.sessionId,
      breadcrumbs: context?.metadata?.breadcrumbs
    });

    // Notify listeners
    this.notifyListeners(appError);

    // Report to external service if configured
    if (this.config.reportToService) {
      this.reportError(appError);
    }

    return appError;
  }

  /**
   * Execute a function with retry logic
   */
  async withRetry<T>(
    fn: () => Promise<T>,
    options: Partial<RetryOptions> = {},
    context?: ErrorContext
  ): Promise<T> {
    const retryOptions: RetryOptions = {
      maxAttempts: options.maxAttempts ?? this.config.maxRetries,
      delay: options.delay ?? this.config.retryDelay,
      backoffMultiplier: options.backoffMultiplier ?? 2,
      maxDelay: options.maxDelay ?? 10000,
    };

    let lastError: Error | AppError | null = null;

    for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error | AppError;
        
        if (attempt === retryOptions.maxAttempts) {
          const appError = this.handleError(lastError, context);
          throw appError;
        }

        // Check if error is retryable
        if (this.isAppError(lastError) && !lastError.retryable) {
          throw this.handleError(lastError, context);
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(
          retryOptions.delay * Math.pow(retryOptions.backoffMultiplier, attempt - 1),
          retryOptions.maxDelay
        );
        
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Execute a function with error boundary
   */
  async withErrorBoundary<T>(
    fn: () => Promise<T>,
    fallback: T,
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error as Error, context);
      return fallback;
    }
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: AppError) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  private isAppError(error: any): error is AppError {
    return error && typeof error === 'object' && 'type' in error && 'severity' in error;
  }

  private categorizeError(error: Error): ErrorType {
    // Check error codes first for more reliable categorization
    if (error.name === 'NetworkError' || 
        error.message.includes('fetch') || 
        error.message.includes('network') ||
        error.message.includes('connection') ||
        error.message.includes('timeout')) {
      return ErrorType.NETWORK;
    }
    if (error.name === 'ValidationError' || 
        error.message.includes('validation') ||
        error.message.includes('invalid') ||
        error.message.includes('required')) {
      return ErrorType.VALIDATION;
    }
    if (error.message.includes('localStorage') || 
        error.message.includes('storage') ||
        error.message.includes('quota') ||
        error.message.includes('persist')) {
      return ErrorType.STORAGE;
    }
    if (error.message.includes('API') || 
        error.message.includes('HTTP') ||
        error.message.includes('status') ||
        error.message.includes('endpoint')) {
      return ErrorType.API;
    }
    return ErrorType.UNKNOWN;
  }

  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.type}] ${error.message}`;
    const logData = {
      ...error,
      stack: error.details?.stack,
    };

    switch (logLevel) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'error' | 'warn' | 'info' | 'log' {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'log';
    }
  }

  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  private async reportError(error: AppError): Promise<void> {
    // In a real application, this would send the error to an external service
    // like Sentry, LogRocket, or a custom error reporting endpoint
    try {
      // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(error) });
      console.log('Error reported to service:', error);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export utility functions
export const createError = errorHandler.createError.bind(errorHandler);
export const handleError = errorHandler.handleError.bind(errorHandler);
export const withRetry = errorHandler.withRetry.bind(errorHandler);
export const withErrorBoundary = errorHandler.withErrorBoundary.bind(errorHandler);
export const addErrorListener = errorHandler.addErrorListener.bind(errorHandler);

export default errorHandler;