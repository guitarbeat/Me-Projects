
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Plus, Minus, Maximize2 } from 'lucide-react';
import { buildChord, generateSecondaryDominants, getHarmonicSuggestions, getScaleNotes, estimateChordSentiment, ChordComplexity, Note, ScaleType, Chord, useStore, useDerivedData } from './lib';
import { cn } from './ui';

// --- HELPERS ---
const GRID_SIZE = 6, SPACING = 80, X_VEC = { x: SPACING, y: 0 }, Y_VEC = { x: SPACING * 0.5, y: SPACING * 0.866 };

const getFunctionName = (semitones: number, isDiatonic: boolean, scaleType: ScaleType, roman: string) => {
    // 1. Handle Special Chromatic Functions
    if (roman === 'N') return 'Neapolitan';
    if (roman === 'Ger+6' || roman === 'Fr+6' || roman === 'It+6') return 'Augmented 6th';
    if (roman.includes('V/')) return 'Secondary Dominant';

    // 2. Handle Diatonic & Common Intervals
    // We map chromatic interval (0-11) to functional name
    switch (semitones) {
        case 0: return 'Tonic';
        case 1: return isDiatonic ? 'Supertonic' : 'Neapolitan'; // Phrygian b2 vs Chromatic b2
        case 2: return 'Supertonic';
        case 3: return 'Mediant'; // Minor 3rd
        case 4: return 'Mediant'; // Major 3rd
        case 5: return 'Subdominant';
        case 6: return isDiatonic ? 'Subdominant' : 'Tritone'; // Lydian #4 vs Tritone
        case 7: return 'Dominant';
        case 8: return 'Submediant'; // Minor 6th
        case 9: return 'Submediant'; // Major 6th
        case 10: return 'Subtonic'; // Minor 7th (Mixolydian/Aeolian)
        case 11: return 'Leading Tone'; // Major 7th
        default: return 'Chromatic';
    }
};

// --- LOGIC ---
const getSentimentMatch = (chordInfo: { quality: string }, currentKey: Note, scaleType: ScaleType, targetMood: { v: number, a: number } | null) => {
    if (!targetMood) return 1;
    const sentiment = estimateChordSentiment(chordInfo, currentKey, scaleType);
    const dist = Math.hypot(sentiment.valence - targetMood.v, sentiment.arousal - targetMood.a);
    return Math.max(0.1, 1 - (dist * 0.7)); 
};

// Calculate where a chord "wants" to go (Harmonic Gravity) based on Traditional Functions
const getResolutionPaths = (source: { functionLabel?: string; id: string } | null, allTriads: Array<{ id: string; functionLabel?: string }>, _currentKey: Note) => {
    const paths: { targetId: string, strength: number, type: 'dominant' | 'subdominant' | 'chromatic' }[] = [];
    if (!source) return paths;

    const func = source.functionLabel;
    
    // Helper to find specific functional targets
    // We relax the type check for Dominant to allow Minor v resolution in modal contexts
    const findFunction = (f: string, preferMajor: boolean = true) => 
        allTriads.find(t => t.functionLabel === f && (!preferMajor || t.type === 'Major' || t.type === 'Dominant'));

    const tonic = allTriads.find(t => t.chordInfo.interval === 0);

    // 1. Dominant Function (V, vii°, Aug6) -> Resolves to Tonic (I) or Dominant (V)
    if (func === 'Dominant' || func === 'Leading Tone') {
        if (tonic) paths.push({ targetId: tonic.id, strength: 1.0, type: 'dominant' });
        
        // Deceptive (V -> vi)
        const submediant = findFunction('Submediant', false); // Prefer minor vi in major
        if (submediant) paths.push({ targetId: submediant.id, strength: 0.5, type: 'chromatic' });
    }

    // 2. Predominant / Subdominant (IV, ii, N, Aug6) -> Resolves to Dominant (V)
    if (func === 'Subdominant' || func === 'Supertonic' || func === 'Neapolitan' || func === 'Augmented 6th') {
        const dominant = findFunction('Dominant', true);
        if (dominant) {
             const strength = (func === 'Neapolitan' || func === 'Augmented 6th') ? 1.0 : 0.8;
             paths.push({ targetId: dominant.id, strength, type: 'subdominant' });
        }
        
        // Plagal (IV -> I)
        if (func === 'Subdominant' && tonic) {
            paths.push({ targetId: tonic.id, strength: 0.4, type: 'subdominant' });
        }
    }

    // 3. Subtonic (bVII) - Modal Gravity
    if (func === 'Subtonic') {
        // Modal Cadence (bVII -> I)
        if (tonic) paths.push({ targetId: tonic.id, strength: 0.6, type: 'subdominant' });
        // bVII -> III (Relative Major)
        const mediant = findFunction('Mediant', true);
        if (mediant) paths.push({ targetId: mediant.id, strength: 0.7, type: 'chromatic' });
    }

    // 4. Secondary Dominants
    if (source.secondary && source.chordInfo.romanNumeral.includes('/')) {
        const targetRoman = source.chordInfo.romanNumeral.split('/')[1]?.replace('7','');
        if (targetRoman) {
            const target = allTriads.find(t => t.chordInfo.romanNumeral.toLowerCase().startsWith(targetRoman.toLowerCase()));
            if (target) paths.push({ targetId: target.id, strength: 0.9, type: 'dominant' });
        }
    }

    return paths;
};

const getFillColor = (t: { functionLabel?: string }, mood: { valence: number; arousal: number }, state: { isActive: boolean; isHover: boolean; isLinked: boolean; isTension: boolean }, matchScore: number) => {
    const { isActive, isLinked, isTension } = state;
    const { valence: v, arousal: a } = mood;

    if (isActive) return 'var(--accent)';
    
    let r, g, b;
    let opacity = 0.4 + (a * 0.2); 

    if (isTension) {
        // Special colors for special chromatic chords
        if (t.functionLabel === 'Neapolitan') { r=255; g=165; b=0; opacity=0.6; } // Orange
        else if (t.functionLabel === 'Augmented 6th') { r=255; g=0; b=255; opacity=0.6; } // Magenta
        else { r = 180; g = 60; b = 180; opacity = 0.5; }
    } else if (t.functionLabel === 'Tonic') {
        r = 255; g = 255; b = 255; opacity = 0.3; 
    } else if (t.isChromatic) { 
        r=80; g=80; b=80; opacity = 0.2;
    } else if (t.secondary) { 
        r=236; g=72+(v*30); b=153+(v*50); 
    } else if (t.type === 'Major') { 
        r=255; g=Math.min(255, 180 + (v*60)); b=Math.max(0, (v*100)); 
    } else { 
        r=Math.max(20, 70-(v*40)); g=Math.max(30, 80+(v*80)); b=220+(v*20); 
    }

    if (matchScore < 0.9 && !isTension && t.functionLabel !== 'Tonic') { 
        opacity *= 0.6;
        r = (r + 100) / 2; g = (g + 100) / 2; b = (b + 100) / 2;
    } 

    if (isLinked) return 'transparent';
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// --- VISUALIZATION COMPONENTS ---

interface FluxStreamProps {
    from: { x: number; y: number };
    to: { x: number; y: number };
    strength: number;
    type: 'dominant' | 'subdominant' | 'chromatic';
}
const FluxStream = React.memo(({ from, to, strength, type }: FluxStreamProps) => {
    const color = type === 'dominant' ? 'var(--accent)' : type === 'subdominant' ? '#3b82f6' : '#a855f7';
    const dashArray = type === 'dominant' ? '4 4' : '2 6';
    const duration = type === 'dominant' ? '0.5s' : '1.5s';
    
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - (20 * strength); 
    const path = `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;

    return (
        <g className="pointer-events-none">
            <path d={path} fill="none" stroke={color} strokeWidth={strength * 6} strokeOpacity={0.15} strokeLinecap="round" />
            <path d={path} fill="none" stroke={color} strokeWidth={strength * 2} strokeOpacity={0.6} strokeLinecap="round" strokeDasharray={dashArray}>
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur={duration} repeatCount="indefinite" />
            </path>
            <circle cx={to.x} cy={to.y} r={3} fill={color} opacity={0.5}>
                <animate attributeName="r" values="3;8;3" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="1s" repeatCount="indefinite" />
            </circle>
        </g>
    );
});
FluxStream.displayName = 'FluxStream';

interface TensionFieldProps {
    center: { x: number; y: number };
    intensity: number;
    type: string;
}
const TensionField = ({ center, intensity, type }: TensionFieldProps) => {
    return (
        <g transform={`translate(${center.x}, ${center.y})`} className="pointer-events-none">
            <circle r={35} fill="url(#tension-gradient)" opacity={intensity * 0.4} className="animate-pulse" />
            <circle r={30} fill="none" stroke={type === 'Neapolitan' ? '#f97316' : type === 'Augmented 6th' ? '#d946ef' : 'var(--accent)'} strokeWidth={1} strokeDasharray="2 4" opacity={0.3}>
                 <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={`${5 - intensity * 4}s`} repeatCount="indefinite" />
            </circle>
        </g>
    );
};
TensionField.displayName = 'TensionField';

const TonnetzNode = React.memo(({ x, y, note, isKey, isDiatonic, active, mood: _mood, onSelectKey }: { x: number; y: number; note: string; isKey: boolean; isDiatonic: boolean; active: boolean; mood: unknown; onSelectKey: () => void }) => {
    const [isHolding, setIsHolding] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startPos = useRef({ x: 0, y: 0 });

    const handleDown = useCallback((e: React.PointerEvent) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        startPos.current = { x: e.clientX, y: e.clientY };
        setIsHolding(true);
        timeoutRef.current = setTimeout(() => {
            onSelectKey(note);
            if (navigator.vibrate) navigator.vibrate([30]);
            setIsHolding(false);
        }, 700);
    }, [note, onSelectKey]);

    const cancelHold = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsHolding(false);
    }, []);

    const handleMove = useCallback((e: React.PointerEvent) => {
        if (isHolding) {
             const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
             if (dist > 10) cancelHold();
        }
    }, [isHolding, cancelHold]);

    return (
        <g 
            transform={`translate(${x}, ${y})`} 
            className="cursor-pointer group"
            onPointerDown={handleDown} 
            onPointerMove={handleMove} 
            onPointerUp={cancelHold} 
            onPointerLeave={cancelHold}
            onPointerCancel={cancelHold}
        >
            <circle 
                r={22} fill="none" stroke="var(--accent)" strokeWidth={3} strokeDasharray={138} strokeDashoffset={isHolding ? 0 : 138}
                className="pointer-events-none"
                style={{ opacity: isHolding ? 1 : 0, transition: isHolding ? 'stroke-dashoffset 700ms linear, opacity 100ms' : 'stroke-dashoffset 0ms, opacity 200ms', transform: 'rotate(-90deg)', transformOrigin: 'center' }} 
            />
            {isKey && (
                <>
                    <circle r={14} className="fill-transparent stroke-[var(--text-main)] stroke-[1] opacity-20 pointer-events-none animate-[spin_10s_linear_infinite]" strokeDasharray="2 4" />
                    <circle r={40} className="fill-[radial-gradient(circle,var(--text-main)_0%,transparent_100%)] opacity-10 pointer-events-none" />
                </>
            )}
            <circle r={isKey ? 8 : active ? 6 : 4} className={cn("transition-all duration-300 pointer-events-none", active ? "fill-[var(--accent)] stroke-[var(--bg-main)] stroke-2" : isKey ? "fill-[var(--text-main)] stroke-[var(--border)]" : isDiatonic ? "fill-[var(--text-muted)]" : "fill-[var(--bg-element)]")} />
            <text dy={isKey ? 20 : 16} textAnchor="middle" className={cn("text-[9px] font-bold pointer-events-none select-none transition-all", active ? "fill-[var(--text-main)] text-[12px]" : isKey ? "fill-[var(--text-main)] text-[10px]" : "fill-[var(--text-dim)] opacity-80")}>{note}</text>
        </g>
    );
});
TonnetzNode.displayName = 'TonnetzNode';

interface TonnetzTriangleProps {
    t: { id: string; functionLabel?: string };
    mood: { valence: number; arousal: number };
    state: { isActive: boolean; isHover: boolean; isLinked: boolean; isTension: boolean };
    matchScore: number;
    onClick: () => void;
    onEnter: () => void;
    onLeave: () => void;
    resolutionSource?: { targetId: string } | null;
}
const TonnetzTriangle = React.memo(({ t, mood, state, matchScore, onClick, onEnter, onLeave, resolutionSource }: TonnetzTriangleProps) => {
    const { isActive, isHover, isLinked, isTension } = state;
    const fill = getFillColor(t, mood, state, matchScore);
    const isTarget = resolutionSource && resolutionSource.targetId === t.id;
    const isTonic = t.functionLabel === 'Tonic';
    
    const baseScale = matchScore > 0.9 && !isActive && !isHover ? 0.9 : 1; 
    const finalScale = isActive ? 1.15 : isHover ? 1.05 : isTarget ? 1.1 : baseScale;
    
    let stroke = 'transparent';
    let strokeW = 0.5;
    let dash = 'none';

    if (isActive) { stroke = 'var(--bg-main)'; strokeW = 3; } 
    else if (isTarget) { stroke = 'var(--accent)'; strokeW = 2; dash = '2 2'; } 
    else if (isHover) { stroke = 'var(--text-main)'; strokeW = 1.5; } 
    else if (isTonic && !t.isChromatic) { stroke = 'var(--text-dim)'; strokeW = 0.5; } 
    else if (isTension) { stroke = t.functionLabel === 'Neapolitan' ? '#f97316' : '#d946ef'; strokeW = 2; dash = '1 1'; } 
    
    return (
        <g 
            className={cn("cursor-pointer interact-base transition-transform duration-300", isActive && "z-10")} 
            style={{ transformOrigin: `${t.center.x}px ${t.center.y}px`, transform: `scale(${finalScale})` }}
            onMouseEnter={() => onEnter(t)} onMouseLeave={onLeave} onClick={(e) => { e.stopPropagation(); onClick(t); }}
        >
            {isTarget && (
                <circle cx={t.center.x} cy={t.center.y} r={25} fill="none" stroke="var(--accent)" strokeWidth={1} opacity={0.4}>
                     <animate attributeName="r" values="25;35;25" dur="2s" repeatCount="indefinite" />
                     <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                </circle>
            )}

            {isTonic && !t.isChromatic && (
                 <circle cx={t.center.x} cy={t.center.y} r={20} fill="url(#tonic-glow)" opacity={0.3} className="pointer-events-none" />
            )}

            {isTension && isActive && <TensionField center={t.center} intensity={0.8} type={t.functionLabel} />}

            <polygon 
                points={t.points.map((p: { x: number; y: number })=>`${p.x},${p.y}`).join(' ')} 
                fill={fill} stroke={stroke} strokeWidth={strokeW} strokeDasharray={dash} strokeLinejoin="round" 
                className="transition-all duration-200"
                filter={(isActive && t.isTension) ? "url(#noise)" : undefined}
            />
            
            <text 
                x={t.center.x} y={t.center.y} dy={3} textAnchor="middle" 
                fontSize={isActive ? 12 : 10} fontWeight={isActive ? "900" : "bold"} 
                className={cn("pointer-events-none select-none transition-all duration-300", (isActive||isHover||isLinked||matchScore>0.9)?"fill-white opacity-100":t.diatonic?"fill-white/80 opacity-60":"fill-white/40 opacity-20")}
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
                {t.label}
            </text>

            {(isActive || isHover) && (
                <text x={t.center.x} y={t.center.y} dy={14} textAnchor="middle" fontSize={7} className="fill-white font-mono tracking-wider pointer-events-none select-none animate-in fade-in slide-in-from-bottom-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                    {t.chordInfo.romanNumeral}
                </text>
            )}
        </g>
    );
});
TonnetzTriangle.displayName = 'TonnetzTriangle';

// --- GRID GENERATION ---
const generateGridData = (key: Note, scale: ScaleType, chords: Chord[], secondary: Chord[], tensionChords: Chord[], complexity: ChordComplexity, suggestions: number[]) => {
    const chrom = (['F','Bb','Eb','Ab','Db','Gb','Cb'].includes(key)||key.includes('b')) ? ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] : ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const scaleNotes = getScaleNotes(key, scale);
    const keyIdx = chrom.indexOf(key);
    const points: Array<{ x: number; y: number }> = [];
    interface TriData {
        id: string;
        type: string;
        root: string;
        label: string;
        points: Array<{ x: number; y: number }>;
        center: { x: number; y: number };
        diatonic: boolean;
        secondary: boolean;
        isTension: boolean;
        isSuggested: boolean;
        isChromatic: boolean;
        chordInfo: Chord;
        functionLabel?: string;
    }
    const tris: TriData[] = [];
    
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
        for (let y = -GRID_SIZE; y <= GRID_SIZE; y++) {
            if (Math.abs(x + y) > GRID_SIZE + 2) continue;
            const note = chrom[((keyIdx + (x * 7) + (y * 4)) % 12 + 12) % 12];
            const p = { gx: x, gy: y, sx: x * X_VEC.x + y * Y_VEC.x, sy: x * X_VEC.y + y * Y_VEC.y, note, isDiatonic: scaleNotes.includes(note) };
            points.push(p);

            ['Major', 'Minor'].forEach((type) => {
                const root = p.note;
                const diatonic = chords.find(c => c.root === root && c.quality === type);
                const sec = secondary.find(c => c.root === root && c.quality === type);
                const tens = tensionChords.find(c => c.root === root && c.quality === type);
                const info = diatonic || sec || tens || { root, quality: type, symbol: type==='Major'?root:`${root}m`, romanNumeral: '?', notes: [], interval: -1, duration: 0 };
                
                // Determine Chromatic Interval from Key Center (0-11)
                const semitones = (chrom.indexOf(root) - keyIdx + 12) % 12;
                const funcLabel = getFunctionName(semitones, !!diatonic, scale, info.romanNumeral);

                const pts = type === 'Major' 
                    ? [{ x: p.sx, y: p.sy }, { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y }, { x: p.sx + Y_VEC.x, y: p.sy + Y_VEC.y }]
                    : [{ x: p.sx, y: p.sy }, { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y }, { x: p.sx + X_VEC.x - Y_VEC.x, y: p.sy + X_VEC.y - Y_VEC.y }];

                tris.push({
                    id: `${type}-${x}-${y}`, type, root, label: type==='Major'?root:root.toLowerCase(), points: pts,
                    center: { x: (pts[0].x+pts[1].x+pts[2].x)/3, y: (pts[0].y+pts[1].y+pts[2].y)/3 },
                    diatonic: !!diatonic, secondary: !!sec, isTension: !!tens, isSuggested: info.interval!==-1 && suggestions.includes(info.interval), isChromatic: !diatonic && !sec && !tens, 
                    chordInfo: info,
                    functionLabel: funcLabel
                });
            });
        }
    }
    return { points, tris };
};

// --- MAIN COMPONENT ---
export const HarmonicSpace = () => {
    const { key: currentKey, scale: scaleType, mood, complexity, targetMood, handleProgression, playOne, setHoveredChord, progression, setKey } = useStore();
    const { chords, tensionChords } = useDerivedData();

    const contextChord = useMemo(() => progression.slice().reverse().find(c => !c.isRest) || null, [progression]);
    const secondaryDominants = useMemo(() => generateSecondaryDominants(currentKey, scaleType), [currentKey, scaleType]);
    const suggestedIndices = useMemo(() => getHarmonicSuggestions(contextChord), [contextChord]);
    
    const [view, setView] = useState({ x: 0, y: 0, k: 1 });
    const [drag, setDrag] = useState<{active:boolean, last:{x:number,y:number}|null}>({active:false, last:null});
    const [hover, setHover] = useState<{ id: string } | null>(null);

    const { points, tris } = useMemo(() => generateGridData(currentKey, scaleType, chords, secondaryDominants, tensionChords, complexity, suggestedIndices), [currentKey, scaleType, chords, secondaryDominants, tensionChords, complexity, suggestedIndices]);

    const activeIds = useMemo(() => {
        if (!contextChord) return { set: new Set<string>(), root: null };
        const main = tris.find(t => t.root === contextChord.root && t.type === contextChord.quality);
        return { set: new Set<string>(main ? [main.id] : []), root: main?.id };
    }, [contextChord, tris]);

    const activeNotes = useMemo(() => new Set(contextChord?.notes || []), [contextChord]);

    const activeFlux = useMemo(() => {
        const source = hover || (activeIds.root ? tris.find(t => t.id === activeIds.root) : null);
        if (!source) return [];
        const paths = getResolutionPaths(source, tris, currentKey);
        const streams: Array<{ from: { x: number; y: number }; to: { x: number; y: number }; strength: number; type: 'dominant' | 'subdominant' | 'chromatic'; targetId: string }> = [];
        paths.forEach(p => {
            const candidates = tris.filter(t => t.id === p.targetId || (t.root === tris.find(x=>x.id===p.targetId)?.root && t.type === tris.find(x=>x.id===p.targetId)?.type));
            candidates.forEach(target => {
                const dist = Math.hypot(target.center.x - source.center.x, target.center.y - source.center.y);
                if (dist < SPACING * 4) {
                    streams.push({ from: source.center, to: target.center, strength: p.strength, type: p.type, targetId: target.id });
                }
            });
        });
        return streams;
    }, [hover, activeIds, tris, currentKey]);

    const handleDrag = (e: React.PointerEvent) => {
        if(e.type === 'pointerdown') { setDrag({active:true, last:{x:e.clientX, y:e.clientY}}); try { (e.target as Element).setPointerCapture(e.pointerId); } catch { /* Ignore capture errors */ } }
        else if(e.type === 'pointermove' && drag.active && drag.last) { setView(v => ({...v, x: v.x + e.clientX - drag.last!.x, y: v.y + e.clientY - drag.last!.y})); setDrag(prev => ({...prev, last:{x:e.clientX, y:e.clientY}})); }
        else if(e.type === 'pointerup') { setDrag({active:false, last:null}); try { (e.target as Element).releasePointerCapture(e.pointerId); } catch { /* Ignore release errors */ } }
    };

    const handleChordAction = useCallback((t: { chordInfo: Chord; root: string; type: string }) => {
        let chordToPlay = t.chordInfo;
        if (!chordToPlay.notes || chordToPlay.notes.length === 0) chordToPlay = buildChord(t.root, t.type, complexity === 'triad' ? '' : '7');
        playOne(chordToPlay);
        handleProgression('add', chordToPlay);
    }, [complexity, playOne, handleProgression]);

    return (
        <div className="w-full h-full relative overflow-hidden bg-[var(--bg-main)] touch-none select-none flex items-center justify-center cursor-move"
             onWheel={(e) => setView(v => ({ ...v, k: Math.max(0.5, Math.min(4, v.k * (1 - e.deltaY * 0.001))) }))}
             onPointerDown={handleDrag} onPointerMove={handleDrag} onPointerUp={handleDrag}>
            
            <div className="absolute inset-0 opacity-80 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, var(--bg-surface) 0%, var(--bg-main) 100%)' }} />
            
            <svg className="w-full h-full relative z-10" viewBox="-400 -300 800 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="noise" /><feComposite operator="in" in="noise" in2="SourceGraphic" result="composite" /><feBlend mode="overlay" in="composite" in2="SourceGraphic" /></filter>
                    <radialGradient id="tension-gradient"><stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                    <radialGradient id="tonic-glow"><stop offset="0%" stopColor="white" stopOpacity="0.8" /><stop offset="100%" stopColor="transparent" /></radialGradient>
                </defs>
                <g transform={`translate(${view.x}, ${view.y}) scale(${view.k})`} className="transition-transform duration-75">
                    <g opacity={0.15}>{points.map((p,i)=><React.Fragment key={i}><line x1={p.sx} y1={p.sy} x2={p.sx+X_VEC.x} y2={p.sy} stroke="var(--border)" strokeWidth={1} /><line x1={p.sx} y1={p.sy} x2={p.sx+Y_VEC.x} y2={p.sy+Y_VEC.y} stroke="var(--border)" strokeWidth={1} /><line x1={p.sx} y1={p.sy} x2={p.sx+X_VEC.x-Y_VEC.x} y2={p.sy+X_VEC.y-Y_VEC.y} stroke="var(--border)" strokeWidth={1} /></React.Fragment>)}</g>
                    <g>{activeFlux.map((s, i) => <FluxStream key={i} {...s} />)}</g>
                    <g>{tris.map(t => {
                        const score = getSentimentMatch(t.chordInfo, currentKey, scaleType, targetMood);
                        return <TonnetzTriangle key={t.id} t={t} mood={mood} matchScore={score} 
                                    state={{isActive:activeIds.set.has(t.id), isHover:hover?.id===t.id, isTension: t.isTension}} 
                                    resolutionSource={activeFlux.find(s => s.targetId === t.id)}
                                    onClick={() => handleChordAction(t)} onEnter={()=>{setHover({ id: t.id }); setHoveredChord({...t.chordInfo, sentiment: estimateChordSentiment(t.chordInfo, currentKey, scaleType)});}} onLeave={()=>{setHover(null); setHoveredChord(null);}} />;
                    })}</g>
                    <g>{points.map((p, i) => <TonnetzNode key={i} x={p.sx} y={p.sy} note={p.note} isKey={p.note === currentKey} isDiatonic={p.isDiatonic} active={activeNotes.has(p.note)} mood={mood} onSelectKey={setKey} />)}</g>
                </g>
            </svg>
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                 {[ {i:Plus, a:()=>setView(v=>({...v,k:Math.min(4,v.k*1.2)}))}, {i:Minus, a:()=>setView(v=>({...v,k:Math.max(0.5,v.k*0.8)}))}, {i:Maximize2, a:()=>setView({x:0,y:0,k:1})} ].map((b,i)=><button key={i} onClick={b.a} className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:scale-110 transition-transform"><b.i size={16}/></button>)}
             </div>
        </div>
    );
};
