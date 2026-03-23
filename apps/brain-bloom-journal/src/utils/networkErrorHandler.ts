import { withRetry } from './errorHandler';
import { addBreadcrumb } from './errorLogger';

interface NetworkRequestOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
}

interface NetworkResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  statusText?: string;
}

class NetworkErrorHandler {
  private defaultTimeout = 10000;
  private defaultRetries = 3;
  private defaultRetryDelay = 1000;

  /**
   * Make a network request with comprehensive error handling
   */
  async request<T = any>(
    url: string, 
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      headers = {},
      method = 'GET',
      body
    } = options;

    addBreadcrumb(`Making ${method} request to ${url}`, 'network');

    try {
      const response = await withRetry(
        () => this.makeRequest(url, { timeout, headers, method, body }),
        { maxAttempts: retries, delay: retryDelay },
        { 
          component: 'NetworkErrorHandler', 
          action: 'request',
          metadata: { url, method, timeout }
        }
      );

      addBreadcrumb(`Request successful: ${response.status}`, 'network');
      
      return {
        success: true,
        data: response.data,
        status: response.status,
        statusText: response.statusText
      };

    } catch (error) {
      addBreadcrumb(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network request failed',
        status: (error as any)?.status,
        statusText: (error as any)?.statusText
      };
    }
  }

  /**
   * Make a GET request
   */
  async get<T = any>(url: string, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(url: string, body?: any, options: Omit<NetworkRequestOptions, 'method'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(url: string, body?: any, options: Omit<NetworkRequestOptions, 'method'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(url: string, options: Omit<NetworkRequestOptions, 'method' | 'body'> = {}): Promise<NetworkResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Check if the user is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Wait for the user to come back online
   */
  waitForOnline(): Promise<void> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve();
        return;
      }

      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };

      window.addEventListener('online', handleOnline);
    });
  }

  /**
   * Make a request that waits for connectivity if offline
   */
  async requestWithConnectivityCheck<T = any>(
    url: string, 
    options: NetworkRequestOptions = {}
  ): Promise<NetworkResponse<T>> {
    if (!this.isOnline()) {
      addBreadcrumb('User is offline, waiting for connectivity', 'network');
      await this.waitForOnline();
    }

    return this.request<T>(url, options);
  }

  /**
   * Upload a file with progress tracking
   */
  async uploadFile<T = any>(
    url: string,
    file: File,
    options: {
      onProgress?: (progress: number) => void;
      fieldName?: string;
      additionalData?: Record<string, any>;
    } & Omit<NetworkRequestOptions, 'body'> = {}
  ): Promise<NetworkResponse<T>> {
    const { onProgress, fieldName = 'file', additionalData = {} } = options;

    addBreadcrumb(`Uploading file: ${file.name} (${file.size} bytes)`, 'network');

    try {
      const formData = new FormData();
      formData.append(fieldName, file);
      
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });

      const response = await withRetry(
        () => this.makeRequest(url, {
          timeout: options.timeout || 30000,
          method: 'POST',
          body: formData,
          headers: {
            // Don't set Content-Type for FormData, let the browser set it
            ...Object.fromEntries(
              Object.entries(options.headers || {}).filter(([key]) => 
                key.toLowerCase() !== 'content-type'
              )
            )
          }
        }, onProgress),
        { maxAttempts: options.retries || this.defaultRetries, delay: options.retryDelay || this.defaultRetryDelay },
        { 
          component: 'NetworkErrorHandler', 
          action: 'uploadFile',
          metadata: { url, fileName: file.name, fileSize: file.size }
        }
      );

      addBreadcrumb(`File upload successful: ${response.status}`, 'network');
      
      return {
        success: true,
        data: response.data,
        status: response.status,
        statusText: response.statusText
      };

    } catch (error) {
      addBreadcrumb(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File upload failed',
        status: (error as any)?.status,
        statusText: (error as any)?.statusText
      };
    }
  }

  private async makeRequest(
    url: string,
    options: {
      timeout: number;
      headers: Record<string, string>;
      method: string;
      body?: any;
    },
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    try {
      const requestOptions: RequestInit = {
        method: options.method,
        headers: options.headers,
        body: options.body,
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
      };

      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        (error as any).statusText = response.statusText;
        throw error;
      }

      // Handle progress for file uploads
      if (onProgress && options.body instanceof FormData) {
        onProgress(100);
      }

      return response;

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error(`Request timeout after ${options.timeout}ms`);
          (timeoutError as any).code = 'TIMEOUT';
          throw timeoutError;
        }
        
        if (error.message.includes('Failed to fetch')) {
          const networkError = new Error('Network connection failed');
          (networkError as any).code = 'NETWORK_ERROR';
          throw networkError;
        }
      }
      
      throw error;
    }
  }

  /**
   * Set default configuration
   */
  setDefaults(config: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
  }): void {
    if (config.timeout !== undefined) {
      this.defaultTimeout = config.timeout;
    }
    if (config.retries !== undefined) {
      this.defaultRetries = config.retries;
    }
    if (config.retryDelay !== undefined) {
      this.defaultRetryDelay = config.retryDelay;
    }
  }
}

// Create singleton instance
export const networkErrorHandler = new NetworkErrorHandler();

// Export utility functions
export const networkRequest = networkErrorHandler.request.bind(networkErrorHandler);
export const networkGet = networkErrorHandler.get.bind(networkErrorHandler);
export const networkPost = networkErrorHandler.post.bind(networkErrorHandler);
export const networkPut = networkErrorHandler.put.bind(networkErrorHandler);
export const networkDelete = networkErrorHandler.delete.bind(networkErrorHandler);
export const isOnline = networkErrorHandler.isOnline.bind(networkErrorHandler);
export const waitForOnline = networkErrorHandler.waitForOnline.bind(networkErrorHandler);
export const requestWithConnectivityCheck = networkErrorHandler.requestWithConnectivityCheck.bind(networkErrorHandler);
export const uploadFile = networkErrorHandler.uploadFile.bind(networkErrorHandler);
export const setNetworkDefaults = networkErrorHandler.setDefaults.bind(networkErrorHandler);

export default networkErrorHandler;