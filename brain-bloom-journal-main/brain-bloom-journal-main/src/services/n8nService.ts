import axios, { AxiosInstance, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';
import type {
  EmotionalData,
  EmotionalEvent,
  N8NConfig,
  N8NResponse,
  N8NWorkflowTemplate,
  SyncStatus,
  WebhookPayload
} from '@/types/n8n';
import { ErrorSeverity, ErrorType } from '@/types/errors';
import { errorHandler, withRetry, withErrorBoundary } from '@/utils/errorHandler';
import { getStorageItem, setStorageItem } from '@/utils/storage';

class N8NService {
  private axiosInstance: AxiosInstance;
  private config: N8NConfig;
  private syncStatus: SyncStatus;
  private sessionId: string;

  constructor() {
    this.sessionId = uuidv4();
    this.syncStatus = {
      lastSync: new Date().toISOString(),
      status: 'idle',
      eventsProcessed: 0,
      webhooksSent: 0
    };
    
    this.config = this.loadConfig();
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey || ''
      }
    });

    this.setupInterceptors();
  }

  private loadConfig(): N8NConfig {
    const result = getStorageItem('tampana_n8n_config', {
      defaultValue: {
        baseUrl: 'https://n8n.alw.lol',
        enabled: false,
        autoSync: false,
        syncInterval: 15
      },
      silent: true
    }) as { success: boolean; data?: N8NConfig; error?: string };
    
    return result.success ? result.data! : {
      baseUrl: 'https://n8n.alw.lol',
      enabled: false,
      autoSync: false,
      syncInterval: 15
    };
  }

  private saveConfig(): void {
    const result = setStorageItem('tampana_n8n_config', this.config);
    if (!result.success) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.STORAGE,
          'Failed to save N8N configuration',
          ErrorSeverity.MEDIUM,
          {
            details: { error: result.error },
            context: 'N8NService.saveConfig',
            recoverable: true,
            retryable: true,
          }
        )
      );
    }
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.config.apiKey) {
          config.headers['X-API-Key'] = this.config.apiKey;
        }
        return config;
      },
      (error) => {
        const appError = errorHandler.createError(
          ErrorType.API,
          'Failed to prepare N8N request',
          ErrorSeverity.MEDIUM,
          {
            details: { error: error.message },
            context: 'N8NService.requestInterceptor',
            recoverable: true,
            retryable: true,
          }
        );
        errorHandler.handleError(appError);
        return Promise.reject(appError);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const appError = this.handleAxiosError(error);
        this.updateSyncStatus('error', appError.message);
        return Promise.reject(appError);
      }
    );
  }

  private handleAxiosError(error: AxiosError) {
    let errorType = ErrorType.API;
    let severity = ErrorSeverity.MEDIUM;
    let message = 'API request failed';

    // More robust network error detection
    if (!error.response && (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.request)) {
      errorType = ErrorType.NETWORK;
      severity = ErrorSeverity.HIGH;
      message = 'Network connection failed';
    } else if (error.response) {
      const status = error.response.status;
      if (status >= 500) {
        severity = ErrorSeverity.HIGH;
        message = 'Server error occurred';
      } else if (status === 401 || status === 403) {
        severity = ErrorSeverity.MEDIUM;
        message = 'Authentication failed';
      } else if (status === 404) {
        severity = ErrorSeverity.LOW;
        message = 'Resource not found';
      } else if (status >= 400) {
        severity = ErrorSeverity.MEDIUM;
        message = 'Client error occurred';
      }
    }

    return errorHandler.createError(
      errorType,
      message,
      severity,
      {
        details: {
          originalError: error,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        },
        context: 'N8NService.axiosInterceptor',
        recoverable: true,
        retryable: errorType === ErrorType.NETWORK || (error.response?.status ? error.response.status >= 500 : false),
      }
    );
  }

  public updateConfig(newConfig: Partial<N8NConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    
    // Recreate axios instance with new config
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey || ''
      }
    });
    this.setupInterceptors();
  }

  public getConfig(): N8NConfig {
    return { ...this.config };
  }

  public async testConnection(): Promise<N8NResponse> {
    try {
      const response = await withRetry(
        () => this.axiosInstance.get('/api/v1/health'),
        { maxAttempts: 3, delay: 1000 },
        { component: 'N8NService', action: 'testConnection' }
      );

      this.updateSyncStatus('success');
      return {
        success: true,
        message: 'Connection successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed',
        error: 'Unable to connect to N8N service'
      };
    }
  }

  public async sendWebhook(eventType: WebhookPayload['eventType'], data: any): Promise<boolean> {
    if (!this.config.enabled || !this.config.webhookUrl) {
      return false;
    }

    return withErrorBoundary(
      async () => {
        const payload: WebhookPayload = {
          eventType,
          timestamp: new Date().toISOString(),
          data,
          sessionId: this.sessionId
        };

        await withRetry(
          () => axios.post(this.config.webhookUrl!, payload, {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Tampana-Emotion-Tracker/1.0'
            }
          }),
          { maxAttempts: 3, delay: 2000 },
          { component: 'N8NService', action: 'sendWebhook', metadata: { eventType } }
        );

        this.updateSyncStatus('success');
        this.syncStatus.webhooksSent++;
        return true;
      },
      false,
      { component: 'N8NService', action: 'sendWebhook', metadata: { eventType } }
    );
  }

  public async syncEmotionalData(events: EmotionalEvent[]): Promise<boolean> {
    if (!this.config.enabled || !this.config.autoSync) {
      return false;
    }

    try {
      this.updateSyncStatus('syncing');
      
      const emotionalData = this.processEmotionalData(events);
      
      // Send webhook for data sync
      const success = await this.sendWebhook('daily_summary', emotionalData);
      
      if (success) {
        this.syncStatus.eventsProcessed = events.length;
        this.updateSyncStatus('success');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Data sync failed:', error);
      this.updateSyncStatus('error', 'Data sync failed');
      return false;
    }
  }

  private processEmotionalData(events: EmotionalEvent[]): EmotionalData {
    if (events.length === 0) {
      return {
        events: [],
        summary: {
          totalEvents: 0,
          dateRange: {
            start: new Date().toISOString(),
            end: new Date().toISOString()
          },
          emotionDistribution: {},
          averageIntensity: 0
        }
      };
    }

    const sortedEvents = events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const emotionDistribution: Record<string, number> = {};
    let totalIntensity = 0;

    events.forEach(event => {
      emotionDistribution[event.emotion] = (emotionDistribution[event.emotion] || 0) + 1;
      totalIntensity += event.intensity;
    });

    return {
      events,
      summary: {
        totalEvents: events.length,
        dateRange: {
          start: sortedEvents[0].timestamp,
          end: sortedEvents[sortedEvents.length - 1].timestamp
        },
        emotionDistribution,
        averageIntensity: totalIntensity / events.length
      }
    };
  }

  public async getWorkflowTemplates(): Promise<N8NWorkflowTemplate[]> {
    try {
      const response = await this.axiosInstance.get('/api/v1/workflows/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch workflow templates:', error);
      return [];
    }
  }

  public async createWorkflow(template: N8NWorkflowTemplate): Promise<N8NResponse> {
    try {
      const response = await this.axiosInstance.post('/api/v1/workflows', template);
      return {
        success: true,
        message: 'Workflow created successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create workflow',
        error: error.message
      };
    }
  }

  private updateSyncStatus(status: SyncStatus['status'], errorMessage?: string): void {
    this.syncStatus = {
      ...this.syncStatus,
      status,
      lastSync: new Date().toISOString(),
      errorMessage
    };
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public async triggerPatternDetection(events: EmotionalEvent[]): Promise<boolean> {
    if (events.length < 3) return false; // Need at least 3 events for pattern detection
    
    const recentEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      const weekAgo = subDays(new Date(), 7);
      return eventDate >= weekAgo;
    });

    if (recentEvents.length >= 3) {
      // Simple pattern detection: check for consistent negative emotions
      const negativeEmotions = ['sad', 'angry', 'anxious', 'stressed', 'depressed'];
      const negativeCount = recentEvents.filter(event => 
        negativeEmotions.includes(event.emotion.toLowerCase())
      ).length;

      if (negativeCount >= recentEvents.length * 0.7) { // 70% negative emotions
        return await this.sendWebhook('pattern_detected', {
          pattern: 'negative_emotion_trend',
          events: recentEvents,
          severity: 'medium'
        });
      }
    }

    return false;
  }

  public async sendThresholdAlert(emotion: string, intensity: number, threshold: number): Promise<boolean> {
    if (intensity >= threshold) {
      return await this.sendWebhook('threshold_alert', {
        emotion,
        intensity,
        threshold,
        timestamp: new Date().toISOString()
      });
    }
    return false;
  }
}

export const n8nService = new N8NService();
export default n8nService;
