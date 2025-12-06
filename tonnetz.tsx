
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Plus, Minus, Maximize2, Network, Layers } from 'lucide-react';
import { buildChord, getCompassLabel, estimateChordSentiment, generateSecondaryDominants, getHarmonicSuggestions, getScaleNotes, Chord, ScaleType, Note, ChordComplexity } from './lib';
import { cn, Badge } from './ui';

// --- CONSTANTS & CONFIG ---

const GRID_SIZE = 6; 
const SPACING = 80;
const X_VEC = { x: SPACING * 1, y: 0 }; 
const Y_VEC = { x: SPACING * 0.5, y: SPACING * 0.866 }; 

// --- HELPERS ---

const getFillColor = (t: any, mood: any, isHover: boolean, isActive: boolean, isLinked: boolean) => {
    if (isActive) return 'var(--accent)';
    
    // Linked Extensions (Upper Structures)
    if (isLinked) {
        // Use valence to tint the extensions slightly
        return isHover ? `rgba(255, 255, 255, 0.2)` : `rgba(255, 255, 255, 0.05)`;
    }

    if (t.isChromatic) return isHover ? 'rgba(255,255,255,0.1)' : 'rgba(20,20,20,0.4)';
    if (t.secondary) return isHover ? 'rgba(236, 72, 153, 0.6)' : 'rgba(236, 72, 153, 0.25)';

    const v = mood.valence;
    // Higher arousal = brighter, more opaque colors
    const opacity = Math.min(0.9, 0.35 + (mood.arousal * 0.25) + (isHover ? 0.3 : 0));

    if (t.type === 'Major') {
        // Valence shifts major chords from gold (neutral) to warm (high valence)
        if (v > 0.2) return `rgba(255, 255, ${200 + (v * 55)}, ${opacity})`; 
        return `rgba(255, 215, 0, ${opacity})`; 
    } else {
        // Valence shifts minor chords from indigo (neutral) to cold/dark (low valence)
        if (v < -0.2) return `rgba(${30}, ${30}, ${100 - (v * 30)}, ${opacity})`;
        return `rgba(99, 102, 241, ${opacity})`; 
    }
};

// --- MEMOIZED COMPONENTS ---

const TonnetzNode = React.memo(({ x, y, note, isKeyCenter, isDiatonic, isActiveChordNote, mood }: any) => {
    // Tension affects the "jitter" or glow size of active nodes
    const glowSize = isActiveChordNote ? 15 + (mood.tension * 15) : 0;
    
    return (
        <g transform={`translate(${x}, ${y})`} className="transition-all duration-300">
            {/* Glow for active notes */}
            {isActiveChordNote && (
                <>
                    <circle r={glowSize} className="fill-[var(--accent)] opacity-20 animate-pulse" />
                    <circle r={glowSize * 0.6} className="fill-[var(--accent)] opacity-40" />
                </>
            )}
            
            {/* Node Dot */}
            <circle 
                r={isKeyCenter ? 6 : 3} 
                className={cn("transition-all duration-300", 
                    isActiveChordNote ? "fill-[var(--accent)]" : 
                    isKeyCenter ? "fill-white" : 
                    isDiatonic ? "fill-[var(--text-muted)]" : "fill-[var(--bg-element)]"
                )}
                stroke={isKeyCenter ? "rgba(0,0,0,0.5)" : "none"}
                strokeWidth={1}
            />
            
            {/* Note Label */}
            <text 
                dy={isKeyCenter ? 16 : 12}
                textAnchor="middle" 
                className={cn("text-[8px] font-bold pointer-events-none select-none transition-opacity",
                    isActiveChordNote ? "fill-white opacity-100 font-black text-[10px]" :
                    isKeyCenter ? "fill-white opacity-100" :
                    isDiatonic ? "fill-[var(--text-dim)] opacity-80" : "fill-[var(--bg-element)] opacity-30"
                )}
            >
                {note}
            </text>
        </g>
    );
});

const TonnetzLink = React.memo(({ link, isActive, isHover, mood }: any) => {
    // VISUALIZATION OF EXTENDED HARMONY
    // ---------------------------------
    // Level 0: Root Triad -> 7th Triad (Strong bond)
    // Level 1: 7th Triad -> 9th Triad (Medium bond)
    // Level 2: 9th Triad -> 11th Triad (Weaker bond)
    
    const isTense = mood.tension > 0.5;
    const isExtremeTension = mood.tension > 0.8;

    // Base styling
    let strokeWidth = 1;
    let strokeOpacity = 0.1;
    let strokeDash = "none";
    let color = "white";

    if (isActive) {
        color = "var(--accent)";
        strokeOpacity = 0.8 - (link.level * 0.2); // Fade out higher extensions
        strokeWidth = 3 - (link.level * 0.5);
        
        if (isTense && link.level > 0) {
            strokeDash = "3 3"; // Break upper structure links under tension
        }
    } else if (isHover) {
        strokeOpacity = 0.4;
        strokeWidth = 2;
    } else {
        // Inactive background links
        strokeOpacity = 0.05;
        if (isTense) strokeOpacity = 0.02; // Hide clutter when tense
    }

    // Animation class for high tension
    const animClass = (isActive && isExtremeTension && link.level > 0) ? "animate-pulse" : "";

    return (
        <g className={animClass}>
            <line 
                x1={link.from.x} y1={link.from.y} 
                x2={link.to.x} y2={link.to.y}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeOpacity={strokeOpacity}
                strokeDasharray={strokeDash}
                strokeLinecap="round"
                className="transition-all duration-300"
            />
            {/* Structural Nodes for Links (Joints) */}
            {isActive && (
                <circle cx={(link.from.x + link.to.x)/2} cy={(link.from.y + link.to.y)/2} r={2} fill={color} opacity={strokeOpacity} />
            )}
        </g>
    );
});

const TonnetzTriangle = React.memo(({ t, mood, isHover, isActive, isLinked, isSuggested, onClick, onEnter, onLeave }: any) => {
    const fill = getFillColor(t, mood, isHover, isActive, isLinked);
    
    let stroke = 'transparent';
    let strokeW = 0.5;
    let dash = 'none';

    if (isActive) { stroke = 'var(--accent)'; strokeW = 3; }
    else if (isHover) { stroke = 'white'; strokeW = 2; }
    else if (isLinked) { stroke = 'rgba(255,255,255,0.5)'; strokeW = 1.5; dash = '2 2'; } 
    else if (isSuggested) { stroke = 'var(--accent)'; strokeW = 1.5; dash = '2 2'; }

    return (
        <g 
            className={cn("cursor-pointer interact-base", isActive && "z-10")}
            onMouseEnter={() => onEnter(t)}
            onMouseLeave={onLeave}
            onClick={(e) => { e.stopPropagation(); onClick(t); }}
        >
            <polygon
                points={t.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
                strokeDasharray={dash}
                strokeLinejoin="round"
                style={{ transition: 'fill 0.2s ease-out, stroke 0.1s' }}
                className="vector-effect-non-scaling-stroke"
            />
            
            <text 
                x={t.center.x} 
                y={t.center.y} 
                dy={2.5} 
                textAnchor="middle" 
                fontSize={10} 
                fontWeight="bold" 
                className={cn("pointer-events-none transition-opacity select-none", 
                    (isActive || isHover || isLinked) ? "fill-white opacity-100" :
                    t.diatonic ? "fill-white/80 opacity-60" : "fill-white/20 opacity-10"
                )}
                style={{ textShadow: '0 0 4px rgba(0,0,0,0.5)' }}
            >
                {t.label}
            </text>
        </g>
    );
});

// --- DATA GENERATION HELPER ---

const generateGridData = (currentKey: Note, scaleType: ScaleType, chords: Chord[], secondaryDominants: Chord[], complexity: ChordComplexity, suggestedIndices: number[]) => {
    // 1. Determine Chromatic & Scale Context
    const chromaticScale = (['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'].includes(currentKey) || currentKey.includes('b')) 
        ? ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] 
        : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    const centerKeyIndex = chromaticScale.indexOf(currentKey);
    const scaleNotes = getScaleNotes(currentKey, scaleType);

    // 2. Generate Grid Points
    const points = [];
    for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
        for (let y = -GRID_SIZE; y <= GRID_SIZE; y++) {
            if (Math.abs(x + y) > GRID_SIZE + 2) continue; 
            
            let semitones = (centerKeyIndex + (x * 7) + (y * 4)) % 12;
            if (semitones < 0) semitones += 12;
            const note = chromaticScale[semitones];
            
            points.push({
                gx: x, gy: y,
                sx: (x * X_VEC.x) + (y * Y_VEC.x),
                sy: (x * X_VEC.y) + (y * Y_VEC.y),
                note,
                isDiatonic: scaleNotes.includes(note)
            });
        }
    }

    // 3. Generate Triangles (Triads)
    const tris: any[] = [];
    
    points.forEach(p => {
        const createTri = (type: 'Major'|'Minor', pts: any[]) => {
            const rootNote = p.note;
            const label = type === 'Major' ? rootNote : rootNote.toLowerCase();
            const id = `${type}-${p.gx}-${p.gy}`;

            // Check if this triad exists in our harmonic definition
            const diatonic = chords.find((c: any) => c.root === rootNote && c.quality === type);
            const secondary = secondaryDominants.find((c: any) => c.root === rootNote && c.quality === type);
            
            const chordInfo = diatonic || secondary || { 
                root: rootNote, quality: type, symbol: type === 'Major' ? rootNote : `${rootNote}m`,
                romanNumeral: '?', notes: [], interval: -1, duration: 0, suffix: type==='Minor'?'m':''
            };

            const isSuggested = chordInfo.interval !== -1 && suggestedIndices.includes(chordInfo.interval);

            return {
                id, type, root: rootNote, label, points: pts,
                center: { x: (pts[0].x + pts[1].x + pts[2].x) / 3, y: (pts[0].y + pts[1].y + pts[2].y) / 3 },
                diatonic: !!diatonic, secondary: !!secondary, isSuggested,
                isChromatic: !diatonic && !secondary,
                chordInfo
            };
        };

        // Up (Major)
        tris.push(createTri('Major', [
            { x: p.sx, y: p.sy },
            { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y },
            { x: p.sx + Y_VEC.x, y: p.sy + Y_VEC.y }
        ]));
        // Down (Minor)
        tris.push(createTri('Minor', [
            { x: p.sx, y: p.sy },
            { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y },
            { x: p.sx + X_VEC.x - Y_VEC.x, y: p.sy + X_VEC.y - Y_VEC.y }
        ]));
    });

    // 4. Link Extensions (Extended Harmony Clusters)
    // Identify clusters of triads that form extended chords (e.g., Cmaj9 = C Maj + E Min + G Maj)
    // We create structural links between these triads to visualize the "stack".
    const links: any[] = [];
    const extensionMap: Record<string, string[]> = {}; // Key: TriadID, Value: [ExtensionTriadID, ...]

    if (complexity !== 'triad') {
        const processedPairs = new Set<string>();
        const depth = complexity === '11th' ? 3 : complexity === '9th' ? 2 : 1;

        tris.forEach(t => {
            // Only generate extensions for diatonic or secondary dominant chords (functional harmony)
            if (!t.diatonic && !t.secondary) return;

            // Find full chord definition to get scale degrees for extensions
            const chordDef = chords.find(c => c.root === t.root && c.quality === t.type) || t.chordInfo;
            if (!chordDef || !chordDef.notes || chordDef.notes.length < 3) return;

            let currentTriad = t;
            const chain: string[] = [];

            for (let i = 0; i < depth; i++) {
                // To stack thirds, we look for the next note in the chord structure.
                // Index 0=Root, 1=3rd, 2=5th, 3=7th, 4=9th, 5=11th
                // Extension 1 (7th) is built on the 3rd (Index 1).
                // Extension 2 (9th) is built on the 5th (Index 2).
                const nextRootIndex = 1 + i; 
                
                if (chordDef.notes.length <= nextRootIndex) break;
                const nextRoot = chordDef.notes[nextRootIndex]; 
                
                // Find a triad rooted at 'nextRoot' that is physically adjacent on the lattice.
                // This geometric constraint ensures we visualize the "tightest" voicing representation.
                const nextTriad = tris.find(candidate => 
                    candidate.root === nextRoot && 
                    // Spatially close (Euclidean distance check)
                    Math.hypot(candidate.center.x - currentTriad.center.x, candidate.center.y - currentTriad.center.y) < SPACING * 1.8
                );

                if (nextTriad) {
                    chain.push(nextTriad.id);
                    
                    const linkId = `${currentTriad.id}->${nextTriad.id}`;
                    if (!processedPairs.has(linkId)) {
                        links.push({ 
                            id: linkId, 
                            from: currentTriad.center, 
                            to: nextTriad.center,
                            sourceId: currentTriad.id,
                            targetId: nextTriad.id,
                            rootId: t.id, // Track the fundamental root to light up the whole chain
                            level: i // 0 = Base connection (7th), 1 = Upper structure (9th), etc.
                        });
                        processedPairs.add(linkId);
                    }
                    
                    currentTriad = nextTriad;
                } else {
                    break;
                }
            }
            
            if (chain.length > 0) {
                extensionMap[t.id] = chain;
            }
        });
    }

    return { points, tris, extensionMap, links };
};

// --- MAIN GRID COMPONENT ---

export const TonnetzGrid = ({ currentKey, scaleType, chords, tensionChords, onAddChord, onChordClick, mood, contextChord, secondaryDominants, suggestedIndices, complexity }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState<{x:number, y:number} | null>(null);
    const [hoveredTri, setHoveredTri] = useState<any|null>(null);

    // Optimized Data Generation
    const { points, tris, extensionMap, links } = useMemo(() => 
        generateGridData(currentKey, scaleType, chords, secondaryDominants, complexity, suggestedIndices),
    [currentKey, scaleType, chords, secondaryDominants, complexity, suggestedIndices]);

    // Active Note Set for Visualizing Complex Chords
    const activeNoteSet = useMemo(() => {
        if (!contextChord) return new Set();
        return new Set(contextChord.notes);
    }, [contextChord]);

    // Calculate Active Cluster
    const { activeTriadIds, activeRootId } = useMemo(() => {
        const ids = new Set<string>();
        let rootId = null;
        if (!contextChord) return { activeTriadIds: ids, activeRootId: null };

        // Find the main triad that matches the playing chord
        const mainTriad = tris.find(t => t.root === contextChord.root && t.type === contextChord.quality);
        if (mainTriad) {
            rootId = mainTriad.id;
            ids.add(mainTriad.id);
            // If complexity is high, add the extension chain
            if (extensionMap[mainTriad.id]) {
                extensionMap[mainTriad.id].forEach((extId: string) => ids.add(extId));
            }
        }
        return { activeTriadIds: ids, activeRootId: rootId };
    }, [contextChord, tris, extensionMap]);

    // --- INTERACTION HANDLERS ---
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault(); e.stopPropagation();
        const delta = -e.deltaY * 0.001;
        setView(p => ({ ...p, k: Math.min(Math.max(p.k * (1 + delta), 0.5), 4) }));
    };
    
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !lastPos) return;
        setView(p => ({ ...p, x: p.x + (e.clientX - lastPos.x), y: p.y + (e.clientY - lastPos.y) }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    const handleChordClick = useCallback((t: any) => {
        let chordToPlay = t.chordInfo;
        // Build generic extended chord if no pre-def exists (e.g., chromatic)
        if (!chordToPlay.notes || chordToPlay.notes.length === 0) {
            let ext = '';
            if (complexity === '7th') ext = '7';
            else if (complexity === '9th') ext = '9';
            else if (complexity === '11th') ext = '11';
            chordToPlay = buildChord(t.root, t.type, ext);
        }
        onChordClick(chordToPlay);
        onAddChord(chordToPlay);
    }, [complexity, onChordClick, onAddChord]);

    return (
        <div ref={containerRef} className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center cursor-move touch-none select-none"
            onWheel={handleWheel} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
            
            <svg className="w-full h-full" viewBox="-400 -300 800 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                     <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="15" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                <g transform={`translate(${view.x}, ${view.y}) scale(${view.k})`} className="transition-transform duration-75 ease-out origin-center">
                    
                    {/* 1. GRID LINES */}
                    <g opacity={0.15}>
                        {points.map((p, i) => (
                             <React.Fragment key={i}>
                                 <line x1={p.sx} y1={p.sy} x2={p.sx + X_VEC.x} y2={p.sy + X_VEC.y} stroke={p.isDiatonic ? "white" : "#444"} strokeWidth={p.isDiatonic ? 1 : 0.5} />
                                 <line x1={p.sx} y1={p.sy} x2={p.sx + Y_VEC.x} y2={p.sy + Y_VEC.y} stroke={p.isDiatonic ? "white" : "#444"} strokeWidth={p.isDiatonic ? 1 : 0.5} />
                                 <line x1={p.sx} y1={p.sy} x2={p.sx + X_VEC.x - Y_VEC.x} y2={p.sy + X_VEC.y - Y_VEC.y} stroke={p.isDiatonic ? "white" : "#444"} strokeWidth={p.isDiatonic ? 1 : 0.5} />
                             </React.Fragment>
                        ))}
                    </g>

                    {/* 2. CONNECTORS (Extended Harmony) */}
                    <g>
                        {links.map(link => {
                            // Link is active if it is part of the currently active harmonic cluster
                            const isActive = activeRootId && link.rootId === activeRootId;
                            
                            // Also highlight if hovering over the parent triad
                            const isHover = hoveredTri && (link.rootId === hoveredTri.id || extensionMap[hoveredTri.id]?.includes(link.targetId));
                            
                            return <TonnetzLink key={link.id} link={link} isActive={isActive} isHover={isHover} mood={mood} />;
                        })}
                    </g>

                    {/* 3. TRIANGLES */}
                    <g>
                        {tris.map(t => {
                            const isActive = activeTriadIds.has(t.id);
                            const isDirectHover = hoveredTri && hoveredTri.id === t.id;
                            
                            // Extended Chain Highlight (Hover)
                            let isLinkedHover = false;
                            if (hoveredTri) {
                                // Highlight if T is in Hovered's extension chain
                                const hoveredExts = extensionMap[hoveredTri.id] || [];
                                if (hoveredExts.includes(t.id)) isLinkedHover = true;
                                
                                // Highlight if Hovered is in T's extension chain (Reverse lookup for parent)
                                // This visualizes "This is the extension of X"
                                if (extensionMap[t.id]?.includes(hoveredTri.id)) isLinkedHover = true;
                            }
                            
                            return (
                                <TonnetzTriangle 
                                    key={t.id} t={t} mood={mood} 
                                    isActive={isActive} 
                                    isHover={isDirectHover} 
                                    isLinked={isLinkedHover}
                                    isSuggested={t.isSuggested}
                                    onClick={handleChordClick}
                                    onEnter={setHoveredTri}
                                    onLeave={() => setHoveredTri(null)}
                                />
                            );
                        })}
                    </g>

                    {/* 4. NODES */}
                    <g>
                        {points.map((p, i) => (
                            <TonnetzNode 
                                key={i} x={p.sx} y={p.sy} note={p.note} 
                                isKeyCenter={p.note === currentKey} 
                                isDiatonic={p.isDiatonic}
                                isActiveChordNote={activeNoteSet.has(p.note)}
                                mood={mood}
                            />
                        ))}
                    </g>
                </g>
            </svg>

            {/* HEADER & INFO OVERLAY */}
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-10">
                 <div className="flex items-center gap-2 opacity-50">
                     <Network size={14} className="text-[var(--text-main)]"/>
                     <span className="text-[10px] font-mono text-[var(--text-main)]">TONNETZ LATTICE // {complexity.toUpperCase()}</span>
                 </div>
                 {hoveredTri && (
                     <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-left-2 w-52">
                         <div className="flex items-center justify-between mb-1">
                             <span className="text-sm font-bold text-white">{hoveredTri.chordInfo.symbol}</span>
                             <Badge variant={hoveredTri.diatonic ? "default" : "accent"}>{hoveredTri.diatonic ? "Diatonic" : "Chromatic"}</Badge>
                         </div>
                         <div className="flex flex-col gap-1.5 mt-1">
                             <span className="text-[10px] text-[var(--text-muted)]">{hoveredTri.chordInfo.romanNumeral || 'Unknown Function'}</span>
                             <div className="flex items-center gap-2">
                                 <span className="text-[10px] text-[var(--text-dim)]">{getCompassLabel(estimateChordSentiment(hoveredTri.chordInfo, currentKey, scaleType).valence, estimateChordSentiment(hoveredTri.chordInfo, currentKey, scaleType).arousal)}</span>
                             </div>
                             
                             {/* EXTENSION INFO */}
                             {complexity !== 'triad' && extensionMap[hoveredTri.id] && (
                                 <div className="flex flex-col gap-0.5 pt-1 border-t border-white/5">
                                     <span className="text-[9px] text-[var(--text-dim)] font-mono uppercase">Upper Structure</span>
                                     <div className="flex items-center gap-1 flex-wrap">
                                        <Layers size={10} className="text-[var(--accent)]"/>
                                        {extensionMap[hoveredTri.id].map((extId: string) => {
                                            const extTri = tris.find(x => x.id === extId);
                                            return (
                                                <span key={extId} className="text-[9px] text-white/80 bg-white/10 px-1 rounded">
                                                    {extTri?.label} {extTri?.type === 'Minor' ? 'min' : ''}
                                                </span>
                                            );
                                        })}
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
            </div>
            
            {/* VIEW CONTROLS */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
                 <button className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] interact-push" onClick={() => setView(prev => ({ ...prev, k: Math.min(4, prev.k * 1.2) }))}><Plus size={16} /></button>
                 <button className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] interact-push" onClick={() => setView(prev => ({ ...prev, k: Math.max(0.5, prev.k * 0.8) }))}><Minus size={16} /></button>
                 <button className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] interact-push" onClick={() => setView({ x: 0, y: 0, k: 1 })}><Maximize2 size={16} /></button>
             </div>
        </div>
    );
};

export const HarmonicSpace = (props: any) => {
    // Wrapper to ensure derived props are calculated
    const secondaryDominants = useMemo(() => generateSecondaryDominants(props.currentKey, props.scaleType), [props.currentKey, props.scaleType]);
    const suggestedIndices = useMemo(() => getHarmonicSuggestions(props.contextChord), [props.contextChord]);
    
    return <TonnetzGrid {...props} secondaryDominants={secondaryDominants} suggestedIndices={suggestedIndices} />;
};
