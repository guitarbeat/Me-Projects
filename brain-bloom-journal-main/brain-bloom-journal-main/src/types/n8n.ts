export interface N8NConfig {
  baseUrl: string;
  apiKey?: string;
  webhookUrl?: string;
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // in minutes
}

export interface EmotionalEvent {
  id: string;
  timestamp: string;
  emotion: string;
  intensity: number;
  notes?: string;
  location?: string;
  tags?: string[];
}

export interface EmotionalData {
  events: EmotionalEvent[];
  summary: {
    totalEvents: number;
    dateRange: {
      start: string;
      end: string;
    };
    emotionDistribution: Record<string, number>;
    averageIntensity: number;
  };
}

export interface WebhookPayload {
  eventType: 'emotion_logged' | 'pattern_detected' | 'threshold_alert' | 'daily_summary' | 'patterns_detected' | 'insights_generated';
  timestamp: string;
  data: EmotionalData | EmotionalEvent | any;
  userId?: string;
  sessionId: string;
}

export interface N8NWorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger: 'webhook' | 'schedule' | 'manual';
  category: 'wellness' | 'analytics' | 'notifications' | 'integrations';
  config: Record<string, any>;
}

export interface N8NResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface SyncStatus {
  lastSync: string;
  status: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
  eventsProcessed: number;
  webhooksSent: number;
}