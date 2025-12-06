

// --- UI TYPES ---

export const SplitDetent = {
    TopFull: 'top-full',
    BottomFull: 'bottom-full',
    TopMini: 'top-mini',
    BottomMini: 'bottom-mini',
    Fraction: 'fraction'
} as const;

export type SplitDetent = typeof SplitDetent[keyof typeof SplitDetent];

export interface SplitAccessory {
    id: string;
    icon: any; 
    action: () => void;
    color?: string;
    active?: boolean;
}

// --- MUSIC TYPES ---

export type Note = string;

export const ScaleType = {
  Major: 'Major',
  Minor: 'Natural Minor',
  Dorian: 'Dorian',
  Phrygian: 'Phrygian',
  Lydian: 'Lydian',
  Mixolydian: 'Mixolydian',
  Locrian: 'Locrian'
} as const;

export type ScaleType = typeof ScaleType[keyof typeof ScaleType];

export type InstrumentType = 'rhodes' | 'pad' | 'pluck' | 'synth';

// Explicitly defined complexity type
export type ChordComplexity = 'triad' | '7th' | '9th' | '11th';

export interface Chord {
  root: Note;
  quality: 'Major' | 'Minor' | 'Diminished' | 'Augmented' | 'Half-Dim' | 'Dominant' | 'Sus2' | 'Sus4';
  extension: string;
  suffix: string;
  symbol: string;
  romanNumeral: string;
  notes: Note[];
  interval: number;
  emotionalDesc?: string;
  functionLabel?: string;
  theoryInfo?: string;
  targetChord?: string;
  targetIndex?: number;
  tension?: number;
  complexity?: ChordComplexity;
  upperStructure?: string; // e.g., 'Em' over 'C' for CMaj7
  tensionType?: string;
  x?: number;
  y?: number;
  z?: number;
  scale?: number;
  duration: number;
  isRest?: boolean;
}

export interface ScaleDef {
  intervals: number[];
  palette: { accent: string; background: string; gradient: string };
  coords: { x: number; y: number };
  emotions: Record<number, string>;
  meta: { title: string; desc: string; quote: string; characteristic: string; };
  scaleCoordinates: { v: number, a: number };
}
