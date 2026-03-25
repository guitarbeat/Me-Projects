import { Component, ReactNode } from 'react';
import styled from 'styled-components';
import { AppError, ErrorType, ErrorSeverity } from './types/errors';
import { errorHandler } from './utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: AppError;
  errorInfo?: any;
  retryCount: number;
}

const ErrorContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #fff;
  padding: 24px;
  text-align: center;
  role: alert;
  aria-live: assertive;
`;

const ErrorIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 24px;
  opacity: 0.8;
`;

const ErrorTitle = styled.h1`
  font-size: 2rem;
  margin-bottom: 16px;
  color: #ff6b6b;
  font-weight: 600;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 8px;
  opacity: 0.9;
  max-width: 600px;
  line-height: 1.5;
`;

const ErrorDetails = styled.details`
  margin: 24px 0;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  max-width: 600px;
  width: 100%;
`;

const ErrorSummary = styled.summary`
  cursor: pointer;
  font-weight: 500;
  margin-bottom: 12px;
  color: #ffa502;
`;

const ErrorCode = styled.code`
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  display: block;
  white-space: pre-wrap;
  word-break: break-all;
  margin-top: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;

  &:focus {
    outline: 2px solid #4ECDC4;
    outline-offset: 2px;
  }

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #4ECDC4;
          color: #1a1a1a;
          &:hover {
            background: #45b7b8;
            transform: translateY(-2px);
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          color: #fff;
          border: 2px solid #4ECDC4;
          &:hover {
            background: #4ECDC4;
            color: #1a1a1a;
          }
        `;
      case 'danger':
        return `
          background: #ff6b6b;
          color: #fff;
          &:hover {
            background: #ff5252;
            transform: translateY(-2px);
          }
        `;
      default:
        return `
          background: #666;
          color: #fff;
          &:hover {
            background: #777;
          }
        `;
    }
  }}
`;

const RetryCount = styled.div`
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 16px;
`;

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: unknown): State {
    const appError = errorHandler.createError(
      ErrorType.UNKNOWN,
      error instanceof Error ? error.message : 'An unknown error occurred',
      ErrorSeverity.HIGH,
      {
        details: error instanceof Error ? error.stack : String(error),
        context: 'ErrorBoundary',
        recoverable: true,
        retryable: true,
      }
    );

    return { 
      hasError: true, 
      error: appError,
      retryCount: 0
    };
  }

  componentDidCatch(error: unknown, errorInfo: any) {
    const appError = this.state.error || errorHandler.createError(
      ErrorType.UNKNOWN,
      error instanceof Error ? error.message : 'An unknown error occurred',
      ErrorSeverity.HIGH,
      {
        details: {
          originalError: error,
          errorInfo,
          stack: error instanceof Error ? error.stack : undefined,
        },
        context: 'ErrorBoundary',
        recoverable: true,
        retryable: true,
      }
    );

    // Update state with error info
    this.setState({ 
      error: appError, 
      errorInfo 
    });

    // Handle the error through our error handler
    errorHandler.handleError(appError, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: { errorInfo }
    });

    // Call custom error handler if provided
    this.props.onError?.(appError, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Max retries reached, reload the page
      window.location.reload();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    // Clear any stored data that might be causing issues
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    
    // Reload the page
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount } = this.state;
      const isMaxRetries = retryCount >= this.maxRetries;

      return (
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          
          <ErrorTitle>
            {isMaxRetries ? 'Maximum Retries Reached' : 'Something went wrong'}
          </ErrorTitle>
          
          <ErrorMessage>
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </ErrorMessage>

          {process.env.NODE_ENV !== 'production' && error && (
            <ErrorDetails>
              <ErrorSummary>Technical Details</ErrorSummary>
              <div>
                <strong>Error Type:</strong> {error.type}
                <br />
                <strong>Severity:</strong> {error.severity}
                <br />
                <strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}
                {error.code && (
                  <>
                    <br />
                    <strong>Error Code:</strong> {error.code}
                  </>
                )}
                {error.details && (
                  <>
                    <br />
                    <strong>Stack Trace:</strong>
                    <ErrorCode>{error.details.stack || JSON.stringify(error.details, null, 2)}</ErrorCode>
                  </>
                )}
              </div>
            </ErrorDetails>
          )}

          <ButtonGroup>
            {!isMaxRetries && (
              <Button $variant="primary" onClick={this.handleRetry}>
                Try Again ({this.maxRetries - retryCount} left)
              </Button>
            )}
            
            <Button $variant="secondary" onClick={this.handleReload}>
              Reload Page
            </Button>
            
            <Button $variant="danger" onClick={this.handleReset}>
              Reset & Reload
            </Button>
          </ButtonGroup>

          {retryCount > 0 && (
            <RetryCount>
              Retry attempt: {retryCount} of {this.maxRetries}
            </RetryCount>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
