
import { Note, ScaleType, Chord, ChordComplexity } from './types';
import { CHROMATIC_SHARPS, CHROMATIC_FLATS, SCALE_DEFS } from './constants';

export const getScaleNotes = (root: Note, scaleType: ScaleType): Note[] => {
    if (!SCALE_DEFS[scaleType]) return [];
    const semitones = SCALE_DEFS[scaleType].intervals;
    const chromatic = CHROMATIC_SHARPS.includes(root) || ['G', 'D', 'A', 'E', 'B'].includes(root) ? CHROMATIC_SHARPS : CHROMATIC_FLATS;
    const rootIndex = chromatic.indexOf(root);
    return semitones.map(interval => chromatic[(rootIndex + interval) % 12]);
};

// Helper to determine chord quality based on scale degree and mode
export const getChordQuality = (scale: ScaleType, degree: number): Chord['quality'] => {
    // Diatonic qualities for Major scale (Ionian)
    const majorQualities: Chord['quality'][] = ['Major', 'Minor', 'Minor', 'Major', 'Dominant', 'Minor', 'Half-Dim'];
    
    // Offset for other modes relative to Major
    const modeOffset: Record<ScaleType, number> = {
        [ScaleType.Major]: 0,
        [ScaleType.Minor]: 5,
        [ScaleType.Dorian]: 1,
        [ScaleType.Phrygian]: 2,
        [ScaleType.Lydian]: 3,
        [ScaleType.Mixolydian]: 4,
        [ScaleType.Locrian]: 6
    };

    const offset = modeOffset[scale] || 0;
    return majorQualities[(degree + offset) % 7];
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
             // Add Major 9 (14 semitones)
             if (!intervals.includes(14)) intervals.push(14); 

             // Handle flat 9 situations (phrygian/locrian context) - simplified here to standard 9 for generic build
             if (quality === 'Major') suffix = 'maj9';
             else if (quality === 'Minor') suffix = 'm9';
             else if (quality === 'Dominant') suffix = '9';
        }

        // 11ths
        if (extension.includes('11')) {
            if (!intervals.includes(14)) intervals.push(14); // ensure 9th exists
            
            // Check for #11 (Lydian) context vs natural 11
            // For generic buildChord, we default to P11 (17 semitones) unless specified #11
            const isSharp11 = extension.includes('#11');
            intervals.push(isSharp11 ? 18 : 17);

            if (quality === 'Minor') suffix = 'm11';
            else if (quality === 'Major') suffix = isSharp11 ? 'maj#11' : 'maj11';
            else if (quality === 'Dominant') suffix = isSharp11 ? '7#11' : '11';
        }
    }

    const notes = intervals.map(i => chromatic[(rootIdx + i) % 12]);
    
    let symbol = `${root}${suffix}`;
    
    // Fallback symbol generation if standard suffixes didn't catch specific jazz cases
    if (extension && !suffix) {
        symbol += extension;
    }

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
    
    // Explicit typing for definitions to ensure compatibility with ChordComplexity
    type ExtensionMap = Record<Exclude<ChordComplexity, 'triad'>, string>;
    
    // Definitions of extensions based on MAJOR scale degrees (Ionian)
    // We map these to the current mode using offsets.
    const ionianDefs: { q: Chord['quality']; ext: ExtensionMap }[] = [
        { q: 'Major',    ext: { '7th': 'maj7', '9th': 'maj9', '11th': 'maj11' } },    // I
        { q: 'Minor',    ext: { '7th': 'm7',   '9th': 'm9',   '11th': 'm11' } },      // ii
        { q: 'Minor',    ext: { '7th': 'm7',   '9th': 'm7b9', '11th': 'm11' } },      // iii (Phrygian b9)
        { q: 'Major',    ext: { '7th': 'maj7', '9th': 'maj9', '11th': 'maj#11' } },   // IV (Lydian #11)
        { q: 'Dominant', ext: { '7th': '7',    '9th': '9',    '11th': '11' } },       // V
        { q: 'Minor',    ext: { '7th': 'm7',   '9th': 'm9',   '11th': 'm11' } },      // vi
        { q: 'Half-Dim', ext: { '7th': 'm7b5', '9th': 'm7b5b9', '11th': 'm11b5' } }   // vii (Locrian)
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

        // --- Calculate Note Stacking ---
        // We must select notes relative to the CURRENT degree in the scale
        const noteIndices = [0, 2, 4]; // Root, 3rd, 5th
        if (complexity !== 'triad') noteIndices.push(6); // 7th
        if (complexity === '9th' || complexity === '11th') noteIndices.push(8); // 9th (index + 1 octave up)
        if (complexity === '11th') noteIndices.push(10); // 11th (index + 3 octave up)

        // Map indices to actual notes in the scale array
        const chordNotes = noteIndices.map(i => scaleNotes[(index + i) % 7]);

        let suffix = '';
        if (complexity === 'triad') {
            if (quality === 'Major') suffix = '';
            else if (quality === 'Minor') suffix = 'm';
            else if (quality === 'Diminished') suffix = 'dim';
            else if (quality === 'Augmented') suffix = 'aug';
            else if (quality === 'Half-Dim') suffix = 'dim'; // Show as dim in triad mode
        } else {
            // For complex chords, the definition string handles the suffix
            // e.g. 'maj#11' or 'm7b5'
            suffix = extString;
        }

        // --- Roman Numeral Generation ---
        let num = romanNumerals[index];
        
        // Capitalization
        if (quality === 'Major' || quality === 'Dominant') num = num.toUpperCase();
        if (quality === 'Augmented') num = num.toUpperCase() + '+';
        
        // Symbols
        if (quality === 'Diminished') num = num.toLowerCase() + '°';
        if (quality === 'Half-Dim') num = num.toLowerCase() + 'ø';

        // Extensions in Roman Numeral
        if (complexity !== 'triad') {
            // Clean up base symbols to append specific extension
            num = num.replace('°', '').replace('ø', '');
            
            if (quality === 'Major') num += 'maj7';
            else if (quality === 'Dominant') num += '7';
            else if (quality === 'Minor') num = num.toLowerCase() + '7';
            else if (quality === 'Half-Dim') num = num.toLowerCase() + 'ø7';
            else if (quality === 'Diminished') num = num.toLowerCase() + '°7';
            
            // Add higher extensions
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
        ? CHROMATIC_FLATS 
        : CHROMATIC_SHARPS;
        
    const rootIdx = chromatic.indexOf(root);

    // Helper to safely add chords
    const addTensionChord = (intervalOffset: number, quality: Chord['quality'], extension: string, roman: string, type: string) => {
        const noteIdx = (rootIdx + intervalOffset) % 12;
        const note = chromatic[noteIdx];
        const chord = buildChord(note, quality, extension);
        chord.romanNumeral = roman;
        chord.tensionType = type; // Critical for UI coloring
        
        if (quality === 'Augmented' && extension === '7') chord.symbol = `${note}+7`;
        if (type === 'sub') chord.symbol = `${note}7`;
        
        chords.push(chord);
    };

    // 1. MILD TENSION (Modal Interchange) - Threshold 0.25
    if (tension > 0.25) {
        addTensionChord(8, 'Major', 'maj7', 'bVI', 'borrowed'); // Lydian/Aeolian
        addTensionChord(10, 'Dominant', '7', 'bVII7', 'borrowed'); // Mixolydian/Backdoor
    }
    
    // 2. MEDIUM TENSION (Substitutions) - Threshold 0.50
    if (tension > 0.50) {
        addTensionChord(1, 'Dominant', '7', 'bII7', 'sub'); // Tritone Sub for V7
        addTensionChord(6, 'Dominant', '7', '#IV7', 'sub'); // Lydian Dominant
    }

    // 3. HIGH TENSION (Diminished) - Threshold 0.70
    if (tension > 0.70) {
        addTensionChord(11, 'Diminished', 'dim7', 'vii°7', 'dim');
        addTensionChord(1, 'Diminished', 'dim7', 'bii°7', 'dim'); // Passing dim
    }

    // 4. EXTREME TENSION (Altered) - Threshold 0.85
    if (tension > 0.85) {
        addTensionChord(7, 'Augmented', '7', 'V+7', 'alt');
        addTensionChord(3, 'Dominant', '7', 'bIII7', 'alt'); // Chromatic Mediant
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
    
    // Adjust for complexity
    if (chord.complexity === '7th') { v *= 1.1; a *= 1.1; }
    if (chord.complexity === '9th') { v += 0.1; a -= 0.1; } 
    
    if (chord.interval === 0) { 
        a -= 0.3; 
        if (chord.quality === 'Major') v += 0.3; 
    }
    if (chord.interval === 4) { a += 0.4; v += 0.1; }
    if (chord.interval === 6) { a += 0.3; v -= 0.2; }

    return { valence: Math.max(-1, Math.min(1, v)), arousal: Math.max(-1, Math.min(1, a)) };
};

export const getCompassLabel = (v: number, a: number): string => {
    if (a > 0.3) {
        if (v > 0.3) return "Excited";
        if (v < -0.3) return "Tense";
        return "Energetic";
    }
    if (a < -0.3) {
        if (v > 0.3) return "Serene";
        if (v < -0.3) return "Melancholic";
        return "Calm";
    }
    if (v > 0.3) return "Happy";
    if (v < -0.3) return "Sad";
    return "Neutral";
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
