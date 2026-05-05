import { memo, useMemo } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Cache Intl formatters outside the component for better performance
// as creating these formatters is expensive, reducing render time per day.
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });

interface CalendarDayProps {
  day: number;
  currentDate: Date;
  isFloDay: boolean;
  isToday: boolean;
  readOnly: boolean;
  onToggle?: (day: number, isFloDay: boolean) => void;
  onPressStart?: (day: number) => void;
  onPressEnd?: () => void;
  onHover?: (day: number) => void;
  inMultiSelectRange: boolean;
  justToggled: boolean;
  tabIndex?: number;
  onKeyDown?: (e: React.KeyboardEvent, day: number) => void;
}

export const CalendarDay = memo(
  ({
    day,
    currentDate,
    isFloDay,
    isToday,
    readOnly,
    onToggle,
    onPressStart,
    onPressEnd,
    onHover,
    inMultiSelectRange,
    justToggled,
    tabIndex,
    onKeyDown,
  }: CalendarDayProps) => {
    const DayElement = readOnly ? 'div' : 'button';

    // Memoize date formatting to avoid recalculation on every render
    const ariaLabel = useMemo(() => {
      const fullDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const weekday = weekdayFormatter.format(fullDate);
      const month = monthFormatter.format(fullDate);
      return `${weekday}, ${month} ${day}, ${fullDate.getFullYear()}${isFloDay ? ', Period logged' : ''}`;
    }, [currentDate, day, isFloDay]);

    return (
      <DayElement
        role={readOnly ? undefined : 'gridcell'}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown ? (e) => onKeyDown(e, day) : undefined}
        aria-label={ariaLabel}
        aria-pressed={!readOnly ? isFloDay : undefined}
        onClick={readOnly ? undefined : () => onToggle?.(day, isFloDay)}
        onMouseDown={readOnly ? undefined : () => onPressStart?.(day)}
        onMouseUp={onPressEnd}
        onMouseLeave={onPressEnd}
        onTouchStart={readOnly ? undefined : () => onPressStart?.(day)}
        onTouchEnd={onPressEnd}
        onMouseEnter={() => onHover?.(day)}
        type={!readOnly ? 'button' : undefined}
        className={cn(
          'aspect-square border-2 focus-ring smooth-resize',
          'flex items-center justify-center font-bold font-quicksand',
          'relative overflow-hidden touch-target-expand',
          !readOnly && 'soft-bounce cursor-pointer group interactive-element',
          readOnly && 'cursor-default',
          isFloDay
            ? 'bg-gradient-to-br from-coral to-rose-pink border-coral/50 text-white shadow-md glow-pulse'
            : 'bg-gradient-to-br from-cream to-card dark:from-muted dark:to-card border-primary/30 text-foreground',
          !readOnly && !isFloDay && 'hover:border-primary/50 hover:shadow-sm',
          isToday && 'ring-2 ring-primary/50',
          justToggled && isFloDay && 'success-glow',
          inMultiSelectRange && !isFloDay && 'bg-primary/20 border-primary/50',
          inMultiSelectRange && isFloDay && 'ring-2 ring-white/50'
        )}
        style={{
          minHeight: 'var(--cell-min-h)',
          borderRadius: 'clamp(0.375rem, 1vw, 0.5rem)',
        }}
      >
        {/* Ripple effect on non-readonly */}
        {!readOnly && (
          <span
            className="absolute inset-0 bg-primary/10 scale-0 group-active:scale-100 transition-transform duration-150 ease-out"
            style={{ borderRadius: 'clamp(0.375rem, 1vw, 0.5rem)' }}
          />
        )}
        <span
          className="relative z-10"
          style={{ fontSize: 'var(--text-base)' }}
        >
          {day}
        </span>
        {isFloDay && (
          <Sparkles
            className="relative z-10 animate-pulse-soft text-white/80"
            style={{
              width: 'clamp(0.625rem, 1.5vw, 1rem)',
              height: 'clamp(0.625rem, 1.5vw, 1rem)',
              marginLeft: 'clamp(0.125rem, 0.5vw, 0.25rem)',
            }}
          />
        )}
        {/* Toggle confirmation checkmark */}
        {justToggled && isFloDay && (
          <span className="absolute inset-0 flex items-center justify-center z-20">
            <Check className="w-6 h-6 text-white toggle-confirm" />
          </span>
        )}
      </DayElement>
    );
  }
);

CalendarDay.displayName = 'CalendarDay';
