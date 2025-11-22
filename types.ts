
export type Note = string;

export enum ScaleType {
  Major = 'Major',
  Minor = 'Natural Minor',
  Dorian = 'Dorian',
  Phrygian = 'Phrygian',
  Lydian = 'Lydian',
  Mixolydian = 'Mixolydian',
  Locrian = 'Locrian'
}

export type InstrumentType = 'rhodes' | 'pad' | 'pluck' | 'synth';

export type VoicingType = 'Root' | '1st Inv' | '2nd Inv' | 'Drop-2';

export type ChordComplexity = 'triad' | '7th' | '9th' | '11th' | '13th';

export type HarmonicBank = 'diatonic' | 'secondary' | 'borrowed';

export interface VoicedNote {
  note: Note;
  octave: number;
}

export interface Chord {
  root: Note;
  quality: 'Major' | 'Minor' | 'Diminished' | 'Augmented' | 'Half-Dim' | 'Dominant';
  extension: string;
  suffix: string; // The display suffix (e.g., "maj7", "m7", "m")
  symbol: string; // Full symbol (e.g., "Cmaj7")
  romanNumeral: string;
  notes: Note[];
  interval: number; // Degree in scale (0-6)
  emotionalDesc?: string; // Narrative description of the chord's feel
  functionLabel?: string; // e.g., "V/V", "Borrowed"
}
