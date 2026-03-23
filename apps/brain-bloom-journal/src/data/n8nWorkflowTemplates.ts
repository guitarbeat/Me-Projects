import { N8NWorkflowTemplate } from '../types/n8n';

export const workflowTemplates: N8NWorkflowTemplate[] = [
  {
    id: 'wellness-daily-checkin',
    name: 'Daily Wellness Check-in',
    description: 'Automated daily check-in workflow that analyzes emotional patterns and sends encouraging messages or wellness recommendations based on the user\'s emotional state.',
    trigger: 'schedule',
    category: 'wellness',
    config: {
      schedule: '0 9 * * *', // Daily at 9 AM
      emotions: ['sad', 'anxious', 'stressed'],
      positiveMessages: [
        'Remember, it\'s okay to not be okay. Take a deep breath.',
        'You\'ve got this! Small steps lead to big changes.',
        'Your feelings are valid. Consider reaching out to someone you trust.'
      ],
      wellnessActivities: [
        'Take a 10-minute walk',
        'Practice deep breathing for 5 minutes',
        'Listen to your favorite music',
        'Write down 3 things you\'re grateful for'
      ]
    }
  },
  
  {
    id: 'pattern-detection-alert',
    name: 'Emotional Pattern Detection',
    description: 'Monitors emotional data for concerning patterns and triggers alerts when negative emotional trends are detected over time.',
    trigger: 'webhook',
    category: 'analytics',
    config: {
      patternThreshold: 0.7, // 70% negative emotions
      timeWindow: '7 days',
      alertChannels: ['email', 'slack', 'discord'],
      escalationLevels: [
        { threshold: 0.5, action: 'gentle_reminder' },
        { threshold: 0.7, action: 'wellness_check' },
        { threshold: 0.9, action: 'urgent_alert' }
      ]
    }
  },
  
  {
    id: 'mood-boost-notification',
    name: 'Mood Boost Notifications',
    description: 'Sends personalized mood-boosting content, quotes, or activity suggestions when users log negative emotions.',
    trigger: 'webhook',
    category: 'notifications',
    config: {
      negativeEmotions: ['sad', 'angry', 'frustrated', 'anxious'],
      positiveContent: [
        'Funny videos and memes',
        'Inspirational quotes',
        'Quick meditation exercises',
        'Gratitude prompts'
      ],
      deliveryTiming: 'immediate',
      personalization: true
    }
  },
  
  {
    id: 'weekly-wellness-report',
    name: 'Weekly Wellness Report',
    description: 'Generates comprehensive weekly reports on emotional patterns, trends, and recommendations for improving mental well-being.',
    trigger: 'schedule',
    category: 'analytics',
    config: {
      schedule: '0 10 * * 1', // Every Monday at 10 AM
      reportSections: [
        'Emotional trend analysis',
        'Pattern recognition',
        'Wellness recommendations',
        'Progress tracking'
      ],
      exportFormats: ['pdf', 'email', 'dashboard'],
      includeCharts: true,
      comparisonPeriod: 'previous_week'
    }
  },
  
  {
    id: 'integration-calendar-sync',
    name: 'Calendar Integration',
    description: 'Automatically schedules wellness activities, therapy sessions, or self-care time based on emotional patterns and availability.',
    trigger: 'webhook',
    category: 'integrations',
    config: {
      calendarServices: ['google_calendar', 'outlook', 'apple_calendar'],
      activityTypes: [
        'meditation_session',
        'exercise_time',
        'social_activity',
        'creative_hobby'
      ],
      schedulingRules: {
        avoidNegativeEmotionTimes: true,
        preferPositiveEmotionTimes: true,
        minimumDuration: '30 minutes',
        bufferTime: '15 minutes'
      }
    }
  },
  
  {
    id: 'social-support-network',
    name: 'Social Support Network',
    description: 'Connects users with their support network when they need emotional support, sending appropriate notifications to trusted contacts.',
    trigger: 'webhook',
    category: 'wellness',
    config: {
      supportLevels: [
        { emotion: 'sad', contacts: ['close_friends', 'family'] },
        { emotion: 'anxious', contacts: ['therapist', 'close_friends'] },
        { emotion: 'crisis', contacts: ['emergency_contacts', 'crisis_hotline'] }
      ],
      notificationPreferences: {
        respectPrivacy: true,
        allowOptOut: true,
        escalationDelay: '2 hours'
      }
    }
  },
  
  {
    id: 'habit-tracking-integration',
    name: 'Habit Tracking Integration',
    description: 'Tracks wellness habits and correlates them with emotional states to identify which activities have the most positive impact.',
    trigger: 'webhook',
    category: 'analytics',
    config: {
      trackedHabits: [
        'exercise',
        'meditation',
        'sleep_quality',
        'social_interaction',
        'healthy_eating'
      ],
      correlationAnalysis: true,
      recommendationEngine: true,
      habitReminders: true
    }
  },
  
  {
    id: 'crisis-intervention',
    name: 'Crisis Intervention',
    description: 'Emergency response workflow that activates when severe emotional distress is detected, providing immediate resources and support.',
    trigger: 'webhook',
    category: 'wellness',
    config: {
      crisisIndicators: [
        'suicidal_thoughts',
        'severe_depression',
        'panic_attacks',
        'self_harm_urges'
      ],
      immediateActions: [
        'crisis_hotline_contact',
        'emergency_services',
        'trusted_contact_alert',
        'safety_plan_activation'
      ],
      followUpActions: [
        'professional_help_referral',
        'support_group_connection',
        'wellness_plan_creation'
      ]
    }
  },
  
  {
    id: 'data-export-automation',
    name: 'Data Export Automation',
    description: 'Automatically exports emotional data in various formats for external analysis, therapy sessions, or personal records.',
    trigger: 'schedule',
    category: 'integrations',
    config: {
      exportSchedule: '0 0 * * 0', // Weekly on Sunday
      exportFormats: ['json', 'csv', 'pdf'],
      destinations: [
        'google_drive',
        'dropbox',
        'email',
        'local_storage'
      ],
      dataRetention: '1 year',
      includeMetadata: true
    }
  },
  
  {
    id: 'wellness-challenge-creator',
    name: 'Wellness Challenge Creator',
    description: 'Creates personalized wellness challenges based on emotional patterns and user preferences, with progress tracking and rewards.',
    trigger: 'schedule',
    category: 'wellness',
    config: {
      challengeTypes: [
        'gratitude_practice',
        'mindfulness_meditation',
        'physical_activity',
        'social_connection',
        'creative_expression'
      ],
      difficultyLevels: ['beginner', 'intermediate', 'advanced'],
      duration: '7-30 days',
      progressTracking: true,
      rewardSystem: true,
      socialSharing: false
    }
  }
];

export default workflowTemplates;