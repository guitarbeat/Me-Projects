
import { GoogleGenAI } from "@google/genai";

// --- VERTICAL SPLIT TYPES (Swift Port) ---

export enum SplitDetent {
    TopFull = 'top-full',
    BottomFull = 'bottom-full',
    TopMini = 'top-mini',
    BottomMini = 'bottom-mini',
    Fraction = 'fraction' // value 0-1
}

export interface SplitAccessory {
    id: string;
    icon: any; // Lucide Icon
    action: () => void;
    color?: string;
    active?: boolean;
}

export const SPLIT_CONSTANTS = {
    spacing: 12, // Gap between panels
    lil: 68,     // Height of the mini/collapsed view
    lil2: 68 * 1.5,
    lil3: 68 * 2,
    notches: 6,
    snapThreshold: 0.15
};

// --- TYPES ---

// Polyfill Type enum to prevent import failures if strict named export is missing
export const Type = {
  TYPE_UNSPECIFIED: 'TYPE_UNSPECIFIED',
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  INTEGER: 'INTEGER',
  BOOLEAN: 'BOOLEAN',
  ARRAY: 'ARRAY',
  OBJECT: 'OBJECT',
  NULL: 'NULL'
};

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
export type ChordComplexity = 'triad' | '7th' | '9th' | '11th' | '13th';
export type VoicingType = 'Root' | '1st Inv' | '2nd Inv' | 'Drop-2';

export interface VoicedNote {
  note: Note;
  octave: number;
}

export interface Chord {
  root: Note;
  quality: 'Major' | 'Minor' | 'Diminished' | 'Augmented' | 'Half-Dim' | 'Dominant';
  extension: string;
  suffix: string;
  symbol: string;
  romanNumeral: string;
  notes: Note[];
  interval: number;
  emotionalDesc?: string;
  functionLabel?: string;
  theoryInfo?: string; // New field for educational context
  targetChord?: string; // New field for resolution targets
  x?: number; // Visual coordinates
  y?: number;
  z?: number;
  scale?: number;
  
  // Rhythmic properties
  duration: number; // In beats (e.g. 1 = quarter, 4 = whole)
  isRest?: boolean;
}

export interface ScaleDef {
  intervals: number[];
  palette: { accent: string; background: string; gradient: string };
  coords: { x: number; y: number };
  emotions: Record<number, string>;
  meta: { title: string; desc: string; quote: string; characteristic: string; };
  scaleCoordinates: { v: number, a: number }; // For mood mapping
}

export interface AiSuggestion {
  root: string;
  quality: string;
  extension: string;
  roman: string;
  explanation: string;
  confidence: number;
}

export interface AiAnalysis {
    summary: string;
    emotionalArc: string;
    harmonicComplexity: string;
    rating: number; // 1-100
}

export interface HarmonicAffinity {
  score: number;
  label: string;
  color: string;
  description: string;
}

// --- CONSTANTS ---

export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

export const SCALE_DEFS: Record<ScaleType, ScaleDef> = {
  [ScaleType.Major]: { 
    intervals: [0, 2, 4, 5, 7, 9, 11], 
    coords: { x: 0.75, y: 0.6 }, 
    scaleCoordinates: { v: 0.8, a: 0.2 },
    palette: { accent: '#38bdf8', background: '#0f172a', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)' }, 
    emotions: { 0: "Home", 1: "Soft Sorrow", 2: "Bittersweet", 3: "Hopeful", 4: "Tension", 5: "Sad Lift", 6: "Unresolved" }, 
    meta: { title: 'Ionian', desc: 'Bright & Heroic', quote: 'The journey home.', characteristic: 'Major 7th' } 
  },
  [ScaleType.Minor]: { 
    intervals: [0, 2, 3, 5, 7, 8, 10], 
    coords: { x: -0.6, y: -0.7 }, 
    scaleCoordinates: { v: -0.8, a: -0.2 },
    palette: { accent: '#6366f1', background: '#0a0e14', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' }, 
    emotions: { 0: "Sad Home", 1: "Dissonant", 2: "Hopeful", 3: "Deep Sadness", 4: "Dark Tension", 5: "Epic", 6: "Resolved" }, 
    meta: { title: 'Aeolian', desc: 'Deep & Emotional', quote: 'Shadows in the moonlight.', characteristic: 'Flat 6' } 
  },
  [ScaleType.Mixolydian]: { 
    intervals: [0, 2, 4, 5, 7, 9, 10], 
    coords: { x: 0.8, y: -0.1 }, 
    scaleCoordinates: { v: 0.5, a: 0.6 },
    palette: { accent: '#f59e0b', background: '#140f0a', gradient: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)' }, 
    emotions: {}, 
    meta: { title: 'Mixolydian', desc: 'Hopeful & Bluesy', quote: 'Sun breaking through.', characteristic: 'Flat 7' } 
  },
  [ScaleType.Lydian]: { 
    intervals: [0, 2, 4, 6, 7, 9, 11], 
    coords: { x: 0.4, y: -0.5 }, 
    scaleCoordinates: { v: 0.6, a: -0.5 },
    palette: { accent: '#d946ef', background: '#140a12', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)' }, 
    emotions: {}, 
    meta: { title: 'Lydian', desc: 'Dreamy & Floating', quote: 'Above the clouds.', characteristic: 'Sharp 4' } 
  },
  [ScaleType.Dorian]: { 
    intervals: [0, 2, 3, 5, 7, 9, 10], 
    coords: { x: -0.2, y: -0.2 }, 
    scaleCoordinates: { v: -0.2, a: 0.1 },
    palette: { accent: '#a855f7', background: '#0a0a14', gradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)' }, 
    emotions: {}, 
    meta: { title: 'Dorian', desc: 'Soulful & Jazzy', quote: 'Late night introspection.', characteristic: 'Major 6' } 
  },
  [ScaleType.Phrygian]: { 
    intervals: [0, 1, 3, 5, 7, 8, 10], 
    coords: { x: -0.6, y: 0.6 }, 
    scaleCoordinates: { v: -0.5, a: 0.8 },
    palette: { accent: '#ef4444', background: '#140a0a', gradient: 'linear-gradient(135deg, #fca5a5 0%, #991b1b 100%)' }, 
    emotions: {}, 
    meta: { title: 'Phrygian', desc: 'Exotic & Dark', quote: 'Ancient mysteries revealed.', characteristic: 'Flat 2' } 
  },
  [ScaleType.Locrian]: { 
    intervals: [0, 1, 3, 5, 6, 8, 10], 
    coords: { x: -0.3, y: 0.9 }, 
    scaleCoordinates: { v: -0.9, a: 0.5 },
    palette: { accent: '#71717a', background: '#09090b', gradient: 'linear-gradient(135deg, #52525b 0%, #18181b 100%)' }, 
    emotions: {}, 
    meta: { title: 'Locrian', desc: 'Tense & Unstable', quote: 'The edge of reality.', characteristic: 'Flat 5' } 
  },
};

// --- MUSIC THEORY LOGIC ---

export const getIntervalDescription = (intervalIndex: number, scaleType: ScaleType) => {
    // Returns emotional/functional description for the SVG tethers
    if (intervalIndex === 0) return "Root";
    if (intervalIndex === 4) return "Dominant Pull";
    if (intervalIndex === 3) return "Subdominant";
    if (intervalIndex === 6) return "Leading Tone";
    if (scaleType === ScaleType.Major) {
        if (intervalIndex === 5) return "Sorrow"; // vi
        if (intervalIndex === 1) return "Departure"; // ii
        if (intervalIndex === 2) return "Bittersweet"; // iii
    }
    if (scaleType === ScaleType.Minor) {
        if (intervalIndex === 2) return "Hope"; // III
        if (intervalIndex === 5) return "Tragedy"; // VI
        if (intervalIndex === 6) return "Resolution"; // VII
    }
    return "Interval";
}

export const getCompassLabel = (v: number, a: number) => {
    if (Math.abs(v) < 0.2 && Math.abs(a) < 0.2) return "Neutral";
    let labels = [];
    labels.push(a > 0 ? "High Energy" : "Calm");
    labels.push(v > 0 ? "Positive" : "Negative");
    return labels.join(" ");
};

export const getChromaticIndex = (n: string) => {
  const i = CHROMATIC_SHARPS.indexOf(n);
  return i === -1 ? CHROMATIC_FLATS.indexOf(n) : i;
};

export const getChromaticScale = (root: string) => 
  (['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root) || (root.includes('b') && root !== 'B')) 
  ? CHROMATIC_FLATS 
  : CHROMATIC_SHARPS;

export const getNoteFrequency = (note: Note, octave: number = 4) => 
  440 * Math.pow(2, (12 + (octave * 12) + getChromaticIndex(note) - 69) / 12);

export const getChordFrequencies = (c: Chord) => 
  c.notes.map((n, i) => getNoteFrequency(n, i === 0 ? 3 : 4));

export const getScaleNotes = (root: Note, type: ScaleType): Note[] => {
  const c = getChromaticScale(root);
  const r = getChromaticIndex(root);
  return SCALE_DEFS[type].intervals.map((i: number) => c[(r + i) % 12]);
};

export const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg - 90) * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
};

export const buildChord = (root: string, quality: Chord['quality'], params: any = {}): Chord => {
  const chromatic = getChromaticScale(root);
  const rootIdx = getChromaticIndex(root);
  const intervalsMap: any = { 
    'Major': [0,4,7], 'Minor': [0,3,7], 'Diminished': [0,3,6], 
    'Augmented': [0,4,8], 'Dominant': [0,4,7,10], 'Half-Dim': [0,3,6,10] 
  };
  
  let intervals = [...(intervalsMap[quality] || [0,4,7])];
  let suffix = '';
  let ext = params.extension || '';
  
  // Complexity handling: If no explicit extension is passed, derive from complexity
  const complexity = params.complexity || 'triad';

  if (!ext) {
      if (complexity === '7th' || complexity === '9th') {
          if (quality === 'Major') { intervals.push(11); suffix = 'maj7'; ext = 'Maj7'; }
          else if (quality === 'Minor') { intervals.push(10); suffix = 'm7'; ext = 'm7'; }
          else if (quality === 'Dominant') { /* Already has 7 */ suffix = '7'; ext = '7'; }
          else if (quality === 'Diminished') { intervals.push(9); suffix = 'dim7'; ext = 'dim7'; }
          else if (quality === 'Half-Dim') { /* Already has 7 */ suffix = 'm7b5'; ext = 'm7b5'; }
      }
      if (complexity === '9th') {
          intervals.push(14); // Add 9th
          if (!suffix.includes('9')) suffix = suffix.replace('7', '9');
          if (quality === 'Major') ext = 'Maj9';
          if (quality === 'Minor') ext = 'm9';
          if (quality === 'Dominant') ext = '9';
      }
  } else {
     // Explicit extension overrides complexity logic
     const extMap: any = { 'Maj7': [0,4,7,11], 'm7': [0,3,7,10], '7': [0,4,7,10], 'm7b5': [0,3,6,10], 'dim7': [0,3,6,9], 'Maj9': [0,4,7,11,14], 'm9': [0,3,7,10,14], '9': [0,4,7,10,14] };
     if (extMap[params.extension]) intervals = extMap[params.extension];
     suffix = params.extension.replace('Maj', 'maj');
  }

  // Fallback suffixes for Triads
  if (complexity === 'triad' && !ext) {
    suffix = quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : quality === 'Augmented' ? 'aug' : ''; 
    ext = 'Triad';
  }

  return {
    root, quality, extension: ext, suffix, symbol: `${root}${suffix}`, 
    romanNumeral: params.roman || 'I',
    notes: intervals.map(i => chromatic[(rootIdx + i) % 12]), 
    interval: params.degree || 0,
    emotionalDesc: params.emotion || quality, 
    functionLabel: params.functionLabel || "Diatonic",
    theoryInfo: params.theoryInfo || "Standard diatonic chord.",
    targetChord: params.targetChord,
    duration: params.duration || 4, // Default to 4 beats (1 bar)
    isRest: params.isRest || false
  };
};

export const generateChordsForScale = (root: Note, type: ScaleType, complexity: ChordComplexity): Chord[] => {
  const notes = getScaleNotes(root, type);
  return notes.map((note, i) => {
    const nIdx = getChromaticIndex(note);
    const getInt = (o: number) => (getChromaticIndex(notes[(i + o) % 7]) - nIdx + 12) % 12;
    const [th, fi, se] = [getInt(2), getInt(4), getInt(6)];
    let q: Chord['quality'] = 'Major';
    
    if (th === 3) q = fi === 6 ? 'Diminished' : 'Minor';
    else if (th === 4) q = fi === 8 ? 'Augmented' : 'Major';
    
    // Auto-detect diatonic quality for 7ths if Triad isn't forced
    // But we rely on buildChord to actually ADD the interval
    if (q === 'Major' && se === 10) q = 'Dominant';
    if (q === 'Diminished' && se === 10) q = 'Half-Dim';

    // Correction for basic triad logic if we are just labeling
    if (complexity === 'triad') {
       if (q === 'Dominant') q = 'Major';
       if (q === 'Half-Dim') q = 'Diminished';
    }

    const bases = ['i','ii','iii','iv','v','vi','vii'];
    const base = bases[i] || 'i';
    let roman = ['Major','Dominant','Augmented'].includes(q) ? base.toUpperCase() : base;
    if (q === 'Diminished') roman += '°';
    if (q === 'Augmented') roman += '+';
    
    // Add extension to Roman Numeral if needed
    if (complexity !== 'triad') {
        if (q === 'Dominant' || complexity === '7th') roman += '7';
        if (complexity === '9th') roman += '9';
    }
    
    return buildChord(note, q, { complexity, degree: i, emotion: SCALE_DEFS[type].emotions[i] || q, roman });
  });
};

export const generateSecondaryDominants = (root: Note, type: ScaleType, complexity: ChordComplexity = '7th'): Chord[] => {
    const notes = getScaleNotes(root, type);
    const scaleChords = generateChordsForScale(root, type, 'triad'); // Get targets

    // Limit to V/ii, V/iii, V/IV, V/V, V/vi (indices 1,2,3,4,5)
    return [1, 2, 3, 4, 5].filter(i => notes[i]).map(i => {
        const targetRoot = notes[i];
        const targetChord = scaleChords[i];
        const targetRoman = targetChord.romanNumeral;

        // The dominant of the target is 7 semitones above the target
        const dominantRoot = CHROMATIC_SHARPS[(getChromaticIndex(targetRoot) + 7) % 12];
        
        // Secondary dominants are ALWAYS Dominant quality (Major 3rd, Minor 7th)
        // If they were just Major, they wouldn't pull as hard.
        // If complexity is Triad, we still usually imply the function, but let's stick to the user's request.
        
        const q: Chord['quality'] = 'Dominant'; 
        // Note: Even in 'triad' mode, secondary dominants are functionally major triads acting as V. 
        // But to make them sound "good" as V7/x, they usually need the 7th. 
        // If the user selects 'Triad', we give them the Major V triad.
        
        const actualQuality = complexity === 'triad' ? 'Major' : 'Dominant';
        const romanBase = `V${complexity === 'triad' ? '' : '7'}/${targetRoman}`;

        return buildChord(dominantRoot, actualQuality, { 
            complexity, 
            degree: i, 
            emotion: `Pull to ${targetRoman}`, 
            roman: romanBase, 
            functionLabel: 'Secondary Dominant',
            theoryInfo: `The V chord of the ${targetRoman} chord. Creates a strong gravitational pull to ${targetRoot}. Requires resolution to sound consonant.`,
            targetChord: targetRoot + (targetChord.quality === 'Minor' ? 'm' : '')
        });
    });
};

export const generateBorrowedChords = (root: Note, type: ScaleType, complexity: ChordComplexity = '7th'): Chord[] => {
    const min = getScaleNotes(root, ScaleType.Minor);
    const maj = getScaleNotes(root, ScaleType.Major);
    
    // If we are in Major, we borrow from Parallel Minor
    if (type === ScaleType.Major) {
        return [
            buildChord(min[2], 'Major', { complexity, degree: 2, roman: 'bIII', functionLabel: 'Modal Mixture', emotion: "Heroic / Epic", theoryInfo: "Borrowed from parallel minor. Adds a bold, epic feeling often used in film scores (e.g., Lord of the Rings)." }),
            buildChord(min[3], 'Minor', { complexity, degree: 3, roman: 'iv', functionLabel: 'Minor Plagal', emotion: "Nostalgic / Sad", theoryInfo: "The 'Minor Four'. Creates a heartbreaking, sentimental resolution back to the Major I." }),
            buildChord(min[5], 'Major', { complexity, degree: 5, roman: 'bVI', functionLabel: 'Modal Mixture', emotion: "Fantasy / Wonder", theoryInfo: "Borrowed from parallel minor. A dramatic lift that feels magical and expansive." }),
            buildChord(min[6], 'Major', { complexity, degree: 6, roman: 'bVII', functionLabel: 'Backdoor V', emotion: "Adventure", theoryInfo: "Acts as a softer dominant. Instead of V->I, bVII->I feels like an adventure concluding." })
        ];
    } else {
        // If we are in Minor, we borrow from Parallel Major (Picardy) or Dorian
        return [
            buildChord(maj[0], 'Major', { complexity, degree: 0, roman: 'I', functionLabel: 'Picardy Third', emotion: "Hopeful End", theoryInfo: "Ending a minor song on a Major I chord. Symbolizes light breaking through darkness." }),
            buildChord(maj[3], 'Major', { complexity, degree: 3, roman: 'IV', functionLabel: 'Dorian Brightness', emotion: "Soulful / Uplifting", theoryInfo: "Borrowed from the Dorian mode. Adds a Carlos Santana-esque brightness to a minor key." }),
            buildChord(min[1], 'Major', { complexity, degree: 1, roman: 'II', functionLabel: 'Lydian Lift', emotion: "Dreamy", theoryInfo: "Borrowing the II from Lydian (or V/V). Brightens the minor tonality significantly." })
        ];
    }
};

export const getCompatibleModes = (chord: Chord): { scale: ScaleType, nuance: string, colorNote: string }[] => {
    const q = chord.quality;
    if (q === 'Major') return [{ scale: ScaleType.Major, nuance: "Consonant", colorNote: "4" }, { scale: ScaleType.Lydian, nuance: "Floating", colorNote: "#4" }];
    if (q === 'Minor') return [{ scale: ScaleType.Dorian, nuance: "Soulful", colorNote: "6" }, { scale: ScaleType.Minor, nuance: "Sad", colorNote: "b6" }];
    if (q === 'Dominant') return [{ scale: ScaleType.Mixolydian, nuance: "Bluesy", colorNote: "b7" }, { scale: ScaleType.Lydian, nuance: "Lydian Dom", colorNote: "#4" }];
    if (q === 'Half-Dim') return [{ scale: ScaleType.Locrian, nuance: "Tense", colorNote: "b5" }];
    return [{ scale: ScaleType.Major, nuance: "Standard", colorNote: "R" }];
};

export const getChordExtensions = (chord: Chord, scaleNotes: string[]) => {
  if (!scaleNotes.includes(chord.root)) return [];
  const rIdx = scaleNotes.indexOf(chord.root);
  return [ {d: 9, o: 2}, {d: 11, o: 4}, {d: 13, o: 6} ].map(({d, o}) => {
      const note = scaleNotes[(rIdx + o) % 7];
      const semi = (getChromaticIndex(note) - getChromaticIndex(chord.root) + 12) % 12;
      const name = (d === 9 && semi === 1) ? 'b9' : (d === 9 && semi === 3) ? '#9' : (d === 11 && semi === 6) ? '#11' : (d === 13 && semi === 8) ? 'b13' : `${d}`;
      return { note, intervalName: name, descriptor: 'Color', degree: d };
  });
};

export const analyzeHarmonicDensity = ({ notes, quality, extension }: Chord) => {
    let t = 0, b = 50;
    if (quality === 'Dominant') t = 60; else if (['Diminished', 'Augmented'].includes(quality)) t = 85; else if (quality === 'Minor') b = 30; else b = 80;
    if (extension.match(/b9|#9|#11|alt/)) t += 20;
    return { tension: Math.min(100, t), brightness: Math.min(100, b), complexity: notes.length * 20 };
};

export const getVoicedNotes = (chord: Chord, voicing: VoicingType = 'Root'): VoicedNote[] => {
    const rootIdx = getChromaticIndex(chord.root);
    // Sophisticated voicing logic
    // 1. Root is always at the bottom (octave 3)
    // 2. Guide tones (3rd and 7th) should be in the middle (octave 4 low)
    // 3. Extensions (9, 11, 13) or 5th on top
    
    // Simplistic approach for the Web Audio oscillator:
    // Sort notes by pitch. Ensure the root is the lowest. 
    // If it's a 7th or 9th chord, spread the upper notes to avoid mud.
    
    let baseOctave = 3;
    const notes = chord.notes.map((n, i) => {
        let octave = baseOctave;
        if (i > 0) octave = 4;
        
        // If the note is lower relative to root, bump it up
        if (getChromaticIndex(n) < rootIdx && i !== 0) octave = 5;
        
        // Spread voicing for complex chords
        if (chord.notes.length > 3 && i >= 2) {
             // Push the 3rd, 4th note (7th, 9th) higher
             if (i === 2 && Math.random() > 0.5) octave = 4; 
             if (i > 2) octave = 5; 
        }

        return { note: n, octave };
    });
    
    return notes.sort((a, b) => (a.octave * 12 + getChromaticIndex(a.note)) - (b.octave * 12 + getChromaticIndex(b.note)));
};

export const analyzeVoiceLeading = (a: Chord, b: Chord) => {
    const nA = getVoicedNotes(a), nB = getVoicedNotes(b);
    let totalMovement = 0, commonTones = 0, directionSum = 0;
    const lines = nA.slice(0, Math.min(nA.length, nB.length)).map((na, i) => {
        const diff = (nB[i].octave * 12 + getChromaticIndex(nB[i].note)) - (na.octave * 12 + getChromaticIndex(na.note));
        totalMovement += Math.abs(diff); if (diff === 0) commonTones++; if (diff !== 0) directionSum += Math.sign(diff);
        return { color: Math.abs(diff) <= 2 ? '#4ade80' : Math.abs(diff) <= 4 ? '#fbbf24' : '#f87171', diff };
    });
    return { 
        type: (totalMovement/lines.length) > 3.5 ? 'jump' : (totalMovement/lines.length) > 2 ? 'balanced' : 'smooth', 
        contour: commonTones===0 && Math.abs(directionSum)===lines.length ? (directionSum>0?'Parallel Up':'Parallel Down') : 'Mixed',
        commonTones, lines 
    };
};

export const generateOrbitalLayout = (chords: Chord[]) => {
    const sectors: any = { tonic: [], dominant: [], subdominant: [], mediant: [], submediant: [], exotic: [] };
    
    chords.forEach(c => {
        const r = c.romanNumeral.toLowerCase().replace(/[0-9]/g, '').split('/')[0];
        if(r==='i') sectors.tonic.push(c);
        else if(['v','vii'].some(k=>r.startsWith(k))) sectors.dominant.push(c);
        else if(['iv','ii'].some(k=>r.startsWith(k))) sectors.subdominant.push(c);
        else if(r.startsWith('iii')) sectors.mediant.push(c);
        else if(r.startsWith('vi')) sectors.submediant.push(c);
        else sectors.exotic.push(c);
    });
    
    const results: Chord[] = [];
    const place = (grp: Chord[], ang: number, r: number) => {
        grp.forEach((c, i) => {
            const spread = Math.min(90, grp.length*25);
            const start = ang - spread/2;
            const a = (grp.length===1 ? ang : start + (i/(grp.length-1)*spread)) * (Math.PI/180);
            results.push({...c, x: 50+(r*Math.cos(a)), y: 50+(r*Math.sin(a)), z: 10});
        });
    };
    
    sectors.tonic.forEach((c:any) => results.push({...c, x: 50, y: 50, z: 50}));
    place(sectors.dominant, 0, 28); 
    place(sectors.subdominant, 180, 28); 
    place(sectors.mediant, 270, 28); 
    place(sectors.submediant, 90, 28); 
    place(sectors.exotic, 135, 35);
    
    return results;
};

export const getHarmonicCompatibility = (a: Chord, b: Chord): HarmonicAffinity => {
    const dist = Math.min(Math.abs(getChromaticIndex(a.root) - getChromaticIndex(b.root)), 12 - Math.abs(getChromaticIndex(a.root) - getChromaticIndex(b.root)));
    return dist === 1 ? { score: 1, label: "Strong", color: "text-emerald-400", description: "Perfect 5th" }
         : dist === 2 ? { score: 0.8, label: "Moderate", color: "text-cyan-400", description: "Stepwise" }
         : dist === 3 ? { score: 0.7, label: "Relative", color: "text-purple-400", description: "Third" }
         : { score: 0.4, label: "Distant", color: "text-amber-500", description: "Chromatic" };
};

export const getScaleSuggestionForChord = (c: Chord) => 
  ({ 'Minor': c.romanNumeral.includes('ii') ? "Dorian" : "Aeolian", 'Dominant': "Mixolydian", 'Half-Dim': "Locrian" }[c.quality] || "Ionian");

// --- EMOTIONAL UTILS ---

export const getTempoFromArousal = (a: number) => Math.min(180, Math.max(60, Math.round(110 + (a * 50))));

export const getPsychologyDescription = (v: number, a: number) => 
  `${a > 0.2 ? "High Energy" : a < -0.2 ? "Low Energy" : "Moderate"} ${v > 0.2 ? "Positive" : v < -0.2 ? "Negative" : "Ambivalent"}`;

export const EMOTIONS: any = {
  "pleasant-energetic": { accent: "hsl(45, 93%, 47%)", grad: "rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15)" },
  "pleasant-calm": { accent: "hsl(142, 71%, 45%)", grad: "rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15)" },
  "unpleasant-energetic": { accent: "hsl(0, 84%, 60%)", grad: "rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.15)" },
  "unpleasant-calm": { accent: "hsl(217, 91%, 60%)", grad: "rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15)" },
  "neutral": { accent: "hsl(206, 42%, 56%)", grad: "rgba(100, 116, 139, 0.05)" }
};

export const getScientificEmotion = (v: number, a: number) => {
  const r = Math.sqrt(v*v + a*a);
  if (r < 0.2) return "neutral";
  if (v > 0) return a > 0 ? "pleasant-energetic" : "pleasant-calm";
  return a > 0 ? "unpleasant-energetic" : "unpleasant-calm";
};

// --- AUDIO ENGINE ---

class AudioEngine {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  instrument: InstrumentType = 'rhodes';
  timers: number[] = [];

  constructor() {}

  setInstrument(type: InstrumentType) {
    this.instrument = type;
  }

  private ensureContext() {
    if (typeof window === 'undefined') return null; // Safe guard for SSR

    if (!this.ctx) {
        // Safe access to AudioContext
        const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtor) {
            this.ctx = new AudioCtor();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
        }
    }
    
    if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playChord(chord: Chord, time = 0, duration = 1.0) {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    const now = time || ctx.currentTime;
    const voices = getVoicedNotes(chord);
    
    voices.forEach((v, i) => {
      this.playNote(v.note, v.octave, now, duration, i * 0.03); // Slight stagger for strum effect
    });
  }

  playNote(note: Note, octave: number, time: number, duration: number, delay = 0) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = getNoteFrequency(note, octave);
    
    osc.frequency.value = freq;
    
    // Instrument shaping
    if (this.instrument === 'rhodes') {
        osc.type = 'sine';
    } else if (this.instrument === 'pad') {
        osc.type = 'triangle';
    } else if (this.instrument === 'pluck') {
        osc.type = 'sine';
    } else {
        osc.type = 'sawtooth';
    }

    // Envelope
    const attack = this.instrument === 'pad' ? 0.5 : 0.01;
    const release = this.instrument === 'pad' ? 1.5 : 0.5;
    
    gain.gain.setValueAtTime(0, time + delay);
    gain.gain.linearRampToValueAtTime(0.3, time + delay + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, time + delay + duration + release);
    
    osc.connect(gain);
    gain.connect(this.masterGain); // Connect to master gain instead of destination
    
    osc.start(time + delay);
    osc.stop(time + delay + duration + release + 1);
  }

  playProgression(chords: Chord[], bpm: number, onTick?: (i: number) => void, onComplete?: () => void) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Clear previous timers if any
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];

    const beatTime = 60 / bpm;
    let currentTime = ctx.currentTime + 0.1;

    chords.forEach((chord, index) => {
        if (!chord.isRest) {
            this.playChord(chord, currentTime, chord.duration * beatTime);
        }
        
        // Schedule visual callback
        const timer = window.setTimeout(() => {
            onTick?.(index);
        }, (currentTime - ctx.currentTime) * 1000);
        this.timers.push(timer);

        currentTime += chord.duration * beatTime;
    });

    const endTimer = window.setTimeout(() => {
        onComplete?.();
        this.timers = [];
    }, (currentTime - ctx.currentTime) * 1000);
    this.timers.push(endTimer);
  }

  stop() {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    
    // Smooth mute and cleanup
    if (this.ctx && this.masterGain) {
        // Ramp to 0 to avoid clicks
        this.masterGain.gain.cancelScheduledValues(0);
        this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02);
        
        // Don't fully suspend immediately to allow tail to fade
        setTimeout(() => {
            if (this.ctx && this.ctx.state !== 'closed') {
                // optional: this.ctx.suspend().catch(() => {});
            }
        }, 100);
    }
  }
}

export const audioEngine = new AudioEngine();

// --- AI FUNCTIONS ---

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

export const generateSuggestions = async (key: string, scale: string, valence: number, arousal: number, progression: Chord[]): Promise<AiSuggestion[]> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    const context = progression.map(c => c.romanNumeral).join('-');
    const moodDesc = getPsychologyDescription(valence, arousal);
    
    const prompt = `Suggest 3 chords to follow this progression: [${context}] in ${key} ${scale}. 
    Mood: ${moodDesc} (Valence: ${valence}, Arousal: ${arousal}).`;

    // Manually typed schema to avoid import issues
    const suggestionSchema: any = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          root: { type: Type.STRING },
          quality: { type: Type.STRING },
          extension: { type: Type.STRING },
          roman: { type: Type.STRING },
          explanation: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
        },
        required: ["root", "quality", "extension", "roman", "explanation", "confidence"]
      }
    };

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
              responseMimeType: 'application/json',
              responseSchema: suggestionSchema
            }
        });
        
        return JSON.parse(result.text || '[]');
    } catch (e) {
        console.error("AI Generation failed", e);
        throw e;
    }
};

export const analyzeHarmony = async (progression: Chord[], key: string, scale: string): Promise<AiAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const context = progression.map(c => c.romanNumeral).join('-');
    
    const prompt = `Analyze this chord progression: [${context}] in ${key} ${scale}.
    Act as a PhD Music Theorist.`;

    const analysisSchema: any = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        emotionalArc: { type: Type.STRING },
        harmonicComplexity: { type: Type.STRING },
        rating: { type: Type.INTEGER },
      },
      required: ["summary", "emotionalArc", "harmonicComplexity", "rating"]
    };

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Use Pro for deep analysis
            contents: prompt,
            config: { 
              responseMimeType: 'application/json', 
              responseSchema: analysisSchema
            }
        });

        return JSON.parse(result.text || '{}');
    } catch (e) {
        console.error("AI Analysis failed", e);
        throw e;
    }
};
