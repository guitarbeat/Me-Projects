
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Plus, X, GripHorizontal, Search } from 'lucide-react';
import { cn } from '../ui';
import { Chord, useStore, useDerivedData } from '../../lib';
import { CircleOfFifths } from './CircleOfFifths';

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
            border: 'border-emerald-500/30', bg: 'bg-emerald-500/25', hover: 'hover:bg-emerald-500/35', 
            text: 'text-emerald-900 dark:text-emerald-50', icon: 'text-emerald-600 dark:text-emerald-300',
            borderHover: 'border-emerald-400/50'
        };
        case 'sky': return { 
            border: 'border-sky-500/30', bg: 'bg-sky-500/25', hover: 'hover:bg-sky-500/35', 
            text: 'text-sky-900 dark:text-sky-50', icon: 'text-sky-600 dark:text-sky-300',
            borderHover: 'border-sky-400/50'
        };
        case 'rose': return { 
            border: 'border-rose-500/30', bg: 'bg-rose-500/25', hover: 'hover:bg-rose-500/35', 
            text: 'text-rose-900 dark:text-rose-50', icon: 'text-rose-600 dark:text-rose-300',
            borderHover: 'border-rose-400/50'
        };
        case 'stone': 
        default: return { 
            border: 'border-stone-500/30', bg: 'bg-stone-500/25', hover: 'hover:bg-stone-500/35', 
            text: 'text-stone-900 dark:text-stone-50', icon: 'text-stone-600 dark:text-stone-300',
            borderHover: 'border-stone-400/50'
        };
    }
};

// --- COMPONENTS ---

export const DraggableChord: React.FC<{ chord: Chord, className?: string, onClick?: () => void }> = ({ chord, className, onClick }) => {
    const classes = useMemo(() => getChordColorClass(chord.romanNumeral), [chord.romanNumeral]);
    
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('application/json', JSON.stringify(chord));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div draggable onDragStart={handleDragStart} onClick={onClick}
            className={cn("h-9 px-3 rounded-md border flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing interact-base group relative overflow-hidden shrink-0",
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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredChords = useMemo(() => {
        return availableChords.filter(c => {
             return c.symbol.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [availableChords, searchTerm]);

    return (
        <div className={cn("flex flex-col h-full gap-2", className)}>
             {/* Removed embedded Circle from within ChordPalette since it's now parent-managed */}

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0 px-1">
                {/* Search Bar (kept as utility) */}
                <div className="flex flex-1 items-center gap-1.5 bg-[var(--bg-element)] rounded-md border border-[var(--border)] px-1.5 h-7 focus-within:border-[var(--accent)] transition-all">
                    <Search size={12} className="text-[var(--text-dim)]"/>
                    <input 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search chords..."
                        className="bg-transparent border-none outline-none text-xs w-full text-[var(--text-main)] placeholder:text-[var(--text-dim)]"
                    />
                </div>
            </div>

            {/* Chords - Responsive Grid that wraps based on available height/width */}
            <div className="flex-1 overflow-y-auto custom-scrollbar content-start flex flex-wrap gap-2 min-h-0">
                {filteredChords.map((c: Chord, i: number) => (
                    <DraggableChord 
                        key={c.symbol + i} 
                        chord={c} 
                        onClick={() => playOne(c)}
                        className="h-8 w-auto min-w-[64px] bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] shadow-sm border border-[var(--border)] cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px]" 
                    />
                ))}
                {filteredChords.length === 0 && (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-dim)] italic">
                        No chords found matching search
                    </div>
                )}
            </div>
        </div>
    );
};

interface TimelineNodeProps {
    chord: Chord;
    index: number;
    isActive: boolean;
    isSelected: boolean;
    onRemove: (index: number) => void;
    onResize: (index: number, duration: number) => void;
    onDragStart: (e: React.DragEvent, index: number) => void;
    onDragEnter: (e: React.DragEvent, index: number) => void;
    onDrop: (e: React.DragEvent, index: number) => void;
    onSelect: (index: number) => void;
    isDropTarget: boolean;
    isDragging: boolean;
}
const TimelineNode = React.memo(function TimelineNode({  
    chord, index, isActive, isSelected, 
    onRemove, onResize, onDragStart, onDragEnter, onDrop, onSelect, 
    isDropTarget, isDragging 
}: TimelineNodeProps) {
    const [resizeState, setResizeState] = useState<{px: number, dur: number} | null>(null);
    const classes = useMemo(() => getChordColorClass(chord.romanNumeral), [chord.romanNumeral]);

    const width = resizeState ? resizeState.px : chord.duration * PIXELS_PER_BEAT;

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        const startX = e.clientX;
        const startWidth = chord.duration * PIXELS_PER_BEAT;
        
        // Mutable variable to track duration across the event listener closure
        let currentDur = chord.duration;
        
        const move = (ev: MouseEvent) => {
            const diff = ev.clientX - startX;
            // Min width 0.25 beats
            const newPx = Math.max(PIXELS_PER_BEAT * 0.25, startWidth + diff);
            // Snap to 0.25 beat grid
            const snappedDur = Math.max(0.25, Math.round((newPx / PIXELS_PER_BEAT) * 4) / 4);
            
            currentDur = snappedDur;
            setResizeState({ px: newPx, dur: snappedDur });
        };
        
        const up = () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mouseup', up);
            document.body.style.cursor = '';
            
            // Commit change
            if (currentDur !== chord.duration) {
                onResize(index, currentDur);
            }
            setResizeState(null);
        };
        
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
    };

    const dragHandlers = {
        draggable: !chord.isRest && !resizeState,
        onDragStart: (e: React.DragEvent) => { e.dataTransfer.setData('reorder_index', index.toString()); onDragStart(e, index); },
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = e.dataTransfer.types.includes('reorder_index') ? 'move' : 'copy'; },
        onDragEnter: (e: React.DragEvent) => onDragEnter(e, index),
        onDrop: (e: React.DragEvent) => onDrop(e, index)
    };

    return (
        <div {...dragHandlers} onClick={(e) => { e.stopPropagation(); onSelect(index); }}
             className={cn(
                 "relative h-14 interact-base select-none transition-all group outline-none rounded-md z-10 max-w-full cursor-pointer", 
                 isDragging && "opacity-30 scale-95", 
                 resizeState && "z-50 scale-105 shadow-xl transition-none"
             )} 
             style={{ width }}>
            {isDropTarget && <div className="absolute -left-1.5 inset-y-0 w-3 z-50 flex justify-center"><div className="h-full w-1 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)]" /></div>}
            
            <div className={cn("h-full w-full rounded-md border flex flex-col overflow-hidden relative shadow-sm backdrop-blur-md transition-all", 
                isActive ? "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]" : 
                isSelected ? "border-[var(--accent)] ring-2 ring-[var(--accent)] z-20 shadow-md scale-[1.02]" :
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
                <div onMouseDown={handleResizeStart} className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize z-[60] group/resize flex items-center justify-center hover:bg-[var(--bg-soft-hover)] -mr-3">
                    <div className={cn("w-1 h-6 rounded-full transition-all duration-200", resizeState ? "bg-[var(--accent)] opacity-100 h-8" : "bg-[var(--border)] opacity-0 group-hover/resize:opacity-100")} />
                </div>
            )}
            
            <div className={cn("absolute -bottom-6 left-1/2 -translate-x-1/2 transition-all duration-200 z-[100] pointer-events-none", (resizeState || isSelected) ? "opacity-100 translate-y-0 scale-110" : "opacity-0 -translate-y-1 group-hover:opacity-100")}>
                <span className={cn("text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm whitespace-nowrap", (resizeState || isSelected) ? "bg-[var(--accent)] text-black border-[var(--accent)]" : "bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border)]")}>
                    {resizeState ? resizeState.dur : chord.duration} Beats
                </span>
            </div>
        </div>
    );
});

export const ProgressionStrip = ({ showPalette = false }: { showPalette?: boolean }) => {
    const { 
        progression, 
        playIndex: activeIndex, 
        selectedChordIndex,
        handleProgression, 
        playOne,
        setSelectedChordIndex
    } = useStore();
    
    const { chords: availableChords } = useDerivedData();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{dragging: number|null, target: number|null}>({dragging:null, target:null});
    
    useEffect(() => { 
        if (activeIndex !== null) {
            scrollRef.current?.children[0]?.children[activeIndex]?.scrollIntoView({ behavior:'smooth', block:'center', inline:'center' }); 
        }
    }, [activeIndex]);

    // Stable Handlers for Memoized TimelineNode
    const handleSelect = useCallback((idx: number) => { setSelectedChordIndex(idx); if (progression[idx]) playOne(progression[idx]); }, [setSelectedChordIndex, playOne, progression]);
    const handleRemove = useCallback((idx: number) => handleProgression('remove', idx), [handleProgression]);
    const handleResize = useCallback((idx: number, dur: number) => handleProgression('resize', { index: idx, duration: dur }), [handleProgression]);
    const handleDragStartNode = useCallback((_e: React.DragEvent, idx: number) => setDragState(s => ({...s, dragging:idx})), []);
    const handleDragEnterNode = useCallback((_e: React.DragEvent, idx: number) => setDragState(s => ({...s, target:idx})), []);

    const onDropChord = useCallback((chord: Chord, index: number) => {
        playOne(chord);
        handleProgression('add', { chord, index });
        setSelectedChordIndex(index);
    }, [playOne, handleProgression, setSelectedChordIndex]);

    const handleDrop = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault(); e.stopPropagation();
        setDragState({dragging:null, target:null});
        const ri = e.dataTransfer.getData('reorder_index');
        
        if (ri && ri !== "") {
            const from = parseInt(ri);
            if (!isNaN(from) && from !== index) {
                handleProgression('reorder', { from, to: from < index ? index - 1 : index });
                setSelectedChordIndex(from < index ? index - 1 : index);
            }
        } else { 
            try { const d = JSON.parse(e.dataTransfer.getData('application/json')); if (d.root) onDropChord(d, index); } catch { /* Ignore parse errors */ } 
        }
    }, [handleProgression, setSelectedChordIndex, onDropChord]); // Note: onDropChord needs to be memoized or this useCallback will reset if onDropChord resets. 
    // onDropChord is defined inside component above, let's fix that.

    // ... Fixing inline functions ...

    return (
      <div 
        className="w-full h-full flex flex-col bg-[var(--bg-panel)] overflow-hidden relative"
        onClick={() => setSelectedChordIndex(null)} // Click background to deselect
      >
        {showPalette && (
            <div className="shrink-0 h-[220px] border-b border-[var(--border)] bg-[var(--bg-element)] overflow-hidden flex flex-row">
                 {/* Left: Circle Visualization */}
                <div className="w-[220px] h-full shrink-0 border-r border-[var(--border)] flex items-center justify-center p-2 relative">
                     <CircleOfFifths 
                        currentKey={`${useStore.getState().key} ${useStore.getState().scale === 'Major' ? '' : 'm'}`.trim()} 
                        onChordClick={(symbol) => {
                             const match = availableChords.find(c => c.symbol === symbol || c.symbol === symbol + 'm');
                             if (match) playOne(match);
                        }}
                        className="w-full h-full"
                    />
                </div>

                {/* Right: Scrollable Chord List */}
                <div className="flex-1 min-w-0 h-full overflow-hidden">
                    <ChordPalette className="p-2 h-full" />
                </div>
            </div>
        )}

        <div className="flex-1 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 z-0" style={{backgroundImage: 'linear-gradient(var(--border-soft) 1px, transparent 1px)', backgroundSize: '100% 20px'}}/>
            
            {/* Scrollable Container with Wrapping Grid */}
            <div className="w-full h-full overflow-y-auto custom-scrollbar relative z-10 p-4 sm:p-6" ref={scrollRef}>
                <div className="flex flex-wrap items-start gap-2 w-full relative pb-12">
                    {progression.map((c: Chord, i: number) => (
                        <React.Fragment key={i}>
                            <TimelineNode 
                                chord={c} 
                                index={i} 
                                isActive={i===activeIndex} 
                                isSelected={i===selectedChordIndex}
                                onSelect={handleSelect}
                                onRemove={handleRemove} 
                                onResize={handleResize}
                                onDragStart={handleDragStartNode} 
                                onDragEnter={handleDragEnterNode}
                                onDrop={handleDrop} 
                                isDropTarget={dragState.target===i} 
                                isDragging={dragState.dragging===i} 
                            />
                            {/* Bar separator logic - visible only if it falls nicely */}
                            {(i+1) % 4 === 0 && (
                                <div className="h-14 w-px bg-[var(--border)] mx-1 shrink-0 relative hidden sm:block">
                                    <span className="absolute -top-3 text-[9px] text-[var(--text-dim)]">{(i/4)+1}</span>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    
                    <div onClick={(e) => { e.stopPropagation(); const t = availableChords.find((c: Chord)=>c.romanNumeral?.match(/^[iI]$/)); if(t) onDropChord(t, progression.length); }}
                        onDragOver={(e) => { e.preventDefault(); setDragState(s => ({...s, target: progression.length})); }}
                        onDragLeave={() => setDragState(s => ({...s, target: null}))}
                        onDrop={(e) => handleDrop(e, progression.length)}
                        className={cn("h-14 w-14 shrink-0 rounded-xl border border-dashed flex items-center justify-center cursor-pointer transition-colors z-10 bg-[var(--bg-soft)] backdrop-blur-sm", 
                            dragState.target === progression.length ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]")}>
                        <Plus size={16}/>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
};
// ... existing code ...

export const MiniSequencer = () => {
    const { progression, isPlaying, playIndex } = useStore();
    return (
        <div className="flex items-center gap-3 px-4 w-full h-full bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] transition-colors cursor-pointer group">
            <div className="h-8 w-24 shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] flex items-center px-1 gap-0.5 overflow-hidden group-hover:border-[var(--accent)] relative">
                {progression.length === 0 ? (
                    <div className="w-full text-center text-[8px] text-[var(--text-dim)]">Empty</div>
                ) : (
                    progression.slice(0, 8).map((c, i) => (
                        <div key={i} className={cn("h-4 w-1.5 rounded-full transition-all", 
                            i === playIndex && isPlaying ? "bg-[var(--accent)] h-5" : "bg-[var(--text-muted)] opacity-40")} 
                        />
                    ))
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-panel)]" />
            </div>
            <div className="flex flex-col min-w-0">
                 <span className="font-bold text-xs text-[var(--text-main)] truncate">Sequencer</span>
                 <span className="text-[10px] text-[var(--text-muted)] truncate">{progression.length} Chords • {Math.round(progression.reduce((a,b)=>a+b.duration,0))} Beats</span>
            </div>
        </div>
    );
};

export const MiniChordPalette = () => {
    const { chords } = useDerivedData();
    const categories = Array.from(new Set(chords.map(c => c.quality))).slice(0, 3).join(', ');
    
    return (
        <div className="flex items-center gap-3 px-4 w-full h-full bg-[var(--bg-surface)] hover:bg-[var(--bg-element)] transition-colors cursor-pointer group">
             <div className="w-8 h-8 rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] shrink-0 group-hover:border-[var(--accent)] grid grid-cols-3 grid-rows-3 gap-[2px] p-1.5 opacity-80">
                <div className="bg-emerald-500/50 rounded-[1px]" />
                <div className="bg-sky-500/50 rounded-[1px]" />
                <div className="bg-rose-500/50 rounded-[1px]" />
                <div className="bg-amber-500/50 rounded-[1px]" />
                <div className="bg-[var(--text-muted)] rounded-[1px] opacity-20" />
                <div className="bg-purple-500/50 rounded-[1px]" />
                <div className="bg-[var(--text-accent)] rounded-[1px]" />
                <div className="bg-indigo-500/50 rounded-[1px]" />
                <div className="bg-teal-500/50 rounded-[1px]" />
            </div>
            <div className="flex flex-col min-w-0">
                 <span className="font-bold text-xs text-[var(--text-main)] truncate">Chord Palette</span>
                 <span className="text-[10px] text-[var(--text-muted)] truncate">{chords.length} Available • {categories}</span>
            </div>
        </div>
    );
};
