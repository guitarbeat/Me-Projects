import { ReactNode } from 'react';

export type Detent = 'top' | 'middle' | 'bottom';

export interface SplitSettings {
  snapPoints: { top: boolean; middle: boolean; bottom: boolean };
  magneticStrength: number;
}

export interface VerticalSplitProps {
  topView: ReactNode;
  bottomView: ReactNode;
  topTitle?: string;
  bottomTitle?: string;
  defaultDetent?: Detent;
  onDetentChange?: (d: Detent) => void;
  className?: string;
  onExport?: () => void;
  onImport?: () => void;
  onProfile?: () => void;
  exportDisabled?: boolean;
  /** Slot for center content (e.g., chart selector) - replaces the drag handle when active */
  centerSlot?: ReactNode;
}

export const DEFAULT_SETTINGS: SplitSettings = {
  snapPoints: { top: true, middle: true, bottom: true },
  magneticStrength: 40,
};

export const SNAP_VALUES: Record<Detent, number> = {
  top: 8,
  middle: 50,
  bottom: 92,
};
export const MAGNETIC_RANGE = 6;
