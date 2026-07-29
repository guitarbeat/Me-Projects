/**
 * Calendar and Period Tracking Types
 *
 * Centralized type definitions for calendar and period tracking.
 * This is the canonical source for FloEntry and related types.
 */

/**
 * A single period/flo entry from the database.
 * This is the canonical definition - import from here, not hooks.
 */
export interface FloEntry {
  id: string;
  user_id: string;
  date: string;
  is_period_day: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Map of date strings to period day status.
 * Used for efficient lookup in calendar grid.
 */
export interface FloEntries {
  [dateStr: string]: boolean;
}

/**
 * Calendar date representation for navigation.
 */
export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Props for month navigation components.
 */
export interface MonthNavigationProps {
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
}

/**
 * Handler type for day click events.
 */
export interface DayClickHandler {
  (day: number): void | Promise<void>;
}
