
import React, { useState, useRef } from 'react';
import { Play, Square, ListMusic, Network, Pause, Magnet, Trash2, Lock, Unlock, Music, Activity, Layers, Hexagon, MoveVertical, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { InstrumentType, ChordComplexity, Note, ScaleType, CIRCLE_KEYS } from './lib';
import { cn, Button, IconButton, Stat, ToolbarGroup } from './ui';

// --- DRAGGABLE HOOK ---
const useDrag = (onDrag: (dy: number) => void, onEnd?: () => void) => {
    const startY = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    return {
        isDragging,
        handlers: {
            onPointerDown: (e: React.PointerEvent) => { 
                setIsDragging(true); 
                startY.current = e.clientY; 
                (e.target as Element).setPointerCapture(e.pointerId); 
            },
            onPointerMove: (e: React.PointerEvent) => { 
                if (isDragging) onDrag(e.clientY - startY.current); 
            },
            onPointerUp: (e: React.PointerEvent) => { 
                setIsDragging(false); 
                (e.target as Element).releasePointerCapture(e.pointerId); 
                if(onEnd) onEnd(); 
            }
        }
    };
};

// --- WRAPPERS ---
export const PanelWrapper = ({ minimise, children, overlay, anchor, bgColor, isDragging }: any) => (
    <div 
        className={cn(
            "relative w-full h-full overflow-hidden shadow-2xl ring-1 ring-white/5 rounded-2xl will-change-transform bg-[var(--bg-panel)] flex flex-col",
            isDragging ? "transition-none" : "transition-all duration-500 ease-[var(--ease-spring)]"
        )}
        style={{ 
            transform: `scale(${1 - (1 - (1 - minimise)) * 0.05})`, 
            transformOrigin: anchor === 'top' ? 'top center' : 'bottom center', 
            backgroundColor: bgColor 
        }}
    >
        <div 
            className="flex-1 w-full h-full transition-all duration-500 ease-[var(--ease-spring)] flex items-center justify-center overflow-hidden relative"
            style={{ 
                filter: `blur(${minimise * 16}px)`, 
                opacity: Math.max(0, 1 - minimise * 1.5), 
                pointerEvents: minimise > 0.3 ? 'none' : 'auto' 
            }}
        >
            {children}
        </div>
        <div 
            className={cn(
                "absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-300", 
                minimise > 0.5 ? "pointer-events-auto" : "pointer-events-none"
            )} 
            style={{ opacity: Math.max(0, (minimise - 0.4) * 2) }}
        >
            {minimise > 0.1 && (
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300">
                    {overlay}
                </div>
            )}
        </div>
    </div>
);

// --- DRAGGABLE PANELS ---

export const ResizableTopPanel = ({ children, minHeight, maxHeight, defaultHeight }: any) => {
    const [h, setH] = useState(defaultHeight);
    const [collapsed, setCollapsed] = useState(false);
    const startH = useRef(defaultHeight);
    
    const { isDragging, handlers } = useDrag((dy) => {
        if (collapsed && dy > 20) { setCollapsed(false); setH(minHeight); startH.current = minHeight; return; }
        const newH = Math.min(Math.max(startH.current + dy, minHeight), maxHeight);
        if (startH.current + dy < minHeight - 20) setCollapsed(true);
        else setH(newH);
    }, () => startH.current = h);

    return (
        <div 
            className={cn(
                "w-full relative z-[60] bg-[var(--bg-main)] shadow-lg transition-all ease-[var(--ease-spring)] group/panel",
                isDragging ? "duration-0" : "duration-500"
            )} 
            style={{ height: collapsed ? 12 : h + 12 }}
        >
            <div 
                className={cn(
                    "w-full overflow-hidden transition-all duration-500 ease-[var(--ease-spring)] pb-3 border-b border-[var(--border)]", 
                    collapsed ? "opacity-0 -translate-y-4" : "opacity-100"
                )} 
                style={{ height: h }}
            >
                {children}
            </div>
            
            {/* DRAG HANDLE */}
            <div 
                className="absolute bottom-0 inset-x-0 h-3 flex items-center justify-center cursor-row-resize hover:bg-white/5 group/handle interact-base" 
                onClick={() => setCollapsed(!collapsed)}
                {...handlers}
            >
                <div 
                    className={cn(
                        "w-16 h-1 rounded-full bg-[var(--border)] group-hover/handle:bg-[var(--accent)] transition-all duration-300 opacity-50 group-hover/handle:opacity-100", 
                        isDragging && "w-24 bg-[var(--accent)] opacity-100"
                    )} 
                />
            </div>
        </div>
    );
};

export const SplitView = ({ top, bottom, topOverlay, bottomOverlay }: any) => {
    const [split, setSplit] = useState(0.5);
    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    const onMove = (e: React.PointerEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const raw = (e.clientY - rect.top) / rect.height;
        // Adjusted detents for better feel
        const detents = [0.15, 0.5, 0.85];
        let snap = raw;
        for (const d of detents) {
            if (Math.abs(raw - d) < 0.05) {
                snap = d;
                break;
            }
        }
        setSplit(Math.max(0.1, Math.min(0.9, snap)));
    };

    return (
        <div ref={ref} className="absolute inset-0 flex flex-col bg-black">
            <div 
                className={cn(
                    "relative min-h-0 w-full p-2 pb-1 transition-all ease-[var(--ease-spring)]",
                    isDragging ? "duration-0" : "duration-500"
                )} 
                style={{ flex: split }}
            >
                <PanelWrapper 
                    minimise={split < 0.3 ? 1-((split-0.05)/0.25) : 0} 
                    overlay={topOverlay} 
                    anchor="bottom" 
                    bgColor="var(--bg-panel)"
                    isDragging={isDragging}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        {top}
                    </div>
                </PanelWrapper>
            </div>
            
            {/* SPLITTER HANDLE: CHEVRON BISECTING LINE */}
            <div 
                className="relative h-4 -my-2 z-50 flex items-center justify-center cursor-row-resize group interact-base select-none touch-none"
                onPointerDown={(e) => { 
                    setIsDragging(true); 
                    (e.target as Element).setPointerCapture(e.pointerId); 
                }}
                onPointerMove={(e) => { 
                    if(isDragging) onMove(e); 
                }}
                onPointerUp={(e) => { 
                    setIsDragging(false); 
                    (e.target as Element).releasePointerCapture(e.pointerId); 
                }}
            >
                 <div className="absolute inset-x-4 h-px bg-[var(--border)] group-hover:bg-[var(--accent)] transition-colors opacity-50 group-hover:opacity-100" />
                 
                 <div 
                    className={cn(
                        "relative z-10 bg-[var(--bg-main)] border border-[var(--border)] rounded-full p-0.5 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] text-[var(--text-dim)] transition-all shadow-sm",
                        isDragging ? "border-[var(--accent)] text-[var(--accent)] scale-110 shadow-[0_0_15px_rgba(209,58,52,0.3)]" : "scale-100"
                    )}
                 >
                     <ChevronsUpDown size={12} strokeWidth={2.5} />
                 </div>
            </div>

            <div 
                className={cn(
                    "relative min-h-0 w-full p-2 pt-1 transition-all ease-[var(--ease-spring)]",
                    isDragging ? "duration-0" : "duration-500"
                )} 
                style={{ flex: 1 - split }}
            >
                <PanelWrapper 
                    minimise={split > 0.7 ? (split-0.7)/0.25 : 0} 
                    overlay={bottomOverlay} 
                    anchor="top" 
                    bgColor="var(--bg-panel)"
                    isDragging={isDragging}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        {bottom}
                    </div>
                </PanelWrapper>
            </div>
        </div>
    );
};

// --- CONTROL PANEL ---
export const ControlPanel = (p: any) => (
    <div className="w-full h-full flex flex-col p-2 gap-2 select-none">
        {/* ROW 1 */}
        <div className="flex items-center gap-2 h-9 overflow-x-auto scrollbar-hide shrink-0 min-w-0">
            <ToolbarGroup className="pl-2 pr-1 gap-2">
                <select value={p.currentKey} onChange={e => p.setKey(e.target.value as Note)} className="bg-transparent text-sm font-black text-[var(--text-main)] outline-none cursor-pointer appearance-none hover:text-[var(--accent)] text-center w-6">{CIRCLE_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</select>
                <select value={p.scale} onChange={e => p.setScale(e.target.value as ScaleType)} className="bg-transparent text-xs font-bold text-[var(--text-muted)] outline-none cursor-pointer appearance-none hover:text-white uppercase w-20 truncate">{Object.values(ScaleType).map(s=><option key={s} value={s}>{s}</option>)}</select>
                <div className="w-px h-4 bg-[var(--border)]" />
                <IconButton icon={p.isScaleLocked ? Lock : Unlock} size="sm" onClick={p.toggleScaleLock} className={p.isScaleLocked ? "text-[var(--accent)]" : "text-[var(--text-dim)]"} />
            </ToolbarGroup>

            <div className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity min-w-0 shrink">
                <Stat label="Vibe" value={p.scaleMeta.desc} icon={Music} color="text-yellow-400" />
                <Stat label="Char" value={p.scaleMeta.characteristic} icon={Hexagon} color="text-purple-400" />
                <Stat label="Mood" value={p.analysis.vibe} icon={Activity} color="text-blue-400" />
            </div>
            <div className="flex-1 min-w-[8px]" />
            
            <ToolbarGroup className="ml-auto">
                {[ {id:'sequencer', icon: ListMusic, label:'Seq'}, {id:'harmony', icon: Network, label:'Map'} ].map(v => (
                    <button key={v.id} onClick={() => p.setView(v.id)} className={cn("px-2 py-1 rounded-md flex items-center gap-1.5 text-[9px] font-bold uppercase transition-all whitespace-nowrap", p.view===v.id ? "bg-[var(--bg-surface)] text-white shadow-sm" : "text-[var(--text-dim)] hover:text-white")}>
                        <v.icon size={10} /> {v.label} {v.id==='sequencer' && <span className="opacity-50">{p.progressionCount}</span>}
                    </button>
                ))}
            </ToolbarGroup>
        </div>

        {/* ROW 2 */}
        <div className="flex items-center gap-2 h-9 overflow-x-auto scrollbar-hide shrink-0 min-w-0">
            <ToolbarGroup>
                <Button onClick={p.togglePlay} className={cn("w-10 h-6", p.isPlaying && "bg-[var(--accent)] text-black")}>{p.isPlaying ? <Pause size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}</Button>
                <div className="w-px h-4 bg-[var(--border)] mx-1" />
                <IconButton size="sm" onClick={p.onRest} icon={Pause} className="rotate-90" title="Rest" />
                <IconButton size="sm" onClick={p.onSnap} icon={Magnet} title="Snap" />
                <IconButton size="sm" onClick={p.onClear} icon={Trash2} variant="danger" title="Clear" />
            </ToolbarGroup>

            <ToolbarGroup>
                {['triad', '7th', '9th', '11th'].map(c => (
                    <button key={c} onClick={() => p.setComplexity(c as ChordComplexity)} className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase transition-all whitespace-nowrap", p.complexity===c ? "bg-[var(--accent)] text-black" : "text-[var(--text-dim)] hover:text-white")}>{c}</button>
                ))}
            </ToolbarGroup>
            <div className="flex-1 min-w-[8px]" />

            <ToolbarGroup className="ml-auto">
                {[ {id:'rhodes', icon: Square}, {id:'pad', icon: Layers}, {id:'pluck', icon: Music}, {id:'synth', icon: Activity} ].map(i => (
                    <button key={i.id} onClick={() => p.setInstrument(i.id as InstrumentType)} className={cn("w-7 h-6 flex items-center justify-center rounded transition-all", p.instrument===i.id ? "text-[var(--accent)] bg-[var(--bg-surface)]" : "text-[var(--text-dim)] hover:text-white")}><i.icon size={12}/></button>
                ))}
            </ToolbarGroup>
        </div>
    </div>
);
