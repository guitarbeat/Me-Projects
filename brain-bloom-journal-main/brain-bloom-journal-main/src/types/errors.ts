export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  API = 'API',
  UNKNOWN = 'UNKNOWN',
  SERVER = 'SERVER',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
  context?: string;
  recoverable: boolean;
  retryable: boolean;
}

export interface ErrorHandlerConfig {
  maxRetries: number;
  retryDelay: number;
  showUserNotification: boolean;
  logToConsole: boolean;
  reportToService?: boolean;
}

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
  dismissible: boolean;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}