
import { create } from 'zustand';
import { Chord, Note, ScaleType, InstrumentType, ChordComplexity } from './types';
import { audioEngine } from './audio';
import { SCALE_DEFS } from './constants';
import { findClosestScale, getTempoFromArousal } from './theory';

interface AppState {
    // --- STATE ---
    theme: 'light' | 'dark';
    key: Note;
    scale: ScaleType;
    complexity: ChordComplexity;
    isScaleLocked: boolean;
    bpm: number;
    timeSig: { num: number, den: number };
    instrument: InstrumentType;
    showPath: boolean;
    view: string;
    
    // Interaction State
    hoveredChord: Chord | null;
    targetMood: { v: number, a: number } | null;
    hoveredSequenceIndex: number | null;

    // Data State
    progression: Chord[];
    mood: { valence: number; arousal: number; tension: number };

    // Playback State
    isPlaying: boolean;
    playIndex: number | null;

    // --- ACTIONS ---
    toggleTheme: () => void;
    setKey: (k: Note) => void;
    setScale: (s: ScaleType) => void;
    setComplexity: (c: ChordComplexity) => void;
    toggleScaleLock: () => void;
    setBpm: (bpm: number) => void;
    setTimeSig: (val: { num: number, den: number }) => void;
    setInstrument: (i: InstrumentType) => void;
    togglePath: () => void;
    setView: (v: string) => void;
    setHoveredChord: (c: Chord | null) => void;
    setTargetMood: (m: { v: number, a: number } | null) => void;
    setHoveredSequenceIndex: (i: number | null) => void;
    
    // Logic Actions
    setMood: (v: number, a: number, t?: number) => void;
    handleProgression: (action: 'add' | 'remove' | 'clear' | 'reorder' | 'resize' | 'quantize', payload?: any) => void;
    togglePlay: () => void;
    playOne: (c: Chord) => void;
}

export const useStore = create<AppState>((set, get) => ({
    // Initial State
    theme: (() => {
        if (typeof document === 'undefined') return 'dark';
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    })(),
    key: 'C',
    scale: ScaleType.Major,
    complexity: 'triad',
    isScaleLocked: false,
    bpm: 100,
    timeSig: { num: 4, den: 4 },
    instrument: 'rhodes',
    showPath: false,
    view: 'sequencer',
    hoveredChord: null,
    targetMood: null,
    hoveredSequenceIndex: null,
    progression: [],
    mood: { valence: 0.75, arousal: 0.5, tension: 0.0 }, // Matches Major Scale Default
    isPlaying: false,
    playIndex: null,

    // Actions
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', newTheme === 'dark' ? '#141110' : '#fafaf9');
        localStorage.setItem('theme', newTheme);
        return { theme: newTheme };
    }),

    setKey: (key) => set({ key }),
    
    setScale: (scale) => {
        const state = get();
        if (!state.isScaleLocked) {
            const def = SCALE_DEFS[scale];
            if (def) {
                const { v, a, t } = def.scaleCoordinates;
                // Update Mood to match Scale
                set({ scale, mood: { valence: v, arousal: a, tension: t } });
                audioEngine.setMood(v, a, t);
                
                // Optional: Snap BPM if significant change to reinforce genre feel
                const targetBpm = getTempoFromArousal(a);
                if (Math.abs(targetBpm - state.bpm) > 5) {
                    set({ bpm: targetBpm });
                    audioEngine.setBpm(targetBpm);
                }
            }
        } else {
             set({ scale });
        }
    },
    
    setComplexity: (complexity) => set({ complexity }),
    toggleScaleLock: () => set((s) => ({ isScaleLocked: !s.isScaleLocked })),
    
    setBpm: (bpm) => {
        set({ bpm });
        audioEngine.setBpm(bpm);
    },
    
    setTimeSig: (timeSig) => set({ timeSig }),
    
    setInstrument: (instrument) => {
        set({ instrument });
        audioEngine.setInstrument(instrument);
    },
    
    togglePath: () => set((s) => ({ showPath: !s.showPath })),
    setView: (view) => set({ view }),
    setHoveredChord: (hoveredChord) => set({ hoveredChord }),
    setTargetMood: (targetMood) => set({ targetMood }),
    setHoveredSequenceIndex: (hoveredSequenceIndex) => set({ hoveredSequenceIndex }),

    setMood: (v, a, t) => {
        const state = get();
        const currentTension = t !== undefined ? t : state.mood.tension;
        
        // 1. Update Audio Engine immediately
        audioEngine.setMood(v, a, currentTension);
        
        // 2. Snap to Scale if unlocked
        let newScale = state.scale;
        if (!state.isScaleLocked) {
             newScale = findClosestScale(v, a, currentTension, state.scale);
        }
        
        set({ 
            mood: { valence: v, arousal: a, tension: currentTension },
            scale: newScale
        });
    },

    handleProgression: (action, payload) => {
        set((state) => {
            const timeSig = state.timeSig;
            let newProgression = [...state.progression];

            switch (action) {
                case 'add':
                    let newChords: Chord[] = [];
                    let insertIndex = -1;
                    if (payload && typeof payload === 'object' && ('chord' in payload || 'chords' in payload) && 'index' in payload) {
                         const c = payload.chord || payload.chords;
                         newChords = Array.isArray(c) ? c : [c];
                         insertIndex = payload.index;
                    } else {
                         newChords = Array.isArray(payload) ? payload : [payload];
                    }
                    // Assign current duration default
                    const processed = newChords.map(c => ({...c, duration: timeSig.num}));
                    
                    if (insertIndex !== -1 && insertIndex <= newProgression.length) {
                        newProgression.splice(insertIndex, 0, ...processed);
                    } else {
                        newProgression.push(...processed);
                    }
                    break;
                case 'remove':
                    if (typeof payload === 'number') newProgression = newProgression.filter((_, i) => i !== payload);
                    break;
                case 'clear':
                    newProgression = [];
                    break;
                case 'reorder':
                    if (payload && typeof payload.from === 'number' && typeof payload.to === 'number') {
                        const [moved] = newProgression.splice(payload.from, 1);
                        newProgression.splice(payload.to, 0, moved);
                    }
                    break;
                case 'resize':
                    if (payload && typeof payload.index === 'number' && typeof payload.duration === 'number') {
                        newProgression[payload.index] = { ...newProgression[payload.index], duration: payload.duration };
                    }
                    break;
                case 'quantize':
                    const grid = 0.25;
                    let t = 0;
                    newProgression = newProgression.map(c => {
                        const start = t;
                        const end = start + c.duration;
                        const qEnd = Math.round(end / grid) * grid;
                        t = qEnd; // simple seq quantization
                        let dur = parseFloat((qEnd - Math.round(start / grid) * grid).toFixed(2));
                        if (dur < grid) dur = grid;
                        return { ...c, duration: dur };
                    });
                    break;
            }
            return { progression: newProgression };
        });
    },

    togglePlay: () => {
        const s = get();
        audioEngine.resume();
        if (s.isPlaying) {
            audioEngine.stop();
            set({ isPlaying: false, playIndex: null });
        } else {
            audioEngine.setMood(s.mood.valence, s.mood.arousal, s.mood.tension);
            set({ isPlaying: true });
            audioEngine.playProgression(s.progression, s.bpm, 
                (idx) => set({ playIndex: idx }),
                () => set({ isPlaying: false, playIndex: null })
            );
        }
    },

    playOne: (c) => {
        audioEngine.resume();
        if (!c.isRest) audioEngine.playChord(c);
    }
}));