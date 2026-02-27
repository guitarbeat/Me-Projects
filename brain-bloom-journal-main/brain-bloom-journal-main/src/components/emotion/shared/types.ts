export interface EmotionOption {
  emoji: string;
  label: string;
  value: string;
}

export interface EmotionStats {
  totalEvents: number;
  averageIntensity: number;
  mostCommonEmotion: string;
  recentEmotions: Array<{ emotion: string; intensity: number }>;
}

export interface EmotionTrend {
  emotion: string;
  count: number;
  averageIntensity: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface WeeklyPattern {
  day: string;
  averageIntensity: number;
  dominantEmotion: string;
  count: number;
}

export const EMOTIONS: EmotionOption[] = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😠', label: 'Angry', value: 'angry' },
  { emoji: '😰', label: 'Anxious', value: 'anxious' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '🤗', label: 'Loved', value: 'loved' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😍', label: 'Excited', value: 'excited' },
  { emoji: '😔', label: 'Disappointed', value: 'disappointed' },
  { emoji: '😌', label: 'Grateful', value: 'grateful' },
  { emoji: '😟', label: 'Worried', value: 'worried' },
];

export const getEmotionColor = (emotion: string): string => {
  const colors: Record<string, string> = {
    happy: '#2ed573',
    sad: '#3742fa',
    angry: '#ff4757',
    anxious: '#ffa502',
    calm: '#4ECDC4',
    excited: '#ff6b6b',
    tired: '#999',
    loved: '#ff69b4',
    frustrated: '#ff6348',
    grateful: '#32cd32',
    worried: '#ffa500',
    disappointed: '#696969'
  };
  return colors[emotion.toLowerCase()] || '#4ECDC4';
};
