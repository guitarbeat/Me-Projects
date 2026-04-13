export interface AppColors {
  bg: string;
  text: string;
  empty: string;
  fill: string;
}

export type ActiveLabelFormat = 'date' | 'week' | 'day' | 'month' | 'month-date' | 'full';
export type DotShape = 'square' | 'rounded' | 'circle';

export interface AppConfig {
  date: string;
  mode: 'horizontal' | 'vertical';
  granularity: 'day' | 'week' | 'month';
  itemsPerRow: number;
  isMondayFirst: boolean;
  showMonths: boolean;
  showDays: boolean;
  showYearLabel: boolean;
  showActiveLabel: boolean;
  activeLabelFormat: ActiveLabelFormat;
  dotSize: number;
  gap: number;
  radius: number;
  dotShape: DotShape;
  maxIntensityThreshold: number;
  fontFamily: string;
  fontSize: number;
  colors: AppColors;
  transparentBg: boolean;
}

export interface DayData {
  date?: Date;
  dayOfWeek?: number;
  month?: number;
  weekIndex?: number;
  filled: boolean;
  active?: boolean;
  intensity?: number;
  count?: number;
  label: string;
}

export type { Activity } from '../../shared/schema';
