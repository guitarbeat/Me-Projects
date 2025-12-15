import React, { useMemo } from 'react';
import { Chord } from '../types';
import { cn } from './ui';

// --- DATA ---
// A simplified lookup for common open chords and movable shapes
// Format: [E, A, D, G, B, e] -1 = mute, 0 = open, >0 = fret
const CHORD_SHAPES: Record<string, number[]> = {
    // Open Majors
    'C_Major': [-1, 3, 2, 0, 1, 0],
    'A_Major': [-1, 0, 2, 2, 2, 0],
    'G_Major': [3, 2, 0, 0, 0, 3],
    'E_Major': [0, 2, 2, 1, 0, 0],
    'D_Major': [-1, -1, 0, 2, 3, 2],
    // Open Minors
    'A_Minor': [-1, 0, 2, 2, 1, 0],
    'E_Minor': [0, 2, 2, 0, 0, 0],
    'D_Minor': [-1, -1, 0, 2, 3, 1],
    // Open 7ths
    'E_Dominant': [0, 2, 0, 1, 0, 0],
    'A_Dominant': [-1, 0, 2, 0, 2, 0],
    'D_Dominant': [-1, -1, 0, 2, 1, 2],
    'C_Dominant': [-1, 3, 2, 3, 1, 0],
    'G_Dominant': [3, 2, 0, 0, 0, 1],
    'B_Dominant': [-1, 2, 1, 2, 0, 2],
};

// Generic Barre Shapes (Root Offset, Pattern)
const BARRE_SHAPES = {
    'E_Shape_Major': { baseString: 0, pattern: [0, 2, 2, 1, 0, 0] },
    'E_Shape_Minor': { baseString: 0, pattern: [0, 2, 2, 0, 0, 0] },
    'E_Shape_7':     { baseString: 0, pattern: [0, 2, 0, 1, 0, 0] }, // 7th
    'A_Shape_Major': { baseString: 1, pattern: [-1, 0, 2, 2, 2, 0] },
    'A_Shape_Minor': { baseString: 1, pattern: [-1, 0, 2, 2, 1, 0] },
};

const NOTE_OFFSETS: Record<string, number> = {
    'C': 8, 'C#': 9, 'Db': 9, 'D': 10, 'D#': 11, 'Eb': 11, 'E': 0, 'F': 1, 
    'F#': 2, 'Gb': 2, 'G': 3, 'G#': 4, 'Ab': 4, 'A': 5, 'A#': 6, 'Bb': 6, 'B': 7
};

function getFretData(chord: Chord): { frets: number[], startFret: number } {
    const key = `${chord.root}_${chord.quality}`;
    
    // 1. Try Specific Open Chord Match
    if (CHORD_SHAPES[key]) {
        return { frets: CHORD_SHAPES[key], startFret: 1 };
    }

    // 2. Try Generic Barre Shape logic
    let rootOffset = NOTE_OFFSETS[chord.root] || 0;
    
    // Prefer E-shape barre for roots F, F#, G, G#, A (low), and A shape for Bb, B, C, C#, D, D#, E
    // Actually, let's keep it simple: E shape for low strings, A shape for mid.
    
    let baseOffset = 0; // E string
    let shapePattern = BARRE_SHAPES.E_Shape_Major;

    const useAShape = ['A#', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'D#', 'Eb'].includes(chord.root);

    if (useAShape) {
        // Calculate offset from open A (note index 5)
        // A=0, A#=1 ...
        const mapA: Record<string, number> = {'A':0, 'A#':1, 'Bb':1, 'B':2, 'C':3, 'C#':4, 'Db':4, 'D':5, 'D#':6, 'Eb':6, 'E':7};
        baseOffset = mapA[chord.root];
        
        if (chord.quality === 'Major' || chord.quality === 'Dominant') shapePattern = BARRE_SHAPES.A_Shape_Major;
        else if (chord.quality === 'Minor') shapePattern = BARRE_SHAPES.A_Shape_Minor;
        // Fallback for others to Major shape for visualization if not mapped
        else shapePattern = BARRE_SHAPES.A_Shape_Major;
        
    } else {
        // Use E Shape
        baseOffset = rootOffset; // E=0, F=1...
        
        if (chord.quality === 'Major' || chord.quality === 'Dominant') shapePattern = BARRE_SHAPES.E_Shape_Major;
        else if (chord.quality === 'Minor') shapePattern = BARRE_SHAPES.E_Shape_Minor;
        else shapePattern = BARRE_SHAPES.E_Shape_Major;
    }

    // Apply complexity overrides
    if (chord.quality === 'Dominant' || chord.extension?.includes('7')) {
         if (!useAShape) shapePattern = BARRE_SHAPES.E_Shape_7;
    }

    // Shift pattern
    const shifted = shapePattern.pattern.map(f => (f === -1 ? -1 : (f === 0 && baseOffset === 0) ? 0 : f + baseOffset));
    
    // If we are high up the neck, set start fret
    const minFret = Math.min(...shifted.filter(f => f > 0));
    const startFret = minFret > 2 ? minFret : 1;
    
    // Normalize visualization to relative if using startFret > 1
    // But we need to keep relative positions.
    
    return { frets: shifted, startFret };
}

export const GuitarChordDiagram = ({ chord, className }: { chord: Chord, className?: string }) => {
    const { frets, startFret } = useMemo(() => getFretData(chord), [chord]);

    // Dimensions
    const width = 80;
    const height = 100;
    const paddingX = 12;
    const paddingY = 20;
    const stringGap = (width - paddingX * 2) / 5;
    const fretGap = (height - paddingY * 2) / 4; // Show 4 frets usually

    // Draw Window relative to startFret
    const visibleFrets = 5; 

    return (
        <div className={cn("flex flex-col items-center select-none bg-white rounded-lg border border-stone-200 p-2 shadow-sm", className)}>
            <div className="text-[10px] font-bold text-stone-900 mb-1">{chord.symbol}</div>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Nut (only if startFret is 1) */}
                {startFret === 1 && <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="black" strokeWidth={3} />}
                
                {/* Frets */}
                {Array.from({ length: visibleFrets }).map((_, i) => {
                    const y = paddingY + i * fretGap;
                    return <line key={`fret-${i}`} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#d6d3d1" strokeWidth={1} />;
                })}

                {/* Strings */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const x = paddingX + i * stringGap;
                    return <line key={`str-${i}`} x1={x} y1={paddingY} x2={x} y2={height - paddingY + 10} stroke="#78716c" strokeWidth={i > 2 ? 0.5 : 1} />;
                })}

                {/* Dots / Markers */}
                {frets.map((fret, stringIdx) => {
                    if (fret === -1) {
                        // Mute (X)
                        const x = paddingX + stringIdx * stringGap;
                        return <text key={stringIdx} x={x} y={paddingY - 5} textAnchor="middle" fontSize={8} fill="#ef4444" fontWeight="bold">X</text>;
                    }
                    
                    const relFret = fret - startFret + 1;
                    
                    if (fret === 0 && startFret === 1) {
                        // Open String (O)
                        const x = paddingX + stringIdx * stringGap;
                        return <circle key={stringIdx} cx={x} cy={paddingY - 8} r={2} stroke="#78716c" fill="none" strokeWidth={1}/>;
                    }
                    
                    if (relFret > 0 && relFret <= visibleFrets) {
                        // Finger position
                        const x = paddingX + stringIdx * stringGap;
                        const y = paddingY + (relFret - 1) * fretGap + (fretGap / 2);
                        return <circle key={stringIdx} cx={x} cy={y} r={4} fill="#dc2626" />;
                    }
                    
                    return null;
                })}

                {/* Fret Label */}
                {startFret > 1 && (
                    <text x={4} y={paddingY + fretGap / 2 + 3} fontSize={8} fontWeight="bold" fill="var(--text-dim)">
                        {startFret}fr
                    </text>
                )}
            </svg>
        </div>
    );
};