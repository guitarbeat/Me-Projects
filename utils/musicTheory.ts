
import { Note, ScaleType, Chord, VoicingType, VoicedNote, ChordComplexity } from '../types';

export const CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const CHROMATIC_FLATS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const CIRCLE_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
export const RELATIVE_MINORS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

// --- Type Definitions & Helpers ---

export interface ScaleDef {
    intervals: number[];
    palette: { accent: string; background: string; gradient: string };
    coords: { x: number; y: number };
    emotions: Record<number, string>;
    meta: {
        title: string;
        desc: string;
        quote: string;
        characteristic: string;
    };
}

export const SCALE_DEFS: Record<ScaleType, ScaleDef> = {
  [ScaleType.Major]: { 
    intervals: [0, 2, 4, 5, 7, 9, 11], 
    coords: { x: 0.75, y: 0.6 }, 
    palette: { accent: '#38bdf8', background: '#0f172a', gradient: 'linear-gradient(135deg, #e0f2fe 0%, #38bdf8 100%)' },
    emotions: { 0: "Home", 1: "Soft Sorrow", 2: "Bittersweet", 3: "Hopeful", 4: "Tension", 5: "Sad Lift", 6: "Unresolved" },
    meta: { title: 'Ionian', desc: 'Bright & Heroic', quote: 'The journey home.', characteristic: 'Major 7th' }
  },
  [ScaleType.Minor]: { 
    intervals: [0, 2, 3, 5, 7, 8, 10], 
    coords: { x: -0.6, y: -0.7 }, 
    palette: { accent: '#6366f1', background: '#0a0e14', gradient: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)' },
    emotions: { 0: "Sad Home", 1: "Dissonant", 2: "Hopeful", 3: "Deep Sadness", 4: "Dark Tension", 5: "Epic", 6: "Resolved" },
    meta: { title: 'Aeolian', desc: 'Deep & Emotional', quote: 'Shadows in the moonlight.', characteristic: 'Flat 6' }
  },
  [ScaleType.Mixolydian]: { 
    intervals: [0, 2, 4, 5, 7, 9, 10], 
    coords: { x: 0.8, y: -0.1 }, 
    palette: { accent: '#f59e0b', background: '#140f0a', gradient: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)' }, 
    emotions: {},
    meta: { title: 'Mixolydian', desc: 'Hopeful & Bluesy', quote: 'Sun breaking through.', characteristic: 'Flat 7' }
  },
  [ScaleType.Lydian]: { 
    intervals: [0, 2, 4, 6, 7, 9, 11], 
    coords: { x: 0.4, y: -0.5 }, 
    palette: { accent: '#d946ef', background: '#140a12', gradient: 'linear-gradient(135deg, #f5d0fe 0%, #d946ef 100%)' }, 
    emotions: {},
    meta: { title: 'Lydian', desc: 'Dreamy & Floating', quote: 'Above the clouds.', characteristic: 'Sharp 4' }
  },
  [ScaleType.Dorian]: { 
    intervals: [0, 2, 3, 5, 7, 9, 10], 
    coords: { x: -0.2, y: -0.2 }, 
    palette: { accent: '#a855f7', background: '#0a0a14', gradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 100%)' }, 
    emotions: {},
    meta: { title: 'Dorian', desc: 'Soulful & Jazzy', quote: 'Late night introspection.', characteristic: 'Major 6' }
  },
  [ScaleType.Phrygian]: { 
    intervals: [0, 1, 3, 5, 7, 8, 10], 
    coords: { x: -0.6, y: 0.6 }, 
    palette: { accent: '#ef4444', background: '#140a0a', gradient: 'linear-gradient(135deg, #fca5a5 0%, #991b1b 100%)' }, 
    emotions: {},
    meta: { title: 'Phrygian', desc: 'Exotic & Dark', quote: 'Ancient mysteries revealed.', characteristic: 'Flat 2' }
  },
  [ScaleType.Locrian]: { 
    intervals: [0, 1, 3, 5, 6, 8, 10], 
    coords: { x: -0.3, y: 0.9 }, 
    palette: { accent: '#71717a', background: '#09090b', gradient: 'linear-gradient(135deg, #52525b 0%, #18181b 100%)' }, 
    emotions: {},
    meta: { title: 'Locrian', desc: 'Tense & Unstable', quote: 'The edge of reality.', characteristic: 'Flat 5' }
  },
};

export const getChromaticIndex = (note: string): number => {
    const idx = CHROMATIC_SHARPS.indexOf(note);
    return idx === -1 ? CHROMATIC_FLATS.indexOf(note) : idx;
};

export const getChromaticScale = (root: string): string[] => 
    (['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root) || (root.includes('b') && root !== 'B')) ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

export const polarToCartesian = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg - 90) * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
};

export const getNoteFrequency = (note: Note, octave: number = 4): number => 
    440 * Math.pow(2, (12 + (octave * 12) + getChromaticIndex(note) - 69) / 12);

export const getChordFrequencies = (chord: Chord) => chord.notes.map((n, i) => getNoteFrequency(n, i === 0 ? 3 : 4));

// --- Chord Construction ---

interface BuildChordParams {
    complexity?: ChordComplexity;
    extension?: string;
    degree?: number; // 0-6
    emotion?: string;
    roman?: string;
    functionLabel?: string;
}

const INTERVAL_MAP: Record<string, number[]> = {
    'Major': [0, 4, 7], 'Minor': [0, 3, 7], 'Diminished': [0, 3, 6], 'Augmented': [0, 4, 8],
    'Dominant': [0, 4, 7, 10], 'Half-Dim': [0, 3, 6, 10]
};

// Smart factory that derives quality/extension if not fully specified
export const buildChord = (root: string, quality: Chord['quality'], params: BuildChordParams = {}): Chord => {
    const chromatic = getChromaticScale(root);
    const rootIdx = getChromaticIndex(root);
    const { complexity = 'triad', degree = 0 } = params;

    // Determine Extension Intervals
    let intervals = [...(INTERVAL_MAP[quality] || [0, 4, 7])];
    let suffix = '';
    let extDisplay = params.extension || 'Triad';
    
    if (params.extension) {
        // Explicit extension overrides complexity logic
        const extMap: Record<string, number[]> = { 
            'Maj7': [0,4,7,11], 'm7': [0,3,7,10], '7': [0,4,7,10], 'm7b5': [0,3,6,10], 'dim7': [0,3,6,9] 
        };
        if (extMap[params.extension]) intervals = extMap[params.extension];
        suffix = params.extension === 'Triad' ? '' : params.extension.replace('Maj', 'maj');
    } else if (complexity !== 'triad') {
        // Derive based on Quality + Complexity
        if (quality === 'Major') { intervals = [0, 4, 7, 11]; suffix = 'maj7'; extDisplay = 'Maj7'; }
        else if (quality === 'Minor') { intervals = [0, 3, 7, 10]; suffix = 'm7'; extDisplay = 'm7'; }
        else if (quality === 'Dominant') { intervals = [0, 4, 7, 10]; suffix = '7'; extDisplay = '7'; }
        else if (quality === 'Half-Dim') { intervals = [0, 3, 6, 10]; suffix = 'm7b5'; extDisplay = 'm7b5'; }
        else if (quality === 'Diminished') { intervals = [0, 3, 6, 9]; suffix = 'dim7'; extDisplay = 'dim7'; }
        
        if (complexity === '9th') {
            intervals.push(14); suffix += '9'; 
        }
    } else {
         // Triad suffixes
         suffix = quality === 'Minor' ? 'm' : quality === 'Diminished' ? 'dim' : quality === 'Augmented' ? 'aug' : '';
    }

    // Build Roman Numeral if not provided
    let roman = params.roman;
    if (!roman) {
        const bases = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
        let base = bases[degree] || 'i';
        if (['Major', 'Dominant', 'Augmented'].includes(quality)) base = base.toUpperCase();
        if (quality === 'Diminished') base += '°';
        if (quality === 'Augmented') base += '+';
        if (extDisplay.includes('7')) base += '7';
        roman = base;
    }

    return {
        root, quality, extension: extDisplay, suffix, symbol: `${root}${suffix}`,
        romanNumeral: roman,
        notes: intervals.map(i => chromatic[(rootIdx + i) % 12]),
        interval: degree,
        emotionalDesc: params.emotion || quality,
        functionLabel: params.functionLabel || params.emotion || "Diatonic"
    };
};

export const getScaleNotes = (root: Note, type: ScaleType): Note[] => {
  const chromatic = getChromaticScale(root);
  const rootIdx = getChromaticIndex(root);
  return SCALE_DEFS[type].intervals.map(int => chromatic[(rootIdx + int) % 12]);
};

export const generateChordsForScale = (root: Note, type: ScaleType, complexity: ChordComplexity): Chord[] => {
  const scaleNotes = getScaleNotes(root, type);
  const chromatic = getChromaticScale(root);
  
  return scaleNotes.map((note, i) => {
      // Calculate intervals relative to chord root
      const nIdx = getChromaticIndex(note);
      const getInt = (offset: number) => (getChromaticIndex(scaleNotes[(i + offset) % 7]) - nIdx + 12) % 12;
      
      const [third, fifth, seventh] = [getInt(2), getInt(4), getInt(6)];
      
      // Identify Quality
      let q: Chord['quality'] = 'Major';
      if (third === 3) q = fifth === 6 ? 'Diminished' : 'Minor';
      else if (third === 4) q = fifth === 8 ? 'Augmented' : 'Major';
      
      // Refine with 7th
      if (complexity !== 'triad') {
          if (q === 'Major' && seventh === 10) q = 'Dominant';
          if (q === 'Diminished' && seventh === 10) q = 'Half-Dim';
      }

      return buildChord(note, q, { 
          complexity, 
          degree: i, 
          emotion: SCALE_DEFS[type].emotions[i] 
      });
  });
};

export const generateSecondaryDominants = (root: Note, type: ScaleType): Chord[] => {
    const notes = getScaleNotes(root, type);
    return [1, 2, 3, 4, 5].filter(i => notes[i]).map(i => {
        const target = notes[i];
        const fifth = CHROMATIC_SHARPS[(getChromaticIndex(target) + 7) % 12];
        return buildChord(fifth, 'Dominant', { 
            extension: '7', degree: i, 
            emotion: `V/${notes[i]}`, 
            roman: `V7/${['I','ii','iii','IV','V','vi','vii'][i] || '?' }`,
            functionLabel: 'Secondary Dominant' 
        });
    });
};

export const generateBorrowedChords = (root: Note, type: ScaleType): Chord[] => {
    const min = getScaleNotes(root, ScaleType.Minor);
    const maj = getScaleNotes(root, ScaleType.Major);
    
    if (type === ScaleType.Major) {
        return [
            buildChord(min[2], 'Major', { extension: 'Maj7', degree: 2, roman: 'bIII', functionLabel: 'Borrowed' }),
            buildChord(min[3], 'Minor', { extension: 'm7', degree: 3, roman: 'iv', functionLabel: 'Minor Plagal' }),
            buildChord(min[5], 'Major', { extension: 'Maj7', degree: 5, roman: 'bVI', functionLabel: 'Borrowed' }),
            buildChord(min[6], 'Major', { extension: '7', degree: 6, roman: 'bVII', functionLabel: 'Backdoor' })
        ];
    } else {
        return [
            buildChord(maj[0], 'Major', { extension: 'Maj7', degree: 0, roman: 'I', functionLabel: 'Picardy' }),
            buildChord(maj[3], 'Major', { extension: '7', degree: 3, roman: 'IV', functionLabel: 'Dorian' })
        ];
    }
};

// --- Analysis Helpers ---

export const getCompatibleModes = (chord: Chord): { scale: ScaleType, nuance: string, colorNote: string }[] => {
    const q = chord.quality;
    const ext = chord.extension;

    if (q === 'Major') {
        return [
            { scale: ScaleType.Major, nuance: "Consonant / Stable", colorNote: "Natural 4" },
            { scale: ScaleType.Lydian, nuance: "Dreamy / Floating", colorNote: "Sharp 4" }
        ];
    }
    if (q === 'Minor') {
        if (chord.romanNumeral.includes('ii')) {
             return [
                 { scale: ScaleType.Dorian, nuance: "Soulful / Bright Minor", colorNote: "Natural 6" },
                 { scale: ScaleType.Minor, nuance: "Darker / Melancholic", colorNote: "Flat 6" }
             ];
        }
        return [
            { scale: ScaleType.Minor, nuance: "Sad / Emotional", colorNote: "Flat 6" },
            { scale: ScaleType.Dorian, nuance: "Jazzy / Hopeful", colorNote: "Natural 6" },
            { scale: ScaleType.Phrygian, nuance: "Dark / Exotic", colorNote: "Flat 2" }
        ];
    }
    if (q === 'Dominant') {
        return [
            { scale: ScaleType.Mixolydian, nuance: "Bluesy / Standard", colorNote: "Flat 7" },
            { scale: ScaleType.Lydian, nuance: "Lydian Dominant / Magical", colorNote: "#4 & b7" },
            { scale: ScaleType.Phrygian, nuance: "Phrygian Dominant / Spanish", colorNote: "b2 & 3" }
        ];
    }
    if (q === 'Half-Dim') {
        return [{ scale: ScaleType.Locrian, nuance: "Tense / Unresolved", colorNote: "Flat 5" }];
    }
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

export const getScaleSuggestionForChord = (c: Chord) => ({ 'Minor': c.romanNumeral.includes('ii') ? "Dorian" : "Aeolian", 'Dominant': "Mixolydian", 'Half-Dim': "Locrian" }[c.quality] || "Ionian");

export interface HarmonicAffinity { score: number; label: string; color: string; description: string; }

export const getHarmonicCompatibility = (a: Chord, b: Chord): HarmonicAffinity => {
    const diff = Math.abs((getChromaticIndex(a.root) - getChromaticIndex(b.root) + 12) % 12);
    const dist = Math.min(diff, 12 - diff);
    return dist === 1 ? { score: 1, label: "Strong", color: "text-emerald-400", description: "Perfect 5th" }
         : dist === 2 ? { score: 0.8, label: "Moderate", color: "text-cyan-400", description: "Stepwise" }
         : dist === 3 ? { score: 0.7, label: "Relative", color: "text-purple-400", description: "Third" }
         : { score: 0.4, label: "Distant", color: "text-amber-500", description: "Chromatic" };
};

export const getVoicedNotes = (chord: Chord, voicing: VoicingType = 'Root'): VoicedNote[] => {
    const rootIdx = getChromaticIndex(chord.root);
    const voiced = chord.notes.map((n, i) => ({ 
        note: n, 
        octave: i === 0 ? 3 : (i >= 4 || getChromaticIndex(n) < rootIdx ? 5 : 4) 
    }));
    if (voicing === '1st Inv' && voiced[0]) voiced[0].octave++;
    else if (voicing === '2nd Inv' && voiced[1]) { voiced[0].octave++; voiced[1].octave++; }
    else if (voicing === 'Drop-2' && voiced.length >= 3) voiced[voiced.length - (voiced.length >= 4 ? 2 : 1)].octave--;
    return voiced.sort((a, b) => (a.octave * 12 + getChromaticIndex(a.note)) - (b.octave * 12 + getChromaticIndex(b.note)));
};

export const analyzeVoiceLeading = (a: Chord, b: Chord) => {
    const nA = getVoicedNotes(a), nB = getVoicedNotes(b);
    let totalMovement = 0;
    let commonTones = 0;
    let directionSum = 0; // +1 for up, -1 for down

    const lines = nA.slice(0, Math.min(nA.length, nB.length)).map((na, i) => {
        const pitchA = na.octave * 12 + getChromaticIndex(na.note);
        const pitchB = nB[i].octave * 12 + getChromaticIndex(nB[i].note);
        const diff = pitchB - pitchA;
        const absDiff = Math.abs(diff);
        
        totalMovement += absDiff;
        if (absDiff === 0) commonTones++;
        if (diff !== 0) directionSum += Math.sign(diff);

        // Color coding based on movement distance
        let color = 'rgba(255,255,255,0.3)'; // Static
        if (absDiff > 0 && absDiff <= 2) color = '#4ade80'; // Green (Step/Smooth)
        else if (absDiff > 2 && absDiff <= 4) color = '#fbbf24'; // Amber (Skip)
        else if (absDiff > 4) color = '#f87171'; // Red (Leap/Jump)

        return { start: i, end: i, color, diff, absDiff };
    });

    const avgMovement = lines.length ? totalMovement / lines.length : 0;
    
    // Determine overall type
    let type = 'smooth';
    if (avgMovement > 3.5) type = 'jump';
    else if (avgMovement > 2) type = 'balanced';

    // Determine contour
    let contour = 'Static';
    const movingVoices = lines.length - commonTones;
    
    if (movingVoices > 0) {
        if (commonTones === 0 && Math.abs(directionSum) === lines.length) {
            contour = directionSum > 0 ? 'Parallel Up' : 'Parallel Down';
        } else if (directionSum > 0) {
            contour = 'Ascending';
        } else if (directionSum < 0) {
            contour = 'Descending';
        } else {
            contour = 'Mixed'; // Contrary or oblique
        }
    }

    return { type, lines, commonTones, contour, avgMovement };
};

export const getTempoFromArousal = (a: number) => Math.min(180, Math.max(60, Math.round(110 + (a * 50))));
export const getPsychologyDescription = (v: number, a: number) => `${a > 0.2 ? "High Energy" : a < -0.2 ? "Low Energy" : "Moderate"} ${v > 0.2 ? "Positive" : v < -0.2 ? "Negative" : "Ambivalent"}`;
export const getShapeClass = (r: string, q: string) => {
    const l = r.toLowerCase();
    if (l === 'i' || l === '1') return 'rounded-xl';
    if ((l.includes('v') && !l.includes('iv')) || q === 'Dominant') return 'rounded-sm rotate-45 scale-90'; 
    if (l.includes('ii') || l.includes('iv')) return '-skew-x-6 rounded-lg';
    if (l.includes('vi')) return 'rounded-full';
    return 'rounded-xl';
};

// --- Deterministic Orbital Layout ---

export const generateOrbitalLayout = (chords: Chord[]) => {
    const sectors: Record<string, Chord[]> = {
        tonic: [], dominant: [], subdominant: [], mediant: [], submediant: [], exotic: []
    };

    // 1. Categorize chords into functional buckets
    chords.forEach(chord => {
        const raw = chord.romanNumeral.toLowerCase().replace(/[0-9]/g, ''); 
        const parts = raw.split('/');
        const root = parts[0];
        const target = parts[1] || null;

        if (root === 'i' && !target) { sectors.tonic.push(chord); return; }

        const key = target || root;
        // Identify functional zones
        if (['v', 'vii', 'bvii'].some(r => key.startsWith(r))) sectors.dominant.push(chord);
        else if (['iv', 'ii', 'bii'].some(r => key.startsWith(r))) sectors.subdominant.push(chord);
        else if (['iii'].some(r => key.startsWith(r))) sectors.mediant.push(chord);
        else if (['vi'].some(r => key.startsWith(r))) sectors.submediant.push(chord);
        else sectors.exotic.push(chord);
    });

    const results: any[] = [];

    // 2. Helper to distribute chords within a sector
    const place = (group: Chord[], baseAngle: number, baseR: number) => {
        if (!group.length) return;
        
        // Sort: put shorter/simpler symbols first (e.g. V before V7/V)
        group.sort((a, b) => a.symbol.length - b.symbol.length); 

        // Calculate spread: fan out based on count
        const spread = Math.min(90, group.length * 25); 
        const start = baseAngle - (spread/2);
        
        group.forEach((c, i) => {
            // Distribute along arc
            const progress = group.length === 1 ? 0.5 : i / (group.length - 1);
            let angle = group.length === 1 ? baseAngle : start + (progress * spread);
            
            let r = baseR;
            let s = 1;
            
            // Push complex/secondary chords to outer orbit to avoid crowding center
            if (c.romanNumeral.includes('/') || (c.functionLabel && c.functionLabel !== 'Diatonic')) {
                r += 8;
                s = 0.9;
                // Stagger radius slightly to prevent ring stacking if angles are close
                r += (i % 2) * 2; 
            } else {
                // Slight zigzag for diatonic neighbors
                r += (i % 2) * -2; 
            }
            
            const rad = angle * (Math.PI / 180);
            results.push({
                ...c,
                x: 50 + (r * Math.cos(rad)),
                y: 50 + (r * Math.sin(rad)),
                z: 10,
                scale: s
            });
        });
    };

    // 3. Execute Layout
    sectors.tonic.forEach(c => results.push({ ...c, x: 50, y: 50, z: 50, scale: 1.2 }));

    // Radius optimized for mobile view (~28% of container)
    place(sectors.dominant, 0, 28);      // East
    place(sectors.subdominant, 180, 28); // West
    place(sectors.mediant, 270, 28);     // North
    place(sectors.submediant, 90, 28);   // South
    
    // Exotics go to diagonals
    place(sectors.exotic, 135, 35);

    return results;
};
