
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Chord } from './lib';
import { cn } from './ui';

// --- HELPERS ---

const setDragGhost = (e: React.DragEvent, text: string) => {
    if (e.dataTransfer && typeof e.dataTransfer.setDragImage === 'function') {
        const el = document.createElement('div');
        el.className = "fixed top-0 left-0 bg-[var(--accent)] text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-xl z-[9999] pointer-events-none transform -translate-x-[1000px] border border-white/20 whitespace-nowrap";
        el.innerText = text;
        document.body.appendChild(el);
        e.dataTransfer.setDragImage(el, 0, 0);
        setTimeout(() => { if(el.parentNode) document.body.removeChild(el); }, 0);
    }
};

const getFunctionColor = (roman: string) => {
    const r = (roman || '').toLowerCase().replace(/[^ivxlc]/g, ''); 
    if (['i', 'iii', 'vi'].includes(r)) return 'bg-emerald-500/80 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'; 
    if (['ii', 'iv'].includes(r)) return 'bg-sky-500/80 border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]'; 
    if (['v', 'vii'].includes(r)) return 'bg-rose-500/80 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    return 'bg-[var(--bg-element)] border-[var(--border)]';
};

// --- COMPONENTS ---

const PIXELS_PER_BEAT = 40, SNAP_GRID = 0.25;

interface TimelineNodeProps {
    chord: Chord;
    index: number;
    isActive: boolean;
    onRemove: (idx: number) => void;
    onResize: (idx: number, dur: number) => void;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnter: () => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    isDropTarget: boolean;
    isDragging: boolean;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ chord, index, isActive, onRemove, onResize, onDragStart, onDragEnter, onDragLeave, onDrop, isDropTarget, isDragging }) => {
    const [tempWidth, setTempWidth] = useState<number|null>(null);
    const [isExiting, setIsExiting] = useState(false);
    
    const width = (tempWidth!==null?tempWidth:chord.duration*PIXELS_PER_BEAT);
    
    const handleResize = (dx:number) => setTempWidth(Math.max(PIXELS_PER_BEAT*0.5, (chord.duration*PIXELS_PER_BEAT)+dx));
    const handleResizeEnd = () => { if(tempWidth!==null){ onResize(index, Math.round((tempWidth/PIXELS_PER_BEAT)/SNAP_GRID)*SNAP_GRID); setTempWidth(null); } };
    const handleRemove = (e?: React.SyntheticEvent) => { 
        if(e) e.stopPropagation(); 
        setIsExiting(true); 
        setTimeout(() => { onRemove(index); }, 300); 
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' || e.key === 'Delete') { handleRemove(e); }
    };
    
    const colorClass = chord.isRest ? 'bg-transparent border-transparent' : getFunctionColor(chord.romanNumeral);

    return (
        <div 
            draggable={!chord.isRest} 
            tabIndex={0}
            role="button"
            aria-label={`${chord.symbol} chord. Press Delete to remove.`}
            onKeyDown={handleKeyDown}
            onDragStart={(e) => { 
                setDragGhost(e, chord.symbol);
                onDragStart(e); 
                if(e.dataTransfer){
                     e.dataTransfer.setData('reorder_index', index.toString());
                     try { (e.dataTransfer as any).effectAllowed = 'move'; } catch(e){}
                }
            }} 
            onDragOver={(e)=>{ e.preventDefault(); if(e.dataTransfer) try { (e.dataTransfer as any).dropEffect='move'; } catch(err) {} }} 
            onDragEnter={onDragEnter} 
            onDragLeave={onDragLeave} 
            onDrop={onDrop} 
            className={cn(
                "relative h-12 shrink-0 interact-base group/node select-none mb-1 transition-all duration-300 outline-none focus:ring-2 focus:ring-[var(--accent)] rounded-lg", 
                isDragging?"opacity-30 scale-95":"", 
                isExiting && "opacity-0 scale-90 w-0 !m-0"
            )} 
            style={{ width:isExiting?'0px':`${width}px` }}
        >
            {isDropTarget && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-3 z-50 flex items-center justify-center pointer-events-none -translate-x-1/2">
                    <div className="h-full w-1 bg-[var(--accent)] shadow-[0_0_15px_var(--accent)] rounded-full animate-pulse" />
                    <div className="absolute bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--accent)] rounded-full p-0.5 shadow-lg transform scale-75 animate-bounce">
                        <Plus size={10} strokeWidth={3} />
                    </div>
                </div>
            )}
            
            <div className={cn(
                    "h-full w-full rounded-lg border flex flex-col overflow-hidden relative shadow-sm interact-base interact-lift-sm backdrop-blur-sm", 
                    isActive ? "border-[var(--accent)] bg-[var(--bg-surface)] shadow-md z-10 scale-[1.02]" 
                    : chord.isRest ? "border-[var(--border)] bg-[var(--bg-main)] opacity-60" 
                    : "border-[var(--border)] bg-[var(--bg-element)] hover:bg-[var(--bg-surface)]"
                )}>
                 <div className="absolute inset-0 pointer-events-none flex opacity-5">{Array.from({length:Math.ceil(width/PIXELS_PER_BEAT)}).map((_,i)=><div key={i} className="h-full border-r border-[var(--text-main)] flex-1" style={{width:`${PIXELS_PER_BEAT}px`,flex:'none'}}/>)}</div>
                 {chord.isRest && <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(45deg, var(--text-muted) 25%, transparent 25%, transparent 50%, var(--text-muted) 50%, var(--text-muted) 75%, transparent 75%, transparent)',backgroundSize:'6px 6px'}}/>}
                 
                 {!chord.isRest && <div className={cn("absolute left-0 top-0 bottom-0 w-1", colorClass)} />}

                 <div className="relative z-10 pl-3 pr-1 h-full flex flex-row items-center justify-between gap-1">
                     <div className="flex flex-col justify-center leading-none min-w-0 px-1 py-1">
                        {!chord.isRest ? (
                            <>
                                <span className="font-bold tracking-tight truncate text-[var(--text-main)] text-xs">{chord.symbol}</span>
                                <span className={cn("font-mono text-[10px] uppercase tracking-wider mt-0.5", isActive?"text-[var(--accent)]":"text-[var(--text-dim)]")}>{chord.romanNumeral}</span>
                            </>
                        ) : <div className="text-[var(--text-muted)] opacity-50 ml-0.5 w-2 h-2 rounded-full border border-current"/>}
                     </div>
                     <button onClick={handleRemove} disabled={isExiting} tabIndex={-1} className="text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover/node:opacity-100 group-focus-within/node:opacity-100 interact-base interact-scale p-1 rounded hover:bg-red-500/10 shrink-0"><X size={12}/></button>
                 </div>
                 
                 {!chord.isRest && <div onMouseDown={(e)=>{e.stopPropagation();e.preventDefault();const s=e.clientX;const mv=(ev:MouseEvent)=>handleResize(ev.clientX-s);const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);handleResizeEnd()};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);}} className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize group z-50 flex items-center justify-center hover:bg-[var(--accent)]/5 interact-base"><div className="w-1 h-4 bg-[var(--text-muted)] rounded-full group-hover:bg-[var(--accent)] interact-base opacity-20 group-hover:scale-y-125"/></div>}
            </div>
            <div className="absolute -bottom-4 left-0 right-0 text-center opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none"><span className="text-[8px] font-mono font-bold text-[var(--text-muted)] bg-[var(--bg-panel)] px-1.5 py-0.5 rounded-full border border-[var(--border)] shadow-sm">{chord.duration}</span></div>
        </div>
    );
};

interface ProgressionStripProps {
    progression: Chord[];
    onRemove: (index: number) => void;
    activeIndex: number | null;
    onDropChord: (chord: Chord, index: number) => void;
    availableChords: Chord[];
    onReorder: (from: number, to: number) => void;
    onResize: (index: number, duration: number) => void;
    timeSignature: { num: number; den: number };
    draggingChord?: Chord | null;
}

export const ProgressionStrip = ({ progression, onRemove, activeIndex, onDropChord, availableChords, onReorder, onResize, timeSignature }: ProgressionStripProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState<number|null>(null);
    const [dropTarget, setDropTarget] = useState<number|null>(null);
    
    useEffect(() => { 
        if(activeIndex!==null && scrollRef.current && scrollRef.current.children.length > activeIndex){ 
            const el = scrollRef.current.children[activeIndex] as HTMLElement; 
            if(el) el.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }); 
        } 
    }, [activeIndex]);

    const timelineElements = useMemo(() => {
        const els: React.ReactNode[] = [];
        let accumulatedBeats = 0;
        const beatsPerBar = timeSignature.num;
        
        progression.forEach((c: any, i: number) => {
            els.push(
                <TimelineNode 
                    key={`node-${i}`} chord={c} index={i} isActive={i===activeIndex} onRemove={onRemove} onResize={(idx: number,d: number)=>onResize?.(idx,d)} 
                    onDragStart={(e: any)=>{
                        setDraggingIndex(i);
                        if(e.dataTransfer){
                            e.dataTransfer.setData('reorder_index',i.toString());
                            try { (e.dataTransfer as any).effectAllowed='move'; } catch(e){}
                        }
                    }} 
                    onDragEnter={()=>{if(draggingIndex!==null&&draggingIndex!==i || draggingIndex===null)setDropTarget(i)}} 
                    onDragLeave={()=>setDropTarget(null)} 
                    onDrop={(e: any)=>{
                        e.preventDefault();e.stopPropagation();setDraggingIndex(null);setDropTarget(null);
                        if(e.dataTransfer){
                            const ri=e.dataTransfer.getData('reorder_index');
                            if(ri){const si=parseInt(ri);if(!isNaN(si)&&si!==i)onReorder?.(si,i)}
                            else{try{const d=JSON.parse(e.dataTransfer.getData('application/json'));if(d.root)onDropChord(d, i)}catch(e){}}
                        }
                    }} 
                    isDropTarget={dropTarget===i} isDragging={draggingIndex===i}
                />
            );
            accumulatedBeats += c.duration;
            if (Math.abs(accumulatedBeats % beatsPerBar) < 0.01) {
                const barNum = Math.round(accumulatedBeats / beatsPerBar) + 1;
                els.push(<div key={`bar-${i}`} className="flex flex-col items-center justify-start h-12 w-px bg-[var(--border)] mx-1 relative shrink-0"><span className="absolute -top-4 text-[9px] font-bold text-[var(--text-dim)]">{barNum}</span></div>);
            }
        });
        
        const isEndTarget = dropTarget === progression.length;
        els.push(
            <div key="add-btn" 
                onClick={()=>{const t=availableChords.find((c: any)=>c.romanNumeral==='I'||c.romanNumeral==='i');if(t)onDropChord(t, progression.length)}} 
                onDragOver={(e)=>{ e.preventDefault(); setDropTarget(progression.length); if(e.dataTransfer) try {(e.dataTransfer as any).dropEffect='move';}catch(e){} }} 
                onDragLeave={()=>setDropTarget(null)}
                onDrop={(e)=>{
                    e.preventDefault(); setDropTarget(null);
                    if(e.dataTransfer){
                        const ri=e.dataTransfer.getData('reorder_index');
                        if(ri){onReorder?.(parseInt(ri),progression.length)}
                        else{try{const d=JSON.parse(e.dataTransfer.getData('application/json'));if(d.root)onDropChord(d, progression.length)}catch(e){}}
                    }
                }} 
                className={cn(
                    "h-12 w-12 shrink-0 rounded-xl border border-dashed interact-base interact-scale flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative mb-1",
                    isEndTarget ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
                )}
            >
                {isEndTarget && <div className="absolute -left-1.5 h-full w-1 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)] pointer-events-none" />}
                <Plus size={16}/>
            </div>
        );
        return els;
    }, [progression, activeIndex, draggingIndex, dropTarget, availableChords, timeSignature, onRemove, onResize, onDropChord, onReorder]);

    return (
      <div className="relative w-full h-full flex bg-[var(--bg-main)] overflow-hidden">
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[var(--bg-main)] relative select-none">
             <div className="h-full flex items-center px-6 gap-1 min-w-max" ref={scrollRef}>{timelineElements}</div>
        </div>
      </div>
    );
};
