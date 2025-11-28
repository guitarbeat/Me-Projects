
import { GoogleGenAI, Type, Schema } from "@google/genai";

// --- TYPES ---
export type Note = string;
export enum ScaleType {
  Major = 'Major', Minor = 'Natural Minor', Dorian = 'Dorian', Phrygian = 'Phrygian',
  Lydian = 'Lydian', Mixolydian = 'Mixolydian', Locrian = 'Locrian'
}
export type InstrumentType = 'rhodes' | 'pad' | 'pluck' | 'synth';
export type ChordComplexity = 'triad' | '7th' | '9th';
export interface Chord {
  root: Note; quality: string; extension: string; suffix: string; symbol: string;
  romanNumeral: string; notes: Note[]; interval: number; emotionalDesc?: string; functionLabel?: string;
}
export interface AiSuggestion {
  root: string; quality: string; extension: string; roman: string; explanation: string; confidence: number;
}
export interface ScaleDef {
    intervals: number[]; palette: any; coords: { x: number; y: number }; emotions: Record<number, string>; meta: any;
}

// --- CONSTANTS & DATA ---
export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

export const SCALE_DEFS: Record<ScaleType, ScaleDef> = {
  [ScaleType.Major]: { intervals: [0, 2, 4, 5, 7, 9, 11], coords: { x: 0.75, y: 0.6 }, palette: {}, emotions: {0:"Home",4:"Tension"}, meta: { title: 'Ionian', desc: 'Bright & Heroic', characteristic: 'Major 7th' } },
  [ScaleType.Minor]: { intervals: [0, 2, 3, 5, 7, 8, 10], coords: { x: -0.6, y: -0.7 }, palette: {}, emotions: {0:"Sad Home",3:"Deep Sadness"}, meta: { title: 'Aeolian', desc: 'Deep & Emotional', characteristic: 'Flat 6' } },
  [ScaleType.Dorian]: { intervals: [0, 2, 3, 5, 7, 9, 10], coords: { x: -0.2, y: -0.2 }, palette: {}, emotions: {}, meta: { title: 'Dorian', desc: 'Soulful & Jazzy', characteristic: 'Major 6' } },
  [ScaleType.Phrygian]: { intervals: [0, 1, 3, 5, 7, 8, 10], coords: { x: -0.6, y: 0.6 }, palette: {}, emotions: {}, meta: { title: 'Phrygian', desc: 'Exotic & Dark', characteristic: 'Flat 2' } },
  [ScaleType.Lydian]: { intervals: [0, 2, 4, 6, 7, 9, 11], coords: { x: 0.4, y: -0.5 }, palette: {}, emotions: {}, meta: { title: 'Lydian', desc: 'Dreamy & Floating', characteristic: 'Sharp 4' } },
  [ScaleType.Mixolydian]: { intervals: [0, 2, 4, 5, 7, 9, 10], coords: { x: 0.8, y: -0.1 }, palette: {}, emotions: {}, meta: { title: 'Mixolydian', desc: 'Hopeful & Bluesy', characteristic: 'Flat 7' } },
  [ScaleType.Locrian]: { intervals: [0, 1, 3, 5, 6, 8, 10], coords: { x: -0.3, y: 0.9 }, palette: {}, emotions: {}, meta: { title: 'Locrian', desc: 'Tense & Unstable', characteristic: 'Flat 5' } },
};

// --- MUSIC THEORY UTILS ---
export const getChromaticIndex = (n: string) => { const i = CHROMATIC_SHARPS.indexOf(n); return i === -1 ? CHROMATIC_FLATS.indexOf(n) : i; };
export const getChromaticScale = (root: string) => (['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root) || (root.includes('b') && root !== 'B')) ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
export const getNoteFrequency = (note: Note, octave: number = 4) => 440 * Math.pow(2, (12 + (octave * 12) + getChromaticIndex(note) - 69) / 12);
export const getChordFrequencies = (c: Chord) => c.notes.map((n, i) => getNoteFrequency(n, i === 0 ? 3 : 4));
export const getScaleNotes = (root: Note, type: ScaleType): Note[] => {
  const c = getChromaticScale(root), r = getChromaticIndex(root);
  return SCALE_DEFS[type].intervals.map((i: number) => c[(r + i) % 12]);
};

export const buildChord = (root: string, quality: string, params: any = {}): Chord => {
  const chromatic = getChromaticScale(root);
  const rootIdx = getChromaticIndex(root);
  const intervalsMap: any = { 'Major': [0,4,7], 'Minor': [0,3,7], 'Diminished': [0,3,6], 'Augmented': [0,4,8], 'Dominant': [0,4,7,10] };
  let intervals = [...(intervalsMap[quality] || [0,4,7])], suffix = '', ext = params.extension || 'Triad';
  
  if (params.extension) {
    const extMap: any = { 'Maj7': [0,4,7,11], 'm7': [0,3,7,10], '7': [0,4,7,10], 'm7b5': [0,3,6,10], 'dim7': [0,3,6,9] };
    if (extMap[params.extension]) intervals = extMap[params.extension];
    suffix = params.extension.replace('Maj', 'maj');
  } else { suffix = quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : quality === 'Augmented' ? 'aug' : ''; }

  return {
    root, quality, extension: ext, suffix, symbol: `${root}${suffix}`, romanNumeral: params.roman || 'I',
    notes: intervals.map(i => chromatic[(rootIdx + i) % 12]), interval: params.degree || 0,
    emotionalDesc: params.emotion || quality, functionLabel: params.functionLabel || "Diatonic"
  };
};

export const generateChordsForScale = (root: Note, type: ScaleType, complexity: ChordComplexity): Chord[] => {
  const notes = getScaleNotes(root, type);
  return notes.map((note, i) => {
    const nIdx = getChromaticIndex(note);
    const getInt = (o: number) => (getChromaticIndex(notes[(i + o) % 7]) - nIdx + 12) % 12;
    const [th, fi, se] = [getInt(2), getInt(4), getInt(6)];
    let q = 'Major';
    if (th === 3) q = fi === 6 ? 'Diminished' : 'Minor';
    else if (th === 4) q = fi === 8 ? 'Augmented' : 'Major';
    if (complexity !== 'triad' && q === 'Major' && se === 10) q = 'Dominant';
    const bases = ['i','ii','iii','iv','v','vi','vii'], base = bases[i] || 'i';
    let roman = ['Major','Dominant','Augmented'].includes(q) ? base.toUpperCase() : base;
    if (q === 'Diminished') roman += '°';
    return buildChord(note, q, { complexity, degree: i, emotion: SCALE_DEFS[type].emotions[i] || q, roman });
  });
};

export const analyzeVoiceLeading = (a: Chord, b: Chord) => {
    let mov = 0; a.notes.forEach((n, i) => { mov += Math.abs((getChromaticIndex(b.notes[i] || n) + (i*12)) - (getChromaticIndex(n) + (i*12))); });
    return { type: mov > 10 ? 'jump' : 'smooth', contour: mov > 0 ? 'Movement' : 'Static', commonTones: 0, lines: [] as any[] };
};

export const generateOrbitalLayout = (chords: Chord[]) => chords.map((c, i) => {
    const r = i===0 ? 0 : 35 + (i%2)*5, rad = ((i===0 ? 0 : (i/(chords.length-1))*360)-90) * (Math.PI/180);
    return { ...c, x: 50 + (r * Math.cos(rad)), y: 50 + (r * Math.sin(rad)), z: i===0?50:10 };
});

export const getHarmonicCompatibility = (a: Chord, b: Chord) => {
    const dist = Math.abs(getChromaticIndex(a.root) - getChromaticIndex(b.root));
    return { score: dist === 7 || dist === 5 ? 1 : dist === 3 || dist === 4 ? 0.8 : 0.4 };
};

// --- EMOTIONAL UTILS ---
export const getTempoFromArousal = (a: number) => Math.min(180, Math.max(60, Math.round(110 + (a * 50))));
export const getPsychologyDescription = (v: number, a: number) => `${a > 0.2 ? "High Energy" : a < -0.2 ? "Low Energy" : "Moderate"} ${v > 0.2 ? "Positive" : v < -0.2 ? "Negative" : "Ambivalent"}`;
export const EMOJI_RADIUS = 24;
export const EMOTIONS: any = {
  "pleasant-energetic": { accent: "hsl(45, 93%, 47%)", grad: "rgba(234, 179, 8, 0.15), rgba(249, 115, 22, 0.15)" },
  "pleasant-calm": { accent: "hsl(142, 71%, 45%)", grad: "rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15)" },
  "unpleasant-energetic": { accent: "hsl(0, 84%, 60%)", grad: "rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.15)" },
  "unpleasant-calm": { accent: "hsl(217, 91%, 60%)", grad: "rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15)" },
  "neutral": { accent: "hsl(206, 42%, 56%)", grad: "rgba(100, 116, 139, 0.05)" }
};
export const getEmo = (v: number, a: number) => {
  const r = Math.sqrt(v*v + a*a);
  if (r < 0.15) return { emoji: "😐", label: "Neutral", q: "neutral" };
  const q = v>=0 ? (a>=0 ? "pleasant-energetic" : "pleasant-calm") : (a>=0 ? "unpleasant-energetic" : "unpleasant-calm");
  const emojis = { "pleasant-energetic": ["😌","😊","🤩"], "pleasant-calm": ["🌱","🌊","✨"], "unpleasant-energetic": ["🔥","😤","🤬"], "unpleasant-calm": ["🥀","🌧️","🌑"] };
  const intensity = r > 0.8 ? 2 : r > 0.5 ? 1 : 0;
  return { emoji: emojis[q as keyof typeof emojis][intensity], q };
};

// --- AUDIO ENGINE ---
export class AudioEngine {
  ctx: AudioContext | null = null; master: GainNode | null = null; inst: InstrumentType = 'rhodes'; timeouts: number[] = [];
  constructor() { 
    if (typeof window!=='undefined' && (window.AudioContext || (window as any).webkitAudioContext)) { 
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); 
        this.master = this.ctx.createGain(); this.master.gain.value=0.3; this.master.connect(this.ctx.destination); 
    } 
  }
  ensure() { if(this.ctx?.state === 'suspended') this.ctx.resume(); }
  setInstrument(i: InstrumentType) { this.inst = i; }
  
  playChord(c: Chord, dur=2.0, t=0) {
    if (!this.ctx || !this.master) return; this.ensure();
    const now = t || this.ctx.currentTime;
    getChordFrequencies(c).forEach((f, i) => {
      const osc = this.ctx!.createOscillator(), g = this.ctx!.createGain();
      osc.type = this.inst==='pad'?'sawtooth':this.inst==='synth'?'square':'sine'; osc.frequency.value = f;
      osc.connect(g); g.connect(this.master!);
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.3, now+0.05); g.gain.exponentialRampToValueAtTime(0.001, now+dur);
      osc.start(now + i*0.02); osc.stop(now+dur+0.5);
    });
  }
  playDiscovery(notes: string[], dur=0.2) {
    if(!this.ctx) return; this.ensure(); const now = this.ctx.currentTime;
    notes.slice(0,5).forEach((n,i) => {
        const osc=this.ctx!.createOscillator(), g=this.ctx!.createGain();
        osc.frequency.value = getNoteFrequency(n,4); osc.connect(g); g.connect(this.master!);
        g.gain.setValueAtTime(0, now+i*0.08); g.gain.linearRampToValueAtTime(0.2, now+i*0.08+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+i*0.08+dur);
        osc.start(now+i*0.08); osc.stop(now+i*0.08+dur+0.1);
    });
  }
  playProgression(chords: Chord[], bpm: number, onStep: (i:number)=>void, onEnd: ()=>void) {
    this.stop(); const step = 60/bpm * 2;
    chords.forEach((c, i) => { 
        this.playChord(c, step, this.ctx!.currentTime + i*step); 
        this.timeouts.push(window.setTimeout(()=>onStep(i), i*step*1000)); 
    });
    this.timeouts.push(window.setTimeout(onEnd, chords.length*step*1000));
  }
  stop() {
    this.timeouts.forEach(t => clearTimeout(t)); this.timeouts = [];
    if(this.ctx && this.master) { 
        this.master.gain.cancelScheduledValues(this.ctx.currentTime); 
        this.master.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime+0.1); 
        setTimeout(()=>{ if(this.ctx&&this.master) this.master.gain.value=0.3; }, 150); 
    }
  }
}
export const audioEngine = new AudioEngine();

// --- GEMINI SERVICE ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
export const generateSuggestions = async (progression: Chord[], key: string, scale: string): Promise<AiSuggestion[]> => {
  if (!process.env.API_KEY) return [];
  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 chords for progression: ${progression.map(c=>c.symbol).join('-')} in ${key} ${scale}. JSON format.`,
      config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { root: {type:Type.STRING}, quality: {type:Type.STRING}, extension: {type:Type.STRING}, roman: {type:Type.STRING}, explanation: {type:Type.STRING}, confidence: {type:Type.NUMBER} } } } }
    });
    return JSON.parse(res.text || "[]");
  } catch { return []; }
};
export const analyzeHarmony = async (p: Chord[], k: string) => {
    if (!process.env.API_KEY) return "No API Key";
    try { return (await ai.models.generateContent({ model: "gemini-3-pro-preview", contents: `Analyze harmony: ${p.map(c=>c.symbol).join('-')} in ${k}. 1 sophisticated sentence.` })).text || ""; } catch { return ""; }
};
