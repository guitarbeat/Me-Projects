import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { subDays } from 'date-fns';
import type {
  EmotionalEvent,
  N8NConfig,
  SyncStatus,
  WebhookPayload
} from '@/types/n8n';
import { ErrorSeverity, ErrorType } from '@/types/errors';
import { errorHandler, withRetry, withErrorBoundary } from '@/utils/errorHandler';
import { getStorageItem, setStorageItem } from '@/utils/storage';

export interface EmotionalPattern {
  id: string;
  type: 'trend' | 'cycle' | 'trigger' | 'correlation';
  name: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  data: {
    events: EmotionalEvent[];
    metrics: {
      frequency: number;
      intensity: number;
      duration: number;
    };
    insights: string[];
  };
}

export interface EmotionalInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'achievement' | 'pattern';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  actions?: {
    label: string;
    handler: () => void;
  }[];
  createdAt: string;
  expiresAt?: string;
}

export interface N8NAdvancedConfig extends N8NConfig {
  patternDetection: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    minEvents: number;
    timeWindow: number; // in days
  };
  insights: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    types: string[];
  };
  notifications: {
    enabled: boolean;
    channels: ('webhook' | 'email' | 'slack')[];
    thresholds: {
      pattern: number;
      insight: number;
      alert: number;
    };
  };
}

class N8NAdvancedService {
  private axiosInstance: AxiosInstance;
  private config: N8NAdvancedConfig;
  private syncStatus: SyncStatus;
  private sessionId: string;
  private patterns: EmotionalPattern[] = [];
  private insights: EmotionalInsight[] = [];

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
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey || '',
        'X-Session-ID': this.sessionId
      }
    });

    this.setupInterceptors();
    this.initializePatternDetection();
  }

  private loadConfig(): N8NAdvancedConfig {
    const result = getStorageItem('tampana_n8n_advanced_config', {
      defaultValue: {
        baseUrl: 'https://n8n.alw.lol',
        enabled: false,
        autoSync: false,
        syncInterval: 15,
        patternDetection: {
          enabled: true,
          sensitivity: 'medium',
          minEvents: 5,
          timeWindow: 7
        },
        insights: {
          enabled: true,
          frequency: 'daily',
          types: ['recommendation', 'warning', 'achievement', 'pattern']
        },
        notifications: {
          enabled: true,
          channels: ['webhook'],
          thresholds: {
            pattern: 0.7,
            insight: 0.8,
            alert: 0.9
          }
        }
      },
      silent: true
    });
    
    return result.success ? result.data! : {
      baseUrl: 'https://n8n.alw.lol',
      enabled: false,
      autoSync: false,
      syncInterval: 15,
      patternDetection: {
        enabled: true,
        sensitivity: 'medium',
        minEvents: 5,
        timeWindow: 7
      },
      insights: {
        enabled: true,
        frequency: 'daily',
        types: ['recommendation', 'warning', 'achievement', 'pattern']
      },
      notifications: {
        enabled: true,
        channels: ['webhook'],
        thresholds: {
          pattern: 0.7,
          insight: 0.8,
          alert: 0.9
        }
      }
    };
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.config.apiKey) {
          config.headers['X-API-Key'] = this.config.apiKey;
        }
        config.headers['X-Session-ID'] = this.sessionId;
        return config;
      },
      (error) => {
        const appError = errorHandler.createError(
          ErrorType.API,
          'Failed to prepare N8N advanced request',
          ErrorSeverity.MEDIUM,
          {
            details: { error: error.message },
            context: 'N8NAdvancedService.requestInterceptor',
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
      (error) => {
        const appError = errorHandler.createError(
          ErrorType.API,
          'N8N advanced API request failed',
          ErrorSeverity.MEDIUM,
          {
            details: {
              originalError: error,
              status: error.response?.status,
              statusText: error.response?.statusText,
              data: error.response?.data,
            },
            context: 'N8NAdvancedService.responseInterceptor',
            recoverable: true,
            retryable: error.response?.status ? error.response.status >= 500 : false,
          }
        );
        this.updateSyncStatus('error', appError.message);
        return Promise.reject(appError);
      }
    );
  }

  private initializePatternDetection(): void {
    if (this.config.patternDetection.enabled) {
      // Set up periodic pattern detection
      setInterval(() => {
        this.detectPatterns();
      }, this.config.syncInterval * 60 * 1000);
    }
  }

  public async detectPatterns(): Promise<EmotionalPattern[]> {
    if (!this.config.patternDetection.enabled) {
      return [];
    }

    try {
      const events = this.getRecentEvents();
      if (events.length < this.config.patternDetection.minEvents) {
        return [];
      }

      const patterns: EmotionalPattern[] = [];

      // Detect negative emotion trends
      const negativeTrend = this.detectNegativeTrend(events);
      if (negativeTrend) {
        patterns.push(negativeTrend);
      }

      // Detect emotional cycles
      const cycles = this.detectEmotionalCycles(events);
      patterns.push(...cycles);

      // Detect trigger patterns
      const triggers = this.detectTriggerPatterns(events);
      patterns.push(...triggers);

      // Detect correlations
      const correlations = this.detectCorrelations(events);
      patterns.push(...correlations);

      this.patterns = [...this.patterns, ...patterns];

      // Send patterns to N8N
      if (patterns.length > 0) {
        await this.sendWebhook('patterns_detected', {
          patterns,
          sessionId: this.sessionId,
          detectedAt: new Date().toISOString()
        });
      }

      return patterns;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'N8NAdvancedService',
        action: 'detectPatterns'
      });
      return [];
    }
  }

  private detectNegativeTrend(events: EmotionalEvent[]): EmotionalPattern | null {
    const recentEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      const cutoff = subDays(new Date(), this.config.patternDetection.timeWindow);
      return eventDate >= cutoff;
    });

    if (recentEvents.length < this.config.patternDetection.minEvents) {
      return null;
    }

    const negativeEmotions = ['sad', 'angry', 'anxious', 'stressed', 'depressed', 'frustrated'];
    const negativeCount = recentEvents.filter(event => 
      negativeEmotions.includes(event.emotion.toLowerCase())
    ).length;

    const negativeRatio = negativeCount / recentEvents.length;
    const threshold = this.getSensitivityThreshold();

    if (negativeRatio >= threshold) {
      return {
        id: uuidv4(),
        type: 'trend',
        name: 'Negative Emotion Trend',
        description: `Detected ${Math.round(negativeRatio * 100)}% negative emotions in the last ${this.config.patternDetection.timeWindow} days`,
        confidence: negativeRatio,
        severity: negativeRatio >= 0.8 ? 'high' : negativeRatio >= 0.6 ? 'medium' : 'low',
        detectedAt: new Date().toISOString(),
        data: {
          events: recentEvents,
          metrics: {
            frequency: recentEvents.length / this.config.patternDetection.timeWindow,
            intensity: recentEvents.reduce((sum, e) => sum + e.intensity, 0) / recentEvents.length,
            duration: this.config.patternDetection.timeWindow
          },
          insights: [
            'Consider implementing stress management techniques',
            'Monitor triggers that lead to negative emotions',
            'Seek support if this pattern continues'
          ]
        }
      };
    }

    return null;
  }

  private detectEmotionalCycles(events: EmotionalEvent[]): EmotionalPattern[] {
    const patterns: EmotionalPattern[] = [];
    
    // Group events by day of week
    const weeklyPattern = this.analyzeWeeklyPattern(events);
    if (weeklyPattern) {
      patterns.push(weeklyPattern);
    }

    // Group events by time of day
    const dailyPattern = this.analyzeDailyPattern(events);
    if (dailyPattern) {
      patterns.push(dailyPattern);
    }

    return patterns;
  }

  private detectTriggerPatterns(events: EmotionalEvent[]): EmotionalPattern[] {
    const patterns: EmotionalPattern[] = [];
    
    // Analyze event sequences for triggers
    for (let i = 1; i < events.length; i++) {
      const current = events[i];
      const previous = events[i - 1];
      
      const timeDiff = new Date(current.timestamp).getTime() - new Date(previous.timestamp).getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // If events are close in time and show emotional escalation
      if (hoursDiff <= 2 && current.intensity > previous.intensity) {
        patterns.push({
          id: uuidv4(),
          type: 'trigger',
          name: 'Emotional Escalation Pattern',
          description: `Emotional intensity increased from ${previous.intensity} to ${current.intensity} within ${hoursDiff.toFixed(1)} hours`,
          confidence: Math.min(1, (current.intensity - previous.intensity) / 5),
          severity: current.intensity >= 8 ? 'high' : current.intensity >= 6 ? 'medium' : 'low',
          detectedAt: new Date().toISOString(),
          data: {
            events: [previous, current],
            metrics: {
              frequency: 1,
              intensity: current.intensity,
              duration: hoursDiff
            },
            insights: [
              'Identify what triggered the emotional escalation',
              'Develop coping strategies for similar situations',
              'Consider professional support if this pattern continues'
            ]
          }
        });
      }
    }

    return patterns;
  }

  private detectCorrelations(events: EmotionalEvent[]): EmotionalPattern[] {
    const patterns: EmotionalPattern[] = [];
    
    // Simple correlation analysis between emotion types and intensity
    const emotionIntensityMap = new Map<string, number[]>();
    
    events.forEach(event => {
      if (!emotionIntensityMap.has(event.emotion)) {
        emotionIntensityMap.set(event.emotion, []);
      }
      emotionIntensityMap.get(event.emotion)!.push(event.intensity);
    });

    // Find emotions with consistently high intensity
    emotionIntensityMap.forEach((intensities, emotion) => {
      if (intensities.length >= 3) {
        const avgIntensity = intensities.reduce((sum, i) => sum + i, 0) / intensities.length;
        const variance = intensities.reduce((sum, i) => sum + Math.pow(i - avgIntensity, 2), 0) / intensities.length;
        
        if (avgIntensity >= 7 && variance <= 2) {
          patterns.push({
            id: uuidv4(),
            type: 'correlation',
            name: `High Intensity ${emotion} Pattern`,
            description: `${emotion} emotions consistently show high intensity (avg: ${avgIntensity.toFixed(1)})`,
            confidence: Math.min(1, avgIntensity / 10),
            severity: avgIntensity >= 8 ? 'high' : 'medium',
            detectedAt: new Date().toISOString(),
            data: {
              events: events.filter(e => e.emotion === emotion),
              metrics: {
                frequency: intensities.length / this.config.patternDetection.timeWindow,
                intensity: avgIntensity,
                duration: this.config.patternDetection.timeWindow
              },
              insights: [
                `${emotion} emotions may be a significant factor in your emotional state`,
                'Consider exploring the root causes of these intense emotions',
                'Develop specific strategies for managing this emotion type'
              ]
            }
          });
        }
      }
    });

    return patterns;
  }

  private analyzeWeeklyPattern(events: EmotionalEvent[]): EmotionalPattern | null {
    const dayOfWeekMap = new Map<number, EmotionalEvent[]>();
    
    events.forEach(event => {
      const dayOfWeek = new Date(event.timestamp).getDay();
      if (!dayOfWeekMap.has(dayOfWeek)) {
        dayOfWeekMap.set(dayOfWeek, []);
      }
      dayOfWeekMap.get(dayOfWeek)!.push(event);
    });

    // Find days with significantly different emotional patterns
    const dayAverages = Array.from(dayOfWeekMap.entries()).map(([day, events]) => ({
      day,
      avgIntensity: events.reduce((sum, e) => sum + e.intensity, 0) / events.length,
      count: events.length
    }));

    if (dayAverages.length < 2) return null;

    const overallAvg = dayAverages.reduce((sum, d) => sum + d.avgIntensity, 0) / dayAverages.length;
    const significantDay = dayAverages.find(d => 
      Math.abs(d.avgIntensity - overallAvg) > 1.5 && d.count >= 3
    );

    if (significantDay) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return {
        id: uuidv4(),
        type: 'cycle',
        name: 'Weekly Emotional Pattern',
        description: `${dayNames[significantDay.day]}s show ${significantDay.avgIntensity > overallAvg ? 'higher' : 'lower'} emotional intensity`,
        confidence: Math.min(1, Math.abs(significantDay.avgIntensity - overallAvg) / 5),
        severity: Math.abs(significantDay.avgIntensity - overallAvg) >= 3 ? 'high' : 'medium',
        detectedAt: new Date().toISOString(),
        data: {
          events: dayOfWeekMap.get(significantDay.day)!,
          metrics: {
            frequency: significantDay.count / 4, // approximate weeks
            intensity: significantDay.avgIntensity,
            duration: 7
          },
          insights: [
            `Consider what makes ${dayNames[significantDay.day]}s different`,
            'Plan activities or support for this day of the week',
            'Monitor if this pattern continues over time'
          ]
        }
      };
    }

    return null;
  }

  private analyzeDailyPattern(events: EmotionalEvent[]): EmotionalPattern | null {
    const hourMap = new Map<number, EmotionalEvent[]>();
    
    events.forEach(event => {
      const hour = new Date(event.timestamp).getHours();
      if (!hourMap.has(hour)) {
        hourMap.set(hour, []);
      }
      hourMap.get(hour)!.push(event);
    });

    // Find hours with significantly different emotional patterns
    const hourAverages = Array.from(hourMap.entries()).map(([hour, events]) => ({
      hour,
      avgIntensity: events.reduce((sum, e) => sum + e.intensity, 0) / events.length,
      count: events.length
    }));

    if (hourAverages.length < 2) return null;

    const overallAvg = hourAverages.reduce((sum, h) => sum + h.avgIntensity, 0) / hourAverages.length;
    const significantHour = hourAverages.find(h => 
      Math.abs(h.avgIntensity - overallAvg) > 1.5 && h.count >= 3
    );

    if (significantHour) {
      return {
        id: uuidv4(),
        type: 'cycle',
        name: 'Daily Emotional Pattern',
        description: `${significantHour.hour}:00 shows ${significantHour.avgIntensity > overallAvg ? 'higher' : 'lower'} emotional intensity`,
        confidence: Math.min(1, Math.abs(significantHour.avgIntensity - overallAvg) / 5),
        severity: Math.abs(significantHour.avgIntensity - overallAvg) >= 3 ? 'high' : 'medium',
        detectedAt: new Date().toISOString(),
        data: {
          events: hourMap.get(significantHour.hour)!,
          metrics: {
            frequency: significantHour.count / 7, // approximate days
            intensity: significantHour.avgIntensity,
            duration: 1
          },
          insights: [
            `Consider what happens around ${significantHour.hour}:00 that affects your emotions`,
            'Plan activities or breaks during this time',
            'Monitor if this pattern is consistent'
          ]
        }
      };
    }

    return null;
  }

  private getSensitivityThreshold(): number {
    switch (this.config.patternDetection.sensitivity) {
      case 'low': return 0.8;
      case 'medium': return 0.6;
      case 'high': return 0.4;
      default: return 0.6;
    }
  }

  private getRecentEvents(): EmotionalEvent[] {
    // This would typically load from storage or API
    // For now, return empty array - in real implementation, load from storage
    return [];
  }

  public async generateInsights(): Promise<EmotionalInsight[]> {
    if (!this.config.insights.enabled) {
      return [];
    }

    try {
      const events = this.getRecentEvents();
      const patterns = this.patterns;
      const insights: EmotionalInsight[] = [];

      // Generate insights based on patterns
      patterns.forEach(pattern => {
        if (pattern.severity === 'high' || pattern.severity === 'critical') {
          insights.push({
            id: uuidv4(),
            type: 'warning',
            title: `Pattern Alert: ${pattern.name}`,
            description: pattern.description,
            priority: pattern.severity === 'critical' ? 'high' : 'medium',
            actionable: true,
            actions: [
              {
                label: 'View Details',
                handler: () => console.log('View pattern details:', pattern)
              },
              {
                label: 'Dismiss',
                handler: () => console.log('Dismiss pattern alert')
              }
            ],
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });

      // Generate achievement insights
      const positiveEvents = events.filter(e => 
        ['happy', 'excited', 'grateful', 'proud', 'content'].includes(e.emotion.toLowerCase())
      );
      
      if (positiveEvents.length >= 5) {
        insights.push({
          id: uuidv4(),
          type: 'achievement',
          title: 'Positive Emotion Streak',
          description: `You've recorded ${positiveEvents.length} positive emotions recently!`,
          priority: 'low',
          actionable: false,
          createdAt: new Date().toISOString()
        });
      }

      // Generate recommendations
      if (events.length >= 10) {
        const avgIntensity = events.reduce((sum, e) => sum + e.intensity, 0) / events.length;
        if (avgIntensity >= 7) {
          insights.push({
            id: uuidv4(),
            type: 'recommendation',
            title: 'High Emotional Intensity',
            description: 'Your emotions have been quite intense lately. Consider stress management techniques.',
            priority: 'medium',
            actionable: true,
            actions: [
              {
                label: 'View Stress Management Tips',
                handler: () => console.log('Show stress management tips')
              }
            ],
            createdAt: new Date().toISOString()
          });
        }
      }

      this.insights = [...this.insights, ...insights];

      // Send insights to N8N
      if (insights.length > 0) {
        await this.sendWebhook('insights_generated', {
          insights,
          sessionId: this.sessionId,
          generatedAt: new Date().toISOString()
        });
      }

      return insights;
    } catch (error) {
      errorHandler.handleError(error as Error, {
        component: 'N8NAdvancedService',
        action: 'generateInsights'
      });
      return [];
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
            timeout: 10000,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Tampana-Advanced-Emotion-Tracker/1.0',
              'X-Session-ID': this.sessionId
            }
          }),
          { maxAttempts: 3, delay: 2000 },
          { component: 'N8NAdvancedService', action: 'sendWebhook', metadata: { eventType } }
        );

        this.updateSyncStatus('success');
        this.syncStatus.webhooksSent++;
        return true;
      },
      false,
      { component: 'N8NAdvancedService', action: 'sendWebhook', metadata: { eventType } }
    );
  }

  private updateSyncStatus(status: SyncStatus['status'], errorMessage?: string): void {
    this.syncStatus = {
      ...this.syncStatus,
      status,
      lastSync: new Date().toISOString(),
      errorMessage
    };
  }

  public getPatterns(): EmotionalPattern[] {
    return [...this.patterns];
  }

  public getInsights(): EmotionalInsight[] {
    return [...this.insights];
  }

  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  public updateConfig(newConfig: Partial<N8NAdvancedConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  private saveConfig(): void {
    const result = setStorageItem('tampana_n8n_advanced_config', this.config);
    if (!result.success) {
      errorHandler.handleError(
        errorHandler.createError(
          ErrorType.STORAGE,
          'Failed to save N8N advanced configuration',
          ErrorSeverity.MEDIUM,
          {
            details: { error: result.error },
            context: 'N8NAdvancedService.saveConfig',
            recoverable: true,
            retryable: true,
          }
        )
      );
    }
  }
}

export const n8nAdvancedService = new N8NAdvancedService();
export default n8nAdvancedService;
