

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Square, Gauge, Zap, Activity, Music, Plus, X, Sparkles, Loader2, PanelLeft, Trash2, Magnet, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, BoxSelect, Layers, ArrowRight, Volume2, Mic2, Move, Grid, Layout, ListMusic, Orbit, Wrench, Lock, Unlock, ArrowUpDown, Info, Heart, SortAsc, AlignLeft, Hash, ChevronsUp, Minus, Maximize2, MousePointer2, Thermometer, Sliders, ChevronLeft, ChevronRight, Settings2, Network, Hexagon, GripVertical } from 'lucide-react';
import { 
  CIRCLE_KEYS, Chord, Note, ScaleType, SplitAccessory,
  generateOrbitalLayout, generateSecondaryDominants, generateBorrowedChords,
  buildChord, InstrumentType, getCompassLabel, SCALE_DEFS, getTempoFromArousal, getMusicalCharacteristics,
  EMOTIONAL_ZONES, getHarmonicSuggestions, CHROMATIC_SHARPS, estimateChordSentiment
} from './lib';

// --- UTILITIES ---

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * Creates a custom ghost element for drag operations.
 */
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
    // Tonic (I, iii, vi) - Stable, Home
    if (['i', 'iii', 'vi'].includes(r)) return 'bg-emerald-500/80 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'; 
    // Subdominant (IV, ii) - Moving, Predominant
    if (['ii', 'iv'].includes(r)) return 'bg-sky-500/80 border-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.2)]'; 
    // Dominant (V, vii) - Tense, Leading
    if (['v', 'vii'].includes(r)) return 'bg-rose-500/80 border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    return 'bg-[var(--bg-element)] border-[var(--border)]';
};

// --- UI PRIMITIVES ---

export interface TypoProps {
    variant?: 'h1'|'h2'|'h3'|'label'|'mono'|'body'|'sub';
    as?: any;
    children?: React.ReactNode;
    className?: string;
}

export const Typo = ({ variant='body', as, children, className }: TypoProps) => {
    const Component = as || (variant?.startsWith('h') ? variant : 'div');
    const s = { 
      h1: "text-2xl font-light text-[var(--text-main)]", h2: "text-lg font-medium text-[var(--text-main)]", h3: "text-sm font-medium text-[var(--text-main)]", 
      label: "text-[9px] font-black uppercase tracking-wider text-[var(--text-dim)]", mono: "font-mono text-[10px] text-[var(--text-muted)]", 
      body: "text-sm text-[var(--text-muted)] leading-relaxed", sub: "text-xs text-[var(--text-dim)]" 
    };
    return <Component className={cn(s[variant || 'body'], className)}>{children}</Component>;
};

export interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'panel'|'element'|'card'|'ghost'|'tooltip';
    interactive?: boolean;
    active?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const Surface = ({ children, className, interactive, variant='panel', active, ...props }: SurfaceProps) => {
    const v = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", 
      element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg shadow-sm", 
      card: "bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl shadow-sm", 
      ghost: "bg-transparent border border-transparent rounded-lg", 
      tooltip: "bg-[#09090b]/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg z-[100] text-xs text-[var(--text-main)] px-3 py-2 pointer-events-none" 
    };
    return <div className={cn("interact-base", v[variant], interactive && "cursor-pointer interact-lift", active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary'|'secondary'|'ghost'|'danger';
    size?: 'sm'|'md'|'icon';
    icon?: any;
    active?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({ variant='secondary', size='md', className, children, icon: Icon, active, ...props }: ButtonProps) => {
    const v = { primary: "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 border border-transparent", secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border border-[var(--border)]", ghost: "bg-transparent text-[var(--text-muted)] border border-transparent", danger: "bg-red-500/10 text-red-400 border border-red-500/20" };
    const s = { sm: "px-2 py-0 h-7 text-[10px]", md: "px-4 py-2 text-sm h-10", icon: "p-2 h-8 w-8" };
    const interactionClass = (variant === 'ghost' || size === 'icon') ? 'interact-scale' : 'interact-push';
    return <button className={cn("flex items-center justify-center gap-1.5 rounded-md font-medium interact-base disabled:opacity-50 disabled:pointer-events-none outline-none select-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-black", v[variant], s[size], interactionClass, active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)]", className)} {...props}>{Icon && <Icon size={14}/>}{children}</button>;
};

export const IconButton = ({size='icon', ...props}: ButtonProps) => <Button size={size} variant="ghost" {...props} />;

export const Input = ({variant='default', size='md', className, ...props}: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {variant?:'default'|'ghost', size?:'sm'|'md'}) => 
  <input className={cn("font-bold outline-none interact-base interact-input focus:ring-2 focus:ring-[var(--accent)]", size==='sm'?"h-7 text-[11px] px-2 rounded-[6px]":"h-8 text-xs px-3 rounded-md", variant==='default'?"bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-hover)] placeholder:text-[var(--text-dim)] shadow-sm":"bg-transparent border border-transparent text-[var(--text-main)] hover:bg-[var(--bg-element)]", className)} {...props}/>;

export const Select = ({variant='default', size='md', className, ...props}: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {variant?:'default'|'ghost', size?:'sm'|'md'}) => 
  <div className="relative group w-full"><select className={cn("appearance-none w-full font-bold outline-none interact-base interact-input cursor-pointer focus:ring-2 focus:ring-[var(--accent)]", size==='sm'?"h-7 text-[11px] px-2 rounded-[6px] pr-5":"h-8 text-xs px-3 rounded-md pr-8", variant==='default'?"bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-hover)] shadow-sm":"bg-transparent border border-transparent text-[var(--text-main)] hover:bg-[var(--bg-element)]", className)} {...props}/><div className="absolute right-1 top-1/2 -translate-x-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-main)] interact-base"><ChevronDown size={size==='sm'?12:14}/></div></div>;

export const Badge = ({children, variant='default', className}: {children?:React.ReactNode, variant?:'default'|'outline'|'accent'|'scientific', className?:string}) => 
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none interact-base", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"bg-transparent border-[var(--border)] text-[var(--text-muted)]":variant==='scientific'?"bg-[var(--bg-main)] border-[var(--accent)] text-[var(--accent)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>;

// --- LAYOUT COMPONENTS ---

interface PanelWrapperProps {
    minimise: number;
    isFull: boolean;
    bgColor: string;
    children?: React.ReactNode;
    overlay: React.ReactNode;
    anchor: 'top' | 'bottom';
}

export const PanelWrapper = ({ minimise, isFull, bgColor, children, overlay, anchor }: PanelWrapperProps) => {
    const scale = 1 - (1 - (1 - minimise)) * 0.15;
    const blurRadius = minimise * 8;
    const borderRadius = isFull ? (minimise > 0 ? 32 : 0) : 32;
    const overlayOpacity = Math.pow(minimise, 3);
    const contentOpacity = Math.pow(1 - minimise, 2);

    return (
        <div 
            className="relative w-full h-full overflow-hidden interact-base"
            style={{
                borderRadius: `${borderRadius}px`,
                transform: `scale(${scale})`,
                transformOrigin: anchor === 'top' ? 'top center' : 'bottom center',
                backgroundColor: bgColor,
            }}
        >
            <div 
                className="w-full h-full interact-base"
                style={{ 
                    filter: `blur(${blurRadius}px)`,
                    opacity: contentOpacity,
                    pointerEvents: minimise > 0.5 ? 'none' : 'auto'
                }}
            >
                {children}
            </div>
            
            <div 
                className="absolute left-0 right-0 h-[68px] flex items-center px-6 interact-base"
                style={{
                    [anchor]: 0,
                    opacity: overlayOpacity,
                    transform: `translateY(${anchor === 'top' ? (1 - minimise) * 20 : (minimise - 1) * 20}px) scale(${1 + (1-minimise)*0.1})`,
                    pointerEvents: minimise > 0.5 ? 'auto' : 'none'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-panel)] via-transparent to-[var(--bg-panel)] opacity-50 z-0" />
                <div className="relative z-10 w-full">{overlay}</div>
            </div>
            
            <div className="absolute inset-0 pointer-events-none interact-base" style={{ backgroundColor: 'black', opacity: minimise * 0.1 }} />
        </div>
    );
};

export const ComplicationDragBar = ({ onDragStart, isDragging }: { onDragStart: (e: any) => void, isDragging: boolean }) => {
    return (
        <div 
            className="absolute left-0 right-0 h-10 -mt-5 z-[100] flex items-center justify-center cursor-row-resize touch-none group select-none pointer-events-auto"
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            aria-label="Drag to resize panels"
        >
            <div 
                className={cn(
                    "w-12 h-1.5 rounded-full bg-[var(--border)] transition-all duration-300 shadow-sm backdrop-blur-sm border border-black/10 interact-base",
                    "group-hover:bg-[var(--text-muted)] group-hover:w-16 group-hover:h-2",
                    isDragging ? "bg-[var(--accent)] w-20 h-2 shadow-[0_0_15px_var(--accent)]" : ""
                )} 
            />
        </div>
    );
};

// --- SEQUENCER COMPONENTS ---

const PIXELS_PER_BEAT = 40, SNAP_GRID = 0.25;

interface TimelineNodeProps {
    chord: Chord;
    index: number;
    isActive: boolean;
    onRemove: (i: number) => void;
    onResize: (i: number, beats: number) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
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
                 {/* Grid Background */}
                 <div className="absolute inset-0 pointer-events-none flex opacity-5">{Array.from({length:Math.ceil(width/PIXELS_PER_BEAT)}).map((_,i)=><div key={i} className="h-full border-r border-[var(--text-main)] flex-1" style={{width:`${PIXELS_PER_BEAT}px`,flex:'none'}}/>)}</div>
                 {chord.isRest && <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(45deg, var(--text-muted) 25%, transparent 25%, transparent 50%, var(--text-muted) 50%, var(--text-muted) 75%, transparent 75%, transparent)',backgroundSize:'6px 6px'}}/>}
                 
                 {/* Function Color Strip */}
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

export interface ProgressionStripProps {
    progression: Chord[];
    onRemove: (i: number) => void;
    activeIndex: number | null;
    onDropChord: (c: Chord, index?: number) => void;
    draggingChord: Chord | null;
    availableChords: Chord[];
    onLoadTemplate?: (c: Chord[]) => void;
    onClear?: () => void;
    onQuantize?: () => void;
    isPlaying?: boolean;
    onReorder?: (from: number, to: number) => void;
    onResize?: (index: number, duration: number) => void;
    timeSignature: { num: number, den: number };
    onSetTimeSignature: (ts: { num: number, den: number }) => void;
}

export const ProgressionStrip = ({ progression, onRemove, activeIndex, onDropChord, availableChords, onReorder, onResize, timeSignature, onSetTimeSignature, onClear, onQuantize }: ProgressionStripProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [draggingIndex, setDraggingIndex] = useState<number|null>(null);
    const [dropTarget, setDropTarget] = useState<number|null>(null);
    const [sidebarWidth, setSidebarWidth] = useState(70);
    
    useEffect(() => { 
        if(activeIndex!==null && scrollRef.current && scrollRef.current.children.length > activeIndex){ 
            const el = scrollRef.current.children[activeIndex] as HTMLElement; 
            if(el) el.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }); 
        } 
    }, [activeIndex]);

    const cycleTimeSignature = () => { const common=[{n:4,d:4},{n:3,d:4},{n:6,d:8},{n:5,d:4},{n:7,d:8}]; const idx=common.findIndex(t=>t.n===timeSignature.num && t.d===timeSignature.den); const n=common[(idx+1)%common.length]; onSetTimeSignature({num:n.n,den:n.d}); };
    
    const handleSidebarResize = (e: React.MouseEvent | React.TouchEvent) => {
        const isTouch = 'touches' in e;
        if (!isTouch) e.preventDefault();
        const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const startWidth = sidebarWidth;
        const onMove = (clientX: number) => { setSidebarWidth(Math.max(60, Math.min(140, startWidth + (clientX - startX)))); };
        const mouseMove = (ev: MouseEvent) => onMove(ev.clientX);
        const touchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientX);
        const stop = () => { if (isTouch) { document.removeEventListener('touchmove', touchMove); document.removeEventListener('touchend', stop); } else { document.removeEventListener('mousemove', mouseMove); document.addEventListener('mouseup', stop); } };
        if (isTouch) { document.addEventListener('touchmove', touchMove); document.addEventListener('touchend', stop); } else { document.addEventListener('mousemove', mouseMove); document.addEventListener('mouseup', stop); }
    };

    const timelineElements = useMemo(() => {
        const els: React.ReactNode[] = [];
        let accumulatedBeats = 0;
        const beatsPerBar = timeSignature.num;
        
        progression.forEach((c, i) => {
            els.push(
                <TimelineNode 
                    key={`node-${i}`} chord={c} index={i} isActive={i===activeIndex} onRemove={onRemove} onResize={(idx,d)=>onResize?.(idx,d)} 
                    onDragStart={(e)=>{
                        setDraggingIndex(i);
                        if(e.dataTransfer){
                            e.dataTransfer.setData('reorder_index',i.toString());
                            try { (e.dataTransfer as any).effectAllowed='move'; } catch(e){}
                        }
                    }} 
                    onDragEnter={()=>{if(draggingIndex!==null&&draggingIndex!==i || draggingIndex===null)setDropTarget(i)}} 
                    onDragLeave={()=>setDropTarget(null)} 
                    onDrop={(e)=>{
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
                onClick={()=>{const t=availableChords.find(c=>c.romanNumeral==='I'||c.romanNumeral==='i');if(t)onDropChord(t)}} 
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
        <div style={{width:sidebarWidth}} className="border-r border-[var(--border)] bg-[var(--bg-panel)] flex flex-col items-center py-3 px-2 gap-4 shrink-0 h-full z-20 shadow-xl select-none relative transition-none">
            <div onMouseDown={handleSidebarResize} onTouchStart={handleSidebarResize} className="absolute top-0 right-0 bottom-0 w-8 -mr-4 cursor-col-resize z-50 flex justify-center group/resize touch-none"><div className="w-px h-full bg-transparent group-hover/resize:bg-[var(--accent)] interact-base opacity-50"/></div>
            
            <div className="w-full flex flex-col gap-2">
                <Typo variant="label" className="text-center opacity-70">Signature</Typo>
                <button onClick={cycleTimeSignature} className="w-full aspect-square bg-[var(--bg-surface)] border border-[var(--border)] interact-lift rounded-xl flex flex-col items-center justify-center cursor-pointer group select-none relative overflow-hidden focus:ring-2 focus:ring-[var(--accent)] outline-none shadow-sm" aria-label={`Change Time Signature. Current: ${timeSignature.num} over ${timeSignature.den}`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 interact-base pointer-events-none"/>
                    <span className="text-xl font-black leading-none text-[var(--text-main)] group-hover:text-[var(--accent)] interact-base translate-y-0.5">{timeSignature.num}</span>
                    <div className="w-6 h-0.5 bg-[var(--border)] my-0.5 group-hover:bg-[var(--accent)] transition-colors"/>
                    <span className="text-xl font-black leading-none text-[var(--text-main)] group-hover:text-[var(--accent)] interact-base -translate-y-0.5">{timeSignature.den}</span>
                </button>
            </div>
            
            <div className="mt-auto w-full flex flex-col gap-2">
                <Button variant="ghost" size="sm" onClick={onClear} className="w-full justify-start text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10" aria-label="Clear All">
                    <Trash2 size={12}/> <span className="ml-1">Clear</span>
                </Button>
                <Button variant="ghost" size="sm" onClick={onQuantize} className="w-full justify-start text-[var(--text-muted)] hover:text-[var(--accent)]" aria-label="Quantize">
                    <Magnet size={12}/> <span className="ml-1">Snap</span>
                </Button>
            </div>
        </div>
        
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[var(--bg-main)] relative select-none">
             <div className="h-full flex items-center px-6 gap-1 min-w-max" ref={scrollRef}>{timelineElements}</div>
        </div>
      </div>
    );
};

// --- FEATURE COMPONENTS ---

export interface HeaderProps {
    isPlaying: boolean;
    togglePlay: () => void;
    theme: string;
    toggleTheme: () => void;
    instrument: InstrumentType;
    setInstrument: (i: InstrumentType) => void;
    keyNote: Note;
    scale: ScaleType;
    bpm: number;
    view: string;
    setView: (v: string) => void;
    progressionCount: number;
}

const INSTRUMENTS: {id: InstrumentType, label: string, icon: any, desc: string}[] = [
  {id:'rhodes', label:'Electric Keys', icon:Music, desc:'Warm, bell-like tones'},
  {id:'pad', label:'Ethereal Pad', icon:Activity, desc:'Sustained atmospheric wash'},
  {id:'pluck', label:'Glass Pluck', icon:Zap, desc:'Short, sharp, percussive'},
  {id:'synth', label:'Analog Synth', icon:Music, desc:'Rich harmonics'} 
];

export const Header = ({ isPlaying, togglePlay, theme, toggleTheme, instrument, setInstrument, keyNote, scale, bpm, view, setView, progressionCount }: HeaderProps) => (
    <div className="h-[68px] flex items-center px-4 gap-4 bg-[var(--bg-panel)] shrink-0 z-30 select-none border-b border-[var(--border)] backdrop-blur-md bg-opacity-90">
        {/* Playback Group */}
        <Surface variant="element" className="flex items-center p-1 gap-2 rounded-full pr-4 shadow-md bg-[var(--bg-surface)]">
            <Button onClick={togglePlay} variant="primary" size="icon" className="h-9 w-9 rounded-full shadow-lg shadow-red-500/20 interact-scale" aria-label={isPlaying ? "Stop" : "Play"}>
                {isPlaying ? <Square fill="currentColor" size={14}/> : <Play fill="currentColor" className="ml-0.5" size={14}/>}
            </Button>
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-wider">Transport</span>
                <span className={cn("text-xs font-mono font-medium leading-none", isPlaying ? "text-[var(--accent)] animate-pulse" : "text-[var(--text-main)]")}>{isPlaying ? "PLAYING" : "READY"}</span>
             </div>
        </Surface>

        <div className="h-8 w-px bg-[var(--border)] mx-2 opacity-50"/>

        {/* View Switcher - Segmented Control Style */}
        <Surface variant="element" className="p-1 rounded-lg flex items-center gap-1 shadow-inner bg-[var(--bg-panel)]">
            <button 
                onClick={() => setView('sequencer')}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all interact-base relative",
                    view === 'sequencer' ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm border border-[var(--border)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5"
                )}
            >
                <ListMusic size={14} />
                <span>Sequencer</span>
                {progressionCount > 0 && (
                    <span className="ml-1 text-[9px] px-1 rounded-sm font-mono bg-[var(--bg-main)] text-[var(--text-dim)]">{progressionCount}</span>
                )}
            </button>
            <button 
                onClick={() => setView('harmony')}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all interact-base",
                    view === 'harmony' ? "bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm border border-[var(--border)]" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5"
                )}
            >
                <Network size={14} />
                <span>Harmony</span>
            </button>
        </Surface>

        <div className="flex-1" />

        {/* Read-Only Status Display */}
        <Surface variant="element" className="flex items-center p-1 px-3 gap-4 rounded-xl h-12 shadow-sm bg-[var(--bg-surface)] opacity-80 hover:opacity-100 transition-opacity">
             <div className="flex flex-col gap-0.5">
                 <label className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-wider">Tonality</label>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[var(--text-main)]">{keyNote}</span>
                    <span className="text-xs font-medium text-[var(--text-muted)]">{scale}</span>
                 </div>
             </div>
             <div className="w-px h-8 bg-[var(--border)]"/>
             <div className="flex flex-col gap-0.5 min-w-[50px]">
                 <label className="text-[8px] font-black text-[var(--text-dim)] uppercase tracking-wider">Tempo</label>
                 <div className="flex items-center gap-1">
                    <span className="text-xs font-mono font-bold text-[var(--text-main)]">{bpm}</span>
                    <span className="text-[9px] text-[var(--text-muted)]">BPM</span>
                 </div>
             </div>
        </Surface>

        <div className="flex-1" />

        {/* Instruments & Theme */}
        <Surface variant="element" className="flex items-center p-1 gap-1 rounded-xl h-11 bg-[var(--bg-panel)] shadow-inner">
             {INSTRUMENTS.map(i => (
                 <button key={i.id} onClick={()=>setInstrument(i.id)} className={cn("p-2 rounded-lg interact-scale relative group focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all", instrument===i.id?"bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm ring-1 ring-[var(--border)]":"text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5")} title={i.label} aria-label={`Select Instrument: ${i.label}`}>
                     <i.icon size={16}/>
                 </button>
             ))}
        </Surface>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)] w-10 h-10" aria-label="Toggle Theme">{theme==='dark'?<Sparkles size={16}/>:<Sparkles size={16} className="fill-current"/>}</Button>
    </div>
);

// --- TONNETZ GRID ---

interface TonnetzGridProps {
    currentKey: Note;
    scaleType: ScaleType;
    chords: Chord[];
    onAddChord: (c: Chord) => void;
    onChordClick: (c: Chord) => void;
    mood: { valence: number, arousal: number, tension: number };
    contextChord: Chord | null;
    secondaryDominants: Chord[];
    suggestedIndices: number[];
}

const TonnetzGrid = ({ currentKey, scaleType, chords, onAddChord, onChordClick, mood, contextChord, secondaryDominants, suggestedIndices }: TonnetzGridProps) => {
    // --- GEOMETRY CONSTANTS ---
    const GRID_SIZE = 6; 
    const SPACING = 80;
    const X_VEC = { x: SPACING * 1, y: 0 }; // Perfect Fifth
    const Y_VEC = { x: SPACING * 0.5, y: SPACING * 0.866 }; // Major Third
    
    // Zoom / Pan State
    const containerRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState<{x:number, y:number} | null>(null);
    const [lastPinchDist, setLastPinchDist] = useState<number | null>(null);

    // Interaction State
    const [hoveredTri, setHoveredTri] = useState<any|null>(null);
    const longPressTimerRef = useRef<any>(null);
    const isLongPressRef = useRef(false);

    // Reset view when key changes to center
    useEffect(() => {
        setView({ x: 0, y: 0, k: 1 });
    }, [currentKey]);

    // Zoom Handlers
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = Math.min(Math.max(view.k * (1 + delta), 0.5), 4);
        setView(prev => ({ ...prev, k: newScale }));
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'touch' && !e.isPrimary) return;
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !lastPos) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setView(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };
    
    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
             const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
             if (lastPinchDist !== null) {
                 const scaleFactor = dist / lastPinchDist;
                 const newScale = Math.min(Math.max(view.k * scaleFactor, 0.5), 4);
                 setView(prev => ({ ...prev, k: newScale }));
             }
             setLastPinchDist(dist);
             e.preventDefault(); 
        }
    };
    
    const handleTouchEnd = () => { setLastPinchDist(null); };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        setLastPos(null);
        (e.target as Element).releasePointerCapture(e.pointerId);
    };

    // Helper to get note from grid coords
    const getNoteAt = (kx: number, ky: number, centerKeyIndex: number) => {
        const semitones = (centerKeyIndex + (kx * 7) + (ky * 4)) % 12;
        const normalized = (semitones + 12) % 12;
        return CHROMATIC_SHARPS[normalized];
    };

    const centerKeyIndex = useMemo(() => CHROMATIC_SHARPS.indexOf(currentKey.replace('b', '#') === 'Eb' ? 'D#' : currentKey.replace(/b/g, '') === 'F' ? 'F' : currentKey.length > 1 && currentKey.includes('b') ? CHROMATIC_SHARPS[(CHROMATIC_SHARPS.indexOf(currentKey)+11)%12] : currentKey), [currentKey]); 

    // Generate Grid Points
    const gridPoints = useMemo(() => {
        const points = [];
        for (let x = -GRID_SIZE; x <= GRID_SIZE; x++) {
            for (let y = -GRID_SIZE; y <= GRID_SIZE; y++) {
                if (Math.abs(x + y) > GRID_SIZE + 3) continue; 
                points.push({
                    gx: x, gy: y,
                    sx: (x * X_VEC.x) + (y * Y_VEC.x),
                    sy: (x * X_VEC.y) + (y * Y_VEC.y),
                    note: getNoteAt(x, y, centerKeyIndex)
                });
            }
        }
        return points;
    }, [centerKeyIndex]);

    const emotionMap = SCALE_DEFS[scaleType]?.emotions || {};

    // Generate Triangles (Chords)
    const triangles = useMemo(() => {
        const tris = [];
        gridPoints.forEach(p => {
            const createTri = (type: 'Major'|'Minor', pts: any[]) => {
                // Determine chord metadata
                let diatonic = chords.find(c => c.root === p.note && c.quality === type);
                let secondary = secondaryDominants.find(c => c.root === p.note && c.quality === type);
                
                let chordInfo = diatonic || secondary;
                
                const isChromatic = !diatonic && !secondary;
                
                // Safe Fallback for Chromatic Chords (prevents undefined access crash)
                const fallbackChord: Chord = { 
                    root: p.note, 
                    quality: type, 
                    symbol: `${p.note}${type==='Minor'?'m':''}`,
                    romanNumeral: '?', // Required
                    extension: '',
                    suffix: type === 'Minor' ? 'm' : '',
                    notes: [],
                    interval: -1,
                    duration: 0
                };
                
                // Use fallback if chordInfo is null
                const safeChordInfo = chordInfo || fallbackChord;

                const isSuggested = chordInfo && chordInfo.interval !== undefined && chordInfo.interval !== -1 ? suggestedIndices.includes(chordInfo.interval) : false;

                return {
                    type,
                    root: p.note,
                    points: pts,
                    center: {
                        x: (pts[0].x + pts[1].x + pts[2].x) / 3,
                        y: (pts[0].y + pts[1].y + pts[2].y) / 3
                    },
                    id: `${type}-${p.gx}-${p.gy}`,
                    diatonic,
                    secondary,
                    isSuggested,
                    isChromatic,
                    chordInfo: safeChordInfo
                };
            };

            // Major Triad (Point Up)
            tris.push(createTri('Major', [
                { x: p.sx, y: p.sy },
                { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y },
                { x: p.sx + Y_VEC.x, y: p.sy + Y_VEC.y }
            ]));

            // Minor Triad (Point Down)
            tris.push(createTri('Minor', [
                { x: p.sx, y: p.sy },
                { x: p.sx + X_VEC.x, y: p.sy + X_VEC.y },
                { x: p.sx + X_VEC.x - Y_VEC.x, y: p.sy + X_VEC.y - Y_VEC.y }
            ]));
        });
        return tris;
    }, [gridPoints, chords, secondaryDominants, suggestedIndices]);

    // --- MOOD STYLES ---
    const getFillColor = (t: any, isHover: boolean, isActive: boolean) => {
        if (isActive) return 'var(--accent)';
        
        // Non-diatonic (Ghost)
        if (t.isChromatic) return isHover ? 'rgba(255,255,255,0.1)' : 'rgba(20,20,20,0.5)';
        
        // Secondary Dominants
        if (t.secondary) return isHover ? 'rgba(236, 72, 153, 0.6)' : 'rgba(236, 72, 153, 0.25)';

        // Diatonic Logic
        const v = mood.valence;
        const a = mood.arousal; 

        let opacity = 0.3 + (Math.max(0, a + 0.5) * 0.4); 
        if (isHover) opacity = Math.min(0.9, opacity + 0.3);

        if (t.type === 'Major') {
            if (v > 0.2) return `rgba(255, 255, ${200 + (v * 55)}, ${opacity})`; 
            if (v < -0.2) return `rgba(${255 + (v * 50)}, ${140 + (v * 50)}, 50, ${opacity})`;
            return `rgba(255, 215, 0, ${opacity})`; 
        } else {
            if (v > 0.2) return `rgba(${50 - (v * 20)}, ${200 + (v * 20)}, 255, ${opacity})`; 
            if (v < -0.2) return `rgba(${30}, ${30}, ${100 - (v * 30)}, ${opacity})`;
            return `rgba(99, 102, 241, ${opacity})`; 
        }
    };

    const strokeWidth = 1 + (mood.tension * 3);
    const tensionBlur = mood.tension > 0.6 ? `url(#glow-blur-${mood.tension > 0.8 ? 'strong' : 'weak'})` : 'none';

    // Touch Logic for Long Press Tooltip
    const handleTouchStartTri = (t: any) => {
        isLongPressRef.current = false;
        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setHoveredTri(t);
        }, 500); // 500ms long press
    };

    const handleTouchEndTri = (e: React.TouchEvent) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (isLongPressRef.current) {
            e.preventDefault(); // Prevent click
            // Don't clear hoveredTri immediately if we want them to see it, 
            // but standard behavior is usually hold-to-see. 
            // Let's clear it to match "Hold" behavior.
            setHoveredTri(null);
        }
        // If not long press, click handler will fire natively on many devices, or we can trigger manually if needed.
    };

    return (
        <div 
            ref={containerRef}
            className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center cursor-move active:cursor-grabbing touch-none select-none"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={(e) => e.preventDefault()} // Disable native context menu
        >
             <style>
                 {`
                   @keyframes subtle-shake {
                     0%, 100% { transform: translate(0, 0); }
                     25% { transform: translate(${mood.tension}px, ${mood.tension}px); }
                     50% { transform: translate(-${mood.tension}px, ${mood.tension}px); }
                     75% { transform: translate(-${mood.tension}px, -${mood.tension}px); }
                   }
                   .tension-shake {
                     animation: subtle-shake ${1.1 - mood.tension}s infinite linear;
                   }
                 `}
             </style>
             <svg className="w-full h-full overflow-visible" viewBox="-400 -300 800 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                    <filter id="glow-blur-weak">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <filter id="glow-blur-strong">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <g 
                    transform={`translate(${view.x}, ${view.y}) scale(${view.k})`} 
                    className={cn("transition-transform duration-75 ease-out origin-center", mood.tension > 0.3 && "tension-shake")} 
                    style={{ filter: tensionBlur }}
                >
                    {/* Edges - Dimmed for chromatic areas */}
                    {gridPoints.map(p => (
                        <React.Fragment key={`edges-${p.gx}-${p.gy}`}>
                             <line x1={p.sx} y1={p.sy} x2={p.sx + X_VEC.x} y2={p.sy + X_VEC.y} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
                             <line x1={p.sx} y1={p.sy} x2={p.sx + Y_VEC.x} y2={p.sy + Y_VEC.y} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
                             <line x1={p.sx} y1={p.sy} x2={p.sx + X_VEC.x - Y_VEC.x} y2={p.sy + X_VEC.y - Y_VEC.y} stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
                        </React.Fragment>
                    ))}

                    {/* Triangles (Chords) */}
                    {triangles.map(t => {
                        const isActive = contextChord && t.root === contextChord.root && t.type === contextChord.quality;
                        const isHover = hoveredTri && hoveredTri.id === t.id;
                        const fill = getFillColor(t, isHover, !!isActive);
                        
                        // Stroke Logic
                        let stroke = 'transparent';
                        let strokeW = 1;
                        let dash = 'none';

                        if (isActive) { stroke = 'var(--accent)'; strokeW = 3; }
                        else if (isHover) { stroke = 'white'; strokeW = 2; }
                        else if (t.isSuggested) { stroke = 'var(--accent)'; strokeW = 2; dash = '2 2'; } // Suggested
                        else if (t.secondary) { stroke = 'rgba(236, 72, 153, 0.5)'; strokeW = 1.5; dash = '4 2'; }

                        return (
                            <polygon
                                key={t.id}
                                points={t.points.map((p: any) => `${p.x},${p.y}`).join(' ')}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth={strokeW}
                                strokeDasharray={dash}
                                style={{ transition: 'fill 0.3s, stroke 0.1s' }}
                                className={cn("cursor-pointer interact-base vector-effect-non-scaling-stroke", isActive && "animate-pulse")}
                                onMouseEnter={() => setHoveredTri(t)}
                                onMouseLeave={() => setHoveredTri(null)}
                                onTouchStart={() => handleTouchStartTri(t)}
                                onTouchEnd={handleTouchEndTri}
                                onClick={(e) => {
                                    if (isLongPressRef.current) {
                                        e.stopPropagation();
                                        return;
                                    }
                                    e.stopPropagation();
                                    const c = buildChord(t.root, t.type as any);
                                    onChordClick(c);
                                    onAddChord(c);
                                }}
                            />
                        );
                    })}

                    {/* Voice Leading Connections (On Hover) */}
                    {hoveredTri && (
                        <g pointerEvents="none">
                             {/* Highlight Edges of Hovered */}
                             <polygon 
                                points={hoveredTri.points.map((p:any) => `${p.x},${p.y}`).join(' ')}
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                                opacity="1"
                             />
                             {/* Shared Edge Connectors */}
                             <line x1={hoveredTri.points[0].x} y1={hoveredTri.points[0].y} x2={hoveredTri.points[1].x} y2={hoveredTri.points[1].y} stroke="white" strokeWidth="4" opacity="0.3" strokeLinecap="round"/>
                             <line x1={hoveredTri.points[1].x} y1={hoveredTri.points[1].y} x2={hoveredTri.points[2].x} y2={hoveredTri.points[2].y} stroke="white" strokeWidth="4" opacity="0.3" strokeLinecap="round"/>
                             <line x1={hoveredTri.points[2].x} y1={hoveredTri.points[2].y} x2={hoveredTri.points[0].x} y2={hoveredTri.points[0].y} stroke="white" strokeWidth="4" opacity="0.3" strokeLinecap="round"/>
                             
                             {/* Context Line */}
                             {contextChord && (
                                 <line x1={0} y1={0} x2={hoveredTri.center.x} y2={hoveredTri.center.y} stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />
                             )}
                        </g>
                    )}

                    {/* Nodes (Notes) */}
                    {gridPoints.map(p => {
                        const isRoot = p.note === currentKey;
                        const dist = Math.sqrt(p.gx*p.gx + p.gy*p.gy);
                        const opacity = Math.max(0.1, 1 - (dist / (GRID_SIZE - 1)));
                        
                        return (
                            <g key={`node-${p.gx}-${p.gy}`} transform={`translate(${p.sx},${p.sy})`}>
                                <circle r={isRoot ? 8 : 4} fill={isRoot ? 'var(--accent)' : '#333'} stroke={isRoot ? 'white' : 'none'} className={cn(mood.tension > 0.8 && "animate-pulse")} />
                                <text y={isRoot ? 20 : 12} textAnchor="middle" fill="white" fontSize={isRoot ? 12 : 8} fontWeight="bold" opacity={opacity} className="pointer-events-none select-none" style={{ textShadow: '0 0 4px black' }}>{p.note}</text>
                            </g>
                        );
                    })}
                </g>
             </svg>
             
             {/* HUD */}
             <div className="absolute top-4 left-4 pointer-events-none opacity-50 flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                     <Network size={14} />
                     <span className="text-[10px] font-mono">LATTICE</span>
                 </div>
                 {/* Real-time Sentiment HUD */}
                 {hoveredTri && (() => {
                     const s = estimateChordSentiment(hoveredTri.chordInfo, currentKey, scaleType);
                     return (
                         <div className="mt-2 flex flex-col gap-1 animate-in fade-in slide-in-from-left-2 duration-200">
                             <span className="text-[12px] font-bold text-white tracking-tight">{getCompassLabel(s.valence, s.arousal)}</span>
                             <div className="flex gap-2 text-[9px] font-mono text-[var(--text-dim)]">
                                 <span>V: {s.valence.toFixed(2)}</span>
                                 <span>A: {s.arousal.toFixed(2)}</span>
                             </div>
                         </div>
                     );
                 })()}
             </div>

             {/* Dynamic Tooltip (Replaces Orbit Tooltip) */}
             {hoveredTri && (
                <div className="absolute z-[100] pointer-events-none" style={{ 
                     left: '50%', top: '10%', transform: 'translate(-50%, 0)' // Fixed top center for stability or follow mouse
                }}>
                     <Surface variant="tooltip" className="flex flex-col items-center min-w-[120px] shadow-2xl backdrop-blur-xl bg-black/80 border-white/10 animate-in fade-in zoom-in-95 duration-100">
                        <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1 w-full justify-center">
                            <span className="text-sm font-bold text-white">{hoveredTri.chordInfo.symbol}</span>
                            {hoveredTri.chordInfo.romanNumeral && hoveredTri.chordInfo.romanNumeral !== '?' && <Badge variant="scientific">{hoveredTri.chordInfo.romanNumeral}</Badge>}
                        </div>
                        <span className="text-[10px] text-[var(--text-dim)] uppercase tracking-wide">{hoveredTri.type}</span>
                        {hoveredTri.diatonic && (
                            <span className="text-[10px] text-[var(--accent)] mt-1 font-bold">Diatonic</span>
                        )}
                        {hoveredTri.secondary && (
                            <span className="text-[10px] text-pink-400 mt-1 italic">Secondary Dominant</span>
                        )}
                        {hoveredTri.diatonic && emotionMap[hoveredTri.diatonic.interval] && (
                            <span className="text-[10px] text-white/80 mt-1 italic text-center">"{emotionMap[hoveredTri.diatonic.interval]}"</span>
                        )}
                     </Surface>
                </div>
             )}
             
             {/* Zoom Controls */}
             <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                 <button className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] interact-push" onClick={() => setView(prev => ({ ...prev, k: Math.min(4, prev.k * 1.2) }))}>
                    <Plus size={16} />
                 </button>
                 <button className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] interact-push" onClick={() => setView(prev => ({ ...prev, k: Math.max(0.5, prev.k * 0.8) }))}>
                    <Minus size={16} />
                 </button>
                 <button className="w-8 h-8 rounded-full bg-[var(--bg-element)] border border-[var(--border)] flex items-center justify-center text-[var(--text-main)] interact-push" onClick={() => setView({ x: 0, y: 0, k: 1 })}>
                    <Maximize2 size={16} />
                 </button>
             </div>
        </div>
    );
};

// --- HARMONIC SPACE ---

export interface HarmonicSpaceProps {
    currentKey: Note;
    scaleType: ScaleType;
    chords: Chord[];
    onAddChord: (c: Chord) => void;
    onChordClick: (c: Chord) => void;
    contextChord: Chord | null;
    mood: { valence: number, arousal: number, tension: number };
}

export const HarmonicSpace = ({ currentKey, scaleType, chords, onAddChord, onChordClick, contextChord, mood }: HarmonicSpaceProps) => {
    
    // Derived harmonic data
    const secondaryDominants = useMemo(() => generateSecondaryDominants(currentKey, scaleType), [currentKey, scaleType]);
    const suggestedIndices = useMemo(() => getHarmonicSuggestions(contextChord), [contextChord]);

    return (
        <div className="h-full w-full relative">
            <TonnetzGrid 
                currentKey={currentKey} 
                scaleType={scaleType}
                chords={chords}
                onAddChord={onAddChord} 
                onChordClick={onChordClick} 
                mood={mood} 
                contextChord={contextChord} 
                secondaryDominants={secondaryDominants}
                suggestedIndices={suggestedIndices}
            />
        </div>
    );
};

// --- MOOD SELECTOR ---

export interface MoodSelectorProps {
    theme: string;
    currentScale: ScaleType;
    currentKey: Note;
    onManualScaleSelect: (s: ScaleType) => void;
    onKeyChange: (k: Note) => void;
    onTempoChange: (bpm: number) => void;
    mood: { valence: number, arousal: number, tension: number };
    onMoodChange: (v: number, a: number, t: number) => void;
    bpm: number;
    isScaleLocked: boolean;
    toggleScaleLock: () => void;
    progression?: Chord[];
    activeIndex?: number | null;
    onJumpToChord?: (idx: number) => void;
}

const DataPoint = ({ label, value, icon: Icon, color }: any) => (
    <div className="flex flex-col bg-white/5 rounded p-2 border border-white/5">
        <span className="text-[8px] font-bold text-white/30 uppercase mb-0.5">{label}</span>
        <div className="flex items-center gap-1.5">
            <Icon size={10} className={color} />
            <span className="text-xs font-medium text-white/90 truncate">{value}</span>
        </div>
    </div>
);

export const MoodSelector = ({ theme, currentScale, currentKey, onManualScaleSelect, onKeyChange, onTempoChange, mood, onMoodChange, bpm, isScaleLocked, toggleScaleLock, progression=[], activeIndex, onJumpToChord }: MoodSelectorProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [showZones, setShowZones] = useState(false);
    const [beamX, setBeamX] = useState<number>(0);
    const [showHint, setShowHint] = useState(true);
    const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
    const [initialPinchTension, setInitialPinchTension] = useState<number>(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeout = useRef<any>(null);
    
    // Side Panel States
    const [panelWidth, setPanelWidth] = useState(0); 
    const [lastOpenWidth, setLastOpenWidth] = useState(280); 
    const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
    const [isLocked, setIsLocked] = useState(false); 
    const [isDraggingPanel, setIsDraggingPanel] = useState(false);

    // Calculate Trajectory Points
    const trajectoryPoints = useMemo(() => {
        return progression.map((c, i) => {
            const sentiment = estimateChordSentiment(c, currentKey, currentScale);
            // Convert Valence (-1 to 1) -> X% (0 to 100)
            const x = (sentiment.valence + 1) / 2 * 100;
            // Convert Arousal (-1 to 1) -> Y% (100 to 0) because Arousal up is Top
            const y = (-sentiment.arousal + 1) / 2 * 100; 
            return { x, y, index: i, chord: c };
        });
    }, [progression, currentKey, currentScale]);

    const polylinePoints = useMemo(() => {
        return trajectoryPoints.map(p => `${p.x},${p.y}`).join(' ');
    }, [trajectoryPoints]);

    // Trigger hover logic
    const handleTriggerEnter = () => setIsHoveringSidebar(true);
    const handleSidebarLeave = () => setIsHoveringSidebar(false);
    
    const toggleLock = () => {
        setIsLocked(!isLocked);
        if (!isLocked) setPanelWidth(lastOpenWidth);
        else setPanelWidth(0);
    };

    // Calculate effective width based on state priority: Drag > Locked > Hover > Closed
    const effectiveWidth = useMemo(() => {
        if (isDraggingPanel) return panelWidth;
        if (isLocked) return Math.max(60, panelWidth); // If locked, maintain width
        if (isHoveringSidebar) return Math.max(60, panelWidth > 0 ? panelWidth : 60); // Peek mode (icon width 60px)
        return 0; // Collapsed
    }, [isDraggingPanel, isLocked, isHoveringSidebar, panelWidth]);
    
    // Handle Sidebar Resize Drag
    const handlePanelResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDraggingPanel(true);
        setIsLocked(true); // Dragging implies intent to keep open
    };

    const handlePanelResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingPanel) return;
        const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
        const newWidth = Math.max(0, Math.min(400, clientX));
        
        // Snap to close if dragged too small
        if (newWidth < 50) {
            setPanelWidth(0);
            setIsLocked(false);
        } else {
            setPanelWidth(newWidth);
            setLastOpenWidth(newWidth);
        }
    }, [isDraggingPanel]);

    const handlePanelResizeEnd = useCallback(() => {
        setIsDraggingPanel(false);
        if (panelWidth < 50) {
            setPanelWidth(0);
            setIsLocked(false);
        }
    }, [panelWidth]);

    useEffect(() => {
        if (isDraggingPanel) {
            window.addEventListener('mousemove', handlePanelResizeMove);
            window.addEventListener('mouseup', handlePanelResizeEnd);
            window.addEventListener('touchmove', handlePanelResizeMove);
            window.addEventListener('touchend', handlePanelResizeEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handlePanelResizeMove);
            window.removeEventListener('mouseup', handlePanelResizeEnd);
            window.removeEventListener('touchmove', handlePanelResizeMove);
            window.removeEventListener('touchend', handlePanelResizeEnd);
        };
    }, [isDraggingPanel, handlePanelResizeMove, handlePanelResizeEnd]);

    // Store latest mood in a ref for event handlers to avoid stale closures without full re-bind
    const moodRef = useRef(mood);
    moodRef.current = mood;

    const requestRef = useRef<number | undefined>(undefined);
    const lastBpm = useRef<number>(bpm);

    const char = useMemo(() => getMusicalCharacteristics(mood.valence, mood.arousal, mood.tension), [mood.valence, mood.arousal, mood.tension]);
    const accentColor = SCALE_DEFS[currentScale].palette.accent;

    const updateMoodPad = (clientX: number, clientY: number) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        setBeamX(clientX);

        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const v = (x * 2) - 1;
        const a = -((y * 2) - 1);
        
        onMoodChange(v, a, moodRef.current.tension);
        
        if (!isScaleLocked) {
            let minDist = Infinity;
            let closest: ScaleType = currentScale;
            Object.entries(SCALE_DEFS).forEach(([st, def]) => {
                const d = Math.sqrt(Math.pow(v - def.scaleCoordinates.v, 2) + Math.pow(a - def.scaleCoordinates.a, 2));
                if (d < minDist) { minDist = d; closest = st as ScaleType; }
            });
            if (closest !== currentScale) {
                onManualScaleSelect(closest);
            }
        }
        
        const newBpm = getTempoFromArousal(a);
        if (newBpm !== lastBpm.current) {
            onTempoChange(newBpm);
            lastBpm.current = newBpm;
        }
    };

    // Z-Axis Scroll Handler (Desktop Wheel) - Attached to Container to work everywhere
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setShowHint(false);
            
            // Activate HUD
            setIsScrolling(true);
            if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);
            
            // Normalize direction. 
            // Scroll Up (Negative Delta) -> Push In -> Increase Tension
            // Scroll Down (Positive Delta) -> Pull Out -> Decrease Tension
            const direction = Math.sign(e.deltaY);
            const delta = direction * -0.05; 
            
            const newTension = Math.max(0, Math.min(1, moodRef.current.tension + delta));
            if (newTension !== moodRef.current.tension) {
                onMoodChange(moodRef.current.valence, moodRef.current.arousal, newTension);
            }
        };
        
        const el = containerRef.current;
        if (el) el.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            if (el) el.removeEventListener('wheel', handleWheel);
        };
    }, [onMoodChange]);

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        // Prevent interfering with sidebar
        if ((e.target as HTMLElement).closest('.sidebar-panel')) return;
        // Prevent interfering with chord nodes
        if ((e.target as HTMLElement).closest('.chord-node')) return;
        
        setIsDragging(true);
        setShowHint(false);
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        updateMoodPad(clientX, clientY);
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        if ('touches' in e && e.touches.length === 2) {
             // Show HUD on pinch
             setIsScrolling(true);
             if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
             scrollTimeout.current = setTimeout(() => setIsScrolling(false), 800);

             const touch1 = e.touches[0];
             const touch2 = e.touches[1];
             const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
             
             if (initialPinchDist === null) {
                 setInitialPinchDist(dist);
                 setInitialPinchTension(moodRef.current.tension);
             } else {
                 const scaleFactor = dist / initialPinchDist;
                 const delta = (scaleFactor - 1) * 1.5; 
                 const newTension = Math.max(0, Math.min(1, initialPinchTension + delta));
                 onMoodChange(moodRef.current.valence, moodRef.current.arousal, newTension);
             }
             return;
        } else {
             if (initialPinchDist !== null) setInitialPinchDist(null);
        }

        if (!isDragging) return;
        
        if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
        
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        requestRef.current = requestAnimationFrame(() => {
            if (isDragging) {
                updateMoodPad(clientX, clientY);
            }
        });
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setInitialPinchDist(null);
        if (requestRef.current !== undefined) cancelAnimationFrame(requestRef.current);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const step = 0.1;
        let newV = mood.valence;
        let newA = mood.arousal;
        let handled = true;

        switch(e.key) {
            case 'ArrowUp': newA = Math.min(1, newA + step); break;
            case 'ArrowDown': newA = Math.max(-1, newA - step); break;
            case 'ArrowRight': newV = Math.min(1, newV + step); break;
            case 'ArrowLeft': newV = Math.max(-1, newV - step); break;
            default: handled = false;
        }

        if (handled) {
            e.preventDefault();
            setShowHint(false);
            onMoodChange(newV, newA, mood.tension);
        }
    };

    return (
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden flex flex-row select-none">
            {/* --- TRIGGER ZONE (Invisible Hover Target) --- */}
            <div 
                className="absolute left-0 top-0 bottom-0 w-6 z-40 bg-transparent hover:bg-white/5 transition-colors"
                onMouseEnter={handleTriggerEnter}
            />

            {/* --- CONTEXT SIDEBAR --- */}
            <div 
                className={cn(
                    "h-full border-r border-white/10 bg-black/90 backdrop-blur-xl z-30 flex flex-col relative overflow-hidden sidebar-panel",
                    isDraggingPanel ? "transition-none" : "transition-all duration-300 ease-out-expo"
                )}
                style={{ width: effectiveWidth }}
                onMouseLeave={handleSidebarLeave}
                onMouseEnter={handleTriggerEnter}
            >
                 {/* Sidebar Header/Toggle */}
                 <div className="h-12 flex items-center shrink-0 border-b border-white/5 pl-2 relative group">
                     <button 
                        onClick={toggleLock} 
                        className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                        title={isLocked ? "Unlock Sidebar" : "Lock Sidebar Open"}
                    >
                         {isLocked ? <ChevronLeft size={16}/> : <Settings2 size={16}/>}
                     </button>
                     <span className={cn(
                         "text-xs font-bold uppercase tracking-wider text-white ml-2 opacity-0 transition-opacity duration-300",
                         effectiveWidth > 100 ? "opacity-100" : "opacity-0"
                     )}>
                         Context
                     </span>
                 </div>

                 {/* Sidebar Content (Fade in based on width) */}
                 <div className={cn(
                     "flex-1 overflow-y-auto p-4 flex flex-col gap-6 transition-opacity duration-300",
                     effectiveWidth > 120 ? "opacity-100 delay-100" : "opacity-0 pointer-events-none"
                 )}>
                    {/* Scale Controls */}
                    <div className="space-y-2 min-w-[200px]">
                       <span className="text-[9px] font-bold text-white/40 uppercase">Tonality</span>
                       <div className="flex items-center gap-2">
                           <div className="relative w-16">
                               <select value={currentKey} onChange={(e) => onKeyChange(e.target.value as Note)} disabled={isScaleLocked} className="w-full bg-white/5 border border-white/10 rounded text-xs text-white p-2 font-mono outline-none appearance-none disabled:opacity-50"><option className="bg-black">Key: {currentKey}</option>{CIRCLE_KEYS.map(k => <option key={k} value={k} className="bg-black">{k}</option>)}</select>
                           </div>
                           <div className="relative flex-1">
                               <select value={currentScale} onChange={(e) => onManualScaleSelect(e.target.value as ScaleType)} disabled={isScaleLocked} className="w-full bg-white/5 border border-white/10 rounded text-xs text-white p-2 font-medium outline-none appearance-none disabled:opacity-50"><option className="bg-black">{currentScale}</option>{Object.values(ScaleType).map(s => <option key={s} value={s} className="bg-black">{s}</option>)}</select>
                           </div>
                       </div>
                       <button onClick={toggleScaleLock} className={cn("w-full py-1.5 rounded bg-white/5 border border-white/10 text-xs flex items-center justify-center gap-2 hover:bg-white/10 transition-colors", isScaleLocked && "bg-[var(--accent)] text-black border-[var(--accent)] font-bold")}>
                           {isScaleLocked ? <Lock size={12}/> : <Unlock size={12}/>}
                           {isScaleLocked ? "Scale Locked" : "Scale Free"}
                       </button>
                    </div>
                    
                    {/* Readouts */}
                    <div className="grid grid-cols-1 gap-2 min-w-[200px]">
                         <DataPoint label="Vibe" value={char.vibe} icon={Sparkles} color="text-yellow-400" />
                         <DataPoint label="Mode" value={char.mode} icon={Grid} color="text-purple-400" />
                         <DataPoint label="Tempo" value={`${bpm} BPM`} icon={Move} color="text-blue-400" />
                         <DataPoint label="Texture" value={char.texture} icon={Mic2} color="text-orange-400" />
                     </div>
                 </div>
                 
                 {/* Resize Handle */}
                 <div 
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-[var(--accent)] transition-colors z-50 flex items-center justify-center group"
                    onMouseDown={handlePanelResizeStart}
                    onTouchStart={handlePanelResizeStart}
                 >
                     <div className="h-8 w-1 bg-white/20 rounded-full group-hover:bg-white/80 transition-colors" />
                 </div>
            </div>

            {/* --- RIGHT PANEL: 3D GRID --- */}
            <div className="flex-1 relative overflow-hidden perspective-[1000px] flex flex-col min-w-0">
                {/* Visual Signal Beam */}
                {isDragging && (
                    <div 
                        className="fixed top-0 bottom-0 w-[1px] bg-white z-[9999] pointer-events-none"
                        style={{ 
                            left: beamX,
                            background: 'linear-gradient(to top, var(--accent) 0%, transparent 100%)',
                            boxShadow: '0 0 15px var(--accent)',
                            opacity: 0.8
                        }}
                    >
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-64 bg-[var(--accent)] opacity-20 blur-3xl rounded-full" />
                    </div>
                )}
                
                {/* Tension HUD - Shows when scrolling/pinching */}
                <div className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300 z-50 flex flex-col items-center", isScrolling ? "opacity-100" : "opacity-0")}>
                   <div className="bg-black/80 backdrop-blur-xl border border-[var(--accent)] px-6 py-4 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="flex items-center gap-2 mb-2">
                           <Thermometer size={12} className="text-[var(--accent)]" />
                           <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.2em]">Harmonic Tension</span>
                       </div>
                       <div className="text-3xl font-black text-white tabular-nums tracking-tighter">
                           {(mood.tension * 100).toFixed(0)}<span className="text-sm text-[var(--accent)]">%</span>
                       </div>
                       {/* Mini Bar */}
                       <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-[var(--accent)] transition-all duration-75" style={{width: `${mood.tension*100}%`}} />
                       </div>
                   </div>
               </div>

                {/* 3D Visualizer Surface */}
                <div 
                    ref={ref}
                    className="absolute inset-0 cursor-crosshair touch-none outline-none z-0"
                    tabIndex={0}
                    role="slider"
                    aria-label="Mood Selector. Use arrow keys to adjust valence and arousal, scroll or pinch to adjust tension."
                    aria-valuenow={Math.round((mood.valence + 1) * 50)} 
                    onMouseDown={handlePointerDown}
                    onMouseMove={handlePointerMove}
                    onMouseUp={handlePointerUp}
                    onMouseLeave={handlePointerUp}
                    onTouchStart={handlePointerDown}
                    onTouchMove={handlePointerMove}
                    onTouchEnd={handlePointerUp}
                    onKeyDown={handleKeyDown}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* 3D Background Layers */}
                    <div className="absolute inset-0 w-full h-full transition-colors duration-1000" style={{
                        transform: `translateZ(-${mood.tension * 500}px) scale(${1 + mood.tension})`,
                        background: `
                            radial-gradient(circle at 100% 0%, rgba(250, 204, 21, 0.4) 0%, transparent 70%),
                            radial-gradient(circle at 0% 0%, rgba(220, 38, 38, 0.4) 0%, transparent 70%),
                            radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.4) 0%, transparent 70%),
                            radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.4) 0%, transparent 70%),
                            linear-gradient(to bottom, #000000 0%, transparent 10%, transparent 90%, #000000 100%)
                        `,
                        opacity: 1 - (mood.tension * 0.5)
                    }}/>
                    
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" 
                         style={{
                             backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', 
                             backgroundSize: '50px 50px',
                             opacity: Math.max(0, (1 - mood.tension * 1.5)) * 0.15,
                             transform: `scale(${1 + mood.tension * 0.8})`
                         }} 
                    />

                    {/* Emotional Trajectory Layer (Floating Constellation) */}
                    <div className="absolute inset-0 pointer-events-none z-30" style={{ transform: 'translateZ(50px)' }}>
                         {/* Connecting Lines */}
                         <svg className="absolute inset-0 w-full h-full overflow-visible">
                             <polyline 
                                points={polylinePoints} 
                                fill="none" 
                                stroke="rgba(255,255,255,0.3)" 
                                strokeWidth="1" 
                                strokeDasharray="4 4"
                             />
                         </svg>
                         {/* Nodes */}
                         {trajectoryPoints.map((p, i) => (
                             <div 
                                key={i}
                                className={cn(
                                    "absolute w-4 h-4 -ml-2 -mt-2 rounded-full border border-white/20 bg-black flex items-center justify-center text-[8px] font-mono text-white/50 chord-node transition-all duration-300 cursor-pointer pointer-events-auto hover:scale-125 hover:border-white hover:text-white",
                                    i === activeIndex ? "bg-[var(--accent)] border-[var(--accent)] text-black font-bold scale-125 shadow-[0_0_15px_var(--accent)] z-50" : "z-40"
                                )}
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                                onClick={(e) => { e.stopPropagation(); onJumpToChord?.(i); }}
                                title={`${p.chord.symbol} - Step ${i+1}`}
                             >
                                 {i + 1}
                             </div>
                         ))}
                    </div>

                    <div className="absolute inset-0 pointer-events-none"
                         style={{
                             background: 'repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(255,255,255,0.03) 41px, transparent 42px)',
                             opacity: Math.sin(mood.tension * Math.PI) * 0.5,
                             transform: `scale(${0.5 + mood.tension})`
                         }}
                    />

                    <div className="absolute inset-0 pointer-events-none" 
                         style={{
                             opacity: mood.tension,
                             background: 'radial-gradient(circle, white 1px, transparent 1px)',
                             backgroundSize: '20px 20px',
                             filter: 'blur(0.5px)',
                             transform: `scale(${0.8 + mood.tension * 0.5}) rotate(${mood.tension * 20}deg)`
                         }}
                    />
                    
                    <div className="absolute inset-0 pointer-events-none transition-all duration-300" 
                         style={{ 
                             background: `radial-gradient(circle at center, transparent ${60 - (mood.tension * 30)}%, black 100%)`,
                             opacity: 0.3 + (mood.tension * 0.7)
                         }} 
                    />
                    
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ opacity: showZones || isDragging ? 0.6 : 0.1 }}>
                        {EMOTIONAL_ZONES.map((gem, i) => (
                            <div key={i} className="absolute flex flex-col items-center justify-center text-center -translate-x-1/2 -translate-y-1/2"
                                 style={{ left: `${(gem.v + 1) / 2 * 100}%`, top: `${(-gem.a + 1) / 2 * 100}%` }}>
                                <span className="text-[10px] font-black tracking-widest text-white/20 uppercase whitespace-nowrap">{gem.label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10 pointer-events-none" />
                    <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10 pointer-events-none" />

                    {Object.entries(SCALE_DEFS).map(([st, def]) => {
                        const x = (def.scaleCoordinates.v + 1) / 2 * 100;
                        const y = (-def.scaleCoordinates.a + 1) / 2 * 100;
                        const isActive = st === currentScale;
                        return (
                            <div key={st} className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full transition-all duration-500 shadow-lg pointer-events-none flex items-center justify-center group"
                                style={{ 
                                    left: `${x}%`, top: `${y}%`, 
                                    backgroundColor: isActive ? 'white' : 'rgba(255,255,255,0.2)', 
                                    transform: isActive ? 'scale(1.5)' : 'scale(1)',
                                    boxShadow: isActive ? '0 0 20px rgba(255,255,255,0.6)' : 'none',
                                    opacity: isScaleLocked && !isActive ? 0.3 : 1
                                }}
                            >
                                <span className={cn("absolute -top-6 whitespace-nowrap text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 transition-opacity", isActive ? "text-white opacity-100" : "text-white/50 opacity-0")}>{st}</span>
                            </div>
                        );
                    })}

                    <div 
                        className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 transition-transform duration-75 interact-base pointer-events-none flex items-center justify-center"
                        style={{ 
                            left: `${(mood.valence + 1) * 50}%`, 
                            top: `${(1 - mood.arousal) * 50}%`,
                            borderColor: accentColor,
                            color: accentColor,
                            backgroundColor: `${accentColor}20`,
                            boxShadow: `0 0 ${20 + mood.tension * 40}px currentColor`, 
                            transform: `scale(${1 + mood.tension * 0.5})` 
                        }}
                    >
                        <div className="absolute inset-0 rounded-full border border-current opacity-50" style={{ animationDuration: `${1.5 - mood.tension}s` }}/>
                        <div className="w-1 h-1 bg-current rounded-full"/>
                    </div>
                </div>

                {/* Hint Overlay */}
                <div className={cn(
                    "absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-1 transition-opacity duration-700 delay-500",
                    showHint ? "opacity-100" : "opacity-0"
                )}>
                     <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3">
                         <MousePointer2 size={14} className="text-[var(--accent)] animate-bounce" />
                         <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">Scroll or Pinch to adjust Tension</span>
                         </div>
                     </div>
                </div>
                
                {/* Top Center Label */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 pointer-events-none">
                     <span className="text-[10px] font-mono text-[var(--accent)] font-bold">{getCompassLabel(mood.valence, mood.arousal)}</span>
                </div>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto transition-all duration-300 z-20">
                     <button onClick={() => setShowZones(!showZones)} className="text-[10px] text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md bg-black/20 hover:bg-black/40 transition-colors">
                         {showZones ? "Hide Map Overlay" : "Show Map Overlay"}
                     </button>
                </div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white/20 tracking-[0.2em] pointer-events-none">HIGH ENERGY</div>
                <div className="absolute left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-bold text-white/20 tracking-[0.2em] pointer-events-none">NEGATIVE</div>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-bold text-white/20 tracking-[0.2em] pointer-events-none">POSITIVE</div>
            </div>
        </div>
    );
};