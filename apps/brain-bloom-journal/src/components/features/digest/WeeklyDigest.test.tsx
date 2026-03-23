import { render, screen } from '@testing-library/react';
import { WeeklyDigest } from './WeeklyDigest';
import { TooltipProvider } from '@/components/ui';

// Mock the icons
jest.mock('@/lib/icons/icon-imports', () => {
  const actual = jest.requireActual<typeof import('@/lib/icons/icon-imports')>('@/lib/icons/icon-imports');
  return {
    ...actual,
    ChevronLeft: () => <span data-testid="chevron-left" />,
    ChevronRight: () => <span data-testid="chevron-right" />,
    Calendar: () => <span data-testid="calendar" />,
    Newspaper: () => <span data-testid="newspaper" />,
    FileText: () => <span data-testid="file-text" />,
    Zap: () => <span data-testid="zap" />,
  };
});

// Mock the hook
jest.mock('@/hooks/use-weekly-digest', () => ({
  useWeeklyDigest: () => ({
    weeklyData: {
      retrospectives: [],
      totalReflections: 0,
      themes: [],
      highlights: [],
      weekStart: new Date(),
      weekEnd: new Date(),
    },
    isLoading: false,
    goToPreviousWeek: jest.fn(),
    goToNextWeek: jest.fn(),
    goToCurrentWeek: jest.fn(),
    isCurrentWeek: false,
    weekLabel: "Jan 1 - Jan 7",
  }),
}));

// Mock ResizeObserver for Tooltip
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('WeeklyDigest', () => {
  it('has accessible navigation buttons', () => {
    render(
      <TooltipProvider>
        <WeeklyDigest />
      </TooltipProvider>
    );

    // These assertions should fail initially because aria-label is missing
    expect(screen.getByRole('button', { name: /previous week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next week/i })).toBeInTheDocument();
  });
});
