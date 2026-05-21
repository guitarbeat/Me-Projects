import { memo } from 'react';
import { GradientButton, Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { monthNames } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface CalendarHeaderProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onJumpToToday?: (() => void) | undefined;
  showTodayButton?: boolean | undefined;
  navigationDirection?: 'prev' | 'next' | null;
  readOnly?: boolean;
}

export const CalendarHeader = memo(({
  currentDate,
  onNavigate,
  onJumpToToday,
  showTodayButton = false,
  navigationDirection = null,
  readOnly = false,
}: CalendarHeaderProps) => {
  const today = new Date();
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  // Determine if we can navigate to next month (can't go to future)
  const canGoNext = !readOnly && !isCurrentMonth;

  // Get animation class based on navigation direction
  const getMonthAnimationClass = () => {
    if (!navigationDirection) {
      return '';
    }
    return navigationDirection === 'next'
      ? 'month-slide-left'
      : 'month-slide-right';
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex justify-between items-center">
        <GradientButton
          variant="lavender"
          onClick={() => onNavigate('prev')}
          className="rounded-full p-2.5 sm:p-3 border-2 border-primary/60 dark:border-primary bg-background/80 dark:bg-background/60 backdrop-blur-sm nav-arrow-entrance interactive-element"
          size="icon"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </GradientButton>
        <h2
          key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
          className={cn(
            'text-xl sm:text-2xl font-semibold font-comfortaa gradient-text text-center px-2',
            getMonthAnimationClass()
          )}
        >
          <span className="block sm:inline">
            {monthNames[currentDate.getMonth()]}
          </span>
          <span className="block sm:inline sm:ml-2">
            {currentDate.getFullYear()}
          </span>
        </h2>
        <GradientButton
          variant="lavender"
          onClick={() => canGoNext && onNavigate('next')}
          className={cn(
            'rounded-full p-2.5 sm:p-3 border-2 border-primary/60 dark:border-primary bg-background/80 dark:bg-background/60 backdrop-blur-sm nav-arrow-entrance interactive-element',
            !canGoNext && 'nav-arrow-disabled'
          )}
          size="icon"
          aria-label="Next month"
          aria-disabled={!canGoNext}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </GradientButton>
      </div>

      {/* Today Jump Button - appears when not on current month */}
      {showTodayButton && !isCurrentMonth && onJumpToToday && (
        <div className="flex justify-center animate-fade-in">
          <Button
            variant="outline"
            size="sm"
            onClick={onJumpToToday}
            className={cn(
              'rounded-full px-4 py-1.5 h-auto',
              'border-primary/40 bg-primary/5 hover:bg-primary/10',
              'text-primary font-quicksand text-sm',
              'flex items-center gap-2',
              'transition-all duration-300 hover:scale-105',
              'shadow-sm hover:shadow-md'
            )}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Jump to Today</span>
          </Button>
        </div>
      )}
    </div>
  );
});

CalendarHeader.displayName = 'CalendarHeader';
