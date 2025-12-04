import { GoogleGenAI, Type } from "@google/genai";

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

// --- AI TYPES ---

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
    rating: number; 
}

export interface HarmonicAffinity {
  score: number;
  label: string;
  color: string;
  description: string;
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
    
    return {
        root,
        quality,
        extension: '',
        suffix: quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : '',
        symbol: `${root}${quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : ''}`,
        romanNumeral: '?',
        notes,
        interval: 0,
        duration: 4,
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
 * Used in the Theory Panel.
 */
export const generateSecondaryDominants = (root: Note, scale: ScaleType): Chord[] => {
    const notes = getScaleNotes(root, scale);
    // V/V, V/ii, V/vi, V/IV
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
            theoryInfo: `Secondary Dominant resolving to ${getRomanNumeral(deg, getChordQuality(scale, deg))}`,
            emotionalDesc: "Strong Pull"
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
            emotionalDesc: "Unexpected Color"
        });
    });
};

export const getCompassLabel = (v: number, a: number) => {
    if (v > 0.3 && a > 0.3) return "EXCITED / JOYFUL";
    if (v > 0.3 && a < -0.3) return "PEACEFUL / SERENE";
    if (v < -0.3 && a > 0.3) return "ANGRY / TENSE";
    if (v < -0.3 && a < -0.3) return "SAD / DEPRESSED";
    if (Math.abs(v) < 0.3 && a > 0.5) return "ALERT";
    if (Math.abs(v) < 0.3 && a < -0.5) return "SLEEPY";
    return "NEUTRAL";
};

export const getTempoFromArousal = (a: number) => Math.round(100 + (a * 40));

/**
 * Helper to layout chords in a circle for the GravityStage component.
 */
export const generateOrbitalLayout = (chords: Chord[]) => {
    const layout = [];
    const count = chords.length;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI - (Math.PI / 2); // Start top
        // Distribute in a circle, but vary radius slightly for visual interest
        const radius = 35 + (i % 2) * 5; 
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
 * Handles:
 * - Polyphonic chord playback
 * - Oscillator scheduling
 * - Master gain control
 * - Instrument synthesis (Basic shapes + Envelopes)
 */
class AudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private instrument: InstrumentType = 'rhodes';
    private isPlaying: boolean = false;
    private currentTimeout: number | null = null;

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
     * Plays a single chord immediately.
     */
    playChord(chord: Chord, duration: number = 2.0) {
        const ctx = this.getContext();
        if (!ctx || !this.masterGain) return;
        
        const now = ctx.currentTime;
        const frequencies = chord.notes.map(n => this.noteToFreq(n));
        
        frequencies.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            // Simple instrument switching logic
            osc.type = this.instrument === 'pad' ? 'triangle' : this.instrument === 'synth' ? 'sawtooth' : 'sine';
            osc.frequency.value = freq;
            
            // ADSR Envelope
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1 / frequencies.length, now + 0.05); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay
            
            osc.connect(gain);
            gain.connect(this.masterGain!);
            
            osc.start(now);
            osc.stop(now + duration + 0.1);
        });
    }

    /**
     * Schedules a sequence of chords to play based on BPM.
     */
    playProgression(progression: Chord[], bpm: number, onStep: (idx: number) => void, onComplete: () => void) {
        this.stop();
        this.isPlaying = true;
        const beatDur = 60 / bpm;
        let t = 0;

        const schedule = (idx: number) => {
            if (!this.isPlaying) return;
            if (idx >= progression.length) {
                this.currentTimeout = window.setTimeout(onComplete, 1000);
                return;
            }

            const c = progression[idx];
            onStep(idx);
            
            if (!c.isRest) {
                this.playChord(c, c.duration * beatDur);
            }

            // Recursively schedule next chord
            this.currentTimeout = window.setTimeout(() => {
                schedule(idx + 1);
            }, c.duration * beatDur * 1000);
        };

        schedule(0);
    }

    stop() {
        this.isPlaying = false;
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        // Cancel scheduled audio events to silence output
        if (this.masterGain) {
            const val = this.masterGain.gain.value;
            this.masterGain.gain.cancelScheduledValues(0);
            this.masterGain.gain.setValueAtTime(val, 0); // Reset
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

// --- AI FUNCTIONS ---

const getApiKey = () => {
    try {
        if (typeof process !== 'undefined' && process.env) {
            return process.env.API_KEY;
        }
    } catch (e) {
        // Ignore errors
    }
    return '';
};

/**
 * Uses Gemini API to suggest the next 4 chords based on the current progression and mood.
 */
export const generateSuggestions = async (
    key: Note, 
    scale: ScaleType, 
    valence: number, 
    arousal: number, 
    progression: Chord[]
): Promise<AiSuggestion[]> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("API Key missing");
        
        const ai = new GoogleGenAI({ apiKey });
        const model = "gemini-2.5-flash";
        
        const prompt = `
            Given a chord progression in ${key} ${scale}, suggest 4 next chords.
            Current progression: ${progression.map(c => c.symbol).join(' -> ')}
            Mood: Valence ${valence}, Arousal ${arousal}.
            Return JSON.
        `;
        
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            root: { type: Type.STRING },
                            quality: { type: Type.STRING },
                            extension: { type: Type.STRING },
                            roman: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                            confidence: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });
        
        return JSON.parse(response.text || "[]");
    } catch (e) {
        console.error("AI Error", e);
        return [];
    }
};

/**
 * Uses Gemini API to analyze the current progression and return a summary.
 */
export const analyzeHarmony = async (progression: Chord[], key: Note, scale: ScaleType): Promise<AiAnalysis | null> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) throw new Error("API Key missing");

        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Analyze this chord progression in ${key} ${scale}: ${progression.map(c => c.symbol).join('-')}. Provide a JSON summary.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        emotionalArc: { type: Type.STRING },
                        harmonicComplexity: { type: Type.STRING },
                        rating: { type: Type.NUMBER }
                    }
                }
            }
        });

        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Analysis Error", e);
        return null;
    }
};