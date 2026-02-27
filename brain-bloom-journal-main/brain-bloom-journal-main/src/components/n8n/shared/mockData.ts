import { EmotionalEvent } from '../../../types/n8n';

export const generateMockEvents = (count: number = 15): EmotionalEvent[] => {
  const emotions = ['happy', 'sad', 'excited', 'calm', 'anxious', 'content', 'frustrated', 'grateful'];
  const mockEvents: EmotionalEvent[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    mockEvents.push({
      id: `event-${i}`,
      timestamp: date.toISOString(),
      emotion: emotions[Math.floor(Math.random() * emotions.length)],
      intensity: Math.floor(Math.random() * 10) + 1,
      notes: `Mock emotional event ${i + 1}`,
      tags: ['mock', 'demo']
    });
  }
  
  return mockEvents;
};
