import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Bug,
} from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
  };

  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  private copyError = () => {
    const errorText = `Error: ${this.state.error?.name || 'Unknown'}
Message: ${this.state.error?.message || 'No message'}
Stack: ${this.state.error?.stack || 'No stack trace'}
Component Stack: ${this.state.errorInfo?.componentStack || 'No component stack'}`;

    navigator.clipboard.writeText(errorText).then(() => {
      // Would use toast here but can't use hooks in class component
      console.log('Error details copied to clipboard');
    });
  };

  private getErrorCategory = (error?: Error) => {
    const message = error?.message?.toLowerCase() || '';
    const stack = error?.stack?.toLowerCase() || '';

    if (
      message.includes('invalid array length') ||
      stack.includes('d3-sankey')
    ) {
      return {
        category: 'Chart Data',
        suggestion: 'Check if chart data is valid and not empty',
        color: 'bg-purple-500',
      };
    }

    if (message.includes('network') || message.includes('fetch')) {
      return {
        category: 'Network Error',
        suggestion: 'Check your internet connection and try again',
        color: 'bg-orange-500',
      };
    }

    if (stack.includes('react') || message.includes('hook')) {
      return {
        category: 'React Error',
        suggestion: 'A component encountered an issue during rendering',
        color: 'bg-cyan-500',
      };
    }

    return {
      category: 'Application Error',
      suggestion:
        'Try refreshing the page or contact support if the issue persists',
      color: 'bg-red-500',
    };
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorCategory = this.getErrorCategory(this.state.error);

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">
                  Oops! Something went wrong
                </CardTitle>
                <Badge className={`${errorCategory.color} text-white`}>
                  {errorCategory.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Error Message */}
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Error:</strong>{' '}
                  {this.state.error?.message || 'An unexpected error occurred'}
                </AlertDescription>
              </Alert>

              {/* Suggestion */}
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>What you can do:</strong> {errorCategory.suggestion}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.toggleDetails}
                  className="gap-2"
                >
                  <Bug className="h-4 w-4" />
                  {this.state.showDetails ? 'Hide' : 'Show'} Details
                </Button>
                <Button
                  variant="outline"
                  onClick={this.copyError}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Error
                </Button>
              </div>

              {/* Technical Details */}
              {this.state.showDetails && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm">Technical Details:</h4>

                  {this.state.error?.name && (
                    <div className="text-xs space-y-1">
                      <strong>Error Type:</strong>
                      <code className="block bg-muted p-2 rounded text-xs overflow-x-auto">
                        {this.state.error.name}
                      </code>
                    </div>
                  )}

                  <div className="text-xs space-y-1">
                    <strong>Error Message:</strong>
                    <code className="block bg-muted p-2 rounded text-xs overflow-x-auto">
                      {this.state.error?.message || 'No message available'}
                    </code>
                  </div>

                  {this.state.error?.stack && (
                    <div className="text-xs space-y-1">
                      <strong>Stack Trace:</strong>
                      <code className="block bg-muted p-2 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
                        {this.state.error.stack}
                      </code>
                    </div>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <div className="text-xs space-y-1">
                      <strong>Component Stack:</strong>
                      <code className="block bg-muted p-2 rounded text-xs overflow-x-auto max-h-32 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </code>
                    </div>
                  )}
                </div>
              )}

              {/* Help Links */}
              <div className="text-center text-xs text-muted-foreground space-y-2">
                <p>If this issue persists, you can:</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    asChild
                  >
                    <a
                      href="https://docs.lovable.dev/tips-tricks/troubleshooting"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Troubleshooting Guide
                    </a>
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    asChild
                  >
                    <a
                      href="mailto:support@lovable.dev?subject=Error Report"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Contact Support
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
