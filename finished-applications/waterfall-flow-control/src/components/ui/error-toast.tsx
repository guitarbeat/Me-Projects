import React from 'react';
import { Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

export interface ErrorDetails {
  message: string;
  code?: string;
  timestamp?: string;
  context?: Record<string, any>;
  stack?: string;
}

interface ErrorToastProps {
  error: ErrorDetails;
  onDismiss?: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ error, onDismiss }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const copyErrorDetails = async () => {
    const errorText = `Error Details:
Message: ${error.message}
${error.code ? `Code: ${error.code}` : ''}
${error.timestamp ? `Timestamp: ${error.timestamp}` : ''}
${error.context ? `Context: ${JSON.stringify(error.context, null, 2)}` : ''}
${error.stack ? `Stack: ${error.stack}` : ''}`;

    try {
      await navigator.clipboard.writeText(errorText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      toast({
        title: 'Copied to clipboard',
        description: 'Error details have been copied for debugging',
      });
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-start space-x-2">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-destructive">Error</p>
          <p className="text-sm text-foreground break-words">{error.message}</p>
          {error.code && (
            <p className="text-xs text-muted-foreground mt-1">
              Code: {error.code}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={copyErrorDetails}
          className="flex items-center space-x-2"
        >
          {copied ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Details</span>
            </>
          )}
        </Button>

        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
};
