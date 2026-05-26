import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { CalendarHeader } from './CalendarHeader';
import { WeekdayHeaders } from './WeekdayHeaders';
import { CalendarDay } from './CalendarDay';
import { getDaysInMonth } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { hapticSelection, hapticSuccess } from '@/lib/haptics';

interface UserCalendarProps {
  currentDate: Date;
  floEntries: Record<string, boolean>;
  onToggleDay?: (day: number, isFloDay: boolean) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onJumpToToday?: () => void;
  readOnly?: boolean;
  showTodayButton?: boolean;
}

export const UserCalendar = memo(
  ({
    currentDate,
    floEntries,
    onToggleDay,
    onNavigate,
    onJumpToToday,
    readOnly = false,
    showTodayButton = true,
  }: UserCalendarProps) => {
    const [navigationDirection, setNavigationDirection] = useState<
      'prev' | 'next' | null
    >(null);
    const [lastToggledDay, setLastToggledDay] = useState<string | null>(null);

    // Focus management for keyboard navigation
    const [focusedDay, setFocusedDay] = useState<number | null>(null);
    const focusedDayRef = useRef<number | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Initialize focus when date changes
    useEffect(() => {
      const today = new Date();
      const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
      const initialFocus = isCurrentMonth ? today.getDate() : 1;
      setFocusedDay(initialFocus);
      focusedDayRef.current = initialFocus;
    }, [currentDate]);

    // Focus element when focusedDay changes
    useEffect(() => {
      focusedDayRef.current = focusedDay;

      if (focusedDay === null || !gridRef.current) {
        return;
      }

      // Find index of the day in the grid
      const days = getDaysInMonth(currentDate);
      const index = days.indexOf(focusedDay);

      if (index !== -1 && gridRef.current.children[index]) {
        const element = gridRef.current.children[index] as HTMLElement;
        // Only focus if it's not already focused to prevent fighting
        if (document.activeElement !== element) {
          // We don't force focus here because it might steal focus on mount
          // Roving tabindex handles the focusability
          // But for arrow keys, we DO want to move focus.
          // We can check if focus is already inside the grid
          if (gridRef.current.contains(document.activeElement)) {
            element.focus();
          }
        }
      }
    }, [focusedDay, currentDate]);

    // Use ref for floEntries to keep callbacks stable
    const floEntriesRef = useRef(floEntries);
    useEffect(() => {
      floEntriesRef.current = floEntries;
    }, [floEntries]);

    // Long-press multi-select state
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [multiSelectStart, setMultiSelectStart] = useState<number | null>(
      null
    );
    const [multiSelectEnd, setMultiSelectEnd] = useState<number | null>(null);
    const [showLongPressHint, setShowLongPressHint] = useState(false);
    const activeLongPressDayRef = useRef<number | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastDoubleTapRef = useRef<number>(0);
    const hintShownRef = useRef(false);

    // Handle navigation with direction tracking
    const handleNavigate = useCallback(
      (direction: 'prev' | 'next') => {
        setNavigationDirection(direction);
        onNavigate(direction);
        // Clear direction after animation
        setTimeout(() => setNavigationDirection(null), 350);
      },
      [onNavigate]
    );

    // Swipe gesture for mobile navigation
    const swipeRef = useSwipeGesture({
      onSwipeLeft: () => handleNavigate('next'),
      onSwipeRight: () => handleNavigate('prev'),
      threshold: 50,
      enabled: !readOnly,
    });

    const daysInMonth = useMemo(
      () => getDaysInMonth(currentDate),
      [currentDate]
    );
    // Handle double-tap on header to jump to today
    const handleHeaderDoubleTap = useCallback(() => {
      const now = Date.now();
      if (now - lastDoubleTapRef.current < 300) {
        // Double tap detected
        onJumpToToday?.();
        hapticSuccess();
      }
      lastDoubleTapRef.current = now;
    }, [onJumpToToday]);

    // Long-press handlers for multi-select
    const handleDayPressStart = useCallback(
      (day: number) => {
        if (readOnly || !onToggleDay) {
          return;
        }

        activeLongPressDayRef.current = day;

        longPressTimerRef.current = setTimeout(() => {
          setIsMultiSelectMode(true);
          setMultiSelectStart(day);
          setMultiSelectEnd(day);
          activeLongPressDayRef.current = null;
          hapticSuccess(); // Double vibration to indicate mode entry
          setTimeout(() => hapticSelection(), 100);

          // Show hint on first use
          if (!hintShownRef.current) {
            setShowLongPressHint(true);
            hintShownRef.current = true;
            setTimeout(() => setShowLongPressHint(false), 3000);
          }
        }, 400);
      },
      [readOnly, onToggleDay]
    );

    const handleDayPressEnd = useCallback(() => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      activeLongPressDayRef.current = null;
    }, []);

    const handleDayHover = useCallback(
      (day: number) => {
        if (isMultiSelectMode && multiSelectStart !== null) {
          setMultiSelectEnd(day);
        }
      },
      [isMultiSelectMode, multiSelectStart]
    );

    const handleMultiSelectConfirm = useCallback(() => {
      if (
        !isMultiSelectMode ||
        multiSelectStart === null ||
        multiSelectEnd === null ||
        !onToggleDay
      ) {
        setIsMultiSelectMode(false);
        setMultiSelectStart(null);
        setMultiSelectEnd(null);
        return;
      }

      const start = Math.min(multiSelectStart, multiSelectEnd);
      const end = Math.max(multiSelectStart, multiSelectEnd);

      const year = currentDate.getFullYear();
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');

      // Toggle all days in range
      for (let day = start; day <= end; day++) {
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;
        const isFloDay = !!floEntriesRef.current[dateStr];
        onToggleDay(day, isFloDay);
      }

      hapticSuccess();
      setIsMultiSelectMode(false);
      setMultiSelectStart(null);
      setMultiSelectEnd(null);
    }, [
      isMultiSelectMode,
      multiSelectStart,
      multiSelectEnd,
      onToggleDay,
      currentDate,
    ]); // Removed floEntries dependency

    const handleDayClick = useCallback(
      (day: number, isFloDay: boolean) => {
        if (readOnly || !onToggleDay) {
          return;
        }

        // If in multi-select mode, this is the confirm action
        if (isMultiSelectMode) {
          handleMultiSelectConfirm();
          return;
        }

        const year = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        // Trigger appropriate haptic
        if (isFloDay) {
          hapticSelection();
        } else {
          hapticSuccess();
          // Show toggle confirmation for newly marked days
          setLastToggledDay(dateStr);
          setTimeout(() => setLastToggledDay(null), 500);
        }

        onToggleDay(day, isFloDay);
      },
      [
        readOnly,
        onToggleDay,
        isMultiSelectMode,
        handleMultiSelectConfirm,
        currentDate,
      ]
    );

    // Check if day is in multi-select range
    const isDayInMultiSelectRange = useCallback(
      (day: number) => {
        if (
          !isMultiSelectMode ||
          multiSelectStart === null ||
          multiSelectEnd === null
        ) {
          return false;
        }
        const start = Math.min(multiSelectStart, multiSelectEnd);
        const end = Math.max(multiSelectStart, multiSelectEnd);
        return day >= start && day <= end;
      },
      [isMultiSelectMode, multiSelectStart, multiSelectEnd]
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent, day: number) => {
        if (!focusedDayRef.current) {
          return;
        }

        const handleMove = (newDay: number) => {
          const daysInMonthCount = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0
          ).getDate();
          if (newDay >= 1 && newDay <= daysInMonthCount) {
            e.preventDefault();
            setFocusedDay(newDay);
          }
        };

        switch (e.key) {
          case 'ArrowLeft':
            handleMove(day - 1);
            break;
          case 'ArrowRight':
            handleMove(day + 1);
            break;
          case 'ArrowUp':
            handleMove(day - 7);
            break;
          case 'ArrowDown':
            handleMove(day + 7);
            break;
          case 'Home':
            e.preventDefault();
            setFocusedDay(1);
            break;
          case 'End':
            e.preventDefault();
            setFocusedDay(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
              ).getDate()
            );
            break;
        }
      },
      [currentDate]
    );

    return (
      <div ref={swipeRef} className="relative smooth-resize">
        {/* Multi-select mode indicator */}
        {isMultiSelectMode && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full shadow-lg animate-fade-in">
            Tap to confirm range
          </div>
        )}

        {/* Long-press hint tooltip */}
        {showLongPressHint && !isMultiSelectMode && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full shadow-lg animate-fade-in flex items-center gap-1.5">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Drag to select range
          </div>
        )}

        <div onClick={handleHeaderDoubleTap}>
          <CalendarHeader
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onJumpToToday={onJumpToToday}
            showTodayButton={showTodayButton && !readOnly && !!onJumpToToday}
            navigationDirection={navigationDirection}
            readOnly={readOnly}
          />
        </div>
        <WeekdayHeaders />

        {/* Calendar grid */}
        <div
          className={cn(
            'relative transition-all duration-200',
            isMultiSelectMode && 'ring-2 ring-primary/50 rounded-lg'
          )}
        >
          <div
            ref={gridRef}
            role="grid"
            aria-label="Calendar grid"
            className="grid grid-cols-7 relative smooth-resize"
            style={{
              gap: 'var(--cell-gap)',
              padding: 'var(--space-2xs)',
              margin: 'calc(-1 * var(--space-2xs))',
            }}
          >
            {(() => {
              // Pre-calculate common values outside the map loop
              const year = currentDate.getFullYear();
              const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');

              // Calculate today manually to avoid timezone shifting
              const todayObj = new Date();
              const todayYear = todayObj.getFullYear();
              const todayMonthStr = String(todayObj.getMonth() + 1).padStart(2, '0');
              const todayDayStr = String(todayObj.getDate()).padStart(2, '0');
              const todayStr = `${todayYear}-${todayMonthStr}-${todayDayStr}`;

              return daysInMonth.map((day, index) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square"
                      role="presentation"
                    />
                  );
                }

                const dayStr = String(day).padStart(2, '0');
                const dateStr = `${year}-${monthStr}-${dayStr}`;

                const isFloDay = !!floEntries[dateStr];
                const isToday = dateStr === todayStr;
                const justToggled = lastToggledDay === dateStr;
                const inMultiSelectRange = isDayInMultiSelectRange(day);
                const isFocused = focusedDay === day;

                return (
                <CalendarDay
                  key={dateStr}
                  day={day}
                  currentDate={currentDate}
                  isFloDay={isFloDay}
                  isToday={isToday}
                  readOnly={readOnly}
                  onToggle={handleDayClick}
                  onPressStart={handleDayPressStart}
                  onPressEnd={handleDayPressEnd}
                  onHover={handleDayHover}
                  inMultiSelectRange={inMultiSelectRange}
                  justToggled={justToggled}
                  tabIndex={isFocused ? 0 : -1}
                  onKeyDown={handleKeyDown}
                />
                );
              });
            })()}
          </div>
        </div>
      </div>
    );
  }
);

UserCalendar.displayName = 'UserCalendar';
