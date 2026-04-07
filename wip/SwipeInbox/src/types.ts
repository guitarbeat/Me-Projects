export interface AppColors {
  bg: string;
  text: string;
  empty: string;
  fill: string;
}

export type ActiveLabelFormat = 'date' | 'day' | 'week' | 'month' | 'month-date' | 'full';

export interface AppConfig {
  date: string; // YYYY-MM-DD
  mode: 'horizontal' | 'vertical';
  granularity: 'day' | 'week' | 'month';
  itemsPerRow: number;
  isMondayFirst: boolean;
  showMonths: boolean; // repurposed as "Show Labels" for non-day views
  showDays: boolean;
  showYearLabel: boolean;
  showActiveLabel: boolean;
  activeLabelFormat: ActiveLabelFormat; // New property
  dotSize: number;
  gap: number;
  radius: number;
  fontSize: number;
  fontFamily: string;
  colors: AppColors;
  transparentBg: boolean;
}

export interface DayData {
  date?: Date;
  label: string;
  filled: boolean;
  active?: boolean;
  // For Day view specific metadata
  dayOfWeek?: number;
  month?: number;
  weekIndex?: number; // New property
}