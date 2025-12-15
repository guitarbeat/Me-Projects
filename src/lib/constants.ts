
import { ScaleType, InstrumentType, ScaleDef } from '../types';

// --- LAYOUT CONSTANTS ---

export const SPLIT_CONSTANTS = {
  spacing: 12,
  lil: 68,
  lil2: 68 * 1.5,
  lil3: 68 * 2,
  notches: 6,
  snapThreshold: 0.15
};

// --- MUSIC DATA ---

export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

export const SCALE_DEFS: Record<ScaleType, ScaleDef> = {
  // --- DIATONIC MODES ---
  [ScaleType.Major]: {
    intervals: [0, 2, 4, 5, 7, 9, 11],
    coords: { x: 0.75, y: 0.6 },
    scaleCoordinates: { v: 0.75, a: 0.5, t: 0.0 },
    palette: { accent: '#facc15', background: '#0f172a', gradient: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)' },
    emotions: { 0: "Home", 1: "Soft Sorrow", 2: "Bittersweet", 3: "Hopeful", 4: "Tension", 5: "Sad Lift", 6: "Unresolved" },
    meta: { title: 'Ionian', desc: 'Bright & Heroic', quote: 'The journey home.', characteristic: 'Major 7th' }
  },
  [ScaleType.Minor]: {
    intervals: [0, 2, 3, 5, 7, 8, 10],
    coords: { x: -0.6, y: -0.7 },
    scaleCoordinates: { v: -0.6, a: -0.5, t: 0.1 },
    palette: { accent: '#6366f1', background: '#0a0e14', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' },
    emotions: { 0: "Sad Home", 1: "Dissonant", 2: "Hopeful", 3: "Deep Sadness", 4: "Dark Tension", 5: "Epic", 6: "Resolved" },
    meta: { title: 'Aeolian', desc: 'Deep & Emotional', quote: 'Shadows in the moonlight.', characteristic: 'Flat 6' }
  },
  [ScaleType.Mixolydian]: {
    intervals: [0, 2, 4, 5, 7, 9, 10],
    coords: { x: 0.8, y: -0.1 },
    scaleCoordinates: { v: 0.4, a: 0.2, t: 0.2 },
    palette: { accent: '#f59e0b', background: '#140f0a', gradient: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)' },
    emotions: {},
    meta: { title: 'Mixolydian', desc: 'Hopeful & Bluesy', quote: 'Sun breaking through.', characteristic: 'Flat 7' }
  },
  [ScaleType.Lydian]: {
    intervals: [0, 2, 4, 6, 7, 9, 11],
    coords: { x: 0.4, y: -0.5 },
    scaleCoordinates: { v: 0.8, a: -0.3, t: 0.1 },
    palette: { accent: '#d946ef', background: '#140a12', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)' },
    emotions: {},
    meta: { title: 'Lydian', desc: 'Dreamy & Floating', quote: 'Above the clouds.', characteristic: 'Sharp 4' }
  },
  [ScaleType.Dorian]: {
    intervals: [0, 2, 3, 5, 7, 9, 10],
    coords: { x: -0.2, y: -0.2 },
    scaleCoordinates: { v: -0.2, a: -0.1, t: 0.05 },
    palette: { accent: '#a855f7', background: '#0a0a14', gradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)' },
    emotions: {},
    meta: { title: 'Dorian', desc: 'Soulful & Jazzy', quote: 'Late night introspection.', characteristic: 'Major 6' }
  },
  [ScaleType.Phrygian]: {
    intervals: [0, 1, 3, 5, 7, 8, 10],
    coords: { x: -0.6, y: 0.6 },
    scaleCoordinates: { v: -0.5, a: 0.6, t: 0.5 },
    palette: { accent: '#ef4444', background: '#140a0a', gradient: 'linear-gradient(135deg, #fca5a5 0%, #991b1b 100%)' },
    emotions: {},
    meta: { title: 'Phrygian', desc: 'Exotic & Dark', quote: 'Ancient mysteries revealed.', characteristic: 'Flat 2' }
  },
  [ScaleType.Locrian]: {
    intervals: [0, 1, 3, 5, 6, 8, 10],
    coords: { x: -0.3, y: 0.9 },
    scaleCoordinates: { v: -0.9, a: 0.8, t: 0.8 },
    palette: { accent: '#71717a', background: '#09090b', gradient: 'linear-gradient(135deg, #52525b 0%, #18181b 100%)' },
    emotions: {},
    meta: { title: 'Locrian', desc: 'Tense & Unstable', quote: 'The edge of reality.', characteristic: 'Flat 5' }
  },

  // --- HARMONIC MAJOR MODES ---
  [ScaleType.HarmonicMajor]: {
    intervals: [0, 2, 4, 5, 7, 8, 11],
    coords: { x: 0.5, y: 0.3 },
    scaleCoordinates: { v: 0.6, a: 0.2, t: 0.4 },
    palette: { accent: '#10b981', background: '#064e3b', gradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)' },
    emotions: {},
    meta: { title: 'Harmonic Major', desc: 'Dreamy & Unsettled', quote: 'A fairytale with a twist.', characteristic: 'Flat 6' }
  },
  [ScaleType.Dorianb5]: {
    intervals: [0, 2, 3, 5, 6, 9, 10],
    coords: { x: -0.3, y: 0.1 },
    scaleCoordinates: { v: -0.3, a: 0.3, t: 0.5 },
    palette: { accent: '#6366f1', background: '#312e81', gradient: 'linear-gradient(135deg, #818cf8 0%, #4338ca 100%)' },
    emotions: {},
    meta: { title: 'Dorian b5', desc: 'Bluesy & Dark', quote: 'Walking in the rain.', characteristic: 'Flat 5' }
  },
  [ScaleType.Phrygianb4]: {
    intervals: [0, 1, 3, 4, 7, 8, 10],
    coords: { x: -0.5, y: 0.8 },
    scaleCoordinates: { v: -0.4, a: 0.7, t: 0.7 },
    palette: { accent: '#f43f5e', background: '#881337', gradient: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)' },
    emotions: {},
    meta: { title: 'Phrygian b4', desc: 'Exotic & Intense', quote: 'The desert heat.', characteristic: 'Diminished 4' }
  },
  [ScaleType.Lydianb3]: {
    intervals: [0, 2, 3, 6, 7, 9, 11],
    coords: { x: 0.2, y: -0.6 },
    scaleCoordinates: { v: -0.1, a: -0.2, t: 0.4 },
    palette: { accent: '#8b5cf6', background: '#4c1d95', gradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)' },
    emotions: {},
    meta: { title: 'Lydian b3', desc: 'Mysterious', quote: 'A forgotten memory.', characteristic: 'Flat 3' }
  },
  [ScaleType.Mixolydianb2]: {
    intervals: [0, 1, 4, 5, 7, 9, 10],
    coords: { x: 0.6, y: 0.2 },
    scaleCoordinates: { v: 0.3, a: 0.6, t: 0.6 },
    palette: { accent: '#f97316', background: '#7c2d12', gradient: 'linear-gradient(135deg, #fb923c 0%, #c2410c 100%)' },
    emotions: {},
    meta: { title: 'Mixolydian b2', desc: 'Eastern & Tense', quote: 'Snake charmer.', characteristic: 'Flat 2' }
  },
  [ScaleType.LydianAug2]: {
    intervals: [0, 3, 4, 6, 8, 9, 11],
    coords: { x: 0.4, y: 0.4 },
    scaleCoordinates: { v: 0.4, a: 0.8, t: 0.8 },
    palette: { accent: '#ec4899', background: '#831843', gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)' },
    emotions: {},
    meta: { title: 'Lydian Aug #2', desc: 'Dissonant & Bright', quote: 'Prism of light.', characteristic: 'Augmented 2' }
  },
  [ScaleType.Locrianbb7]: {
    intervals: [0, 1, 3, 5, 6, 8, 9],
    coords: { x: -0.8, y: 0.9 },
    scaleCoordinates: { v: -0.8, a: 0.1, t: 0.9 },
    palette: { accent: '#4b5563', background: '#111827', gradient: 'linear-gradient(135deg, #9ca3af 0%, #374151 100%)' },
    emotions: {},
    meta: { title: 'Locrian bb7', desc: 'Unstable & Diminished', quote: 'Total collapse.', characteristic: 'Diminished 7' }
  }
};

export const EMOTIONAL_ZONES = [
  { label: "Joyful", v: 0.8, a: 0.7, desc: "Energetic & Animated" },
  { label: "Power", v: 0.3, a: 0.8, desc: "Fiery & Heroic" },
  { label: "Tension", v: -0.5, a: 0.8, desc: "Agitated & Nervous" },
  { label: "Sadness", v: -0.8, a: -0.4, desc: "Sorrowful" },
  { label: "Tenderness", v: 0.6, a: -0.5, desc: "Warm & Sensual" },
  { label: "Peace", v: 0.9, a: -0.7, desc: "Calm & Serene" },
  { label: "Nostalgia", v: -0.2, a: -0.5, desc: "Sentimental" },
  { label: "Transcendence", v: 0.5, a: 0.1, desc: "Inspiring" },
  { label: "Wonder", v: 0.7, a: 0.0, desc: "Amazed" }
];