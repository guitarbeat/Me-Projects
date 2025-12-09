
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, X, GripHorizontal, Filter, Search } from 'lucide-react';
import { cn } from './ui';
import { estimateChordSentiment, Chord, useStore, useDerivedData } from './lib';

const PIXELS_PER_BEAT = 40;

// --- UTILS ---

const getChordColorClass = (roman: string) => {
    const root = (roman||'').toLowerCase().replace(/[^a-z]/g,'');
    const map: Record<string, string> = { 
        i: 'emerald', ii: 'sky', iii: 'emerald', iv: 'sky', v: 'rose', vi: 'emerald', vii: 'rose' 
    };
    const color = map[root] || 'stone';
    
    // Explicit return of full class strings for Tailwind scanner
    switch(color) {
        case 'emerald': return { 
            border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', hover: 'hover:bg-emerald-500/20', 
            text: 'text-emerald-900 dark:text-emerald-100', icon: 'text-emerald-600 dark:text-emerald-400',
            borderHover: 'border-emerald-500/40'
        };
        case 'sky': return { 
            border: 'border-sky-500/30', bg: 'bg-sky-500/10', hover: 'hover:bg-sky-500/20', 
            text: 'text-sky-900 dark:text-sky-100', icon: 'text-sky-600 dark:text-sky-400',
            borderHover: 'border-sky-500/40'
        };
        case 'rose': return { 
            border: 'border-rose-500/30', bg: 'bg-rose-500/10', hover: 'hover:bg-rose-500/20', 
            text: 'text-rose-900 dark:text-rose-100', icon: 'text-rose-600 dark:text-rose-400',
            borderHover: 'border-rose-500/40'
        };
        case 'stone': 
        default: return { 
            border: 'border-stone-500/30', bg: 'bg-stone-500/10', hover: 'hover:bg-stone-500/20', 
            text: 'text-stone-900 dark:text-stone-100', icon: 'text-stone-600 dark:text-stone-400',
            borderHover: 'border-stone-500/40'
        };
    }
};

// --- COMPONENTS ---

const HarmonicGraph = ({ progression, currentKey, scaleType }: any) => {
    const data = useMemo(() => {
        if (!progression.length) return null;
        let x = 0;
        const points = progression.map((c: any) => {
            const w = c.duration * PIXELS_PER_BEAT;
            const sentiment = estimateChordSentiment(c, currentKey, scaleType);
            const y = 48 - (sentiment.valence * 25); // Map valence to height
            const cx = x + w / 2;
            x += w + 4; // gap-1 (4px)
            return { x: cx, y, v: sentiment.valence, w };
        });
        return { points, totalWidth: x + 60 };
    }, [progression, currentKey, scaleType]);

    if (!data || data.points.length < 2) return null;

    let d = `M ${data.points[0].x} ${data.points[0].y}`;
    for (let i = 0; i < data.points.length - 1; i++) {
        const p0 = data.points[i];
        const p1 = data.points[i + 1];
        const cp1x = p0.x + (p1.x - p0.x) * 0.5;
        const cp1y = p0.y;
        const cp2x = p0.x + (p1.x - p0.x) * 0.5;
        const cp2y = p1.y;
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    return (
        <div className="absolute top-0 bottom-0 left-6 z-0 pointer-events-none" style={{ width: data.totalWidth }}>
            <svg className="w-full h-full overflow-visible">
                <defs>
                    <linearGradient id="gStroke" x1="0" x2="100%" y1="0" y2="0">
                         {data.points.map((p:any, i:number) => (
                             <stop key={i} offset={`${(p.x / data.totalWidth)*100}%`} stopColor={p.v > 0.1 ? '#facc15' : p.v < -0.1 ? '#6366f1' : '#a8a29e'} />
                         ))}
                    </linearGradient>
                </defs>
                <path d={d} fill="none" stroke="url(#gStroke)" strokeWidth="3" strokeLinecap="round" className="opacity-50 blur-[2px]" />
                <path d={d} fill="none" stroke="url(#gStroke)" strokeWidth="1.5" strokeLinecap="round" className="opacity-80" />
                {data.points.map((p:any, i:number) => (
                    <g key={i} transform={`translate(${p.x}, ${p.y})`}>
                        <circle r={2} fill={p.v > 0.1 ? '#facc15' : p.v < -0.1 ? '#6366f1' : '#a8a29e'} />
                        <circle r={8} className="fill-[var(--bg-soft)]" />
                    </g>
                ))}
            </svg>
        </div>
    );
};

export const DraggableChord: React.FC<{ chord: Chord, className?: string, onClick?: () => void }> = ({ chord, className, onClick }) => {
    const classes = useMemo(() => getChordColorClass(chord.romanNumeral), [chord.romanNumeral]);
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(chord));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div draggable onDragStart={handleDragStart} onClick={onClick}
            className={cn("h-9 px-3 rounded-md border flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing hover:translate-x-1 transition-all interact-base group relative overflow-hidden shrink-0",
                classes.border, classes.bg, classes.hover, className)}>
            <div className="flex items-baseline gap-2 pointer-events-none">
                <span className={cn("font-bold text-xs", classes.text)}>{chord.symbol}</span>
                <span className="font-mono text-[9px] uppercase opacity-50 text-[var(--text-main)]">{chord.romanNumeral}</span>
            </div>
            <div className={cn("opacity-0 group-hover:opacity-100 transition-opacity", classes.icon)}><GripHorizontal size={12} /></div>
        </div>
    );
};

export const ChordPalette = ({ className }: { className?: string }) => {
    const { playOne } = useStore();
    const { chords: availableChords } = useDerivedData();
    const [filter, setFilter] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChords = useMemo(() => {
        return availableChords.filter(c => {
             const matchesFilter = filter === 'All' ? true : 
                                   filter === 'Other' ? !['Major', 'Minor', 'Dominant'].includes(c.quality) : 
                                   c.quality === filter;
             const matchesSearch = c.symbol.toLowerCase().includes(searchTerm.toLowerCase());
             return matchesFilter && matchesSearch;
        });
    }, [availableChords, filter, searchTerm]);

    return (
        <div className={cn("flex flex-col h-full gap-2 p-2", className)}>
            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-wider">Palette</span>
                <div className="w-px h-3 bg-[var(--border)]" />
                
                <div className="flex items-center gap-1.5 bg-[var(--bg-element)] rounded-md border border-[var(--border)] px-1.5 h-6">
                    <Filter size={10} className="text-[var(--text-dim)]" />
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-medium text-[var(--text-muted)] border-none outline-none cursor-pointer hover:text-[var(--text-main)] appearance-none pr-2"
                    >
                        <option value="All">All Types</option>
                        <option value="Major">Major</option>
                        <option value="Minor">Minor</option>
                        <option value="Dominant">Dominant</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div className="flex items-center gap-1.5 bg-[var(--bg-element)] rounded-md border border-[var(--border)] px-1.5 h-6 w-24 focus-within:w-32 focus-within:border-[var(--accent)] transition-all">
                    <Search size={10} className="text-[var(--text-dim)]"/>
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-[10px] w-full text-[var(--text-main)] placeholder:text-[var(--text-dim)]"
                    />
                </div>
            </div>

            {/* Chords - Responsive Grid that wraps based on available height/width */}
            <div className="flex-1 overflow-y-auto custom-scrollbar content-start flex flex-wrap gap-2 min-h-0">
                {filteredChords.map((c: any, i: number) => (
                    <DraggableChord 
                        key={c.symbol + i} 
                        chord={c} 
                        onClick={() => playOne(c)}
                        className="h-8 w-auto min-w-[64px] bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] shadow-sm border border-[var(--border)] cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px]" 
                    />
                ))}
                {filteredChords.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-dim)] italic">
                        No chords found matching filter
                    </div>
                )}
            </div>
        </div>
    );
};

const TimelineNode = ({ chord, index, isActive, onRemove, onResize, onDragStart, onDragEnter, onDrop, isDropTarget, isDragging }: any) => {
    const [resizeState, setResizeState] = useState<{px: number, dur: number} | null>(null);
    const classes = useMemo(() => getChordColorClass(chord.romanNumeral), [chord.romanNumeral]);

    const width = resizeState ? resizeState.px : chord.duration * PIXELS_PER_BEAT;

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        const startX = e.clientX;
        const startWidth = chord.duration * PIXELS_PER_BEAT;
        
        const move = (ev: MouseEvent) => {
            const newPx = Math.max(PIXELS_PER_BEAT * 0.25, startWidth + (ev.clientX - startX));
            const snappedDur = Math.max(0.25, Math.round((newPx / PIXELS_PER_BEAT) * 4) / 4);
            setResizeState({ px: newPx, dur: snappedDur });
        };
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            document.body.style.cursor = '';
            if (resizeState) onResize(index, resizeState.dur);
            setResizeState(null);
        };
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    const dragHandlers = {
        draggable: !chord.isRest && !resizeState,
        onDragStart: (e: React.DragEvent) => { e.dataTransfer.setData('reorder_index', index.toString()); onDragStart(e); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = e.dataTransfer.types.includes('reorder_index') ? 'move' : 'copy'; },
        onDragEnter, onDrop
    };

    return (
        <div {...dragHandlers}
             className={cn("relative h-14 shrink-0 interact-base select-none mb-1 transition-all group outline-none rounded-md z-10", isDragging && "opacity-30 scale-95", resizeState && "z-50 scale-105 shadow-xl transition-none")} 
             style={{ width }}>
            {isDropTarget && <div className="absolute -left-1.5 inset-y-0 w-3 z-50 flex justify-center"><div className="h-full w-1 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)]" /></div>}
            
            <div className={cn("h-full w-full rounded-md border flex flex-col overflow-hidden relative shadow-sm backdrop-blur-md transition-all", 
                isActive ? "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]" : 
                resizeState ? "border-[var(--accent)] bg-[var(--bg-surface)] ring-2 ring-[var(--accent)] shadow-lg" :
                chord.isRest ? "border-[var(--border)] bg-[var(--bg-main)] opacity-60" : 
                cn(classes.border, classes.bg, classes.hover))}>
                 {!chord.isRest && <div className="absolute inset-0 opacity-10 flex pointer-events-none">{Array.from({length:Math.ceil(width/PIXELS_PER_BEAT)}).map((_,i)=><div key={i} className="h-full border-r border-[var(--border)] flex-1 min-w-[40px]"/>)}</div>}
                 
                 <div className="relative z-10 px-3 h-full flex flex-col justify-center gap-0.5 pointer-events-none">
                     {!chord.isRest ? <><span className={cn("font-bold text-xs truncate", classes.text)}>{chord.symbol}</span><span className="font-mono text-[9px] uppercase opacity-70 text-[var(--text-muted)]">{chord.romanNumeral}</span></> : <div className="w-2 h-2 rounded-full bg-[var(--bg-soft)]"/>}
                 </div>
                 <button onClick={(e) => { e.stopPropagation(); onRemove(index); }} className="absolute top-1 right-1 text-[var(--text-muted)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 p-1 cursor-pointer pointer-events-auto transition-opacity z-20"><X size={10}/></button>
            </div>
            
            {!chord.isRest && (
                <div onMouseDown={handleResizeStart} className="absolute right-0 top-0 bottom-0 w-5 cursor-col-resize z-[60] group/resize flex items-center justify-center hover:bg-[var(--bg-soft-hover)] -mr-2.5">
                    <div className={cn("w-1 h-6 rounded-full transition-all duration-200", resizeState ? "bg-[var(--accent)] opacity-100 h-8" : "bg-[var(--border)] opacity-0 group-hover/resize:opacity-100")} />
                </div>
            )}
            
            <div className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-200 z-[100] pointer-events-none", resizeState ? "opacity-100 translate-y-0 scale-110" : "opacity-0 -translate-y-1 group-hover:opacity-100")}>
                <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm whitespace-nowrap", resizeState ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border)]")}>
                    {resizeState ? resizeState.dur : chord.duration} Beats
                </span>
            </div>
        </div>
    );
};

export const ProgressionStrip = ({ showPalette = false }: { showPalette?: boolean }) => {
    const { 
        progression, 
        playIndex: activeIndex, 
        handleProgression, 
        playOne,
        key: currentKey,
        scale: scaleType
    } = useStore();
    
    const { chords: availableChords } = useDerivedData();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{dragging: number|null, target: number|null}>({dragging:null, target:null});
    
    useEffect(() => { 
        if (activeIndex !== null) {
            scrollRef.current?.children[activeIndex]?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }); 
        }
    }, [activeIndex]);

    const onDropChord = (chord: Chord, index: number) => {
        playOne(chord);
        handleProgression('add', { chord, index });
    };

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault(); e.stopPropagation();
        setDragState({dragging:null, target:null});
        const ri = e.dataTransfer.getData('reorder_index');
        
        if (ri && ri !== "") {
            const from = parseInt(ri);
            if (!isNaN(from) && from !== index) handleProgression('reorder', { from, to: from < index ? index - 1 : index });
        } else { 
            try { const d = JSON.parse(e.dataTransfer.getData('application/json')); if (d.root) onDropChord(d, index); } catch {} 
        }
    };

    return (
      <div className="w-full h-full flex flex-col bg-[var(--bg-main)] overflow-hidden relative">
        {showPalette && (
            <div className="shrink-0 h-40 border-b border-[var(--border)] bg-[var(--bg-soft)] overflow-hidden">
                <ChordPalette />
            </div>
        )}

        <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 z-0" style={{backgroundImage: 'linear-gradient(var(--border-soft) 1px, transparent 1px)', backgroundSize: '100% 20px'}}/>
            <div className="w-full overflow-x-auto custom-scrollbar relative z-10" ref={scrollRef}>
                <div className="flex items-center gap-1 h-24 px-6 min-w-max relative">
                    <HarmonicGraph progression={progression} currentKey={currentKey} scaleType={scaleType} />
                    {progression.map((c: any, i: number) => (
                        <React.Fragment key={i}>
                            <TimelineNode 
                                chord={c} 
                                index={i} 
                                isActive={i===activeIndex} 
                                onRemove={(idx: number) => handleProgression('remove', idx)} 
                                onResize={(idx: number, dur: number) => handleProgression('resize', { index: idx, duration: dur })}
                                onDragStart={() => setDragState(s => ({...s, dragging:i}))} 
                                onDragEnter={() => setDragState(s => ({...s, target:i}))}
                                onDrop={(e: any) => handleDrop(e, i)} 
                                isDropTarget={dragState.target===i} 
                                isDragging={dragState.dragging===i} 
                            />
                            {(i+1) % 4 === 0 && <div className="h-14 w-px bg-[var(--border)] mx-1 shrink-0 relative"><span className="absolute -top-3 text-[9px] text-[var(--text-dim)]">{(i/4)+1}</span></div>}
                        </React.Fragment>
                    ))}
                    
                    <div onClick={() => { const t = availableChords.find((c:any)=>c.romanNumeral.match(/^[iI]$/)); if(t) onDropChord(t, progression.length); }}
                        onDragOver={(e) => { e.preventDefault(); setDragState(s => ({...s, target: progression.length})); }}
                        onDragLeave={() => setDragState(s => ({...s, target: null}))}
                        onDrop={(e) => handleDrop(e, progression.length)}
                        className={cn("h-14 w-14 shrink-0 rounded-xl border border-dashed flex items-center justify-center cursor-pointer ml-2 transition-colors z-10 bg-[var(--bg-soft)] backdrop-blur-sm", 
                            dragState.target === progression.length ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]")}>
                        <Plus size={16}/>
                    </div>
                    <div className="w-12 shrink-0" />
                </div>
            </div>
        </div>
      </div>
    );
};