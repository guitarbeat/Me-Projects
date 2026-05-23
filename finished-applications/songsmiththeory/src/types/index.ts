

// --- UI TYPES ---

// --- MUSIC TYPES ---

export type Note = string;

export const ScaleType = {
  Major: 'Major',
  Minor: 'Natural Minor',
  Dorian: 'Dorian',
  Phrygian: 'Phrygian',
  Lydian: 'Lydian',
  Mixolydian: 'Mixolydian',
  Locrian: 'Locrian',
  // Harmonic Major Modes
  HarmonicMajor: 'Harmonic Major',
  Dorianb5: 'Dorian b5',
  Phrygianb4: 'Phrygian b4',
  Lydianb3: 'Lydian b3',
  Mixolydianb2: 'Mixolydian b2',
  LydianAug2: 'Lydian Aug #2',
  Locrianbb7: 'Locrian bb7'
} as const;

// eslint-disable-next-line no-redeclare
export type ScaleType = typeof ScaleType[keyof typeof ScaleType];

export type InstrumentType = 'rhodes' | 'pad' | 'pluck' | 'synth';

// Explicitly defined complexity type
export type ChordComplexity = 'triad' | '7th' | '9th' | '11th';

export interface Chord {
  id: string;
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
  sentiment?: { valence: number; arousal: number; };
  lyrics?: string; // Added for songwriting tool
}

export interface ScaleDef {
  intervals: number[];
  palette: { accent: string; background: string; gradient: string };
  coords: { x: number; y: number };
  emotions: Record<number, string>;
  meta: { title: string; desc: string; quote: string; characteristic: string; };
  scaleCoordinates: { v: number; a: number; t: number; };
}