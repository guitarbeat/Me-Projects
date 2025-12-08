
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Plus, Minus, Maximize2, Network, Layers, Compass, Zap } from 'lucide-react';
import { buildChord, getCompassLabel, estimateChordSentiment, generateSecondaryDominants, getHarmonicSuggestions, getScaleNotes, ChordComplexity, Note, ScaleType } from './lib';
import { cn, Badge } from './ui';

// --- HELPERS ---
const GRID_SIZE = 6, SPACING = 80, X_VEC = { x: SPACING, y: 0 }, Y_VEC = { x: SPACING * 0.5, y: SPACING * 0.866 };

// --- EMOTIONAL MATCHING LOGIC ---
const getSentimentMatch = (chordInfo: any, currentKey: Note, scaleType: ScaleType, targetMood: { v: number, a: number } | null) => {
    if (!targetMood) return 1; // No filter applied
    const sentiment = estimateChordSentiment(chordInfo, currentKey, scaleType);
    
    // Euclidean distance in V-A space (Range 0 to ~2.8)
    const dist = Math.hypot(sentiment.valence - targetMood.v, sentiment.arousal - targetMood.a);
    
    // Convert distance to a match score (0 to 1). 
    // Closer distance = Higher score. Threshold logic determines falloff.
    return Math.max(0.1, 1 - (dist * 0.7)); 
};

// --- COLOR LOGIC ---
const getFillColor = (t: any, mood: any, state: any, matchScore: number) => {
    const { isActive, isHover, isLinked } = state;
    const { valence: v, arousal: a, tension: tn } = mood;

    // 1. Active State (Overrides everything)
    if (isActive) return 'var(--accent)';
    
    // 2. Base Color Calculation
    let r, g, b;
    let opacity = 0.45 + (a * 0.25); 

    if (t.isChromatic) {
        r=80; g=80; b=80;
    } else if (t.secondary) {
        r=236; g=72+(v*30); b=153+(v*50);
    } else if (t.type === 'Major') {
        r=255; g=Math.min(255, 180 + (v*60)); b=Math.max(0, (v*100));
    } else { // Minor
        r=Math.max(20, 70-(v*40)); g=Math.max(30, 80+(v*80)); b=220+(v*20);
    }

    // 3. Apply Match Score (Dimming non-matching chords)
    // If matchScore < 1, we are filtering. 
    if (matchScore < 0.9) {
        // Significantly reduce opacity for non-matching chords
        opacity *= (matchScore * matchScore); 
        // Desaturate them slightly
        r = (r + 128) / 2; g = (g + 128) / 2; b = (b + 128) / 2;
    } else if (matchScore > 0.95 && !isActive) {
        // Highlight compatible chords
        opacity = Math.min(0.9, opacity * 1.5);
    }

    // 4. Linked/Ghost State
    if (isLinked) {
        opacity = isHover ? 0.3 : 0.1;
        return `rgba(255, 255, 255, ${opacity})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// --- SUB-COMPONENTS ---
const TonnetzNode = React.memo(({ x, y, note, isKey, isDiatonic, active, mood }: any) => (
    <g transform={`translate(${x}, ${y})`} className="transition-all duration-300">
        {active && <circle r={20 + mood.tension * 20} className="fill-[var(--accent)] opacity-20 animate-pulse" />}
        <circle r={isKey ? 7 : 3} className={cn("transition-all", active ? "fill-[var(--accent)] stroke-white stroke-2" : isKey ? "fill-white stroke-black/50" : isDiatonic ? "fill-[var(--text-muted)]" : "fill-[var(--bg-element)]")} />
        <text dy={isKey ? 18 : 14} textAnchor="middle" className={cn("text-[9px] font-bold pointer-events-none select-none", active ? "fill-white text-[11px]" : isKey ? "fill-white" : "fill-[var(--text-dim)] opacity-80")}>{note}</text>
    </g>
));

const TonnetzLink = React.memo(({ link, isActive, isHover, mood, onClick }: any) => {
    return (
        <g 
            onClick={(e) => { e.stopPropagation(); onClick(link); }} 
            className={cn("cursor-pointer interact-base group/link", isActive && "z-10")}
        >
             <line x1={link.from.x} y1={link.from.y} x2={link.to.x} y2={link.to.y} stroke="transparent" strokeWidth={24} />
             <line 
                x1={link.from.x} y1={link.from.y} x2={link.to.x} y2={link.to.y} 
                stroke={isActive ? 'var(--accent)' : 'white'} 
                strokeWidth={isActive ? 3 : isHover ? 2 : 1} 
                opacity={isActive ? 0.8 : isHover ? 0.4 : 0.1} 
                strokeDasharray={isActive && mood.tension > 0.5 ? '3 3' : 'none'} 
                strokeLinecap="round" 
                className="transition-all duration-300 pointer-events-none"
             />
             {(isActive || isHover) && (
                <circle cx={(link.from.x + link.to.x)/2} cy={(link.from.y + link.to.y)/2} r={isActive ? 3 : 2} className={cn("transition-all", isActive ? "fill-[var(--accent)]" : "fill-white/50")} />
             )}
        </g>
    );
});

const TonnetzTriangle = React.memo(({ t, mood, state, matchScore, onClick, onEnter, onLeave }: any) => {
    const { isActive, isHover, isLinked, isSuggested } = state;
    const fill = getFillColor(t, mood, state, matchScore);
    
    // Visual pop for matching chords in search mode
    const scale = matchScore > 0.9 && !isActive && !isHover ? 0.9 : 1; 
    
    let stroke = 'transparent';
    let strokeW = 0.5;
    let dash = 'none';

    if (isActive) { stroke = 'var(--accent)'; strokeW = 3; }
    else if (isHover) { stroke = 'white'; strokeW = 2; }
    else if (matchScore > 0.95 && !isActive) { stroke = 'rgba(255,255,255,0.4)'; strokeW = 1; } // Highlight matching potential
    else if (isLinked) { stroke = 'rgba(255,255,255,0.5)'; strokeW = 1.5; dash = '2 2'; } 
    else if (isSuggested) { stroke = 'var(--accent)'; strokeW = 1.5; dash = '2 2'; }
    
    return (
        <g 
            className={cn("cursor-pointer interact-base transition-transform duration-300", isActive && "z-10")} 
            style={{ transformOrigin: `${t.center.x}px ${t.center.y}px`, transform: `scale(${scale})` }}
            onMouseEnter={() => onEnter(t)} 
            onMouseLeave={onLeave} 
            onClick={(e) => { e.stopPropagation(); onClick(t); }}
        >
            <polygon 
                points={t.points.map((p:any)=>`${p.x},${p.y}`).join(' ')} 
                fill={fill} 
                stroke={stroke} 
                strokeWidth={strokeW} 
                strokeDasharray={dash} 
                strokeLinejoin="round" 
                className="transition-colors duration-200" 
            />
            <text x={t.center.x} y={t.center.y} dy={2.5} textAnchor="middle" fontSize={10} fontWeight="bold" className={cn("pointer-events-none select-none transition-opacity", (isActive||isHover||isLinked||matchScore>0.9)?"fill-white opacity-100":t.diatonic?"fill-white/80 opacity-60":"fill-white/20 opacity-10")}>{t.label}</text>
        </g>
    );
});

// --- GRID LOGIC ---
const generateGridData = (key: Note, scale: ScaleType, chords: any[], secondary: any[], complexity: ChordComplexity, suggestions: number[]) => {
    const chrom = (['F','Bb','Eb','Ab','Db','Gb','Cb'].includes(key)||key.includes('b')) ? ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'] : ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    const scaleNotes = getScaleNotes(key, scale);
    const keyIdx = chrom.indexOf(key);

    const points = [], tris: any[] = [];
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
                const info = diatonic || sec || { root, quality: type, symbol: type==='Major'?root:`${root}m`, romanNumeral: '?', notes: [], interval: -1, duration: 0 };
                
                const pts = type === 'Major' 
                    ? [{ x: p.sx, y: p.sy }, { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y }, { x: p.sx + Y_VEC.x, y: p.sy + Y_VEC.y }]
                    : [{ x: p.sx, y: p.sy }, { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y }, { x: p.sx + X_VEC.x - Y_VEC.x, y: p.sy + X_VEC.y - Y_VEC.y }];

                tris.push({
                    id: `${type}-${x}-${y}`, type, root, label: type==='Major'?root:root.toLowerCase(), points: pts,
                    center: { x: (pts[0].x+pts[1].x+pts[2].x)/3, y: (pts[0].y+pts[1].y+pts[2].y)/3 },
                    diatonic: !!diatonic, secondary: !!sec, isSuggested: info.interval!==-1 && suggestions.includes(info.interval), isChromatic: !diatonic && !sec, chordInfo: info
                });
            });
        }
    }

    const links: any[] = [], extMap: Record<string, string[]> = {};
    if (complexity !== 'triad') {
        const depth = complexity === '11th' ? 3 : complexity === '9th' ? 2 : 1;
        tris.forEach(t => {
            if ((!t.diatonic && !t.secondary)) return;
            const def = chords.find(c => c.root === t.root && c.quality === t.type) || t.chordInfo;
            if (!def?.notes?.length) return;
            
            let curr = t, chain = [];
            for (let i = 0; i < depth; i++) {
                const nextRoot = def.notes[1 + i];
                const next = nextRoot && tris.find(c => c.root === nextRoot && Math.hypot(c.center.x - curr.center.x, c.center.y - curr.center.y) < SPACING * 1.8);
                if (next) {
                    chain.push(next.id);
                    links.push({ id: `${curr.id}->${next.id}`, from: curr.center, to: next.center, rootId: t.id, level: i });
                    curr = next;
                } else break;
            }
            if (chain.length) extMap[t.id] = chain;
        });
    }
    return { points, tris, extMap, links };
};

// --- MAIN ---
export const TonnetzGrid = ({ currentKey, scaleType, chords, secondaryDominants, suggestedIndices, complexity, onAddChord, onChordClick, mood, contextChord, targetMood, onHoverChord }: any) => {
    const [view, setView] = useState({ x: 0, y: 0, k: 1 });
    const [drag, setDrag] = useState<{active:boolean, last:{x:number,y:number}|null}>({active:false, last:null});
    const [hover, setHover] = useState<any|null>(null);

    const { points, tris, extMap, links } = useMemo(() => generateGridData(currentKey, scaleType, chords, secondaryDominants, complexity, suggestedIndices), [currentKey, scaleType, chords, secondaryDominants, complexity, suggestedIndices]);

    const activeIds = useMemo(() => {
        const set = new Set<string>();
        if (!contextChord) return { set, root: null };
        const main = tris.find(t => t.root === contextChord.root && t.type === contextChord.quality);
        if (main) { set.add(main.id); extMap[main.id]?.forEach(id => set.add(id)); }
        return { set, root: main?.id };
    }, [contextChord, tris, extMap]);

    const activeNotes = useMemo(() => new Set(contextChord?.notes || []), [contextChord]);

    const handleDrag = (e: React.PointerEvent) => {
        if(e.type === 'pointerdown') { 
            setDrag({active:true, last:{x:e.clientX, y:e.clientY}}); 
            try { (e.target as Element).setPointerCapture(e.pointerId); } catch(err){}
        }
        else if(e.type === 'pointermove' && drag.active && drag.last) { setView(v => ({...v, x: v.x + e.clientX - drag.last!.x, y: v.y + e.clientY - drag.last!.y})); setDrag(prev => ({...prev, last:{x:e.clientX, y:e.clientY}})); }
        else if(e.type === 'pointerup') { 
            setDrag({active:false, last:null}); 
            try { (e.target as Element).releasePointerCapture(e.pointerId); } catch(err){}
        }
    };

    const handleChordAction = useCallback((t: any) => {
        let chordToPlay = t.chordInfo;
        if (!chordToPlay.notes || chordToPlay.notes.length === 0) {
            let ext = complexity === 'triad' ? '' : complexity === '11th' ? '11' : complexity === '9th' ? '9' : '7';
            chordToPlay = buildChord(t.root, t.type, ext);
        }
        onChordClick(chordToPlay);
        onAddChord(chordToPlay);
    }, [complexity, onChordClick, onAddChord]);

    const handleLinkClick = useCallback((link: any) => {
        const rootTriad = tris.find(t => t.id === link.rootId);
        if (rootTriad) handleChordAction(rootTriad);
    }, [tris, handleChordAction]);

    // Update hovered chord state for external use
    const handleEnter = (t: any) => {
        setHover(t);
        // Estimate sentiment for the hover tooltip linkage
        const info = t.chordInfo;
        if (info && onHoverChord) {
             // Create a lightweight object for the parent component to visualize
             const sentiment = estimateChordSentiment(info, currentKey, scaleType);
             onHoverChord({ ...info, sentiment }); 
        }
    };

    const handleLeave = () => {
        setHover(null);
        if(onHoverChord) onHoverChord(null);
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#0c0a09] touch-none select-none flex items-center justify-center cursor-move"
             onWheel={(e) => setView(v => ({ ...v, k: Math.max(0.5, Math.min(4, v.k * (1 - e.deltaY * 0.001))) }))}
             onPointerDown={handleDrag} onPointerMove={handleDrag} onPointerUp={handleDrag}>
            
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#292524_0%,#000000_100%)] opacity-80 pointer-events-none" />
            
            <svg className="w-full h-full relative z-10" viewBox="-400 -300 800 600" preserveAspectRatio="xMidYMid slice">
                <g transform={`translate(${view.x}, ${view.y}) scale(${view.k})`} className="transition-transform duration-75">
                    <g opacity={0.15}>{points.map((p,i)=><React.Fragment key={i}><line x1={p.sx} y1={p.sy} x2={p.sx+X_VEC.x} y2={p.sy} stroke={p.isDiatonic?"white":"#444"}/><line x1={p.sx} y1={p.sy} x2={p.sx+Y_VEC.x} y2={p.sy+Y_VEC.y} stroke={p.isDiatonic?"white":"#444"}/><line x1={p.sx} y1={p.sy} x2={p.sx+X_VEC.x-Y_VEC.x} y2={p.sy+X_VEC.y-Y_VEC.y} stroke={p.isDiatonic?"white":"#444"}/></React.Fragment>)}</g>
                    <g>{links.map(l => {
                        const active = activeIds.root === l.rootId;
                        const isHover = hover && (hover.id === l.rootId || extMap[hover.id]?.includes(l.targetId));
                        return <TonnetzLink key={l.id} link={l} isActive={active} isHover={isHover} mood={mood} onClick={handleLinkClick} />;
                    })}</g>
                    <g>{tris.map(t => {
                        const score = getSentimentMatch(t.chordInfo, currentKey, scaleType, targetMood);
                        return <TonnetzTriangle key={t.id} t={t} mood={mood} matchScore={score} state={{isActive:activeIds.set.has(t.id), isHover:hover?.id===t.id, isLinked: hover && (extMap[hover.id]?.includes(t.id) || extMap[t.id]?.includes(hover.id)), isSuggested:t.isSuggested}} onClick={handleChordAction} onEnter={handleEnter} onLeave={handleLeave} />;
                    })}</g>
                    <g>{points.map((p, i) => <TonnetzNode key={i} x={p.sx} y={p.sy} note={p.note} isKey={p.note === currentKey} isDiatonic={p.isDiatonic} active={activeNotes.has(p.note)} mood={mood} />)}</g>
                </g>
            </svg>
            
            <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-2 z-20">
                 <div className="flex items-center gap-2 opacity-50"><Network size={14} className="text-[var(--text-main)]"/><span className="text-[10px] font-mono text-[var(--text-main)]">TONNETZ // {complexity}</span></div>
                 {hover && (() => {
                     const sent = estimateChordSentiment(hover.chordInfo, currentKey, scaleType);
                     return (
                        <div className="bg-black/80 backdrop-blur border border-white/10 p-3 rounded-lg shadow-xl animate-in fade-in w-56">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-white">{hover.chordInfo.symbol}</span>
                                <Badge variant={hover.diatonic ? "default" : "accent"}>{hover.diatonic ? "Diatonic" : "Chromatic"}</Badge>
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] mt-1 mb-2">{hover.chordInfo.romanNumeral || 'Non-Functional'}</div>
                            
                            {/* MINI EMOTIONAL COMPASS */}
                            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                                <div className="relative w-8 h-8 rounded-full border border-white/20 bg-black/50">
                                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10"/>
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10"/>
                                    {/* The dot */}
                                    <div className="absolute w-2 h-2 bg-[var(--accent)] rounded-full -ml-1 -mt-1 shadow-[0_0_5px_var(--accent)]" 
                                         style={{ left: `${(sent.valence + 1) * 50}%`, top: `${(1 - sent.arousal) * 50}%` }}/>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-bold text-[var(--text-main)]">{getCompassLabel(sent.valence, sent.arousal)}</span>
                                    <span className="text-[8px] text-[var(--text-dim)]">V: {sent.valence.toFixed(1)} / A: {sent.arousal.toFixed(1)}</span>
                                </div>
                            </div>
                            
                            {/* Extension Hint */}
                            {complexity !== 'triad' && extMap[hover.id] && (
                                <div className="mt-2 pt-1 border-t border-white/5 flex items-center gap-1">
                                    <Layers size={8} className="text-[var(--text-dim)]"/>
                                    <span className="text-[9px] text-[var(--text-dim)]">Extended Structure</span>
                                </div>
                            )}
                        </div>
                     );
                 })()}
            </div>
            
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                 {[ {i:Plus, a:()=>setView(v=>({...v,k:Math.min(4,v.k*1.2)}))}, {i:Minus, a:()=>setView(v=>({...v,k:Math.max(0.5,v.k*0.8)}))}, {i:Maximize2, a:()=>setView({x:0,y:0,k:1})} ].map((b,i)=><button key={i} onClick={b.a} className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] hover:scale-110 transition-transform"><b.i size={16}/></button>)}
             </div>
        </div>
    );
};

export const HarmonicSpace = (props: any) => {
    const secondaryDominants = useMemo(() => generateSecondaryDominants(props.currentKey, props.scaleType), [props.currentKey, props.scaleType]);
    const suggestedIndices = useMemo(() => getHarmonicSuggestions(props.contextChord), [props.contextChord]);
    return <TonnetzGrid {...props} secondaryDominants={secondaryDominants} suggestedIndices={suggestedIndices} />;
};
