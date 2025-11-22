

import { Note, ScaleType, Chord, VoicingType, VoicedNote, ChordComplexity } from '../types';

const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Define coordinates for modes on the Valence (x) / Arousal (y) chart [-1, 1]
export const MODE_COORDINATES: Record<ScaleType, { x: number, y: number }> = {
  [ScaleType.Major]: { x: 0.75, y: 0.75 },      // Happy/High Energy
  [ScaleType.Mixolydian]: { x: 0.6, y: 0.1 },   // Cool/Chill Positive
  [ScaleType.Lydian]: { x: 0.5, y: -0.6 },      // Dreamy/Low Energy Positive
  [ScaleType.Minor]: { x: -0.7, y: -0.7 },      // Sad/Low Energy Negative
  [ScaleType.Dorian]: { x: -0.4, y: -0.2 },     // Soulful/Centrist Negative
  [ScaleType.Phrygian]: { x: -0.6, y: 0.6 },    // Aggressive/High Energy Negative
  [ScaleType.Locrian]: { x: -0.1, y: 0.9 },     // Tension
};

// Define Color Palettes for each Scale (Enhanced for Gradient Overlays)
export const SCALE_PALETTES: Record<ScaleType, { accent: string, background: string, gradient: string }> = {
  [ScaleType.Major]:      { accent: '#38bdf8', background: '#0f172a', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)' }, // Ionian: Sky Blue to White
  [ScaleType.Mixolydian]: { accent: '#f59e0b', background: '#140f0a', gradient: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)' }, // Mixolydian: Yellow to Orange
  [ScaleType.Lydian]:     { accent: '#d946ef', background: '#140a12', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)' }, // Lydian: Pink Dream
  [ScaleType.Minor]:      { accent: '#6366f1', background: '#0a0e14', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' }, // Aeolian: Indigo
  [ScaleType.Dorian]:     { accent: '#a855f7', background: '#0a0a14', gradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)' }, // Dorian: Purple Twilight
  [ScaleType.Phrygian]:   { accent: '#ef4444', background: '#140a0a', gradient: 'linear-gradient(135deg, #fca5a5 0%, #991b1b 100%)' }, // Phrygian: Deep Red
  [ScaleType.Locrian]:    { accent: '#71717a', background: '#09090b', gradient: 'linear-gradient(135deg, #52525b 0%, #18181b 100%)' }, // Locrian: Dark Grey
};

const CHORD_EMOTIONS: Record<string, Record<number, string>> = {
  [ScaleType.Major]: { 0: "Home", 1: "Soft Sorrow", 2: "Bittersweet", 3: "Hopeful", 4: "Tension", 5: "Sad Lift", 6: "Unresolved" },
  [ScaleType.Minor]: { 0: "Sad Home", 1: "Dissonant", 2: "Hopeful", 3: "Deep Sadness", 4: "Dark Tension", 5: "Epic", 6: "Resolved" },
};

const getChordEmotionalLabel = (scaleType: ScaleType, degree: number): string => {
  if (CHORD_EMOTIONS[scaleType] && CHORD_EMOTIONS[scaleType][degree]) {
    return CHORD_EMOTIONS[scaleType][degree];
  }
  if (degree === 0) return "Tonic";
  if (degree === 4) return "Dominant";
  return "Color";
};

export const SCALE_INTERVALS: Record<ScaleType, number[]> = {
  [ScaleType.Major]: [0, 2, 4, 5, 7, 9, 11],
  [ScaleType.Minor]: [0, 2, 3, 5, 7, 8, 10],
  [ScaleType.Dorian]: [0, 2, 3, 5, 7, 9, 10],
  [ScaleType.Phrygian]: [0, 1, 3, 5, 7, 8, 10],
  [ScaleType.Lydian]: [0, 2, 4, 6, 7, 9, 11],
  [ScaleType.Mixolydian]: [0, 2, 4, 5, 7, 9, 10],
  [ScaleType.Locrian]: [0, 1, 3, 5, 6, 8, 10],
};

export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

export const getNoteFrequency = (note: Note, octave: number = 4): number => {
  const baseNotes = CHROMATIC_SHARPS;
  let index = baseNotes.indexOf(note);
  if (index === -1) index = CHROMATIC_FLATS.indexOf(note);
  if (index === -1) return 0;

  const semitoneOffset = index; 
  const midi = 12 + (octave * 12) + semitoneOffset;
  return 440 * Math.pow(2, (midi - 69) / 12);
};

export const getChordFrequencies = (chord: Chord): number[] => {
  return chord.notes.map((note, i) => {
    const octave = i === 0 ? 3 : 4;
    return getNoteFrequency(note, octave);
  });
};

export const getChromaticIndex = (note: string): number => {
    let idx = CHROMATIC_SHARPS.indexOf(note);
    if (idx === -1) idx = CHROMATIC_FLATS.indexOf(note);
    return idx;
};

export const getVoicedNotes = (chord: Chord, voicing: VoicingType = 'Root'): VoicedNote[] => {
    const rawNotes = [...chord.notes];
    const voiced: VoicedNote[] = [];
    const rootIdx = getChromaticIndex(chord.root);
    
    rawNotes.forEach((n, i) => {
        let octave = 4;
        if (i === 0) octave = 3;
        else if (i >= 4) octave = 5;
        else {
            const noteIdx = getChromaticIndex(n);
            if (noteIdx < rootIdx) octave = 5; 
        }
        voiced.push({ note: n, octave });
    });

    if (voicing === '1st Inv') {
        if (voiced.length > 0) voiced[0].octave += 1;
        voiced.sort((a, b) => (a.octave * 12 + getChromaticIndex(a.note)) - (b.octave * 12 + getChromaticIndex(b.note)));
    }
    else if (voicing === '2nd Inv') {
        if (voiced.length > 0) voiced[0].octave += 1;
        if (voiced.length > 1) voiced[1].octave += 1;
        voiced.sort((a, b) => (a.octave * 12 + getChromaticIndex(a.note)) - (b.octave * 12 + getChromaticIndex(b.note)));
    }
    else if (voicing === 'Drop-2') {
        if (voiced.length >= 4) voiced[voiced.length - 2].octave -= 1;
        else if (voiced.length === 3) voiced[1].octave -= 1;
        voiced.sort((a, b) => (a.octave * 12 + getChromaticIndex(a.note)) - (b.octave * 12 + getChromaticIndex(b.note)));
    }

    return voiced;
};

export const getScaleFromEmotion = (valence: number, arousal: number): ScaleType => {
  if (Math.abs(valence) < 0.15 && Math.abs(arousal) < 0.15) return ScaleType.Dorian;

  if (valence >= 0) {
    if (arousal >= 0.3) return ScaleType.Major;
    else if (arousal > -0.3) return ScaleType.Mixolydian;
    else return ScaleType.Lydian;
  } else {
    if (arousal >= 0.3) return ScaleType.Phrygian;
    else if (arousal > -0.3) return ScaleType.Dorian;
    else return ScaleType.Minor;
  }
};

export const getTempoFromArousal = (arousal: number): number => {
    const bpm = 110 + (arousal * 50);
    return Math.min(180, Math.max(60, Math.round(bpm)));
};

export const getPsychologyDescription = (valence: number, arousal: number): string => {
    if (Math.abs(valence) < 0.2 && Math.abs(arousal) < 0.2) return "Neutral / Balanced";
    
    const energy = arousal > 0.2 ? "High Energy" : arousal < -0.2 ? "Low Energy" : "Moderate";
    const mood = valence > 0.2 ? "Positive" : valence < -0.2 ? "Negative" : "Ambivalent";

    if (energy === "High Energy" && mood === "Positive") return "Joyful & Exuberant";
    if (energy === "High Energy" && mood === "Negative") return "Tense & Aggressive";
    if (energy === "Low Energy" && mood === "Positive") return "Serene & Dreamy";
    if (energy === "Low Energy" && mood === "Negative") return "Sad & Melancholic";
    
    return `${energy} ${mood}`;
};

const getRomanNumeral = (degreeIndex: number, quality: string, extension: string): string => {
  const romans = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
  let base = romans[degreeIndex];
  
  const isMajor = quality === 'Major' || quality === 'Dominant' || quality === 'Augmented';
  if (isMajor) base = base.toUpperCase();

  if (quality === 'Diminished') base += '°';
  if (quality === 'Augmented') base += '+';
  if (extension.includes('Maj')) base += 'M';
  if (extension.includes('m7')) base += '7';
  if (extension.includes('7') && !extension.includes('Maj')) base += '7';
  
  return base;
};

export const getScaleNotes = (root: Note, scaleType: ScaleType): Note[] => {
  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root) || (root.includes('b') && root !== 'B');
  const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  
  let rootIndex = chromatic.indexOf(root);
  if (rootIndex === -1) {
    const altChromatic = useFlats ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    rootIndex = altChromatic.indexOf(root);
    if (rootIndex === -1) return [];
  }

  const intervals = SCALE_INTERVALS[scaleType];
  return intervals.map(interval => chromatic[(rootIndex + interval) % 12]);
};

export const buildChord = (rootNote: string, quality: Chord['quality'], extension: string, scaleIndex: number, emotionalDesc: string, romanOverride?: string): Chord => {
    const useFlats = rootNote.includes('b') || rootNote === 'F'; 
    const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    const rootIdx = chromatic.indexOf(rootNote) !== -1 ? chromatic.indexOf(rootNote) : (useFlats ? CHROMATIC_SHARPS : CHROMATIC_FLATS).indexOf(rootNote);
    
    let notes: string[] = [rootNote];
    let intervals = [0, 4, 7]; // Major default

    if (quality === 'Minor') intervals = [0, 3, 7];
    if (quality === 'Diminished') intervals = [0, 3, 6];
    if (quality === 'Augmented') intervals = [0, 4, 8];
    if (quality === 'Dominant') intervals = [0, 4, 7, 10];
    if (quality === 'Half-Dim') intervals = [0, 3, 6, 10];

    if (extension === 'Maj7') intervals = [0, 4, 7, 11];
    if (extension === 'm7') intervals = [0, 3, 7, 10];
    if (extension === '7') intervals = [0, 4, 7, 10];

    // Build notes from intervals
    notes = intervals.map(int => chromatic[(rootIdx + int) % 12]);

    let suffix = '';
    if (quality === 'Minor') suffix = 'm';
    if (quality === 'Diminished') suffix = 'dim';
    if (quality === 'Augmented') suffix = 'aug';
    
    if (extension === 'Maj7') suffix = 'maj7';
    if (extension === 'm7') suffix = 'm7';
    if (extension === '7') suffix = '7';
    if (extension === 'm7b5') suffix = 'm7b5';

    return {
        root: rootNote,
        quality,
        extension,
        suffix,
        symbol: `${rootNote}${suffix}`,
        romanNumeral: romanOverride || getRomanNumeral(scaleIndex, quality, extension),
        notes,
        interval: scaleIndex,
        emotionalDesc,
        functionLabel: emotionalDesc
    };
}

export const generateChordsForScale = (root: Note, scaleType: ScaleType, complexity: ChordComplexity): Chord[] => {
  const scaleNotes = getScaleNotes(root, scaleType);
  const chords: Chord[] = [];
  
  const getIndex = (n: string) => {
    let idx = CHROMATIC_SHARPS.indexOf(n);
    if (idx === -1) idx = CHROMATIC_FLATS.indexOf(n);
    return idx;
  };

  const useSevenths = complexity !== 'triad';
  
  for (let i = 0; i < scaleNotes.length; i++) {
    const rootNote = scaleNotes[i];
    const third = scaleNotes[(i + 2) % 7];
    const fifth = scaleNotes[(i + 4) % 7];
    const seventh = scaleNotes[(i + 6) % 7];

    const notes = [rootNote, third, fifth];
    
    const rootIdx = getIndex(rootNote);
    const thirdIdx = getIndex(third);
    const fifthIdx = getIndex(fifth);
    const seventhIdx = getIndex(seventh);

    const semiThird = (thirdIdx - rootIdx + 12) % 12;
    const semiFifth = (fifthIdx - rootIdx + 12) % 12;
    const semiSeventh = (seventhIdx - rootIdx + 12) % 12;

    let quality: Chord['quality'] = 'Major';
    let extension = 'Triad';
    let suffix = '';

    // Basic Triad Quality
    if (semiThird === 4 && semiFifth === 7) { quality = 'Major'; suffix = ''; }
    else if (semiThird === 3 && semiFifth === 7) { quality = 'Minor'; suffix = 'm'; }
    else if (semiThird === 3 && semiFifth === 6) { quality = 'Diminished'; suffix = 'dim'; }
    else if (semiThird === 4 && semiFifth === 8) { quality = 'Augmented'; suffix = 'aug'; }

    // Add 7ths
    if (useSevenths) {
      notes.push(seventh);
      if (quality === 'Major' && semiSeventh === 11) { extension = 'Maj7'; suffix = 'maj7'; }
      else if (quality === 'Major' && semiSeventh === 10) { quality = 'Dominant'; extension = '7'; suffix = '7'; }
      else if (quality === 'Minor' && semiSeventh === 10) { extension = 'm7'; suffix = 'm7'; }
      else if (quality === 'Minor' && semiSeventh === 11) { extension = 'm7'; suffix = 'm(maj7)'; }
      else if (quality === 'Diminished' && semiSeventh === 10) { quality = 'Half-Dim'; extension = 'm7b5'; suffix = 'm7b5'; }
      else if (quality === 'Diminished' && semiSeventh === 9) { extension = 'dim7'; suffix = 'dim7'; }
    }

    chords.push({
      root: rootNote,
      quality,
      extension,
      suffix,
      symbol: `${rootNote}${suffix}`,
      romanNumeral: getRomanNumeral(i, quality, extension),
      notes,
      interval: i,
      emotionalDesc: getChordEmotionalLabel(scaleType, i),
      functionLabel: "Diatonic"
    });
  }

  return chords;
};

export const generateSecondaryDominants = (root: Note, scaleType: ScaleType): Chord[] => {
    const scaleNotes = getScaleNotes(root, scaleType);
    const dominants: Chord[] = [];
    const targets = [1, 2, 3, 4, 5];

    targets.forEach(targetIdx => {
        if (!scaleNotes[targetIdx]) return;
        const targetNote = scaleNotes[targetIdx];
        const chromatic = CHROMATIC_SHARPS;
        let idx = chromatic.indexOf(targetNote);
        if (idx === -1) idx = CHROMATIC_FLATS.indexOf(targetNote);
        const fifthOfTarget = chromatic[(idx + 7) % 12];
        const chord = buildChord(fifthOfTarget, 'Dominant', '7', targetIdx, `Modulation to ${targetNote}`, `V7/${targetIdx + 1}`);
        chord.functionLabel = `V/${getRomanNumeral(targetIdx, 'Major', '')}`;
        dominants.push(chord);
    });
    return dominants;
};

export const generateBorrowedChords = (root: Note, scaleType: ScaleType): Chord[] => {
    const borrowed: Chord[] = [];
    if (scaleType === ScaleType.Major) {
        const minorNotes = getScaleNotes(root, ScaleType.Minor);
        borrowed.push(buildChord(minorNotes[2], 'Major', 'Maj7', 2, 'Epic / Heroic', 'bIII'));
        borrowed.push(buildChord(minorNotes[3], 'Minor', 'm7', 3, 'Emotional / Sad', 'iv'));
        borrowed.push(buildChord(minorNotes[5], 'Major', 'Maj7', 5, 'Fantasy / Space', 'bVI'));
        borrowed.push(buildChord(minorNotes[6], 'Major', '7', 6, 'Mixolydian Edge', 'bVII'));
    } else {
        const majorNotes = getScaleNotes(root, ScaleType.Major);
        borrowed.push(buildChord(majorNotes[0], 'Major', 'Maj7', 0, 'Picardy Third', 'I'));
        borrowed.push(buildChord(majorNotes[3], 'Major', '7', 3, 'Dorian Vibe', 'IV'));
    }
    return borrowed;
};

export const TENSION_DESCRIPTORS: Record<string, string> = {
  'b9': 'Dissonant / Phrygian',
  '9': 'Rich / Sweet',
  '#9': 'Bluesy / Tension',
  '11': 'Suspended',
  '#11': 'Lydian / Space',
  'b13': 'Aeolian / Emotional',
  '13': 'Jazzy / Bright'
};

export const getNoteDistance = (root: string, target: string): number => {
  const idx1 = getChromaticIndex(root);
  const idx2 = getChromaticIndex(target);
  return (idx2 - idx1 + 12) % 12;
};

export interface ExtensionInfo {
  note: string;
  intervalName: string;
  descriptor: string;
  degree: number;
}

export const getChordExtensions = (chord: Chord, scaleNotes: string[]): ExtensionInfo[] => {
  const rootIndexInScale = scaleNotes.indexOf(chord.root);
  if (rootIndexInScale === -1) return [];
  const extensions: ExtensionInfo[] = [];
  const steps = [
    { degree: 9, offset: 2 },
    { degree: 11, offset: 4 },
    { degree: 13, offset: 6 },
  ];

  steps.forEach(step => {
    const noteIndex = (rootIndexInScale + step.offset) % 7;
    const note = scaleNotes[noteIndex];
    const semitones = getNoteDistance(chord.root, note);
    let intervalName = `${step.degree}`;
    let isValid = true;

    if (step.degree === 9 && semitones === 1) intervalName = 'b9';
    if (step.degree === 9 && semitones === 3) intervalName = '#9';
    if (step.degree === 11 && semitones === 6) intervalName = '#11';
    if (step.degree === 13 && semitones === 8) intervalName = 'b13';

    if (isValid) {
        extensions.push({
            note,
            intervalName,
            descriptor: TENSION_DESCRIPTORS[intervalName] || 'Color',
            degree: step.degree
        });
    }
  });
  return extensions;
};

export interface HarmonicProfile {
    tension: number;
    brightness: number;
    complexity: number;
    densityLabel: string;
}

export const analyzeHarmonicDensity = (chord: Chord): HarmonicProfile => {
    const { notes, quality, extension } = chord;
    let complexity = 0;
    let tension = 0;
    let brightness = 50;

    if (notes.length === 3) complexity = 20;
    if (notes.length === 4) complexity = 50;
    if (notes.length >= 5) complexity = 80;

    if (quality === 'Major') { tension = 10; brightness = 80; }
    if (quality === 'Minor') { tension = 20; brightness = 30; }
    if (quality === 'Dominant') { tension = 60; brightness = 60; }
    if (quality === 'Diminished') { tension = 90; brightness = 10; }
    if (quality === 'Augmented') { tension = 85; brightness = 70; }
    if (quality === 'Half-Dim') { tension = 75; brightness = 20; }

    if (extension.includes('b9') || extension.includes('#9') || extension.includes('#11') || extension.includes('alt')) {
        tension += 20;
        complexity += 10;
    }
    if (extension.includes('Maj7')) { tension += 5; complexity += 5; }
    
    tension = Math.min(100, Math.max(0, tension));
    brightness = Math.min(100, Math.max(0, brightness));
    complexity = Math.min(100, Math.max(0, complexity));

    return {
        tension,
        brightness,
        complexity,
        densityLabel: complexity > 60 ? "High" : complexity > 30 ? "Medium" : "Low"
    };
};

export const getScaleSuggestionForChord = (chord: Chord): string => {
    if (chord.quality === 'Minor') {
        if (chord.romanNumeral === 'ii' || chord.romanNumeral === 'ii7') return "Dorian";
        if (chord.romanNumeral === 'vi' || chord.romanNumeral === 'vi7') return "Aeolian";
        return "Dorian / Minor";
    }
    if (chord.quality === 'Dominant') {
        return "Mixolydian / Altered";
    }
    if (chord.quality === 'Major') {
        if (chord.romanNumeral.includes('IV')) return "Lydian";
        return "Ionian / Lydian";
    }
    if (chord.quality === 'Half-Dim') return "Locrian";
    if (chord.quality === 'Diminished') return "Diminished";
    
    return "Chromatic";
};

// --- New Shape Theory & Analysis Logic ---

export const getShapeClassForFunction = (roman: string, quality: string): string => {
    // Returns tailwind classes or internal shape IDs
    const r = roman.toLowerCase();
    
    // Tonic (I, i) - Stable
    if (r === 'i' || r === '1') return 'shape-square rounded-xl';
    
    // Dominant (V, vii, secondary V) - Tension/Sharp
    if (r.includes('v') && !r.includes('iv') || quality === 'Dominant' || quality === 'Diminished') {
        return 'shape-diamond rounded-sm rotate-45 scale-90'; 
    }

    // Predominant (ii, IV) - Motion/Leaning
    if (r.includes('ii') || r.includes('iv')) {
        return 'shape-lean -skew-x-6';
    }

    // Submediant (vi) - Pivot/Bridge
    if (r.includes('vi')) {
        return 'shape-circle rounded-full';
    }

    // Default Stable
    return 'shape-square rounded-xl';
};

export const analyzeVoiceLeading = (chordA: Chord, chordB: Chord): { type: 'smooth' | 'jump' | 'guide', lines: {start: number, end: number, color: string}[] } => {
    const notesA = getVoicedNotes(chordA, 'Root'); // Analyze based on standard root voicing for clarity
    const notesB = getVoicedNotes(chordB, 'Root');

    // Normalize logic: Ensure we compare same number of voices if possible, or just map min
    const lines = [];
    let smoothCount = 0;
    let jumpCount = 0;

    for (let i = 0; i < Math.min(notesA.length, notesB.length); i++) {
        const idxA = notesA[i].octave * 12 + getChromaticIndex(notesA[i].note);
        const idxB = notesB[i].octave * 12 + getChromaticIndex(notesB[i].note);
        const diff = Math.abs(idxB - idxA);

        let color = 'rgba(255,255,255,0.1)';
        if (diff === 0) color = 'rgba(255,255,255,0.3)'; // Common tone
        else if (diff <= 2) { color = '#4ade80'; smoothCount++; } // Smooth (Green)
        else { color = '#f87171'; jumpCount++; } // Jump (Red)

        // Guide Tone Check (3rd to 7th or 7th to 3rd)
        // Simplified: checking indices 1 (3rd) and 3 (7th) in standard voicing array
        if ((i === 1 && diff <= 2) || (i === 3 && diff <= 2)) {
            color = '#facc15'; // Gold for guide tone resolution
        }

        lines.push({ start: i, end: i, color }); // Index mapping for visualization
    }

    const type = jumpCount > smoothCount ? 'jump' : 'smooth';
    return { type, lines };
};

// --- Phase 2: Harmonic Affinity Logic ---

export interface HarmonicAffinity {
  score: number; // 0 to 1
  label: string;
  color: string;
  description: string;
}

/**
 * Calculates the harmonic distance between two chords using Circle of Fifths logic.
 * @param prev Standard or Dragged Chord
 * @param next Standard or Dragged Chord
 * @returns HarmonicAffinity object
 */
export const getHarmonicCompatibility = (prev: Chord, next: Chord): HarmonicAffinity => {
  // normalize roots for lookup (Circle keys often use sharps/flats differently than builders)
  const getCircleIndex = (root: string) => {
      let idx = CIRCLE_KEYS.indexOf(root);
      if (idx === -1) {
        // Try enharmonic equivalents
        if (root === 'C#') idx = CIRCLE_KEYS.indexOf('Db');
        else if (root === 'F#') idx = CIRCLE_KEYS.indexOf('Gb');
        else if (root === 'G#') idx = CIRCLE_KEYS.indexOf('Ab');
        else if (root === 'D#') idx = CIRCLE_KEYS.indexOf('Eb');
        else if (root === 'A#') idx = CIRCLE_KEYS.indexOf('Bb');
      }
      return idx;
  };

  const idx1 = getCircleIndex(prev.root);
  const idx2 = getCircleIndex(next.root);

  if (idx1 === -1 || idx2 === -1) return { score: 0.5, label: "Unknown", color: "text-slate-500", description: "Non-functional" };

  let diff = Math.abs(idx1 - idx2);
  if (diff > 6) diff = 12 - diff; // Circle wrapping (shortest path)

  // 1. Perfect Fourth/Fifth (Distance 1) - Strongest Resolution
  if (diff === 1) {
      // Check direction. Clockwise (1) is Dominant->Tonic (Strong). Counter is Plagal/Reverse.
      // Simple distance is enough for "Affinity"
      return { 
          score: 1.0, 
          label: "Strong Affinity", 
          color: "text-emerald-400", 
          description: "Perfect Fifth Interval" 
      };
  }

  // 2. Same Root (Distance 0)
  if (diff === 0) {
      return { 
          score: 0.5, 
          label: "Static", 
          color: "text-slate-400", 
          description: "Same Root" 
      };
  }

  // 3. Major 2nd (Distance 2) - e.g. C to D (ii) or C to Bb (bVII)
  if (diff === 2) {
      return { 
          score: 0.8, 
          label: "Moderate Affinity", 
          color: "text-cyan-400", 
          description: "Stepwise Motion" 
      };
  }

  // 4. Minor 3rd (Distance 3) - Relative Minor/Major relationship usually
  if (diff === 3) {
      return { 
          score: 0.7, 
          label: "Relative Connection", 
          color: "text-purple-400", 
          description: "Third Relation" 
      };
  }

  // 5. Tritone (Distance 6) - Distant/Tension
  if (diff === 6) {
      return { 
          score: 0.2, 
          label: "Tritone Jump", 
          color: "text-rose-500", 
          description: "High Tension" 
      };
  }

  // 6. Others (Distance 4 or 5) - Chromatic/Distant
  return { 
      score: 0.4, 
      label: "Distant", 
      color: "text-amber-500", 
      description: "Chromatic Shift" 
  };
};

