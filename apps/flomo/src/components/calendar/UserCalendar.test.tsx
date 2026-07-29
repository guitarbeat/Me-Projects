import React, { act } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { UserCalendar } from './UserCalendar';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Hoist the mock function so it's available in the mock factory
const { CalendarDayMock } = vi.hoisted(() => {
  return { CalendarDayMock: vi.fn() };
});

// Mock CalendarDay using React.memo to respect prop stability
vi.mock('./CalendarDay', async () => {
  const React = await import('react');
  const MockComponent = (props: any) => {
    // Call the spy
    CalendarDayMock(props);
    return (
      <div
        data-testid={`day-${props.day}`}
        onClick={() => props.onToggle(props.day, props.isFloDay)}
        onKeyDown={(e) => props.onKeyDown && props.onKeyDown(e, props.day)}
        tabIndex={props.tabIndex}
      >
        {props.day} {props.isFloDay ? 'Flo' : ''}
      </div>
    );
  };
  MockComponent.displayName = 'CalendarDayMock';
  return {
    CalendarDay: React.memo(MockComponent),
  };
});

// Mock other components to avoid noise
vi.mock('./CalendarHeader', () => ({
  CalendarHeader: () => <div>Header</div>,
}));
vi.mock('./WeekdayHeaders', () => ({
  WeekdayHeaders: () => <div>Weekdays</div>,
}));
vi.mock('@/hooks/useSwipeGesture', () => ({
  useSwipeGesture: () => ({ current: null }),
}));
vi.mock('@/lib/haptics', () => ({
  hapticSelection: vi.fn(),
  hapticSuccess: vi.fn(),
}));

describe('UserCalendar Performance', () => {
  beforeEach(() => {
    CalendarDayMock.mockClear();
  });

  it('only re-renders the toggled day when floEntries changes', () => {
    const currentDate = new Date(2024, 0, 1); // Jan 2024
    const onToggleDay = vi.fn();
    const onNavigate = vi.fn();

    // Initial render
    const { rerender } = render(
      <UserCalendar
        currentDate={currentDate}
        floEntries={{}}
        onToggleDay={onToggleDay}
        onNavigate={onNavigate}
      />
    );

    // Reset mock count after mount
    CalendarDayMock.mockClear();

    // Re-render with updated floEntries (simulate toggling Day 1)
    const newFloEntries = { '2024-01-01': true };

    rerender(
      <UserCalendar
        currentDate={currentDate}
        floEntries={newFloEntries}
        onToggleDay={onToggleDay}
        onNavigate={onNavigate}
      />
    );

    // Expectation:
    // Day 1 should re-render because isFloDay prop changed.
    // Day 2 (and others) should NOT re-render if handleDayClick is stable.

    // Find calls for Day 1
    const day1Calls = CalendarDayMock.mock.calls.filter(
      (args: any[]) => args[0].day === 1
    );
    // Find calls for Day 2
    const day2Calls = CalendarDayMock.mock.calls.filter(
      (args: any[]) => args[0].day === 2
    );

    console.log(`Day 1 re-renders: ${day1Calls.length}`);
    console.log(`Day 2 re-renders: ${day2Calls.length}`);

    expect(day1Calls.length).toBe(1); // Should re-render once
    expect(day2Calls.length).toBe(0); // Should NOT re-render
  });

  it('avoids re-rendering all days when focus changes via keyboard', async () => {
    const currentDate = new Date(2024, 0, 1);
    const onToggleDay = vi.fn();
    const onNavigate = vi.fn();

    render(
      <UserCalendar
        currentDate={currentDate}
        floEntries={{}}
        onToggleDay={onToggleDay}
        onNavigate={onNavigate}
      />
    );

    // Initial renders happen. Clear mock.
    CalendarDayMock.mockClear();

    const day1 = screen.getByTestId('day-1');
    day1.focus();

    // Simulate pressing ArrowRight on Day 1
    await act(async () => {
      fireEvent.keyDown(day1, { key: 'ArrowRight', code: 'ArrowRight' });
    });

    // Expect renders to be minimal (Day 1 and Day 2 only)
    const calls = CalendarDayMock.mock.calls;

    console.log(`Re-renders after key press: ${calls.length}`);

    expect(calls.length).toBeLessThan(10);
    expect(calls.length).toBeGreaterThan(0);
  });
});
