import { useState, useCallback, useEffect } from 'react';
import { ErrorNotification, AppError, ErrorSeverity } from '../types/errors';
import { errorHandler } from '../utils/errorHandler';

interface UseErrorNotificationsReturn {
  notifications: ErrorNotification[];
  showError: (error: AppError) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useErrorNotifications = (): UseErrorNotificationsReturn => {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);
  const [, setTimeoutIds] = useState<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const dismissNotification = useCallback((id: string) => {
    // Clear timeout if it exists
    setTimeoutIds(prev => {
      const timeoutId = prev.get(id);
      if (timeoutId) {
        clearTimeout(timeoutId);
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      }
      return prev;
    });

    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<ErrorNotification, 'id'>) => {
    const id = generateId();
    const newNotification: ErrorNotification = {
      id,
      duration: 5000,
      ...notification,
      dismissible: notification.dismissible ?? true,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      const timeoutId = setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
      
      setTimeoutIds(prev => {
        const newMap = new Map(prev);
        newMap.set(id, timeoutId);
        return newMap;
      });
    }
  }, [dismissNotification]);

  const showError = useCallback((error: AppError) => {
    const title = getErrorTitle(error);
    const message = getErrorMessage(error);
    
    addNotification({
      type: 'error',
      title,
      message,
      duration: getErrorDuration(error.severity),
      dismissible: true,
      action: error.recoverable ? {
        label: 'Retry',
        handler: () => {
          // Retry logic would be implemented based on the error context
          // For now, we'll just show a message that retry is not implemented
          console.warn('Retry action triggered for error:', error);
          // TODO: Implement actual retry logic based on error context
        }
      } : undefined,
    });
  }, [addNotification]);

  const showSuccess = useCallback((message: string, title: string = 'Success') => {
    addNotification({
      type: 'success',
      title,
      message,
      duration: 3000,
      dismissible: true,
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, title: string = 'Warning') => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration: 4000,
      dismissible: true,
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, title: string = 'Info') => {
    addNotification({
      type: 'info',
      title,
      message,
      duration: 3000,
      dismissible: true,
    });
  }, [addNotification]);

  const clearAllNotifications = useCallback(() => {
    // Clear all timeouts
    setTimeoutIds(prev => {
      prev.forEach(timeoutId => clearTimeout(timeoutId));
      return new Map();
    });
    
    setNotifications([]);
  }, []);

  // Listen for errors from the error handler
  useEffect(() => {
    const unsubscribe = errorHandler.addErrorListener((error: AppError) => {
      showError(error);
    });

    return unsubscribe;
  }, [showError]);

  return {
    notifications,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    dismissNotification,
    clearAllNotifications,
  };
};

const getErrorTitle = (error: AppError): string => {
  switch (error.type) {
    case 'NETWORK':
      return 'Connection Error';
    case 'VALIDATION':
      return 'Validation Error';
    case 'STORAGE':
      return 'Storage Error';
    case 'API':
      return 'API Error';
    default:
      return 'Error';
  }
};

const getErrorMessage = (error: AppError): string => {
  // Return user-friendly message based on error type and context
  switch (error.type) {
    case 'NETWORK':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'VALIDATION':
      return error.message || 'Please check your input and try again.';
    case 'STORAGE':
      return 'Unable to save data locally. Some features may not work properly.';
    case 'API':
      return 'There was a problem communicating with the server. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

const getErrorDuration = (severity: ErrorSeverity): number => {
  switch (severity) {
    case ErrorSeverity.CRITICAL:
      return 0; // Don't auto-dismiss critical errors
    case ErrorSeverity.HIGH:
      return 8000;
    case ErrorSeverity.MEDIUM:
      return 5000;
    case ErrorSeverity.LOW:
      return 3000;
    default:
      return 5000;
  }
};