import React from 'react';
import { createErrorDetails, logError, getUserFriendlyMessage, getErrorAction, ErrorType } from '@/lib';
import { Button, Card } from '@/components/ui';
import { AlertTriangle, RefreshCw, Home, Bug } from '@/lib/icons/icon-imports';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = createErrorDetails(error, {
      component: 'ErrorBoundary',
      operation: 'render',
      metadata: {
        errorBoundary: true,
        componentStack: errorInfo.componentStack
      }
    });

    logError(errorDetails, {
      component: 'ErrorBoundary',
      operation: 'componentDidCatch',
      metadata: {
        errorBoundary: true,
        componentStack: errorInfo.componentStack
      }
    });

    this.setState({ errorInfo });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportBug = () => {
    const { error, errorId } = this.state;
    const errorDetails = error ? createErrorDetails(error) : null;
    
    // In a real app, you might open a bug report form or send to error tracking
    const bugReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    console.log('Bug report data:', bugReport);
    
    // You could also copy to clipboard or open a mailto link
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2));
      alert('Error details copied to clipboard. Please paste them in your bug report.');
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorDetails = this.state.error ? createErrorDetails(this.state.error) : null;
      const userMessage = errorDetails ? getUserFriendlyMessage(errorDetails) : 'Something went wrong.';
      const action = errorDetails ? getErrorAction(errorDetails) : 'Retry';
      const isRetryable = errorDetails?.retryable ?? true;

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                {errorDetails?.type === ErrorType.NETWORK ? 'Connection Problem' : 
                 errorDetails?.type === ErrorType.SERVER ? 'Server Error' : 
                 'Something went wrong'}
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                {userMessage}
              </p>
              
              {this.props.showDetails && this.state.error && (
                <details className="text-left mb-4 p-3 bg-gray-50 rounded-md">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                    Technical Details
                  </summary>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Error ID:</strong> {this.state.errorId}</div>
                    <div><strong>Message:</strong> {this.state.error.message}</div>
                    <div><strong>Type:</strong> {errorDetails?.type}</div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="space-y-3">
              {isRetryable && (
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={this.handleReportBug}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  <Bug className="h-3 w-3 mr-1" />
                  Copy Error Details
                </Button>
              )}
            </div>

            {this.state.errorId && (
              <p className="text-xs text-gray-400 mt-4">
                Error ID: {this.state.errorId}
              </p>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with ErrorBoundary
interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary
        fallback={options.fallback}
        onError={options.onError}
        showDetails={options.showDetails}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}
