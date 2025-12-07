
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, X, GripHorizontal } from 'lucide-react';
import { cn } from './ui';

const PIXELS_PER_BEAT = 40;

// --- HELPERS ---
const getChordColor = (roman: string) => {
    const colors: Record<string, string> = { i:'emerald', ii:'sky', iii:'emerald', iv:'sky', v:'rose', vi:'emerald', vii:'rose' };
    const root = (roman||'').toLowerCase().replace(/[^a-z]/g,'');
    return colors[root] || 'stone';
};

// --- COMPONENTS ---

const PaletteChord = ({ chord }: any) => {
    const color = getChordColor(chord.romanNumeral);
    
    return (
        <div 
            draggable 
            onDragStart={(e) => {
                // Serialize chord data for drop targets
                e.dataTransfer.setData('application/json', JSON.stringify(chord));
                e.dataTransfer.effectAllowed = 'copy';
                
                // Set drag image/ghost if needed, usually browser default is fine for simple elements
            }}
            className={cn(
                "h-10 px-3 rounded-md border flex flex-col justify-center gap-0.5 min-w-[64px] cursor-grab active:cursor-grabbing hover:scale-105 transition-all interact-base group relative overflow-hidden",
                `border-${color}-500/40 bg-${color}-500/10 hover:bg-${color}-500/20`
            )}
        >
            <div className={`absolute top-0 right-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-${color}-400`}>
                <GripHorizontal size={10} />
            </div>
            <span className={cn("font-bold text-[10px] truncate", `text-${color}-100`)}>{chord.symbol}</span>
            <span className="font-mono text-[8px] uppercase opacity-60">{chord.romanNumeral}</span>
        </div>
    );
};

const TimelineNode = ({ chord, index, isActive, onRemove, onResize, onDragStart, onDragEnter, onDrop, isDropTarget, isDragging }: any) => {
    const [tempW, setTempW] = useState<number|null>(null);
    const width = tempW ?? chord.duration * PIXELS_PER_BEAT;
    const color = getChordColor(chord.romanNumeral);

    return (
        <div draggable={!chord.isRest} 
             onDragStart={(e) => { e.dataTransfer.setData('reorder_index', index.toString()); onDragStart(e); }}
             onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
             onDragEnter={onDragEnter} onDrop={onDrop}
             className={cn("relative h-14 shrink-0 interact-base select-none mb-1 transition-all group outline-none rounded-md", isDragging && "opacity-30 scale-95")} style={{ width }}>
            
            {isDropTarget && <div className="absolute -left-1.5 inset-y-0 w-3 z-50 flex justify-center"><div className="h-full w-1 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)]" /></div>}
            
            <div className={cn("h-full w-full rounded-md border flex flex-col overflow-hidden relative shadow-sm backdrop-blur-sm transition-colors", 
                isActive ? "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]" : 
                chord.isRest ? "border-[var(--border)] bg-[var(--bg-main)] opacity-60" : 
                `border-${color}-500/40 bg-${color}-500/10 hover:bg-${color}-500/20`
            )}>
                 {!chord.isRest && <div className="absolute inset-0 opacity-10 flex">{Array.from({length:Math.ceil(width/PIXELS_PER_BEAT)}).map((_,i)=><div key={i} className="h-full border-r border-white flex-1 min-w-[40px]"/>)}</div>}
                 
                 <div className="relative z-10 px-3 h-full flex flex-col justify-center gap-0.5">
                     {!chord.isRest ? <><span className={cn("font-bold text-xs truncate", `text-${color}-100`)}>{chord.symbol}</span><span className="font-mono text-[9px] uppercase opacity-70">{chord.romanNumeral}</span></> : <div className="w-2 h-2 rounded-full bg-white/20"/>}
                     <button onClick={(e) => { e.stopPropagation(); onRemove(index); }} className="absolute top-1 right-1 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 p-1"><X size={10}/></button>
                 </div>
                 
                 {!chord.isRest && <div onMouseDown={(e) => { e.stopPropagation(); const s=e.clientX; const mv=(ev:MouseEvent)=>setTempW(Math.max(20, (chord.duration*PIXELS_PER_BEAT)+(ev.clientX-s))); const up=()=>{ window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up); if(tempW) { onResize(index, Math.round((tempW/PIXELS_PER_BEAT)/0.25)*0.25); setTempW(null); }}; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up); }} className="absolute right-0 inset-y-0 w-3 cursor-col-resize hover:bg-white/10 z-20" />}
            </div>
            <div className="absolute -bottom-4 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[8px] font-mono bg-black/80 px-1.5 rounded-full border border-white/10">{chord.duration}</span></div>
        </div>
    );
};

export const ProgressionStrip = ({ progression, onRemove, activeIndex, onDropChord, availableChords, onReorder, onResize, timeSignature }: any) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<{dragging: number|null, target: number|null}>({dragging:null, target:null});
    
    useEffect(() => { scrollRef.current?.children[activeIndex]?.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }); }, [activeIndex]);

    const handleDrop = (e: React.DragEvent, index: number) => {
        e.preventDefault(); e.stopPropagation();
        setDragState({dragging:null, target:null});
        
        const ri = e.dataTransfer.getData('reorder_index');
        
        // Handle Internal Reorder
        if (ri && ri !== "") {
            const fromIndex = parseInt(ri);
            if (!isNaN(fromIndex) && fromIndex !== index) {
                onReorder?.(fromIndex, index);
            }
        } 
        // Handle New Chord Drop (JSON)
        else { 
            try { 
                const raw = e.dataTransfer.getData('application/json');
                if (raw) {
                    const d = JSON.parse(raw); 
                    if (d.root) onDropChord(d, index); 
                }
            } catch (err) {
                console.error("Failed to parse dropped chord data", err);
            } 
        }
    };

    return (
      <div className="w-full h-full flex flex-col bg-[#0c0a09] overflow-hidden relative">
        
        {/* TOP PALETTE (Draggable Source) */}
        <div className="shrink-0 h-14 border-b border-white/5 flex items-center px-4 gap-2 overflow-x-auto custom-scrollbar bg-white/[0.02]">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest mr-2 select-none sticky left-0 z-10">Palette</span>
            {availableChords && availableChords.map((c: any, i: number) => (
                <PaletteChord key={i} chord={c} />
            ))}
        </div>

        {/* BOTTOM TIMELINE (Drop Target) */}
        <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute inset-0 z-0" style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '100% 20px'}}/>
            
            <div className="w-full overflow-x-auto custom-scrollbar relative z-10 px-6 flex items-center gap-1 h-24" ref={scrollRef}>
                {progression.map((c: any, i: number) => (
                    <React.Fragment key={i}>
                        <TimelineNode chord={c} index={i} isActive={i===activeIndex} onRemove={onRemove} onResize={onResize} 
                            onDragStart={() => setDragState(s => ({...s, dragging:i}))} 
                            onDragEnter={() => setDragState(s => ({...s, target:i}))}
                            onDrop={(e: any) => handleDrop(e, i)}
                            isDropTarget={dragState.target===i} isDragging={dragState.dragging===i} />
                        {(i+1) % 4 === 0 && <div className="h-14 w-px bg-white/10 mx-1 shrink-0 relative"><span className="absolute -top-3 text-[9px] text-[var(--text-dim)]">{(i/4)+1}</span></div>}
                    </React.Fragment>
                ))}
                
                {/* Add Button / End Drop Target */}
                <div onClick={() => { const t = availableChords.find((c:any)=>c.romanNumeral==='I'||c.romanNumeral==='i'); if(t) onDropChord(t, progression.length); }}
                    onDragOver={(e) => { e.preventDefault(); setDragState(s => ({...s, target: progression.length})); }}
                    onDragLeave={() => setDragState(s => ({...s, target: null}))}
                    onDrop={(e) => handleDrop(e, progression.length)}
                    className={cn("h-14 w-14 shrink-0 rounded-xl border border-dashed flex items-center justify-center cursor-pointer ml-2 transition-colors", 
                        dragState.target === progression.length ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]")}
                >
                    <Plus size={16}/>
                </div>
                
                {/* Empty space at the end for scrolling comfort */}
                <div className="w-12 shrink-0" />
            </div>
        </div>
      </div>
    );
};
