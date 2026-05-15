import { useState, useCallback, useMemo, memo } from 'react';
import { WeekdayHeaders } from './WeekdayHeaders';
import type { FloEntries } from '@/types/calendar';
import { formatLocalYYYYMMDD } from '@/lib/dateUtils';

interface CalendarGridProps {
  currentDate: Date;
  floEntries: FloEntries;
  onDayClick: (day: number) => void;
  disabled?: boolean;
}

export const CalendarGrid = memo(
  ({
    currentDate,
    floEntries,
    onDayClick,
    disabled = false,
  }: CalendarGridProps) => {
    const [rippleDay, setRippleDay] = useState<number | null>(null);
    const [hoverDay, setHoverDay] = useState<number | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = useMemo(() => new Date(), []);
    const isCurrentMonth =
      today.getFullYear() === year && today.getMonth() === month;

    // Check if a day is part of a streak (consecutive period days)
    const isPartOfStreak = useCallback(
      (
        day: number
      ): { isStreak: boolean; hasLeft: boolean; hasRight: boolean } => {
        // ⚡ Bolt: Use formatLocalYYYYMMDD instead of toISOString().split('T')[0]
        // This avoids timezone shifting bugs and improves render loop performance.
        const dateStr = formatLocalYYYYMMDD(new Date(year, month, day));
        const prevDateStr = formatLocalYYYYMMDD(new Date(year, month, day - 1));
        const nextDateStr = formatLocalYYYYMMDD(new Date(year, month, day + 1));

        const isCurrent = !!floEntries[dateStr];
        const hasPrev = !!floEntries[prevDateStr];
        const hasNext = !!floEntries[nextDateStr];

        return {
          isStreak: isCurrent && (hasPrev || hasNext),
          hasLeft: isCurrent && hasPrev,
          hasRight: isCurrent && hasNext,
        };
      },
      [floEntries, year, month]
    );

    const handleDayClick = useCallback(
      (day: number) => {
        if (disabled) {
          return;
        }

        // Trigger ripple effect
        setRippleDay(day);
        setTimeout(() => setRippleDay(null), 600);

        onDayClick(day);
      },
      [disabled, onDayClick]
    );

    const renderedDays = useMemo(() => {
      const days = [];

      // Empty cells for days before the month starts
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="aspect-square p-2" />);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        // ⚡ Bolt: Use formatLocalYYYYMMDD for better loop performance
        const dateStr = formatLocalYYYYMMDD(new Date(year, month, day));
        const isFloDay = !!floEntries[dateStr];
        const isToday = isCurrentMonth && day === today.getDate();
        const streak = isPartOfStreak(day);
        const isHovered = hoverDay === day;
        const isRippling = rippleDay === day;

        days.push(
          <button
            key={day}
            onClick={() => handleDayClick(day)}
            onMouseEnter={() => setHoverDay(day)}
            onMouseLeave={() => setHoverDay(null)}
            disabled={disabled}
            className={`
            relative aspect-square rounded-[clamp(0.375rem,1vw,0.5rem)] soft-bounce focus-ring
            flex items-center justify-center font-bold overflow-hidden smooth-resize
            ${
              isFloDay
                ? 'bg-gradient-to-br from-coral via-rose-pink to-coral text-white shadow-md'
                : 'bg-card hover:bg-accent'
            }
            ${
              isToday
                ? 'ring-2 ring-primary ring-offset-[clamp(1px,0.25vw,2px)] ring-offset-background'
                : ''
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
            style={{
              padding: 'clamp(0.375rem, 1vw, 0.5rem)',
              fontSize: 'var(--text-base)',
              minHeight: 'var(--cell-min-h)',
            }}
            aria-label={`${day} ${isFloDay ? '(Period day)' : ''} ${isToday ? '(Today)' : ''}`}
            aria-pressed={isFloDay}
          >
            {/* Streak connector - left */}
            {streak.hasLeft && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-3 bg-gradient-to-r from-rose-pink/60 to-coral/80 -ml-1" />
            )}

            {/* Streak connector - right */}
            {streak.hasRight && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-3 bg-gradient-to-l from-rose-pink/60 to-coral/80 -mr-1" />
            )}

            {/* Ripple effect */}
            {isRippling && (
              <span className="absolute inset-0 animate-ripple rounded-lg bg-white/30" />
            )}

            {/* Today pulsing dot indicator */}
            {isToday && !isFloDay && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}

            {/* Hover hint for non-period days */}
            {isHovered && !isFloDay && !disabled && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground opacity-60 whitespace-nowrap pointer-events-none">
                tap
              </span>
            )}

            {/* Glow effect for period days */}
            {isFloDay && (
              <span className="absolute inset-0 rounded-lg bg-white/10 glow-pulse pointer-events-none" />
            )}

            <span className="relative z-10">{day}</span>
          </button>
        );
      }

      return days;
    }, [
      firstDay,
      daysInMonth,
      year,
      month,
      floEntries,
      isCurrentMonth,
      today,
      isPartOfStreak,
      hoverDay,
      rippleDay,
      disabled,
      handleDayClick,
    ]);

    return (
      <div
        className="smooth-resize"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-xs)',
        }}
      >
        <WeekdayHeaders />
        <div
          className="grid grid-cols-7 smooth-resize"
          style={{ gap: 'var(--cell-gap)' }}
        >
          {renderedDays}
        </div>
      </div>
    );
  }
);

CalendarGrid.displayName = 'CalendarGrid';
