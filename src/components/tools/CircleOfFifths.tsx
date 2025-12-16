import React, { useMemo } from 'react';

import { useStore } from '../../lib';
import { cn } from '../ui';

// --- DATA ---
// Position 0 = Top (C), going clockwise
export const ORDER_OF_FIFTHS = [
    { major: 'C', minor: 'Am', sharpCount: 0 },
    { major: 'G', minor: 'Em', sharpCount: 1 },
    { major: 'D', minor: 'Bm', sharpCount: 2 },
    { major: 'A', minor: 'F#m', sharpCount: 3 },
    { major: 'E', minor: 'C#m', sharpCount: 4 },
    { major: 'B', minor: 'G#m', sharpCount: 5 },
    { major: 'F#', minor: 'D#m', sharpCount: 6 }, // / Gb
    { major: 'Db', minor: 'Bbm', sharpCount: -5 }, // / C#
    { major: 'Ab', minor: 'Fm', sharpCount: -4 },
    { major: 'Eb', minor: 'Cm', sharpCount: -3 },
    { major: 'Bb', minor: 'Gm', sharpCount: -2 },
    { major: 'F', minor: 'Dm', sharpCount: -1 },
];

interface CircleOfFifthsProps {
    currentKey?: string; // e.g. "C" or "Am"
    onChordClick?: (symbol: string) => void;
    className?: string;
}

export const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ 
    currentKey = 'C', 
    onChordClick, 
    className 
}) => {
    


    // Calculate active indices (Key +/- 1 neighbor)
    // Actually, simple Diatonic check:
    // C Major Diatonic: F(11), C(0), G(1) Majors -> Dm(11), Am(0), Em(1) Minors
    // So we just highlight the index match and its immediate neighbors?
    
    // Let's find the 'center' index for the current key
    const centerIndex = useMemo(() => {
        const idx = ORDER_OF_FIFTHS.findIndex(k => 
            k.major === currentKey || k.minor === currentKey ||
            (k.major + 'm') === currentKey // e.g. currentKey is Cm -> not in circle usually as inner ring is relative minor (Eb Major)
            // But wait, if song is in Cm, the relative major is Eb.
            // Circle inner ring is Relative Minors.
            // If user selects "C Minor" scale, that is Eb Major.
            // If user selects "C Major" scale, that is C Major.
        );
        // Fallback for flat/sharp equivalents if strict match fails could be added here
        return idx >= 0 ? idx : 0;
    }, [currentKey]);

    // For C Major (Index 0): Neighbors are 11 (F) and 1 (G).
    // So indices: [11, 0, 1] modulo 12.
    const activeIndices = useMemo(() => {
        const prev = (centerIndex - 1 + 12) % 12;
        const next = (centerIndex + 1) % 12;
        return [prev, centerIndex, next];
    }, [centerIndex]);


    // SVG METRICS
    const SIZE = 200;
    const CENTER = SIZE / 2;
    const OUTER_R = SIZE / 2 - 2; // Padding
    const MID_R = SIZE * 0.32;
    const INNER_R = SIZE * 0.15; // Hole in middle

    // polar to cartesian
    const p2c = (angleDeg: number, radius: number) => {
        const rad = (angleDeg - 90) * (Math.PI / 180);
        return {
            x: CENTER + radius * Math.cos(rad),
            y: CENTER + radius * Math.sin(rad)
        };
    };

    // Create wedge path
    const createWedge = (startIdx: number, innerR: number, outerR: number) => {
        const ANGLE_PER_SEGMENT = 360 / 12;
        const startAngle = startIdx * ANGLE_PER_SEGMENT - (ANGLE_PER_SEGMENT / 2);
        const endAngle = startAngle + ANGLE_PER_SEGMENT;

        const p1 = p2c(startAngle, outerR);
        const p2 = p2c(endAngle, outerR);
        const p3 = p2c(endAngle, innerR);
        const p4 = p2c(startAngle, innerR);

        return `M ${p1.x} ${p1.y} A ${outerR} ${outerR} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 0 0 ${p4.x} ${p4.y} Z`;
    };

    return (
        <div className={cn("relative aspect-square max-h-[300px] w-full flex items-center justify-center p-2", className)}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full drop-shadow-xl overflow-visible">
                {/* Background Ring */}
                <circle cx={CENTER} cy={CENTER} r={INNER_R} fill="#1a1a1a" />

                {ORDER_OF_FIFTHS.map((item, i) => {
                    const isActive = activeIndices.includes(i);
                    const isCenter = i === centerIndex;
                    
                    // Major Wedge (Outer)
                    const majPath = createWedge(i, MID_R, OUTER_R);
                    // Minor Wedge (Inner)
                    const minPath = createWedge(i, INNER_R, MID_R);

                    const textPosMaj = p2c(i * 30, (MID_R + OUTER_R) / 2);
                    const textPosMin = p2c(i * 30, (INNER_R + MID_R) / 2);

                    return (
                        <g key={item.major} className="group transition-opacity duration-500">
                             {/* Major Segment */}
                            <path 
                                d={majPath}
                                className={cn(
                                    "stroke-[var(--bg-main)] stroke-[1px] transition-all duration-300 cursor-pointer hover:opacity-80",
                                    isActive ? "fill-[var(--accent)] text-[var(--bg-main)]" : "fill-[var(--bg-element)] text-[var(--text-dim)]",
                                    isCenter ? "opacity-100" : (isActive ? "opacity-80" : "opacity-30")
                                )}
                                onClick={() => onChordClick?.(item.major)}
                            />
                            <text 
                                x={textPosMaj.x} y={textPosMaj.y} 
                                textAnchor="middle" dominantBaseline="middle"
                                className={cn(
                                    "text-[8px] font-bold pointer-events-none select-none",
                                    isActive ? "fill-black" : "fill-[var(--text-muted)]"
                                )}
                            >
                                {item.major}
                            </text>

                            {/* Minor Segment */}
                            <path 
                                d={minPath}
                                className={cn(
                                    "stroke-[var(--bg-main)] stroke-[1px] transition-all duration-300 cursor-pointer hover:opacity-80",
                                    isActive ? "fill-[var(--accent)] text-[var(--bg-main)]" : "fill-[var(--bg-element)] text-[var(--text-dim)]",
                                     isCenter ? "opacity-90" : (isActive ? "opacity-70" : "opacity-20")
                                )}
                                onClick={() => onChordClick?.(item.minor)}
                            />
                            <text 
                                x={textPosMin.x} y={textPosMin.y} 
                                textAnchor="middle" dominantBaseline="middle"
                                className={cn(
                                    "text-[6px] font-bold pointer-events-none select-none",
                                    isActive ? "fill-black" : "fill-[var(--text-muted)]"
                                )}
                            >
                                {item.minor}
                            </text>
                            
                            {/* Hover Highlight (Invisible Hit Area or just rely on path hover) */}
                        </g>
                    );
                })}

                {/* Center Label? Key */}
                <text x={CENTER} y={CENTER} textAnchor="middle" dominantBaseline="middle" className="fill-[var(--text-main)] text-[10px] font-bold opacity-80">
                    {currentKey}
                </text>
            </svg>
        </div>
    );
};

export const MiniCircleOfFifths = () => {
    const { key, scale } = useStore();
    
    const keyInfo = useMemo(() => {
        return ORDER_OF_FIFTHS.find(k => k.major === key || k.minor === key) || { sharpCount: 0 };
    }, [key]);
    
    const sig = keyInfo.sharpCount === 0 ? 'Natural' : 
                keyInfo.sharpCount > 0 ? `${keyInfo.sharpCount}♯` : 
                `${Math.abs(keyInfo.sharpCount)}♭`;

    return (
        <div className="flex items-center gap-3 px-4 w-full h-full bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] flex items-center justify-center shrink-0 group-hover:border-[var(--accent)] relative overflow-hidden">
                <svg viewBox="0 0 32 32" className="w-full h-full opacity-50 group-hover:opacity-100 transition-opacity">
                    {ORDER_OF_FIFTHS.map((_, i) => (
                        <path key={i} 
                            d={`M 16 16 L ${16 + 16 * Math.cos(i * Math.PI / 6)} ${16 + 16 * Math.sin(i * Math.PI / 6)} A 16 16 0 0 1 ${16 + 16 * Math.cos((i + 1) * Math.PI / 6)} ${16 + 16 * Math.sin((i + 1) * Math.PI / 6)} Z`} 
                            fill={i % 2 === 0 ? 'var(--text-muted)' : 'var(--bg-element)'} 
                            stroke="var(--bg-panel)" 
                            strokeWidth="1"
                        />
                    ))}
                    <circle cx="16" cy="16" r="6" fill="var(--bg-panel)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-[var(--text-main)]">{key.replace(/#/, '♯').replace(/b/, '♭')}</span>
                </div>
            </div>
            <div className="flex flex-col min-w-0">
                 <span className="font-bold text-xs text-[var(--text-main)] truncate">Circle of Fifths</span>
                 <span className="text-[10px] text-[var(--text-muted)] truncate">{scale} • {sig}</span>
            </div>
        </div>
    );
};
