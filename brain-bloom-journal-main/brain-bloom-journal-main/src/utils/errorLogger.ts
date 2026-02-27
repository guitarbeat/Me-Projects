import { AppError } from '../types/errors';
import { getStorageItem, setStorageItem } from './storage';

interface ErrorLogEntry {
  id: string;
  timestamp: string;
  error: AppError;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  breadcrumbs: string[];
}

interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  recentErrors: ErrorLogEntry[];
  lastErrorTime?: string;
}

class ErrorLogger {
  private readonly MAX_LOG_ENTRIES = 1000;
  private readonly STORAGE_KEY = 'tampana_error_logs';
  private readonly STATS_KEY = 'tampana_error_stats';
  private breadcrumbs: string[] = [];

  /**
   * Log an error with context
   * 
   * WARNING: This method logs user agent and URL information.
   * Be careful not to log sensitive information, especially if error logs
   * are exported or sent to external services. Consider sanitizing data
   * before logging or implementing data filtering for sensitive fields.
   */
  logError(error: AppError, context?: {
    userId?: string;
    sessionId?: string;
    breadcrumbs?: string[];
  }): void {
    const logEntry: ErrorLogEntry = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context?.userId,
      sessionId: context?.sessionId,
      breadcrumbs: [...this.breadcrumbs, ...(context?.breadcrumbs || [])],
    };

    this.saveLogEntry(logEntry);
    this.updateStats(logEntry);
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string = 'info'): void {
    const breadcrumb = `[${category.toUpperCase()}] ${message}`;
    this.breadcrumbs.push(breadcrumb);
    
    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  /**
   * Get error logs
   */
  getErrorLogs(limit?: number): ErrorLogEntry[] {
    const result = getStorageItem(this.STORAGE_KEY, {
      defaultValue: [],
      silent: true
    }) as { success: boolean; data?: ErrorLogEntry[]; error?: string };

    if (!result.success || !result.data) {
      return [];
    }

    const logs = result.data.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const result = getStorageItem(this.STATS_KEY, {
      defaultValue: {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: {},
        recentErrors: []
      },
      silent: true
    }) as { success: boolean; data?: ErrorStats; error?: string };

    return result.success ? result.data! : {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: []
    };
  }

  /**
   * Clear all error logs
   */
  clearLogs(): void {
    setStorageItem(this.STORAGE_KEY, [], { silent: true });
    setStorageItem(this.STATS_KEY, {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: []
    }, { silent: true });
  }

  /**
   * Export error logs as JSON
   */
  exportLogs(): string {
    const logs = this.getErrorLogs();
    const stats = this.getErrorStats();
    
    return JSON.stringify({
      exportDate: new Date().toISOString(),
      stats,
      logs,
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2);
  }

  /**
   * Get error trends over time
   */
  getErrorTrends(days: number = 7): {
    date: string;
    count: number;
    severity: Record<string, number>;
  }[] {
    const logs = this.getErrorLogs();
    const now = new Date();
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= daysAgo
    );

    const trends: Record<string, { count: number; severity: Record<string, number> }> = {};

    filteredLogs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { count: 0, severity: {} };
      }
      trends[date].count++;
      trends[date].severity[log.error.severity] = 
        (trends[date].severity[log.error.severity] || 0) + 1;
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      count: data.count,
      severity: data.severity
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get most common errors
   */
  getMostCommonErrors(limit: number = 10): {
    message: string;
    type: string;
    severity: string;
    count: number;
    lastOccurrence: string;
  }[] {
    const logs = this.getErrorLogs();
    const errorCounts: Record<string, {
      count: number;
      lastOccurrence: string;
      error: AppError;
    }> = {};

    logs.forEach(log => {
      const key = `${log.error.type}:${log.error.message}`;
      if (!errorCounts[key]) {
        errorCounts[key] = {
          count: 0,
          lastOccurrence: log.timestamp,
          error: log.error
        };
      }
      errorCounts[key].count++;
      if (new Date(log.timestamp) > new Date(errorCounts[key].lastOccurrence)) {
        errorCounts[key].lastOccurrence = log.timestamp;
      }
    });

    return Object.values(errorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(item => ({
        message: item.error.message,
        type: item.error.type,
        severity: item.error.severity,
        count: item.count,
        lastOccurrence: item.lastOccurrence
      }));
  }

  private saveLogEntry(logEntry: ErrorLogEntry): void {
    const result = getStorageItem(this.STORAGE_KEY, {
      defaultValue: [],
      silent: true
    }) as { success: boolean; data?: ErrorLogEntry[]; error?: string };

    const logs = result.success ? result.data || [] : [];
    logs.unshift(logEntry);

    // Keep only the most recent entries
    const trimmedLogs = logs.slice(0, this.MAX_LOG_ENTRIES);
    
    setStorageItem(this.STORAGE_KEY, trimmedLogs, { silent: true });
  }

  private updateStats(logEntry: ErrorLogEntry): void {
    const result = getStorageItem(this.STATS_KEY, {
      defaultValue: {
        totalErrors: 0,
        errorsByType: {},
        errorsBySeverity: {},
        recentErrors: []
      },
      silent: true
    }) as { success: boolean; data?: ErrorStats; error?: string };

    const stats = result.success ? result.data! : {
      totalErrors: 0,
      errorsByType: {},
      errorsBySeverity: {},
      recentErrors: []
    };

    stats.totalErrors++;
    stats.errorsByType[logEntry.error.type] = 
      (stats.errorsByType[logEntry.error.type] || 0) + 1;
    stats.errorsBySeverity[logEntry.error.severity] = 
      (stats.errorsBySeverity[logEntry.error.severity] || 0) + 1;
    
    stats.recentErrors.unshift(logEntry);
    stats.recentErrors = stats.recentErrors.slice(0, 50);
    stats.lastErrorTime = logEntry.timestamp;

    setStorageItem(this.STATS_KEY, stats, { silent: true });
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

// Create singleton instance
export const errorLogger = new ErrorLogger();

// Export utility functions
export const logError = errorLogger.logError.bind(errorLogger);
export const addBreadcrumb = errorLogger.addBreadcrumb.bind(errorLogger);
export const clearBreadcrumbs = errorLogger.clearBreadcrumbs.bind(errorLogger);
export const getErrorLogs = errorLogger.getErrorLogs.bind(errorLogger);
export const getErrorStats = errorLogger.getErrorStats.bind(errorLogger);
export const clearLogs = errorLogger.clearLogs.bind(errorLogger);
export const exportLogs = errorLogger.exportLogs.bind(errorLogger);
export const getErrorTrends = errorLogger.getErrorTrends.bind(errorLogger);
export const getMostCommonErrors = errorLogger.getMostCommonErrors.bind(errorLogger);

export default errorLogger;