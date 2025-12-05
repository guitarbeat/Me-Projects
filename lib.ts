

// --- UI & LAYOUT CONSTANTS ---

/**
 * Defines the snap states for the split-screen view.
 * - Fraction: Free-floating or calculated based on drag.
 * - Top/Bottom Full/Mini: Snapped positions.
 */
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
    icon: any; // Lucide Icon
    action: () => void;
    color?: string;
    active?: boolean;
}

/**
 * Physics constants for the draggable split view.
 * lil: base unit for minimized height.
 */
export const SPLIT_CONSTANTS = {
    spacing: 12,
    lil: 68,
    lil2: 68 * 1.5,
    lil3: 68 * 2,
    notches: 6,
    snapThreshold: 0.15
};

// --- MUSIC THEORY TYPES ---

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
export type ChordComplexity = 'triad' | '7th' | '9th' | '11th' | '13th';
export type VoicingType = 'Root' | '1st Inv' | '2nd Inv' | 'Drop-2';

export interface VoicedNote {
  note: Note;
  octave: number;
}

/**
 * Represents a musical chord with theory metadata.
 */
export interface Chord {
  root: Note;
  quality: 'Major' | 'Minor' | 'Diminished' | 'Augmented' | 'Half-Dim' | 'Dominant';
  extension: string;
  suffix: string; // e.g., 'm', 'dim'
  symbol: string; // e.g., 'Cm7'
  romanNumeral: string; // e.g., 'ii'
  notes: Note[];
  interval: number; // Scale degree (0-6)
  emotionalDesc?: string;
  functionLabel?: string;
  theoryInfo?: string;
  targetChord?: string;
  targetIndex?: number; // The scale degree this chord resolves to (for visual grouping)
  tension?: number; // Huron's ITPRA Tension value (0-1)
  // Visual coordinates for the GravityStage
  x?: number;
  y?: number;
  z?: number;
  scale?: number;
  duration: number; // In beats
  isRest?: boolean;
}

/**
 * Configuration for a musical scale/mode including visual and emotional metadata.
 */
export interface ScaleDef {
  intervals: number[];
  palette: { accent: string; background: string; gradient: string };
  coords: { x: number; y: number }; // Position on the Mood Selector
  emotions: Record<number, string>; // Emotion per scale degree
  meta: { title: string; desc: string; quote: string; characteristic: string; };
  scaleCoordinates: { v: number, a: number }; // Valence/Arousal values
}

// --- MUSIC CONSTANTS ---

export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

/**
 * Detailed definitions for supported scales/modes.
 * Maps music theory intervals to emotional characteristics and UI colors.
 */
export const SCALE_DEFS: Record<ScaleType, ScaleDef> = {
  [ScaleType.Major]: { 
    intervals: [0, 2, 4, 5, 7, 9, 11], 
    coords: { x: 0.75, y: 0.6 }, 
    scaleCoordinates: { v: 0.8, a: 0.4 }, // Excited/Happy
    palette: { accent: '#facc15', background: '#0f172a', gradient: 'linear-gradient(135deg, #fef08a 0%, #facc15 100%)' }, 
    emotions: { 0: "Home", 1: "Soft Sorrow", 2: "Bittersweet", 3: "Hopeful", 4: "Tension", 5: "Sad Lift", 6: "Unresolved" }, 
    meta: { title: 'Ionian', desc: 'Bright & Heroic', quote: 'The journey home.', characteristic: 'Major 7th' } 
  },
  [ScaleType.Minor]: { 
    intervals: [0, 2, 3, 5, 7, 8, 10], 
    coords: { x: -0.6, y: -0.7 }, 
    scaleCoordinates: { v: -0.6, a: -0.4 }, // Sad/Melancholy
    palette: { accent: '#6366f1', background: '#0a0e14', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' }, 
    emotions: { 0: "Sad Home", 1: "Dissonant", 2: "Hopeful", 3: "Deep Sadness", 4: "Dark Tension", 5: "Epic", 6: "Resolved" }, 
    meta: { title: 'Aeolian', desc: 'Deep & Emotional', quote: 'Shadows in the moonlight.', characteristic: 'Flat 6' } 
  },
  [ScaleType.Mixolydian]: { 
    intervals: [0, 2, 4, 5, 7, 9, 10], 
    coords: { x: 0.8, y: -0.1 }, 
    scaleCoordinates: { v: 0.6, a: 0.1 }, // Hopeful/Relaxed
    palette: { accent: '#f59e0b', background: '#140f0a', gradient: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)' }, 
    emotions: {}, 
    meta: { title: 'Mixolydian', desc: 'Hopeful & Bluesy', quote: 'Sun breaking through.', characteristic: 'Flat 7' } 
  },
  [ScaleType.Lydian]: { 
    intervals: [0, 2, 4, 6, 7, 9, 11], 
    coords: { x: 0.4, y: -0.5 }, 
    scaleCoordinates: { v: 0.5, a: -0.2 }, // Dreamy/Calm
    palette: { accent: '#d946ef', background: '#140a12', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)' }, 
    emotions: {}, 
    meta: { title: 'Lydian', desc: 'Dreamy & Floating', quote: 'Above the clouds.', characteristic: 'Sharp 4' } 
  },
  [ScaleType.Dorian]: { 
    intervals: [0, 2, 3, 5, 7, 9, 10], 
    coords: { x: -0.2, y: -0.2 }, 
    scaleCoordinates: { v: -0.2, a: 0.0 }, // Bittersweet/Soulful
    palette: { accent: '#a855f7', background: '#0a0a14', gradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)' }, 
    emotions: {}, 
    meta: { title: 'Dorian', desc: 'Soulful & Jazzy', quote: 'Late night introspection.', characteristic: 'Major 6' } 
  },
  [ScaleType.Phrygian]: { 
    intervals: [0, 1, 3, 5, 7, 8, 10], 
    coords: { x: -0.6, y: 0.6 }, 
    scaleCoordinates: { v: -0.4, a: 0.7 }, // Aggressive/Tense
    palette: { accent: '#ef4444', background: '#140a0a', gradient: 'linear-gradient(135deg, #fca5a5 0%, #991b1b 100%)' }, 
    emotions: {}, 
    meta: { title: 'Phrygian', desc: 'Exotic & Dark', quote: 'Ancient mysteries revealed.', characteristic: 'Flat 2' } 
  },
  [ScaleType.Locrian]: { 
    intervals: [0, 1, 3, 5, 6, 8, 10], 
    coords: { x: -0.3, y: 0.9 }, 
    scaleCoordinates: { v: -0.8, a: 0.6 }, // Unsettled/Tense
    palette: { accent: '#71717a', background: '#09090b', gradient: 'linear-gradient(135deg, #52525b 0%, #18181b 100%)' }, 
    emotions: {}, 
    meta: { title: 'Locrian', desc: 'Tense & Unstable', quote: 'The edge of reality.', characteristic: 'Flat 5' } 
  },
};

// [5] Geneva Emotional Music Scales (Ideas)
// Derived from confirmatory factor analyses of ratings of emotions evoked by various genres of music.
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

// --- LOGIC FUNCTIONS ---

export const getIntervalDescription = (intervalIndex: number, scaleType: ScaleType) => {
    if (intervalIndex === 0) return "Root";
    if (intervalIndex === 4) return "Dominant Pull";
    if (intervalIndex === 3) return "Subdominant";
    if (intervalIndex === 6) return "Leading Tone";
    if (scaleType === ScaleType.Major) {
        if (intervalIndex === 5) return "Sorrow";
        if (intervalIndex === 1) return "Tension";
    }
    return "Passing";
};

/**
 * Calculates the notes in a scale starting from a root note.
 */
export const getScaleNotes = (root: Note, scaleType: ScaleType): Note[] => {
    if (!SCALE_DEFS[scaleType]) return [];
    const semitones = SCALE_DEFS[scaleType].intervals;
    // Determine whether to use sharps or flats based on the key
    const chromatic = CHROMATIC_SHARPS.includes(root) || ['G', 'D', 'A', 'E', 'B'].includes(root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    const rootIndex = chromatic.indexOf(root);
    return semitones.map(interval => chromatic[(rootIndex + interval) % 12]);
};

// Helper for chord quality based on scale degree
const getChordQuality = (scale: ScaleType, degree: number): Chord['quality'] => {
    // Standard diatonic chord qualities for Major scale
    const majorQualities = ['Major', 'Minor', 'Minor', 'Major', 'Major', 'Minor', 'Diminished'];
    
    // Determine offset for modes (e.g., Dorian starts on the 2nd degree of Major)
    const modeOffset: Record<ScaleType, number> = {
        [ScaleType.Major]: 0, [ScaleType.Dorian]: 1, [ScaleType.Phrygian]: 2,
        [ScaleType.Lydian]: 3, [ScaleType.Mixolydian]: 4, [ScaleType.Minor]: 5, [ScaleType.Locrian]: 6
    };
    
    const offset = modeOffset[scale];
    const index = (degree + offset) % 7;
    // @ts-ignore
    return majorQualities[index] as Chord['quality'];
};

const getRomanNumeral = (degree: number, quality: string): string => {
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    let num = numerals[degree];
    if (quality === 'Minor' || quality === 'Diminished' || quality === 'Half-Dim') num = num.toLowerCase();
    if (quality === 'Augmented') num += '+';
    if (quality === 'Diminished') num += '°';
    return num;
};

// Huron's ITPRA - Tension Calculation (Heuristic)
// Assigns a tension value (0-1) based on harmonic function.
const calculateHarmonicTension = (roman: string, quality: string): number => {
    const r = (roman || '').toLowerCase(); // Safety check
    // High Tension (Pre-outcome 'T')
    if (r.includes('vii') || quality === 'Diminished') return 1.0; // Leading tone
    if (r.includes('v') || quality === 'Dominant') return 0.8; // Dominant
    if (r.includes('/')) return 0.9; // Secondary Dominant
    
    // Moderate Tension
    if (r === 'iv' || r === 'ii') return 0.4; // Predominant
    
    // Low Tension / Release
    if (r === 'i' || r === 'vi') return 0.0; // Tonic / Submediant (deceptive resolution)
    
    return 0.3;
};

/**
 * Constructs a Chord object given a root and quality.
 * Handles interval mapping for chords (Major: 0-4-7, Minor: 0-3-7, etc.)
 */
export const buildChord = (root: Note, quality: Chord['quality'], options?: Partial<Chord>): Chord => {
    const chromatic = CHROMATIC_SHARPS.includes(root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    const rootIndex = chromatic.indexOf(root);
    let intervals = [0, 4, 7]; // Major default
    
    if (quality === 'Minor') intervals = [0, 3, 7];
    if (quality === 'Diminished') intervals = [0, 3, 6];
    if (quality === 'Augmented') intervals = [0, 4, 8];
    if (quality === 'Dominant') intervals = [0, 4, 7, 10];
    
    const notes = intervals.map(i => chromatic[(rootIndex + i) % 12]);
    const roman = options?.romanNumeral || '?';
    
    return {
        root,
        quality,
        extension: '',
        suffix: quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : '',
        symbol: `${root}${quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : ''}`,
        romanNumeral: roman,
        notes,
        interval: 0,
        duration: 4,
        tension: calculateHarmonicTension(roman, quality),
        ...options
    };
};

/**
 * Generates all diatonic chords for a given scale.
 */
export const generateChordsForScale = (root: Note, scale: ScaleType, complexity: ChordComplexity): Chord[] => {
    const notes = getScaleNotes(root, scale);
    return notes.map((note, i) => {
        const quality = getChordQuality(scale, i);
        return buildChord(note, quality, {
            romanNumeral: getRomanNumeral(i, quality),
            interval: i,
            scale: i
        });
    });
};

/**
 * Calculates Secondary Dominants (V of V, V of ii, etc.)
 * Returns the targetIndex so the UI can group them near their resolution.
 */
export const generateSecondaryDominants = (root: Note, scale: ScaleType): Chord[] => {
    const notes = getScaleNotes(root, scale);
    // Targets: V/V (to 5th), V/ii (to 2nd), V/vi (to 6th), V/IV (to 4th)
    // Scale degrees are 0-indexed: V=4, ii=1, vi=5, IV=3
    const targets = [4, 1, 5, 3]; 
    return targets.map(deg => {
        if (deg >= notes.length) return null;
        const targetRoot = notes[deg];
        // The V of the target is 7 semitones above target
        const chromatic = CHROMATIC_SHARPS.includes(root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
        const targetIndex = chromatic.indexOf(targetRoot);
        const domRoot = chromatic[(targetIndex + 7) % 12];
        return buildChord(domRoot, 'Dominant', {
            extension: '7',
            symbol: `${domRoot}7`,
            romanNumeral: `V7/${getRomanNumeral(deg, getChordQuality(scale, deg))}`,
            theoryInfo: `Resolves to ${getRomanNumeral(deg, getChordQuality(scale, deg))}`,
            emotionalDesc: "Strong Pull",
            targetIndex: deg // KEY: This allows visual grouping
        });
    }).filter(Boolean) as Chord[];
};

/**
 * Calculates Borrowed Chords (Modal Interchange).
 * Used in the Theory Panel.
 */
export const generateBorrowedChords = (root: Note, scale: ScaleType): Chord[] => {
    // Borrow from parallel minor (if major) or major (if minor)
    const parallelScale = scale === ScaleType.Major ? ScaleType.Minor : ScaleType.Major;
    const notes = getScaleNotes(root, parallelScale);
    
    // Common borrowings: bVI, bVII, iv (in major)
    const indices = scale === ScaleType.Major ? [5, 6, 3] : [0, 3, 4]; // Picnic logic
    
    return indices.map(i => {
        const quality = getChordQuality(parallelScale, i);
        return buildChord(notes[i], quality, {
            romanNumeral: getRomanNumeral(i, quality),
            theoryInfo: `Borrowed from Parallel ${parallelScale}`,
            emotionalDesc: "Unexpected Color",
            targetIndex: -1 // No specific orbital target, usually distinct
        });
    });
};

/**
 * Returns a list of scale degrees (0-indexed) that are strong harmonic candidates 
 * for the next chord, based on the current context chord.
 * Simple common-practice heuristics.
 */
export const getHarmonicSuggestions = (contextChord: Chord | null): number[] => {
    if (!contextChord) return [0]; // Suggest Tonic if empty
    
    const r = (contextChord.romanNumeral || '').toLowerCase().replace(/[^ivxlc]/g, '');
    
    // Simple harmonic flow map
    // V -> I (Dominant -> Tonic)
    // IV -> V or I (Subdominant -> Dominant or Plagal)
    // ii -> V (Predominant -> Dominant)
    // vi -> IV or ii (Submediant -> Predominant)
    // iii -> vi
    
    if (r === 'v' || r === 'vii') return [0, 5]; // Resolve to I or vi (deceptive)
    if (r === 'iv') return [4, 0, 1]; // To V, I, or ii
    if (r === 'ii') return [4]; // To V
    if (r === 'vi') return [3, 1]; // To IV or ii
    if (r === 'iii') return [5]; // To vi
    if (r === 'i') return [3, 4, 5, 1]; // Anywhere, usually IV or V
    
    return [];
};

export const getCompassLabel = (v: number, a: number) => {
    // Basic V/A Quadrants
    if (v > 0.3 && a > 0.3) return "EXCITED / JOYFUL";
    if (v > 0.3 && a < -0.3) return "PEACEFUL / SERENE";
    if (v < -0.3 && a > 0.3) return "TENSE / ANGRY";
    if (v < -0.3 && a < -0.3) return "SAD / MELANCHOLY";
    return "NEUTRAL";
};

/**
 * Analyzes the sentiment of a chord based on its quality, function, and scale context.
 * Returns Valence (Pos/Neg emotion) and Arousal (Energy/Tension).
 */
export const estimateChordSentiment = (chord: Chord, currentKey: Note, scale: ScaleType) => {
    let v = 0; // Valence: -1 (Negative/Sad) to 1 (Positive/Happy)
    let a = 0; // Arousal: -1 (Calm/Boring) to 1 (Exciting/Tense)

    // 1. Base Quality Analysis
    if (chord.quality === 'Major') { v += 0.5; a += 0.1; }
    else if (chord.quality === 'Minor') { v -= 0.4; a -= 0.1; }
    else if (chord.quality === 'Diminished') { v -= 0.6; a += 0.6; }
    else if (chord.quality === 'Augmented') { v += 0.1; a += 0.5; }
    else if (chord.quality === 'Dominant') { v += 0.3; a += 0.5; }

    // 2. Functional Analysis (Roman Numeral)
    // Guard against undefined romanNumeral
    const roman = (chord.romanNumeral || '').toLowerCase();
    const rClean = roman.replace(/[^ivxlcdm]/g, ''); // strip accidentals or extensions

    // Tonic Function (Stability -> Low Arousal)
    if (rClean === 'i') { 
        a -= 0.5; 
        if (chord.quality === 'Major') v += 0.2; // Resolution home
    } 
    
    // Subdominant Function (Travel/Heroic -> High Valence)
    if (rClean === 'iv') { v += 0.2; a += 0.1; } 
    
    // Dominant Function (Tension -> High Arousal)
    if (rClean === 'v') { a += 0.4; } 
    
    // Deceptive (vi in Major is sadder)
    if (rClean === 'vi') { v -= 0.2; } 
    
    // Leading Tone (vii -> High Tension)
    if (rClean === 'vii') { a += 0.5; v -= 0.2; }

    // 3. Complexity Modifiers
    if (roman.includes('/')) {
        a += 0.3; // Secondary dominant adds tension/surprise
    }
    if (chord.extension && ['7', '9', '11', '13'].some(e => chord.extension.includes(e))) {
        a += 0.1; // Extensions add color/richness
    }

    // Clamp
    v = Math.max(-1, Math.min(1, v));
    a = Math.max(-1, Math.min(1, a));

    return { valence: v, arousal: a };
};

export const getTempoFromArousal = (a: number) => Math.round(110 + (a * 50));

/**
 * Maps Valence/Arousal to concise musical features for the HUD.
 */
export const getMusicalCharacteristics = (v: number, a: number, t: number = 0) => {
    // Find closest emotional zone
    let min = Infinity;
    let gem = EMOTIONAL_ZONES[0];
    EMOTIONAL_ZONES.forEach(z => {
        const d = Math.sqrt(Math.pow(v - z.v, 2) + Math.pow(a - z.a, 2));
        if (d < min) { min = d; gem = z; }
    });

    // 1. TEMPO [36]
    let tempo = 'Moderate';
    if (a > 0.2) tempo = 'Fast / Agitated';
    else if (a < -0.2) tempo = 'Slow / Calm';

    // 2. MODE [37]
    let mode = 'Modal';
    if (v > 0.1) mode = 'Major (Bright)';
    else if (v < -0.1) mode = 'Minor (Dark)';

    // 3. LOUDNESS [38]
    let dynamics = 'Moderate';
    if (a > 0.3) dynamics = 'Loud / Intense';
    else if (a < -0.3) dynamics = 'Soft / Gentle';

    // 4. HARMONY [39][40]
    let harmony = 'Diatonic';
    if (t > 0.6) harmony = 'Chaotic / Noise';
    else if (t > 0.3) harmony = 'Unstable / Drift';
    else if (Math.abs(v) > 0.5 && Math.abs(a) < 0.5) harmony = 'Resolving';
    else if (v < -0.3 && a > 0.3) harmony = 'Dissonant';

    // 5. STYLE [41]
    let style = 'Legato';
    if (a > 0.2) style = 'Staccato';

    return {
        vibe: gem.label,
        tempo,
        mode,
        dynamics,
        harmony,
        texture: style
    };
};

/**
 * Helper to layout chords in a circle for the GravityStage component.
 */
export const generateOrbitalLayout = (chords: Chord[]) => {
    const layout = [];
    const count = chords.length;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI - (Math.PI / 2); // Start top
        // Distribute in a circle, but vary radius slightly for visual interest
        const radius = 35; 
        layout.push({
            ...chords[i],
            x: 50 + Math.cos(angle) * radius,
            y: 50 + Math.sin(angle) * radius
        });
    }
    return layout;
};

// --- AUDIO ENGINE ---

/**
 * A wrapper class for the Web Audio API.
 * Uses a Lookahead Scheduler pattern for precise rhythm timing.
 */
class AudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private instrument: InstrumentType = 'rhodes';
    
    // Scheduling State
    private isPlaying: boolean = false;
    private nextNoteTime: number = 0;
    private currentChordIndex: number = 0;
    private timerID: number | null = null;
    private _progression: Chord[] = [];
    private _bpm: number = 120;
    
    // Dynamic Structural Features
    private _valence: number = 0;
    private _arousal: number = 0;
    private _tension: number = 0;

    // Callbacks
    private _onStep: ((idx: number) => void) | null = null;
    private _onComplete: (() => void) | null = null;

    private getContext(): AudioContext {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtor) {
                this.ctx = new AudioCtor();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.value = 0.4;
                this.masterGain.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx!;
    }

    setInstrument(inst: InstrumentType) {
        this.instrument = inst;
    }

    /**
     * Updates the emotional state, affecting playback physics in real-time.
     */
    setMood(valence: number, arousal: number, tension: number = 0) {
        this._valence = valence;
        this._arousal = arousal;
        this._tension = tension;
        // Update BPM if we want dynamic tempo, but usually BPM is set explicitly
        // Logic for Volume/Style is handled in playChord
    }

    /**
     * Plays a single chord immediately or at a scheduled time.
     * Incorporates "Loudness" [38] and "Style" [41] based on Valence/Arousal.
     */
    playChord(chord: Chord, duration: number = 2.0, when?: number) {
        const ctx = this.getContext();
        if (!ctx || !this.masterGain) return;
        
        const startTime = when || ctx.currentTime;
        const frequencies = chord.notes.map(n => this.noteToFreq(n));
        
        // --- Structural Feature Implementation ---
        
        // Loudness [38]: Map Arousal (-1 to 1) to Gain (0.1 to 0.6)
        const baseGain = 0.35 + (this._arousal * 0.25);
        const volume = Math.max(0.1, Math.min(0.8, baseGain));
        
        // Style [41]: Map Arousal to Articulation (Staccato vs Legato)
        // High Arousal (> 0.2) = Staccato (Short release)
        // Low Arousal = Legato (Full sustain)
        const isStaccato = this._arousal > 0.2;
        
        // Envelope shaping
        const attack = isStaccato ? 0.01 : 0.05 + (Math.abs(this._valence) * 0.05);
        const release = isStaccato ? 0.1 : duration * 0.8; 
        const hold = isStaccato ? 0.05 : duration * 0.9;

        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Simple instrument switching logic
            osc.type = this.instrument === 'pad' ? 'triangle' : this.instrument === 'synth' ? 'sawtooth' : 'sine';
            
            // Tension detuning logic (0 to 1 -> 0 to 50 cents)
            const detune = (Math.random() - 0.5) * this._tension * 50;
            osc.frequency.value = freq;
            osc.detune.value = detune;
            
            // ADSR Envelope
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume / frequencies.length, startTime + attack); // Attack
            
            // Sustain / Release
            gain.gain.setValueAtTime(volume / frequencies.length, startTime + attack + hold);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + attack + hold + release);
            
            osc.connect(gain);
            gain.connect(this.masterGain!);
            
            osc.start(startTime);
            osc.stop(startTime + duration + release + 0.5);
        });
    }

    /**
     * Internal scheduler loop.
     * Looks ahead 0.1s and schedules notes that fall within that window.
     */
    private scheduler() {
        const lookahead = 25.0; // Check every 25ms
        const scheduleAheadTime = 0.1; // Schedule 100ms ahead

        while (this.nextNoteTime < this.getContext().currentTime + scheduleAheadTime) {
            if (this.currentChordIndex >= this._progression.length) {
                // Determine when the last note finishes to trigger onComplete
                const totalDuration = this.nextNoteTime - this.getContext().currentTime;
                if (totalDuration > 0) {
                     setTimeout(() => {
                         if(this.isPlaying) {
                             this.stop();
                             if (this._onComplete) this._onComplete();
                         }
                     }, totalDuration * 1000);
                } else {
                     this.stop();
                     if (this._onComplete) this._onComplete();
                }
                return;
            }
            
            this.scheduleNote(this.currentChordIndex, this.nextNoteTime);
            this.advanceNote();
        }

        if (this.isPlaying) {
            this.timerID = window.setTimeout(this.scheduler.bind(this), lookahead);
        }
    }

    private advanceNote() {
        const secondsPerBeat = 60.0 / this._bpm;
        const chord = this._progression[this.currentChordIndex];
        // Advance time by chord duration
        this.nextNoteTime += chord.duration * secondsPerBeat;
        this.currentChordIndex++;
    }

    private scheduleNote(index: number, time: number) {
        const chord = this._progression[index];
        const secondsPerBeat = 60.0 / this._bpm;
        
        if (!chord.isRest) {
            this.playChord(chord, chord.duration * secondsPerBeat, time);
        }

        // Schedule visual update
        // We use a precise timeout to trigger the UI callback at the exact moment audio plays
        // We clamp it to 0 just in case we are slightly late
        const timeToVisual = Math.max(0, (time - this.getContext().currentTime));
        
        setTimeout(() => {
            if (this.isPlaying && this._onStep) {
                this._onStep(index);
            }
        }, timeToVisual * 1000);
    }

    /**
     * Starts playback of the progression.
     */
    playProgression(progression: Chord[], bpm: number, onStep: (idx: number) => void, onComplete: () => void) {
        if (this.isPlaying) this.stop();
        this.isPlaying = true;
        this._progression = progression;
        this._bpm = bpm;
        this._onStep = onStep;
        this._onComplete = onComplete;
        this.currentChordIndex = 0;
        
        const ctx = this.getContext();
        // Start slightly in the future to ensure clean attack
        this.nextNoteTime = ctx.currentTime + 0.05; 
        
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            window.clearTimeout(this.timerID);
            this.timerID = null;
        }
        // Reset gain to silence output
        if (this.masterGain) {
            const now = this.getContext().currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.linearRampToValueAtTime(0, now + 0.05); // Fade out quick
            // Restore gain shortly after
            setTimeout(() => {
                if(this.masterGain) this.masterGain.gain.value = 0.4;
            }, 100);
        }
    }

    private noteToFreq(note: string): number {
        const octave = 4; // Default center octave
        const noteMap: Record<string, number> = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        const semitones = noteMap[note.replace(/\d/, '')] || 0;
        const n = (semitones - 9) + (octave - 4) * 12; 
        return 440 * Math.pow(2, n / 12);
    }
}

export const audioEngine = new AudioEngine();