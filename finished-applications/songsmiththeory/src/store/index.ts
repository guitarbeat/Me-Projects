
import { create } from 'zustand';
import { Chord, Note, ScaleType, InstrumentType, ChordComplexity } from '../types';
import { audioEngine } from '../lib/audio';
import { SCALE_DEFS } from '../lib/constants';
import { findClosestScale, getTempoFromArousal, generateId } from '../lib/theory';

type AddPayload = Chord | Chord[] | { chord: Chord; index: number } | { chords: Chord[]; index: number };
type RemovePayload = number;
type ReorderPayload = { from: number; to: number };
type ResizePayload = { index: number; duration: number };
type UpdatePayload = { index: number; chord: Chord };

type ProgressionPayload = AddPayload | RemovePayload | ReorderPayload | ResizePayload | UpdatePayload;

export interface SavedProject {
    id: string;
    name: string;
    timestamp: number;
    state: {
        progression: Chord[];
        key: Note;
        scale: ScaleType;
        bpm: number;
        mood: { valence: number; arousal: number; tension: number };
        instrument: InstrumentType;
    }
}

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
    selectedChordIndex: number | null;
    targetMood: { v: number, a: number } | null;
    hoveredSequenceIndex: number | null;

    // Data State
    progression: Chord[];
    mood: { valence: number; arousal: number; tension: number };
    savedProjects: SavedProject[];

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
    setSelectedChordIndex: (i: number | null) => void;
    setTargetMood: (m: { v: number, a: number } | null) => void;
    setHoveredSequenceIndex: (i: number | null) => void;

    // Logic Actions
    setMood: (v: number, a: number, t?: number) => void;
    handleProgression: (action: 'add' | 'remove' | 'clear' | 'reorder' | 'resize' | 'quantize' | 'update', payload?: ProgressionPayload) => void;
    togglePlay: () => void;
    playOne: (c: Chord) => void;

    // Persistence
    saveProject: (name: string) => void;
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
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
    selectedChordIndex: null,
    targetMood: null,
    hoveredSequenceIndex: null,
    progression: [],
    mood: { valence: 0.75, arousal: 0.5, tension: 0.0 }, // Matches Major Scale Default
    savedProjects: (() => {
        try {
            const data = localStorage.getItem('harmonic_projects');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    })(),
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
        // Sentinel Security: Input Validation
        if (typeof bpm !== 'number' || isNaN(bpm)) return;
        const safeBpm = Math.max(20, Math.min(300, bpm));

        set({ bpm: safeBpm });
        audioEngine.setBpm(safeBpm);
    },

    setTimeSig: (timeSig) => set({ timeSig }),

    setInstrument: (instrument) => {
        set({ instrument });
        audioEngine.setInstrument(instrument);
    },

    togglePath: () => set((s) => ({ showPath: !s.showPath })),
    setView: (view) => set({ view }),
    setHoveredChord: (hoveredChord) => set({ hoveredChord }),
    setSelectedChordIndex: (selectedChordIndex) => set({ selectedChordIndex }),
    setTargetMood: (targetMood) => set({ targetMood }),
    setHoveredSequenceIndex: (hoveredSequenceIndex) => set({ hoveredSequenceIndex }),

    setMood: (v, a, t) => {
        // Sentinel Security: Input Validation
        const clamp = (val: number) => Math.max(-1, Math.min(1, val));
        const safeV = clamp(v);
        const safeA = clamp(a);

        const state = get();
        const currentTension = t !== undefined ? clamp(t) : state.mood.tension;

        // 1. Update Audio Engine immediately
        audioEngine.setMood(safeV, safeA, currentTension);

        // 2. Snap to Scale if unlocked
        let newScale = state.scale;
        if (!state.isScaleLocked) {
            newScale = findClosestScale(safeV, safeA, currentTension, state.scale);
        }

        set({
            mood: { valence: safeV, arousal: safeA, tension: currentTension },
            scale: newScale
        });
    },

    handleProgression: (action, payload) => {
        set((state) => {
            const timeSig = state.timeSig;
            let newProgression = [...state.progression];
            let newSelected = state.selectedChordIndex;

            switch (action) {
                case 'add': {
                    let newChords: Chord[] = [];
                    let insertIndex = -1;
                    if (payload && typeof payload === 'object' && ('chord' in payload || 'chords' in payload) && 'index' in payload) {
                        // @ts-expect-error - Union type complexity, runtime check is sufficient
                        const c = payload.chord || payload.chords;
                        newChords = Array.isArray(c) ? c : [c];
                        insertIndex = payload.index;
                    } else {
                        newChords = Array.isArray(payload) ? payload : [payload as Chord];
                    }
                    // Assign current duration default and new ID.
                    // Unique IDs are critical for React list performance (reconciliation) and correct drag-and-drop behavior.
                    const processed = newChords.map(c => ({
                        ...c,
                        id: generateId(),
                        duration: timeSig.num
                    }));

                    if (insertIndex !== -1 && insertIndex <= newProgression.length) {
                        newProgression.splice(insertIndex, 0, ...processed);
                        // Shift selection if needed
                        if (newSelected !== null && newSelected >= insertIndex) {
                            newSelected += newChords.length;
                        }
                    } else {
                        newProgression.push(...processed);
                    }
                    break;
                }
                case 'remove':
                    if (typeof payload === 'number') {
                        newProgression = newProgression.filter((_, i) => i !== payload);
                        if (newSelected === payload) newSelected = null;
                        else if (newSelected !== null && newSelected > payload) newSelected -= 1;
                    }
                    break;
                case 'clear':
                    newProgression = [];
                    newSelected = null;
                    break;
                case 'reorder': {
                    const reorderPayload = payload as ReorderPayload;
                    if (payload && typeof reorderPayload.from === 'number' && typeof reorderPayload.to === 'number') {
                        const [moved] = newProgression.splice(reorderPayload.from, 1);
                        newProgression.splice(reorderPayload.to, 0, moved);

                        // Update selection index if involved
                        if (newSelected === reorderPayload.from) newSelected = reorderPayload.to;
                        else if (newSelected !== null) {
                            if (newSelected > reorderPayload.from && newSelected <= reorderPayload.to) newSelected -= 1;
                            else if (newSelected < reorderPayload.from && newSelected >= reorderPayload.to) newSelected += 1;
                        }
                    }
                    break;
                }
                case 'resize': {
                    const resizePayload = payload as ResizePayload;
                    if (payload && typeof resizePayload.index === 'number' && typeof resizePayload.duration === 'number') {
                        newProgression[resizePayload.index] = { ...newProgression[resizePayload.index], duration: resizePayload.duration };
                    }
                    break;
                }
                case 'quantize': {
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
                case 'update': {
                    const updatePayload = payload as UpdatePayload;
                    if (payload && typeof updatePayload.index === 'number' && updatePayload.chord) {
                        newProgression[updatePayload.index] = updatePayload.chord;
                    }
                    break;
                }
            }
            return { progression: newProgression, selectedChordIndex: newSelected };
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
    },

    // --- PERSISTENCE ---
    saveProject: (name) => set((state) => {
        // Sentinel Security: Input Validation
        let safeName = (name || '').trim().slice(0, 50);
        if (!safeName) safeName = 'Untitled Project';

        const newProject: SavedProject = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
            name: safeName,
            timestamp: Date.now(),
            state: {
                progression: state.progression,
                key: state.key,
                scale: state.scale,
                bpm: state.bpm,
                mood: state.mood,
                instrument: state.instrument
            }
        };
        const updated = [newProject, ...state.savedProjects];
        try {
            localStorage.setItem('harmonic_projects', JSON.stringify(updated));
        } catch (e) { console.error("Save failed", e); }
        return { savedProjects: updated };
    }),

    loadProject: (id) => set((state) => {
        const project = state.savedProjects.find(p => p.id === id);
        // Sentinel Security: Basic structural validation
        if (!project || !project.state || !project.state.mood) return {};

        // Restore audio engine state
        audioEngine.setMood(project.state.mood.valence, project.state.mood.arousal, project.state.mood.tension);
        audioEngine.setBpm(project.state.bpm);
        audioEngine.setInstrument(project.state.instrument);

        return {
            progression: project.state.progression.map(c => c.id ? c : { ...c, id: generateId() }),
            key: project.state.key,
            scale: project.state.scale,
            bpm: project.state.bpm,
            mood: project.state.mood,
            instrument: project.state.instrument,
            selectedChordIndex: null, // Clear selection
            // unlock scale on load to respect saved mood/scale sync
            isScaleLocked: false
        };
    }),

    deleteProject: (id) => set((state) => {
        const updated = state.savedProjects.filter(p => p.id !== id);
        try {
            localStorage.setItem('harmonic_projects', JSON.stringify(updated));
        } catch (e) { console.error("Delete failed", e); }
        return { savedProjects: updated };
    }),
}));
