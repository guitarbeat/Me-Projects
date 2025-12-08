
import { Note, ScaleType, Chord, ChordComplexity } from './types';
import { Scale, Chord as TonalChord, Note as TonalNote } from '@tonaljs/tonal';

// Helper to map UI scale names to Tonal.js scale names
const mapScaleType = (s: ScaleType): string => {
    const map: Record<string, string> = {
        'Major': 'major',
        'Natural Minor': 'minor',
        'Dorian': 'dorian',
        'Phrygian': 'phrygian',
        'Lydian': 'lydian',
        'Mixolydian': 'mixolydian',
        'Locrian': 'locrian'
    };
    return map[s] || 'major';
};

export const getScaleNotes = (root: Note, scaleType: ScaleType): Note[] => {
    return Scale.get(`${root} ${mapScaleType(scaleType)}`).notes;
};

export const buildChord = (root: Note, quality: Chord['quality'], extension: string = '', duration: number = 4): Chord => {
    // Construct a symbol that Tonal can parse (e.g., "C" + "maj7" -> "Cmaj7")
    // If we have a specific extension (like "maj7"), use it. 
    // Otherwise map the Quality to a basic suffix.
    let suffix = extension;
    
    if (!suffix) {
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
    }

    // Tonal.js chord generation
    const symbol = `${root}${suffix}`;
    const c = TonalChord.get(symbol);
    
    // Fallback for complex extensions Tonal might parse strictly
    const safeNotes = c.empty ? TonalChord.get(`${root}${quality === 'Minor' ? 'm' : ''}`).notes : c.notes;

    return {
        root,
        quality,
        extension,
        suffix,
        symbol: c.symbol || symbol,
        romanNumeral: '', // Calculated elsewhere or not needed for standalone
        notes: safeNotes,
        interval: -1,
        duration,
        theoryInfo: c.name
    };
};

export const generateChordsForScale = (root: Note, scaleType: ScaleType, complexity: ChordComplexity = 'triad'): Chord[] => {
    const scale = getScaleNotes(root, scaleType);
    
    // Roman Numeral Analysis for the scale
    // Tonal doesn't generate "ii7" etc automatically for modes perfectly in all versions, 
    // so we build it by stacking thirds from the scale notes.
    
    const romanNumerals = ['i','ii','iii','iv','v','vi','vii'];
    
    return scale.map((note, i) => {
        // Stack thirds: Root, 3rd, 5th...
        // Indices in scale array: i, i+2, i+4 (mod 7)
        const indices = [0, 2, 4]; 
        if (complexity !== 'triad') indices.push(6); // 7th
        if (complexity === '9th' || complexity === '11th') indices.push(8); // 9th
        if (complexity === '11th') indices.push(10); // 11th

        const chordNotes = indices.map(offset => scale[(i + offset) % 7]);
        
        // Use Tonal to detect what chord this is
        const detected = TonalChord.detect(chordNotes)[0] || '';
        const tonalChord = TonalChord.get(detected);
        
        // Determine Quality from Tonal's analysis or fallback to manual
        let quality: Chord['quality'] = 'Major';
        const type = tonalChord.quality; // 'Major', 'Minor', 'Augmented', 'Diminished'
        
        if (type === 'Major') quality = 'Major';
        else if (type === 'Minor') quality = 'Minor';
        else if (type === 'Diminished') quality = 'Diminished';
        else if (type === 'Augmented') quality = 'Augmented';
        
        // Specific checks for Jazz types
        if (detected.includes('m7b5')) quality = 'Half-Dim';
        if (detected.includes('7') && !detected.includes('maj') && !detected.includes('m7')) quality = 'Dominant';

        // Roman Numeral Construction
        let num = romanNumerals[i];
        if (quality === 'Major' || quality === 'Dominant' || quality === 'Augmented') num = num.toUpperCase();
        
        // Add symbols
        if (quality === 'Diminished') num += '°';
        if (quality === 'Half-Dim') num += 'ø';
        if (quality === 'Augmented') num += '+';
        
        // Add Extensions to Roman Numeral
        if (complexity !== 'triad') {
             if (detected.includes('maj7')) num = num.replace(/[°ø+]/,'') + 'maj7';
             else if (detected.includes('m7b5')) num = num.replace(/[°ø+]/,'') + 'ø7';
             else if (detected.includes('dim7')) num = num.replace(/[°ø+]/,'') + '°7';
             else if (detected.includes('m7')) num = num.replace(/[°ø+]/,'') + '7';
             else if (detected.includes('7') && quality === 'Dominant') num += '7';
             
             if (complexity === '9th') num = num.replace('7', '9');
             if (complexity === '11th') num = num.replace('7', '11').replace('9', '11');
        }

        return {
            root: note,
            quality,
            extension: complexity === 'triad' ? '' : detected.replace(note, ''),
            suffix: detected.replace(note, ''),
            symbol: detected || `${note}?`,
            romanNumeral: num,
            notes: chordNotes,
            interval: i,
            duration: 4,
            complexity
        };
    });
};

export const generateSecondaryDominants = (root: Note, scaleType: ScaleType): Chord[] => {
    const targets = generateChordsForScale(root, scaleType, 'triad');
    const roman = ['I','II','III','IV','V','VI','VII'];

    return targets.map((target, i) => {
        if (i === 0) return null; // V/I is just V
        if (target.quality === 'Diminished' || target.quality === 'Half-Dim') return null;

        // The Dominant is a perfect 5th above the target root
        const domRoot = TonalNote.transpose(target.root, "5P");
        
        // Build V7
        const c = buildChord(domRoot, 'Dominant', '7');
        
        return {
            ...c,
            romanNumeral: `V7/${roman[i]}`,
            theoryInfo: `Secondary Dominant to ${target.symbol}`
        };
    }).filter(Boolean) as Chord[];
};

export const getTensionChords = (root: Note, scaleType: ScaleType, tension: number): Chord[] => {
    const chords: Chord[] = [];
    
    // Helper to generate a chord relative to key center
    const add = (interval: string, quality: Chord['quality'], ext: string, roman: string, type: string) => {
        const note = TonalNote.transpose(root, interval);
        // Tonal transpose might return double flats/sharps, simplify if needed:
        const simpleNote = TonalNote.simplify(note);
        
        const c = buildChord(simpleNote, quality, ext);
        c.romanNumeral = roman;
        c.tensionType = type;
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
        add('2m', 'Diminished', 'dim7', 'bii°7', 'dim');
    }
    if (tension > 0.85) {
        add('5P', 'Augmented', '7', 'V+7', 'alt');
        add('3m', 'Dominant', '7', 'bIII7', 'alt');
    }

    return chords;
};

export const estimateChordSentiment = (chord: Chord, key: Note, scale: ScaleType) => {
    let v = 0, a = 0;
    if (chord.quality === 'Major') { v += 0.5; a += 0.1; }
    else if (chord.quality === 'Minor') { v -= 0.4; a -= 0.1; }
    else if (chord.quality === 'Diminished') { v -= 0.6; a += 0.3; }
    else if (chord.quality === 'Dominant') { v += 0.2; a += 0.4; }
    if (chord.complexity && chord.complexity !== 'triad') { v *= 1.1; a *= 1.1; }
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
    const map: any = { 0: [3,4,5,1], 1:[4,6], 2:[5,3], 3:[4,0,1], 4:[0,5], 5:[3,1], 6:[0,5] };
    return map[i] || [0,4,5];
};
