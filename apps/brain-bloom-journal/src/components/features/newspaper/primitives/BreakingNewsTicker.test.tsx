import { render, screen, fireEvent } from '@testing-library/react';
import { BreakingNewsTicker } from './BreakingNewsTicker';

describe('BreakingNewsTicker', () => {
  const items = [
    { id: '1', text: 'First item', type: 'insight' as const },
    { id: '2', text: 'Second item', type: 'stat' as const },
  ];

  it('renders nothing when items are empty', () => {
    const { container } = render(<BreakingNewsTicker items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders items correctly', () => {
    render(<BreakingNewsTicker items={items} />);
    // Items are duplicated for the infinite scroll effect
    const firstItems = screen.getAllByText('First item');
    expect(firstItems.length).toBeGreaterThanOrEqual(1);
    expect(firstItems[0]).toBeInTheDocument();

    const secondItems = screen.getAllByText('Second item');
    expect(secondItems.length).toBeGreaterThanOrEqual(1);
    expect(secondItems[0]).toBeInTheDocument();
  });

  it('pauses animation on hover', () => {
    render(<BreakingNewsTicker items={items} />);

    // Find the ticker content container
    const firstItem = screen.getAllByText('First item')[0];
    const tickerContainer = firstItem.closest('div[style*="animation"]');
    // The hover event is attached to the parent of the animated div in my implementation
    const hoverContainer = tickerContainer?.parentElement;

    expect(tickerContainer).toBeInTheDocument();

    // Check initial state (should be running)
    expect(tickerContainer).toHaveStyle({ animationPlayState: 'running' });

    // Simulate hover on the interactive container
    fireEvent.mouseEnter(hoverContainer!);

    expect(tickerContainer).toHaveStyle({ animationPlayState: 'paused' });

    // Simulate mouse leave
    fireEvent.mouseLeave(hoverContainer!);

    expect(tickerContainer).toHaveStyle({ animationPlayState: 'running' });
  });
});
