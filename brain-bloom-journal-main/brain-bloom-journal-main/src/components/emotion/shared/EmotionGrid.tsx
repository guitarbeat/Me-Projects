import React from 'react';
import styled from 'styled-components';
import { EMOTIONS } from './types';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
  }
`;

const EmotionButton = styled.button<{ selected: boolean; intensity: number }>`
  background: ${({ selected, intensity }) => 
    selected 
      ? `hsl(${120 + (intensity - 1) * 20}, 70%, 50%)`
      : '#2a2a2a'
  };
  border: 2px solid ${({ selected }) => selected ? '#4ECDC4' : '#444'};
  border-radius: 12px;
  padding: 16px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 80px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  &:focus {
    outline: 2px solid #4ECDC4;
    outline-offset: 2px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 4px;
    min-height: 60px;
  }
`;

const EmotionEmoji = styled.div`
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const EmotionLabel = styled.span`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

interface EmotionGridProps {
  selectedEmotion: string;
  intensity: number;
  onEmotionSelect: (emotion: string) => void;
}

export const EmotionGrid: React.FC<EmotionGridProps> = ({
  selectedEmotion,
  intensity,
  onEmotionSelect
}) => {
  return (
    <Grid>
      {EMOTIONS.map(emotion => (
        <EmotionButton
          key={emotion.value}
          selected={selectedEmotion === emotion.value}
          intensity={selectedEmotion === emotion.value ? intensity : 0}
          onClick={() => onEmotionSelect(emotion.value)}
          aria-label={`Select ${emotion.label} emotion`}
        >
          <EmotionEmoji>{emotion.emoji}</EmotionEmoji>
          <EmotionLabel>{emotion.label}</EmotionLabel>
        </EmotionButton>
      ))}
    </Grid>
  );
};
