/**
 * Error Tracking System - Captures and manages application errors
 */

interface ErrorInfo {
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string | null;
}

class ErrorTracker {
  private errors: ErrorInfo[] = [];
  private maxErrors = 50;

  public trackError(
    error: Error,
    componentStack?: string,
    userId?: string
  ): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack || null,
      componentStack: componentStack || null,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: userId || null,
    };

    this.errors.push(errorInfo);

    // Keep only the last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error tracked:', errorInfo);
    }
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public getErrorCount(): number {
    return this.errors.length;
  }
}

export const errorTracker = new ErrorTracker();

/**
 * Global error handler setup - attaches window event listeners
 */
export const setupGlobalErrorHandling = (userId?: string): void => {
  window.addEventListener('error', (event) => {
    errorTracker.trackError(event.error, undefined, userId);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const error = new Error(
      event.reason?.message || 'Unhandled Promise Rejection'
    );
    errorTracker.trackError(error, undefined, userId);
  });
};
