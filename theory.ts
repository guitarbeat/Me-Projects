import { Note, ScaleType, Chord, ChordComplexity } from './types';
import { Scale, Chord as TonalChord, Note as TonalNote } from '@tonaljs/tonal';

export const getScaleNotes = (root: Note, scaleType: ScaleType): Note[] => {
    // Map internal ScaleType to Tonal's naming
    const map: Record<ScaleType, string> = {
        'Major': 'major',
        'Natural Minor': 'minor',
        'Dorian': 'dorian',
        'Phrygian': 'phrygian',
        'Lydian': 'lydian',
        'Mixolydian': 'mixolydian',
        'Locrian': 'locrian'
    };
    return Scale.get(`${root} ${map[scaleType]}`).notes;
};

export const buildChord = (root: Note, quality: Chord['quality'], extension: string = '', duration: number = 4): Chord => {
    // Construct a Tonal-compatible symbol
    let suffix = '';
    switch(quality) {
        case 'Major': suffix = 'M'; break;
        case 'Minor': suffix = 'm'; break;
        case 'Diminished': suffix = 'dim'; break;
        case 'Augmented': suffix = 'aug'; break;
        case 'Half-Dim': suffix = 'm7b5'; break;
        case 'Dominant': suffix = '7'; break;
        case 'Sus2': suffix = 'sus2'; break;
        case 'Sus4': suffix = 'sus4'; break;
    }

    // Override suffix if extension is more specific
    if (extension) {
        if (extension.includes('maj7')) suffix = 'maj7';
        else if (extension.includes('m7b5')) suffix = 'm7b5';
        else if (extension.includes('dim7')) suffix = 'dim7';
        else if (extension.includes('m7')) suffix = 'm7';
        else if (extension === '7') suffix = '7';
        else if (extension.includes('maj9')) suffix = 'maj9';
        else if (extension.includes('m9')) suffix = 'm9';
        else if (extension === '9') suffix = '9';
        else if (extension.includes('11')) {
            // Tonal handles '11', 'm11', 'maj#11' etc fairly well
            suffix = extension;
        }
    }

    // Fallback logic for constructing the query
    let query = root + suffix;
    
    // Tonal fallback for clean parsing
    const c = TonalChord.get(query);
    const valid = !c.empty ? c : TonalChord.get(`${root}${quality === 'Minor' ? 'm' : ''}`);

    return {
        root,
        quality,
        extension,
        suffix: valid.aliases[0] || suffix,
        symbol: valid.symbol || query,
        romanNumeral: '', 
        notes: valid.notes,
        interval: -1, 
        duration,
        theoryInfo: valid.name
    };
};

export const generateChordsForScale = (root: Note, scaleType: ScaleType, complexity: ChordComplexity = 'triad'): Chord[] => {
    const scaleNotes = getScaleNotes(root, scaleType);
    const romanNumerals = ['i','ii','iii','iv','v','vi','vii'];
    const degrees = ['Major', 'Minor', 'Minor', 'Major', 'Dominant', 'Minor', 'Half-Dim'];
    const extensionsMap: Record<string, string[]> = {
        'triad': ['', '', '', '', '', '', ''],
        '7th': ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'],
        '9th': ['maj9', 'm9', 'm7b9', 'maj9', '9', 'm9', 'm7b5'],
        '11th': ['maj9', 'm11', 'm11', 'maj#11', '11', 'm11', 'm11b5']
    };

    const modeOffsets: Record<ScaleType, number> = {
        'Major': 0, 'Natural Minor': 5, 'Dorian': 1, 'Phrygian': 2, 
        'Lydian': 3, 'Mixolydian': 4, 'Locrian': 6
    };
    const offset = modeOffsets[scaleType] || 0;

    return scaleNotes.map((note, index) => {
        const degreeInMajor = (index + offset) % 7;
        const quality = degrees[degreeInMajor] as Chord['quality'];
        const ext = complexity === 'triad' ? '' : extensionsMap[complexity][degreeInMajor];

        // Let Tonal build the notes
        let symbol = note + ext;
        if (!ext) {
             if (quality === 'Minor') symbol += 'm';
             if (quality === 'Diminished') symbol += 'dim';
             if (quality === 'Half-Dim') symbol += 'dim'; // fallback for triad view
             if (quality === 'Augmented') symbol += 'aug';
        }
        
        const c = TonalChord.get(symbol);
        
        // Construct Roman Numeral
        let num = romanNumerals[index];
        if (['Major', 'Dominant', 'Augmented'].includes(quality)) num = num.toUpperCase();
        if (quality === 'Augmented') num += '+';
        if (quality === 'Diminished') num += '°';
        if (quality === 'Half-Dim') num += 'ø';
        
        if (complexity !== 'triad') {
             num = num.replace(/[°ø]/, '');
             if (ext.includes('maj7')) num += 'maj7';
             else if (ext.includes('m7b5')) num += 'ø7';
             else if (ext.includes('dim7')) num += '°7';
             else if (ext.includes('7')) num += '7';
             if (complexity === '9th') num = num.replace('7', '9');
             if (complexity === '11th') num = num.replace(/7|9/, '11');
        }

        return {
            root: note,
            quality,
            extension: ext,
            suffix: ext,
            symbol: c.symbol || symbol,
            romanNumeral: num,
            notes: c.notes,
            interval: index,
            duration: 4,
            complexity
        };
    });
};

export const generateSecondaryDominants = (root: Note, scaleType: ScaleType): Chord[] => {
    const scaleNotes = getScaleNotes(root, scaleType);
    const romanNumerals = ['I','II','III','IV','V','VI','VII'];
    
    // Return a V7 for each degree except root
    return scaleNotes.map((target, i) => {
        if (i === 0) return null; // V/I is just V
        // V is a Perfect 5th above the target
        const vRoot = TonalNote.transpose(target, "5P");
        const c = buildChord(vRoot, 'Dominant', '7');
        c.romanNumeral = `V7/${romanNumerals[i]}`;
        return c;
    }).filter(Boolean) as Chord[];
};

export const getTensionChords = (root: Note, scaleType: ScaleType, tension: number): Chord[] => {
    const chords: Chord[] = [];
    
    const add = (interval: string, quality: Chord['quality'], ext: string, roman: string, type: string) => {
        const note = TonalNote.transpose(root, interval);
        const c = buildChord(note, quality, ext);
        c.romanNumeral = roman;
        c.tensionType = type;
        if(quality==='Augmented') c.symbol = `${note}+7`; 
        chords.push(c);
    };

    if (tension > 0.25) {
        add('6m', 'Major', 'maj7', 'bVI', 'borrowed');
        add('7m', 'Dominant', '7', 'bVII7', 'borrowed');
    }
    if (tension > 0.50) {
        add('2m', 'Dominant', '7', 'bII7', 'sub');
        add('4A', 'Dominant', '7', '#IV7', 'sub');
    }
    if (tension > 0.70) {
        add('7M', 'Diminished', 'dim7', 'vii°7', 'dim');
    }
    if (tension > 0.85) {
        add('5P', 'Augmented', '7', 'V+7', 'alt');
    }

    return chords;
};

// ... keep existing non-theory helpers ...
export const estimateChordSentiment = (chord: Chord, key: Note, scale: ScaleType) => {
    let v = 0, a = 0;
    if (chord.quality === 'Major') { v += 0.5; a += 0.1; }
    else if (chord.quality === 'Minor') { v -= 0.4; a -= 0.1; }
    else if (chord.quality === 'Diminished') { v -= 0.6; a += 0.3; }
    else if (chord.quality === 'Dominant') { v += 0.2; a += 0.4; }
    if (chord.complexity !== 'triad') { v *= 1.1; a *= 1.1; }
    return { valence: Math.max(-1, Math.min(1, v)), arousal: Math.max(-1, Math.min(1, a)) };
};

export const getCompassLabel = (v: number, a: number): string => {
    if (a > 0.3) return v > 0.3 ? "Excited" : v < -0.3 ? "Tense" : "Energetic";
    if (a < -0.3) return v > 0.3 ? "Serene" : v < -0.3 ? "Melancholic" : "Calm";
    return v > 0.3 ? "Happy" : v < -0.3 ? "Sad" : "Neutral";
};

export const getTempoFromArousal = (a: number): number => Math.round(110 + (a * 50));

export const getMusicalCharacteristics = (v: number, a: number, t: number) => {
    let vibe = v > 0.25 ? "Bright" : v < -0.25 ? "Dark" : "Neutral";
    let mode = t > 0.5 ? "Unstable" : a > 0.5 ? "Dynamic" : "Stable";
    let texture = a > 0.4 ? "Dense" : a < -0.4 ? "Sparse" : "Moderate";
    return { vibe, mode, texture };
};

export const getHarmonicSuggestions = (contextChord: Chord | null): number[] => {
    if (!contextChord) return [0, 4, 5]; 
    const i = contextChord.interval;
    const map: any = { 0: [3,4,5,1], 1:[4,6], 2:[5,3], 3:[4,0,1], 4:[0,5], 5:[3,1], 6:[0,5] };
    return map[i] || [0,4,5];
};