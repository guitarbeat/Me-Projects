import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmotionTracker from '../emotion/EmotionTracker';

// Mock the performance hook to avoid infinite render loops during testing
jest.mock('../../hooks/usePerformance', () => ({
  usePerformance: () => ({
    metrics: { renderCount: 0, lastRenderTime: 0, averageRenderTime: 0 },
    startRender: jest.fn(),
    endRender: jest.fn(),
  }),
  useDebounce: (val) => val,
  useThrottle: (cb) => cb,
}));

describe('EmotionTracker Component', () => {
  const mockOnEmotionLog = jest.fn();
  const mockEvents = [];

  beforeEach(() => {
    mockOnEmotionLog.mockClear();
  });

  it('renders correctly with default props', () => {
    render(
      <EmotionTracker
        onEmotionLog={mockOnEmotionLog}
        events={mockEvents}
      />
    );

    // Check title
    expect(screen.getByText('🎭 Emotion Tracker')).toBeInTheDocument();

    // Check slider presence and label
    const slider = screen.getByLabelText('Emotion intensity slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toBeEnabled();
  });

  it('updates intensity when slider changes', () => {
    render(
      <EmotionTracker
        onEmotionLog={mockOnEmotionLog}
        events={mockEvents}
      />
    );

    const slider = screen.getByLabelText('Emotion intensity slider');
    fireEvent.change(slider, { target: { value: '8' } });

    expect(slider).toHaveValue('8');
    expect(screen.getByText('Intensity: 8/10')).toBeInTheDocument();
  });

  it('calls onEmotionLog when log button is clicked', () => {
    render(
      <EmotionTracker
        onEmotionLog={mockOnEmotionLog}
        events={mockEvents}
      />
    );

    // Select an emotion first
    const happyButton = screen.getByLabelText('Select Happy emotion');
    fireEvent.click(happyButton);

    // Change intensity
    const slider = screen.getByLabelText('Emotion intensity slider');
    fireEvent.change(slider, { target: { value: '8' } });

    const logButton = screen.getByRole('button', { name: /Log Emotion/i });
    expect(logButton).toBeEnabled();

    fireEvent.click(logButton);

    expect(mockOnEmotionLog).toHaveBeenCalledWith('happy', 8);
  });
});
