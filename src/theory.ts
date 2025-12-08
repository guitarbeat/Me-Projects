
import { Note, ScaleType, Chord, ChordComplexity } from './types';
import { CHROMATIC_SHARPS, CHROMATIC_FLATS, SCALE_DEFS } from './constants';
import { ScaleDef } from './types';

export const getScaleNotes = (root: Note, scaleType: ScaleType): Note[] => {
    if (!SCALE_DEFS[scaleType]) return [];
    const semitones = SCALE_DEFS[scaleType].intervals;
    const chromatic = CHROMATIC_SHARPS.includes(root) || ['G', 'D', 'A', 'E', 'B'].includes(root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    const rootIndex = chromatic.indexOf(root);
    return semitones.map(interval => chromatic[(rootIndex + interval) % 12]);
};

export const buildChord = (root: Note, quality: Chord['quality'], extension: string = '', duration: number = 4): Chord => {
    const chromatic = CHROMATIC_SHARPS.includes(root) || ['G', 'D', 'A', 'E', 'B', 'F#'].includes(root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    const rootIdx = chromatic.indexOf(root);
    
    let intervals: number[] = [];
    let suffix = '';
    
    // Basic Triad Intervals
    switch(quality) {
        case 'Major': intervals = [0, 4, 7]; suffix = ''; break;
        case 'Minor': intervals = [0, 3, 7]; suffix = 'm'; break;
        case 'Diminished': intervals = [0, 3, 6]; suffix = 'dim'; break;
        case 'Augmented': intervals = [0, 4, 8]; suffix = 'aug'; break;
        case 'Dominant': intervals = [0, 4, 7]; suffix = ''; break; 
        case 'Half-Dim': intervals = [0, 3, 6]; suffix = 'm(b5)'; break;
        case 'Sus2': intervals = [0, 2, 7]; suffix = 'sus2'; break;
        case 'Sus4': intervals = [0, 5, 7]; suffix = 'sus4'; break;
        default: intervals = [0, 4, 7]; suffix = ''; break;
    }

    // Parse Complexity/Extension for Jazz Chords
    if (extension) {
        // 7ths
        if (extension.includes('7')) {
            if (quality === 'Major') { intervals.push(11); suffix = 'maj7'; }
            else if (quality === 'Minor') { intervals.push(10); suffix = 'm7'; }
            else if (quality === 'Dominant') { intervals.push(10); suffix = '7'; }
            else if (quality === 'Half-Dim') { intervals.push(10); suffix = 'm7b5'; }
            else if (quality === 'Diminished') { intervals.push(9); suffix = 'dim7'; }
        }
        
        // 9ths
        if (extension.includes('9')) {
             if (!intervals.includes(10) && !intervals.includes(11)) {
                 if (quality === 'Major') intervals.push(11);
                 else if (quality === 'Dominant' || quality === 'Minor') intervals.push(10);
             }
             if (!intervals.includes(14)) intervals.push(14); 

             if (quality === 'Major') suffix = 'maj9';
             else if (quality === 'Minor') suffix = 'm9';
             else if (quality === 'Dominant') suffix = '9';
        }

        // 11ths
        if (extension.includes('11')) {
            if (!intervals.includes(14)) intervals.push(14); 
            const isSharp11 = extension.includes('#11');
            intervals.push(isSharp11 ? 18 : 17);

            if (quality === 'Minor') suffix = 'm11';
            else if (quality === 'Major') suffix = isSharp11 ? 'maj#11' : 'maj11';
            else if (quality === 'Dominant') suffix = isSharp11 ? '7#11' : '11';
        }
    }

    const notes = intervals.map(i => chromatic[(rootIdx + i) % 12]);
    let symbol = `${root}${suffix}`;
    if (extension && !suffix) symbol += extension;

    return {
        root,
        quality,
        extension,
        suffix,
        symbol,
        romanNumeral: '', 
        notes,
        interval: -1, 
        duration
    };
};

export const generateChordsForScale = (root: Note, scaleType: ScaleType, complexity: ChordComplexity = 'triad'): Chord[] => {
    const scaleNotes = getScaleNotes(root, scaleType);
    const chords: Chord[] = [];
    const romanNumerals = ['i','ii','iii','iv','v','vi','vii'];
    
    type ExtensionMap = Record<Exclude<ChordComplexity, 'triad'>, string>;
    
    const ionianDefs: { q: Chord['quality']; ext: ExtensionMap }[] = [
        { q: 'Major',    ext: { '7th': 'maj7', '9th': 'maj9', '11th': 'maj11' } },    // I
        { q: 'Minor',    ext: { '7th': 'm7',   '9th': 'm9',   '11th': 'm11' } },      // ii
        { q: 'Minor',    ext: { '7th': 'm7',   '9th': 'm7b9', '11th': 'm11' } },      // iii
        { q: 'Major',    ext: { '7th': 'maj7', '9th': 'maj9', '11th': 'maj#11' } },   // IV
        { q: 'Dominant', ext: { '7th': '7',    '9th': '9',    '11th': '11' } },       // V
        { q: 'Minor',    ext: { '7th': 'm7',   '9th': 'm9',   '11th': 'm11' } },      // vi
        { q: 'Half-Dim', ext: { '7th': 'm7b5', '9th': 'm7b5b9', '11th': 'm11b5' } }   // vii
    ];

    const modeOffsets: Record<ScaleType, number> = {
        'Major': 0, 'Natural Minor': 5, 'Dorian': 1, 'Phrygian': 2, 
        'Lydian': 3, 'Mixolydian': 4, 'Locrian': 6
    };
    const offset = modeOffsets[scaleType] || 0;

    scaleNotes.forEach((note, index) => {
        const degreeInMajor = (index + offset) % 7;
        const def = ionianDefs[degreeInMajor];
        const quality = def.q;
        
        let extString = '';
        if (complexity !== 'triad') {
            extString = def.ext[complexity] || '';
        }

        const noteIndices = [0, 2, 4];
        if (complexity !== 'triad') noteIndices.push(6);
        if (complexity === '9th' || complexity === '11th') noteIndices.push(8);
        if (complexity === '11th') noteIndices.push(10);

        const chordNotes = noteIndices.map(i => scaleNotes[(index + i) % 7]);

        let suffix = '';
        if (complexity === 'triad') {
            if (quality === 'Major') suffix = '';
            else if (quality === 'Minor') suffix = 'm';
            else if (quality === 'Diminished') suffix = 'dim';
            else if (quality === 'Augmented') suffix = 'aug';
            else if (quality === 'Half-Dim') suffix = 'dim';
        } else {
            suffix = extString;
        }

        let num = romanNumerals[index];
        if (quality === 'Major' || quality === 'Dominant') num = num.toUpperCase();
        if (quality === 'Augmented') num = num.toUpperCase() + '+';
        if (quality === 'Diminished') num = num.toLowerCase() + '°';
        if (quality === 'Half-Dim') num = num.toLowerCase() + 'ø';

        if (complexity !== 'triad') {
            num = num.replace('°', '').replace('ø', '');
            if (quality === 'Major') num += 'maj7';
            else if (quality === 'Dominant') num += '7';
            else if (quality === 'Minor') num = num.toLowerCase() + '7';
            else if (quality === 'Half-Dim') num = num.toLowerCase() + 'ø7';
            else if (quality === 'Diminished') num = num.toLowerCase() + '°7';
            if (complexity === '9th') num = num.replace('7', '9');
            if (complexity === '11th') num = num.replace('7', '11').replace('9', '11');
        }

        const chord: Chord = {
            root: note,
            quality: quality,
            extension: extString,
            suffix: suffix,
            symbol: `${note}${suffix}`,
            romanNumeral: num,
            notes: chordNotes,
            interval: index,
            duration: 4,
            complexity: complexity
        };
        chords.push(chord);
    });
    return chords;
};

export const generateSecondaryDominants = (root: Note, scaleType: ScaleType): Chord[] => {
    const diatonicChords = generateChordsForScale(root, scaleType, 'triad'); 
    const secondary: Chord[] = [];
    
    diatonicChords.forEach(target => {
        if (target.quality === 'Diminished' || target.quality === 'Half-Dim') return; 
        if (target.interval === 0) return; 

        const targetRootNotes = CHROMATIC_SHARPS.includes(target.root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
        const targetIdx = targetRootNotes.indexOf(target.root);
        const domRootIndex = (targetIdx + 7) % 12;
        const domRoot = targetRootNotes[domRootIndex];
        
        const realChord = buildChord(domRoot, 'Dominant', '7');
        
        realChord.symbol = `${domRoot}7`;
        realChord.romanNumeral = `V7/${target.romanNumeral.replace(/[°ø7maj]/g,'')}`;
        
        secondary.push(realChord);
    });
    return secondary;
};

export const getTensionChords = (root: Note, scaleType: ScaleType, tension: number): Chord[] => {
    const chords: Chord[] = [];
    const chromatic = (['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(root) || root.includes('b')) 
        ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
    const rootIdx = chromatic.indexOf(root);

    const addTensionChord = (intervalOffset: number, quality: Chord['quality'], extension: string, roman: string, type: string) => {
        const noteIdx = (rootIdx + intervalOffset) % 12;
        const note = chromatic[noteIdx];
        const chord = buildChord(note, quality, extension);
        chord.romanNumeral = roman;
        chord.tensionType = type;
        if (quality === 'Augmented' && extension === '7') chord.symbol = `${note}+7`;
        if (type === 'sub') chord.symbol = `${note}7`;
        chords.push(chord);
    };

    if (tension > 0.25) {
        addTensionChord(8, 'Major', 'maj7', 'bVI', 'borrowed');
        addTensionChord(10, 'Dominant', '7', 'bVII7', 'borrowed');
    }
    if (tension > 0.50) {
        addTensionChord(1, 'Dominant', '7', 'bII7', 'sub');
        addTensionChord(6, 'Dominant', '7', '#IV7', 'sub');
    }
    if (tension > 0.70) {
        addTensionChord(11, 'Diminished', 'dim7', 'vii°7', 'dim');
        addTensionChord(1, 'Diminished', 'dim7', 'bii°7', 'dim');
    }
    if (tension > 0.85) {
        addTensionChord(7, 'Augmented', '7', 'V+7', 'alt');
        addTensionChord(3, 'Dominant', '7', 'bIII7', 'alt');
    }
    return chords;
};

export const estimateChordSentiment = (chord: Chord, key: Note, scale: ScaleType) => {
    let v = 0;
    let a = 0;
    if (chord.quality === 'Major') { v += 0.5; a += 0.1; }
    else if (chord.quality === 'Minor') { v -= 0.4; a -= 0.1; }
    else if (chord.quality === 'Diminished') { v -= 0.6; a += 0.3; }
    else if (chord.quality === 'Dominant') { v += 0.2; a += 0.4; }
    
    if (chord.complexity === '7th') { v *= 1.1; a *= 1.1; }
    if (chord.complexity === '9th') { v += 0.1; a -= 0.1; } 
    
    if (chord.interval === 0) { a -= 0.3; if (chord.quality === 'Major') v += 0.3; }
    if (chord.interval === 4) { a += 0.4; v += 0.1; }
    if (chord.interval === 6) { a += 0.3; v -= 0.2; }

    return { valence: Math.max(-1, Math.min(1, v)), arousal: Math.max(-1, Math.min(1, a)) };
};

export const getCompassLabel = (v: number, a: number): string => {
    if (a > 0.3) return v > 0.3 ? "Excited" : v < -0.3 ? "Tense" : "Energetic";
    if (a < -0.3) return v > 0.3 ? "Serene" : v < -0.3 ? "Melancholic" : "Calm";
    return v > 0.3 ? "Happy" : v < -0.3 ? "Sad" : "Neutral";
};

export const getTempoFromArousal = (a: number): number => Math.round(110 + (a * 50));

export const getMusicalCharacteristics = (v: number, a: number, t: number) => {
    let vibe = "Neutral";
    if (v > 0.25) vibe = "Bright";
    else if (v < -0.25) vibe = "Dark";
    let mode = "Stable";
    if (t > 0.5) mode = "Unstable";
    else if (a > 0.5) mode = "Dynamic";
    let texture = "Moderate";
    if (a > 0.4) texture = "Dense";
    else if (a < -0.4) texture = "Sparse";
    return { vibe, mode, texture };
};

export const getHarmonicSuggestions = (contextChord: Chord | null): number[] => {
    if (!contextChord) return [0, 4, 5]; 
    const i = contextChord.interval;
    switch(i) {
        case 0: return [3, 4, 5, 1]; 
        case 1: return [4, 6];       
        case 2: return [5, 3];       
        case 3: return [4, 0, 1];    
        case 4: return [0, 5];       
        case 5: return [3, 1];       
        case 6: return [0, 5];       
        default: return [0, 4, 5];
    }
};

export const findClosestScale = (v: number, a: number, t: number, currentScale: ScaleType): ScaleType => {
    let minDist = Infinity;
    let closest = currentScale;
    Object.entries(SCALE_DEFS).forEach(([st, def]) => {
        const sDef = def as ScaleDef;
        const d = Math.sqrt(
            Math.pow(v - sDef.scaleCoordinates.v, 2) + 
            Math.pow(a - sDef.scaleCoordinates.a, 2) + 
            Math.pow(t - sDef.scaleCoordinates.t, 2)
        );
        const weightedDist = st === currentScale ? d * 0.75 : d;
        if (weightedDist < minDist) { minDist = weightedDist; closest = st as ScaleType; }
    });
    return closest;
};
