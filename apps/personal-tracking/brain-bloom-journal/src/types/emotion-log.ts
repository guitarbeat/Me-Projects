export interface EmotionLog {
  emoji: string;
  emotion: string;
  position: { x: number; y: number };
  valence: number;
  arousal: number;
  timestamp: string;
}

export interface EmotionalEvent {
  id: string;
  emotion: string;
  intensity: number;
  timestamp: string;
  notes?: string;
  tags?: string[];
}
