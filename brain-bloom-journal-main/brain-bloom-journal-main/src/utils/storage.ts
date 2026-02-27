import { ErrorType, ErrorSeverity } from '../types/errors';
import { errorHandler } from './errorHandler';

interface StorageOptions {
  defaultValue?: any;
  fallbackToMemory?: boolean;
  silent?: boolean;
}

interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class StorageManager {
  private memoryStorage: Map<string, string> = new Map();
  private isAvailable: boolean = true;

  constructor() {
    this.checkAvailability();
  }

  /**
   * NOTE: Memory storage fallback is not persisted across page reloads.
   * This is a limitation of the in-memory storage approach.
   * Data stored in memory will be lost when the page is refreshed or closed.
   */

  private checkAvailability(): void {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      this.isAvailable = true;
    } catch (e) {
      this.isAvailable = false;
      console.warn('localStorage is not available, falling back to memory storage');
    }
  }

  /**
   * Safely get an item from localStorage
   */
  getItem<T = any>(key: string, options: StorageOptions = {}): StorageResult<T> {
    const { defaultValue, fallbackToMemory = true, silent = false } = options;

    try {
      if (!this.isAvailable) {
        if (fallbackToMemory) {
          const memoryValue = this.memoryStorage.get(key);
          if (memoryValue !== undefined) {
            return {
              success: true,
              data: this.parseValue(memoryValue, defaultValue)
            };
          }
        }
        
        if (defaultValue !== undefined) {
          return {
            success: true,
            data: defaultValue
          };
        }

        return {
          success: false,
          error: 'Storage not available and no fallback provided'
        };
      }

      const value = localStorage.getItem(key);
      
      if (value === null) {
        if (defaultValue !== undefined) {
          return {
            success: true,
            data: defaultValue
          };
        }
        
        return {
          success: false,
          error: 'Key not found'
        };
      }

      return {
        success: true,
        data: this.parseValue(value, defaultValue)
      };

    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.STORAGE,
        `Failed to get item from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        {
          details: { key, error },
          context: 'StorageManager.getItem',
          recoverable: true,
          retryable: false,
        }
      );

      if (!silent) {
        errorHandler.handleError(appError);
      }

      // Try fallback to memory storage
      if (fallbackToMemory) {
        const memoryValue = this.memoryStorage.get(key);
        if (memoryValue !== undefined) {
          return {
            success: true,
            data: this.parseValue(memoryValue, defaultValue)
          };
        }
      }

      if (defaultValue !== undefined) {
        return {
          success: true,
          data: defaultValue
        };
      }

      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Safely set an item in localStorage
   */
  setItem<T = any>(key: string, value: T, options: StorageOptions = {}): StorageResult<boolean> {
    const { fallbackToMemory = true, silent = false } = options;

    try {
      const serializedValue = this.serializeValue(value);

      if (!this.isAvailable) {
        if (fallbackToMemory) {
          this.memoryStorage.set(key, serializedValue);
          return {
            success: true,
            data: true
          };
        }

        return {
          success: false,
          error: 'Storage not available and no fallback provided'
        };
      }

      localStorage.setItem(key, serializedValue);
      
      // Also store in memory as backup
      if (fallbackToMemory) {
        this.memoryStorage.set(key, serializedValue);
      }

      return {
        success: true,
        data: true
      };

    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.STORAGE,
        `Failed to set item in storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        {
          details: { key, value, error },
          context: 'StorageManager.setItem',
          recoverable: true,
          retryable: false,
        }
      );

      if (!silent) {
        errorHandler.handleError(appError);
      }

      // Try fallback to memory storage
      if (fallbackToMemory) {
        try {
          this.memoryStorage.set(key, this.serializeValue(value));
          return {
            success: true,
            data: true
          };
        } catch (memoryError) {
          return {
            success: false,
            error: `Failed to store in memory: ${memoryError instanceof Error ? memoryError.message : 'Unknown error'}`
          };
        }
      }

      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Safely remove an item from localStorage
   */
  removeItem(key: string, options: StorageOptions = {}): StorageResult<boolean> {
    const { fallbackToMemory = true, silent = false } = options;

    try {
      if (!this.isAvailable) {
        if (fallbackToMemory) {
          this.memoryStorage.delete(key);
          return {
            success: true,
            data: true
          };
        }

        return {
          success: false,
          error: 'Storage not available and no fallback provided'
        };
      }

      localStorage.removeItem(key);
      
      // Also remove from memory
      if (fallbackToMemory) {
        this.memoryStorage.delete(key);
      }

      return {
        success: true,
        data: true
      };

    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.STORAGE,
        `Failed to remove item from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        {
          details: { key, error },
          context: 'StorageManager.removeItem',
          recoverable: true,
          retryable: false,
        }
      );

      if (!silent) {
        errorHandler.handleError(appError);
      }

      // Try fallback to memory storage
      if (fallbackToMemory) {
        this.memoryStorage.delete(key);
        return {
          success: true,
          data: true
        };
      }

      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Safely clear all items from localStorage
   */
  clear(options: StorageOptions = {}): StorageResult<boolean> {
    const { fallbackToMemory = true, silent = false } = options;

    try {
      if (!this.isAvailable) {
        if (fallbackToMemory) {
          this.memoryStorage.clear();
          return {
            success: true,
            data: true
          };
        }

        return {
          success: false,
          error: 'Storage not available and no fallback provided'
        };
      }

      localStorage.clear();
      
      // Also clear memory
      if (fallbackToMemory) {
        this.memoryStorage.clear();
      }

      return {
        success: true,
        data: true
      };

    } catch (error) {
      const appError = errorHandler.createError(
        ErrorType.STORAGE,
        `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorSeverity.MEDIUM,
        {
          details: { error },
          context: 'StorageManager.clear',
          recoverable: true,
          retryable: false,
        }
      );

      if (!silent) {
        errorHandler.handleError(appError);
      }

      // Try fallback to memory storage
      if (fallbackToMemory) {
        this.memoryStorage.clear();
        return {
          success: true,
          data: true
        };
      }

      return {
        success: false,
        error: appError.message
      };
    }
  }

  /**
   * Get all keys from storage
   */
  keys(): string[] {
    try {
      if (!this.isAvailable) {
        return Array.from(this.memoryStorage.keys());
      }

      const localStorageKeys = Object.keys(localStorage);
      const memoryKeys = Array.from(this.memoryStorage.keys());
      
      // Return unique keys from both sources
      return [...new Set([...localStorageKeys, ...memoryKeys])];
    } catch (error) {
      console.warn('Failed to get storage keys:', error);
      return Array.from(this.memoryStorage.keys());
    }
  }

  /**
   * Check if storage is available
   */
  isStorageAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { available: boolean; memoryKeys: number; localStorageKeys: number } {
    return {
      available: this.isAvailable,
      memoryKeys: this.memoryStorage.size,
      localStorageKeys: this.isAvailable ? localStorage.length : 0
    };
  }

  private parseValue<T>(value: string, defaultValue?: T): T {
    try {
      return JSON.parse(value);
    } catch {
      // If JSON parsing fails, check if we have a default value
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      // Only return the raw string if no default is provided
      return (value as unknown as T);
    }
  }

  private serializeValue<T>(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      // If serialization fails, convert to string
      return String(value);
    }
  }
}

// Create singleton instance
export const storage = new StorageManager();

// Export utility functions
export const getStorageItem = storage.getItem.bind(storage);
export const setStorageItem = storage.setItem.bind(storage);
export const removeStorageItem = storage.removeItem.bind(storage);
export const clearStorage = storage.clear.bind(storage);
export const getStorageKeys = storage.keys.bind(storage);
export const isStorageAvailable = storage.isStorageAvailable.bind(storage);
export const getStorageInfo = storage.getStorageInfo.bind(storage);

export default storage;