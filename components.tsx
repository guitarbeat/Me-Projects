

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, Gauge, Zap, Activity, Music, Brain, Plus, X, Sparkles, Loader2, PanelLeft, Trash2, Magnet, AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';
import { 
  CIRCLE_KEYS, Chord, Note, ScaleType, SplitAccessory,
  generateOrbitalLayout, generateSecondaryDominants, generateBorrowedChords,
  generateSuggestions, analyzeHarmony, AiSuggestion, AiAnalysis, buildChord,
  InstrumentType, getCompassLabel, SCALE_DEFS, getTempoFromArousal
} from './lib';

// --- CONSTANTS ---

// Instrument definitions for the synthesizer engine
const INSTRUMENTS: {id: InstrumentType, label: string, icon: any, desc: string}[] = [
  {id:'rhodes', label:'Electric Keys', icon:Music, desc:'Warm, bell-like tones'},
  {id:'pad', label:'Ethereal Pad', icon:Activity, desc:'Sustained atmospheric wash'},
  {id:'pluck', label:'Glass Pluck', icon:Zap, desc:'Short, sharp, percussive'},
  {id:'synth', label:'Analog Synth', icon:Music, desc:'Rich harmonics'} 
];

// --- UTILITIES ---

/**
 * Utility to merge tailwind classes with conditional logic.
 */
export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

/**
 * Creates a custom ghost element for drag operations to improve visual feedback.
 * Removing the default browser ghost image allows for a cleaner UI.
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

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches runtime errors in the component tree (e.g., in the AI panel) to prevent app crashes.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  componentDidCatch(error: any, errorInfo: any) { 
    console.error("Uncaught error:", error, errorInfo); 
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-4 text-red-500 text-sm flex items-center gap-2"><AlertTriangle size={16}/><span>Something went wrong.</span></div>;
    }
    return this.props.children;
  }
}

// --- UI PRIMITIVES ---

/**
 * Typography component to enforce consistent text styles across the app.
 * Variants map to specific CSS classes defined in the index.html.
 */
export const Typo: React.FC<{ variant?: 'h1'|'h2'|'h3'|'label'|'mono'|'body'|'sub'; as?: any; children: React.ReactNode; className?: string }> = ({ variant='body', as, children, className }) => {
    const Component = as || (variant?.startsWith('h') ? variant : 'div');
    const s = { 
      h1: "text-2xl font-light text-[var(--text-main)]", h2: "text-lg font-medium text-[var(--text-main)]", h3: "text-sm font-medium text-[var(--text-main)]", 
      label: "text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]", mono: "font-mono text-[10px] text-[var(--text-muted)]", 
      body: "text-sm text-[var(--text-muted)] leading-relaxed", sub: "text-xs text-[var(--text-dim)]" 
    };
    return <Component className={cn(s[variant], className)}>{children}</Component>;
};

/**
 * Base surface component for Panels, Cards, and Elements.
 * Includes interaction classes for hover/active states.
 */
export const Surface: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: 'panel'|'element'|'card'|'ghost'|'tooltip'; interactive?: boolean; active?: boolean }> = ({ children, className, interactive, variant='panel', active, ...props }) => {
    const v = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg", 
      card: "bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl", ghost: "bg-transparent border border-transparent rounded-lg", 
      tooltip: "bg-[#09090b] border border-[var(--border)] shadow-xl rounded-md z-50 text-xs" 
    };
    return <div className={cn("interact-base", v[variant], interactive && "cursor-pointer interact-lift", active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

// Generic Button Component
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'icon'; icon?: any; active?: boolean }> = ({ variant='secondary', size='md', className, children, icon: Icon, active, ...props }) => {
    const v = { primary: "bg-[var(--accent)] text-black shadow-md border border-transparent", secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border border-[var(--border)]", ghost: "bg-transparent text-[var(--text-muted)] border border-transparent", danger: "bg-red-500/10 text-red-400 border border-red-500/20" };
    const s = { sm: "px-2 py-0 h-7 text-[10px]", md: "px-4 py-2 text-sm h-10", icon: "p-2 h-8 w-8" };
    const interactionClass = (variant === 'ghost' || size === 'icon') ? 'interact-scale' : 'interact-push';
    return <button className={cn("flex items-center justify-center gap-1.5 rounded-md font-medium interact-base disabled:opacity-50 disabled:pointer-events-none outline-none select-none", v[variant], s[size], interactionClass, active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)]", className)} {...props}>{Icon && <Icon size={14}/>}{children}</button>;
};

export const IconButton: React.FC<any> = ({size='icon', ...props}) => <Button size={size} variant="ghost" {...props} />;

export const Input: React.FC<Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {variant?:'default'|'ghost', size?:'sm'|'md'}> = ({variant='default', size='md', className, ...props}) => 
  <input className={cn("font-bold outline-none interact-base interact-input", size==='sm'?"h-7 text-[11px] px-2 rounded-[6px]":"h-8 text-xs px-3 rounded-md", variant==='default'?"bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-hover)] placeholder:text-[var(--text-dim)] shadow-sm":"bg-transparent border border-transparent text-[var(--text-main)] hover:bg-[var(--bg-element)]", className)} {...props}/>;

export const Select: React.FC<Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {variant?:'default'|'ghost', size?:'sm'|'md'}> = ({variant='default', size='md', className, ...props}) => 
  <div className="relative group w-full"><select className={cn("appearance-none w-full font-bold outline-none interact-base interact-input cursor-pointer", size==='sm'?"h-7 text-[11px] px-2 rounded-[6px] pr-5":"h-8 text-xs px-3 rounded-md pr-8", variant==='default'?"bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-hover)] shadow-sm":"bg-transparent border border-transparent text-[var(--text-main)] hover:bg-[var(--bg-element)]", className)} {...props}/><div className="absolute right-1 top-1/2 -translate-x-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-main)] interact-base"><ChevronDown size={size==='sm'?12:14}/></div></div>;

export const Badge: React.FC<{children:React.ReactNode, variant?:'default'|'outline'|'accent'|'scientific', className?:string}> = ({children, variant='default', className}) => 
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none interact-base", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"bg-transparent border-[var(--border)] text-[var(--text-muted)]":variant==='scientific'?"bg-[var(--bg-main)] border-[var(--accent)] text-[var(--accent)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>;

export const Tabs: React.FC<{items:{id:string, label:string, icon?:any}[], active:string, onChange:(id:string)=>void, className?:string}> = ({items, active, onChange, className}) => 
  <div className={cn("flex border-b border-[var(--border)] bg-[var(--bg-panel)] w-full overflow-x-auto scrollbar-hide", className)}>{items.map(t=><button key={t.id} onClick={()=>onChange(t.id)} className={cn("flex-1 py-3 px-4 min-w-fit text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 interact-base outline-none", active===t.id?"border-[var(--accent)] text-[var(--text-main)]":"border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]")}>{t.icon && <t.icon size={14} className={active===t.id?"text-[var(--accent)]":"opacity-50"}/>}<span>{t.label}</span></button>)}</div>;

export const Card = Surface;

// --- LAYOUT COMPONENTS ---

/**
 * A container that implements the "Panel" visual language.
 * It handles the deformation (corner radius, blur, scaling) that occurs during the
 * split-view interaction in App.tsx.
 * 
 * @param minimise - 0 to 1 value indicating how "minimised" this panel is.
 * @param isFull - Whether this panel is currently taking up the full screen.
 */
export const PanelWrapper: React.FC<{
    minimise: number;
    isFull: boolean;
    bgColor: string;
    children: React.ReactNode;
    overlay: React.ReactNode;
    anchor: 'top' | 'bottom';
}> = ({ minimise, isFull, bgColor, children, overlay, anchor }) => {
    // Calculate visual transformations based on minimise state
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
            {/* Content Container - Blurs when minimised */}
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
            
            {/* Minimal Overlay - Appears when minimised (e.g., small music player view) */}
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
            
            {/* Dimming Layer */}
            <div className="absolute inset-0 pointer-events-none interact-base" style={{ backgroundColor: 'black', opacity: minimise * 0.1 }} />
        </div>
    );
};

export const ScaleDownButton: React.FC<{ onClick: () => void, isActive?: boolean, children: React.ReactNode, className?: string }> = ({ onClick, isActive, children, className }) => (
    <button
        onClick={onClick}
        className={cn(
            "p-2 rounded-full interact-base flex items-center justify-center shrink-0 outline-none select-none",
            isActive ? "bg-white text-black shadow-lg scale-110" : "text-[#8e8e93] hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95",
            className
        )}
    >
        {children}
    </button>
);

/**
 * The draggable "pill" that sits between the two panels.
 * Provides shortcuts to switch views (leading/trailing accessories).
 */
export const ComplicationDragBar: React.FC<{
    leading: SplitAccessory[],
    trailing: SplitAccessory[],
    onDragStart: (e: any) => void,
    isDragging: boolean
}> = ({ leading, trailing, onDragStart, isDragging }) => {
    return (
        <div className="absolute left-0 right-0 flex items-center justify-center z-[100] pointer-events-none select-none" style={{ top: '50%', transform: 'translateY(-50%)' }}>
            <div className="pointer-events-auto">
                <div className={cn(
                    "bg-[#1c1c1e] text-white border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-full flex items-center p-1.5 gap-3 backdrop-blur-2xl interact-base transform",
                    isDragging ? "scale-95 cursor-grabbing shadow-xl" : ""
                )}>
                    {/* Left Actions */}
                    <div className="flex gap-1">
                        {leading.map(item => (
                            <ScaleDownButton key={item.id} onClick={item.action} isActive={item.active}>
                                <item.icon size={18} strokeWidth={2.5} />
                            </ScaleDownButton>
                        ))}
                    </div>
                    
                    {/* Drag Handle */}
                    <div
                        className="w-14 h-8 flex items-center justify-center cursor-row-resize touch-none group hover:bg-white/5 rounded-lg transition-colors active:bg-white/10"
                        onMouseDown={onDragStart}
                        onTouchStart={onDragStart}
                    >
                        <div className="w-10 h-1 bg-[#48484a] rounded-full group-hover:bg-[#636366] interact-base group-active:scale-x-110" />
                    </div>
                    
                    {/* Right Actions */}
                    <div className="flex gap-1">
                        {trailing.map(item => (
                            <ScaleDownButton key={item.id} onClick={item.action} isActive={item.active}>
                                <item.icon size={18} strokeWidth={2.5} />
                            </ScaleDownButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SEQUENCER COMPONENTS ---

const PIXELS_PER_BEAT = 40, SNAP_GRID = 0.25;

/**
 * Represents a single chord block in the timeline.
 * Supports: Drag & Drop reordering, Resizing (duration), and Deletion.
 */
export const TimelineNode: React.FC<{ chord: Chord; index: number; isActive: boolean; onRemove: (i:number)=>void; onResize: (i:number, beats:number)=>void; onDragStart: (e:React.DragEvent<HTMLDivElement>)=>void; onDragEnter: ()=>void; onDragLeave: ()=>void; onDrop: (e:React.DragEvent<HTMLDivElement>)=>void; isDropTarget: boolean; isDragging: boolean; }> = ({ chord, index, isActive, onRemove, onResize, onDragStart, onDragEnter, onDragLeave, onDrop, isDropTarget, isDragging }) => {
    const [tempWidth, setTempWidth] = useState<number|null>(null);
    const [isExiting, setIsExiting] = useState(false);
    
    // Width calculation based on beats
    const width = (tempWidth!==null?tempWidth:chord.duration*PIXELS_PER_BEAT);
    
    const handleResize = (dx:number) => setTempWidth(Math.max(PIXELS_PER_BEAT*0.5, (chord.duration*PIXELS_PER_BEAT)+dx));
    const handleResizeEnd = () => { if(tempWidth!==null){ onResize(index, Math.round((tempWidth/PIXELS_PER_BEAT)/SNAP_GRID)*SNAP_GRID); setTempWidth(null); } };
    const handleRemove = (e:React.MouseEvent) => { e.stopPropagation(); setIsExiting(true); setTimeout(()=>onRemove(index), 300); };
    
    return (
        <div draggable={!chord.isRest} onDragStart={(e) => { 
                setDragGhost(e, chord.symbol);
                onDragStart(e); 
                if(e.dataTransfer){
                     e.dataTransfer.setData('reorder_index', index.toString());
                     try { (e.dataTransfer as any).effectAllowed = 'move'; } catch(e){}
                }
            }} 
            onDragOver={(e)=>{
                e.preventDefault();
                if(e.dataTransfer) {
                    try { (e.dataTransfer as any).dropEffect='move'; } catch(err) {}
                }
            }} 
            onDragEnter={onDragEnter} 
            onDragLeave={onDragLeave} 
            onDrop={onDrop} 
            className={cn("relative h-9 shrink-0 interact-base group/node select-none mb-1 transition-all duration-300", isDragging?"opacity-30 scale-95":"", isExiting && "opacity-0 scale-90 w-0 !m-0")} 
            style={{ width:isExiting?'0px':`${width}px` }}
        >
            {/* Drop Indicator */}
            {isDropTarget && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-3 z-50 flex items-center justify-center pointer-events-none -translate-x-1/2">
                    <div className="h-full w-1 bg-[var(--accent)] shadow-[0_0_15px_var(--accent)] rounded-full animate-pulse" />
                    <div className="absolute bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--accent)] rounded-full p-0.5 shadow-lg transform scale-75 animate-bounce">
                        <Plus size={10} strokeWidth={3} />
                    </div>
                </div>
            )}
            
            {/* Main Chord Block */}
            <div className={cn("h-full w-full rounded-md border flex flex-col overflow-hidden relative shadow-sm interact-base interact-lift-sm", isActive?"border-[var(--accent)] bg-[var(--bg-surface)] shadow-md z-10 scale-[1.02]":chord.isRest?"border-[var(--border)] bg-[var(--bg-main)] opacity-60":"border-[var(--border)] bg-[var(--bg-element)]")}>
                 {/* Grid lines inside block */}
                 <div className="absolute inset-0 pointer-events-none flex" style={{opacity:0.1}}>{Array.from({length:Math.ceil(width/PIXELS_PER_BEAT)}).map((_,i)=><div key={i} className="h-full border-r border-[var(--text-muted)] flex-1" style={{width:`${PIXELS_PER_BEAT}px`,flex:'none'}}/>)}</div>
                 {/* Rest pattern */}
                 {chord.isRest && <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(45deg, var(--text-muted) 25%, transparent 25%, transparent 50%, var(--text-muted) 50%, var(--text-muted) 75%, transparent 75%, transparent)',backgroundSize:'6px 6px'}}/>}
                 
                 <div className="relative z-10 p-0.5 h-full flex flex-row items-center justify-between gap-0.5">
                     <div className="flex items-center gap-1 min-w-0">
                        {!chord.isRest ? <span className={cn("text-[7px] font-bold font-mono px-0.5 rounded-[2px] leading-none shrink-0 interact-base", isActive?"bg-[var(--accent)] text-black":"bg-[var(--bg-main)] text-[var(--text-muted)]")}>{chord.romanNumeral}</span> : null}
                        {!chord.isRest ? <span className={cn("font-bold tracking-tight truncate leading-none interact-base", isActive?"text-[var(--text-main)] text-[10px]":"text-[var(--text-muted)] text-[9px]")}>{chord.symbol}</span> : <div className="text-[var(--text-muted)] opacity-50 ml-0.5 w-2 h-2 rounded-full border border-current"/>}
                     </div>
                     {/* Remove Button */}
                     <button onClick={handleRemove} disabled={isExiting} className="text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover/node:opacity-100 interact-base interact-scale p-0.5 rounded hover:bg-red-500/10 shrink-0"><X size={8}/></button>
                 </div>
                 
                 {/* Resize Handle */}
                 {!chord.isRest && <div onMouseDown={(e)=>{e.stopPropagation();e.preventDefault();const s=e.clientX;const mv=(ev:MouseEvent)=>handleResize(ev.clientX-s);const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);handleResizeEnd()};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);}} className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize group z-50 flex items-center justify-center hover:bg-[var(--accent)]/10 interact-base"><div className="w-0.5 h-2 bg-[var(--text-muted)] rounded-full group-hover:bg-[var(--accent)] interact-base opacity-50 group-hover:scale-y-125"/></div>}
            </div>
            {/* Duration Label */}
            <div className="absolute -bottom-2.5 left-0 right-0 text-center opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none"><span className="text-[6px] font-mono font-bold text-[var(--text-muted)]">{chord.duration}</span></div>
        </div>
    );
};

/**
 * Main sequencer view.
 * Contains:
 * - Resizable sidebar for meter controls.
 * - Horizontal scrolling timeline.
 * - Logic for dropping chords from other panels.
 */
export const ProgressionStrip: React.FC<{ progression: Chord[]; onRemove: (i:number)=>void; activeIndex: number|null; onDropChord: (c:Chord, index?:number)=>void; draggingChord: Chord|null; availableChords: Chord[]; onLoadTemplate?: (c:Chord[])=>void; onClear?: ()=>void; onQuantize?: ()=>void; isPlaying?: boolean; onReorder?: (from: number, to: number) => void; onResize?: (index: number, duration: number) => void; timeSignature: { num: number, den: number }; onSetTimeSignature: (ts: { num: number, den: number }) => void; }> = ({ progression, onRemove, activeIndex, onDropChord, availableChords, onReorder, onResize, timeSignature, onSetTimeSignature, onClear, onQuantize }) => {
    const scrollRef = useRef<HTMLDivElement>(null), [draggingIndex, setDraggingIndex] = useState<number|null>(null), [dropTarget, setDropTarget] = useState<number|null>(null), [sidebarWidth, setSidebarWidth] = useState(60);
    
    // Auto-scroll to active chord during playback
    useEffect(() => { 
        if(activeIndex!==null && scrollRef.current && scrollRef.current.children.length > activeIndex){ 
            const el = scrollRef.current.children[activeIndex] as HTMLElement; 
            if(el) el.scrollIntoView({ behavior:'smooth', block:'nearest', inline:'center' }); 
        } 
    }, [activeIndex]);

    const cycleTimeSignature = () => { const common=[{n:4,d:4},{n:3,d:4},{n:6,d:8},{n:5,d:4},{n:7,d:8}]; const idx=common.findIndex(t=>t.n===timeSignature.num && t.d===timeSignature.den); const n=common[(idx+1)%common.length]; onSetTimeSignature({num:n.n,den:n.d}); };
    
    // Sidebar resize logic
    const handleSidebarResize = (e: React.MouseEvent | React.TouchEvent) => {
        const isTouch = 'touches' in e;
        if (!isTouch) e.preventDefault();
        const startX = isTouch ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
        const startWidth = sidebarWidth;
        const onMove = (clientX: number) => { setSidebarWidth(Math.max(50, Math.min(120, startWidth + (clientX - startX)))); };
        const mouseMove = (ev: MouseEvent) => onMove(ev.clientX);
        const touchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientX);
        const stop = () => { if (isTouch) { document.removeEventListener('touchmove', touchMove); document.removeEventListener('touchend', stop); } else { document.removeEventListener('mousemove', mouseMove); document.addEventListener('mouseup', stop); } };
        if (isTouch) { document.addEventListener('touchmove', touchMove); document.addEventListener('touchend', stop); } else { document.addEventListener('mousemove', mouseMove); document.addEventListener('mouseup', stop); }
    };

    const timelineElements = useMemo(() => {
        const els: React.ReactNode[] = [];
        let accumulatedBeats = 0;
        const beatsPerBar = timeSignature.num;
        
        // Generate nodes
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
            // Bar dividers
            if (Math.abs(accumulatedBeats % beatsPerBar) < 0.01) {
                const barNum = Math.round(accumulatedBeats / beatsPerBar) + 1;
                els.push(<div key={`bar-${i}`} className="flex flex-col items-center justify-start h-9 w-px bg-[var(--border)] mx-0.5 relative shrink-0"><span className="absolute -top-3 text-[6px] font-mono font-bold text-[var(--text-dim)]">{barNum}</span></div>);
            }
        });
        
        // Add Button at the end
        const isEndTarget = dropTarget === progression.length;
        els.push(
            <div key="add-btn" 
                onClick={()=>{const t=availableChords.find(c=>c.romanNumeral==='I'||c.romanNumeral==='i');if(t)onDropChord(t)}} 
                onDragOver={(e)=>{
                    e.preventDefault(); 
                    setDropTarget(progression.length); 
                    if(e.dataTransfer) try {(e.dataTransfer as any).dropEffect='move';}catch(e){}
                }} 
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
                    "h-9 w-9 shrink-0 rounded-md border border-dashed interact-base interact-scale flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative",
                    isEndTarget ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
                )}
            >
                {isEndTarget && <div className="absolute -left-1.5 h-full w-1 bg-[var(--accent)] rounded-full animate-pulse shadow-[0_0_10px_var(--accent)] pointer-events-none" />}
                <Plus size={12}/>
            </div>
        );
        return els;
    }, [progression, activeIndex, draggingIndex, dropTarget, availableChords, timeSignature, onRemove, onResize, onDropChord, onReorder]);

    return (
      <div className="relative w-full h-full flex bg-[var(--bg-main)] overflow-hidden">
        {/* Resizable Control Sidebar */}
        <div style={{width:sidebarWidth}} className="border-r border-[var(--border)] bg-[var(--bg-panel)] flex flex-col items-center py-2 px-1 gap-4 shrink-0 h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] select-none relative transition-none">
            <div onMouseDown={handleSidebarResize} onTouchStart={handleSidebarResize} className="absolute top-0 right-0 bottom-0 w-8 -mr-4 cursor-col-resize z-50 flex justify-center group/resize touch-none"><div className="w-px h-full bg-transparent group-hover/resize:bg-[var(--accent)] interact-base opacity-50"/></div>
            <div className="shrink-0"><Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--text-main)]"><PanelLeft size={16}/></Button></div>
            
            {/* Meter Control */}
            <div className="flex flex-col items-center gap-1 w-full px-1.5">{sidebarWidth>55 && <Typo variant="label" className="text-[9px] opacity-60">METER</Typo>}<div onClick={cycleTimeSignature} className="w-full aspect-square bg-[var(--bg-surface)] border border-[var(--border)] interact-lift rounded-xl flex flex-col items-center justify-center cursor-pointer group select-none relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 interact-base pointer-events-none"/><span className="text-xl font-black leading-none text-[var(--text-main)] group-hover:text-[var(--accent)] interact-base translate-y-0.5">{timeSignature.num}</span><span className="text-xl font-black leading-none text-[var(--text-main)] group-hover:text-[var(--accent)] interact-base -translate-y-0.5">{timeSignature.den}</span></div></div>
            
            {/* Utilities */}
            <div className="mt-auto w-full px-1 mb-1 flex flex-col gap-1">
                <Button variant="ghost" size="icon" onClick={onClear} className="w-full h-8 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14}/></Button>
                <Button variant="ghost" size="icon" onClick={onQuantize} className="w-full h-8 text-[var(--text-muted)] hover:text-[var(--accent)]"><Magnet size={14}/></Button>
            </div>
        </div>
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[var(--bg-main)] relative select-none">
             <div className="h-full flex items-center px-4 gap-1 min-w-max" ref={scrollRef}>{timelineElements}</div>
        </div>
      </div>
    );
};

// --- FEATURE COMPONENTS ---

// Global Application Header
export const Header: React.FC<any> = ({ isPlaying, togglePlay, theme, toggleTheme, instrument, setInstrument, keyNote, setKey, scale, setScale, bpm, setBpm }) => (
    <div className="h-[68px] flex items-center px-6 gap-6 bg-[var(--bg-panel)] shrink-0 z-30 select-none border-b border-[var(--border)]">
        <Button onClick={togglePlay} variant="primary" size="icon" className="h-10 w-10 rounded-full shadow-[0_4px_12px_rgba(209,58,52,0.3)] hover:shadow-[0_6px_20px_rgba(209,58,52,0.5)] interact-scale">{isPlaying ? <Square fill="currentColor" size={16}/> : <Play fill="currentColor" className="ml-0.5" size={16}/>}</Button>
        <div className="h-8 w-px bg-[var(--border)]"/>
        <div className="flex flex-col gap-0.5"><Typo variant="label">KEY</Typo><div className="flex items-center gap-2"><Select value={keyNote} onChange={(e)=>setKey(e.target.value)} size="sm" className="w-14" variant="ghost">{CIRCLE_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</Select><Select value={scale} onChange={(e)=>setScale(e.target.value)} size="sm" className="w-24" variant="ghost">{Object.values(ScaleType).map(s=><option key={s} value={s}>{s}</option>)}</Select></div></div>
        <div className="h-8 w-px bg-[var(--border)]"/>
        <div className="flex flex-col gap-0.5"><Typo variant="label">TEMPO</Typo><div className="flex items-center gap-2"><div className="relative group w-16 interact-base"><Input type="number" value={bpm} onChange={(e)=>setBpm(parseInt(e.target.value))} className="w-full text-center pr-3 font-mono" size="sm" variant="ghost"/><span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-[var(--text-muted)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">BPM</span></div></div></div>
        <div className="flex-1"/>
        {/* Instrument Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-element)] p-1 rounded-lg border border-[var(--border)]">{INSTRUMENTS.map(i => <button key={i.id} onClick={()=>setInstrument(i.id)} className={cn("p-1.5 rounded-md interact-scale relative group", instrument===i.id?"bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm":"text-[var(--text-muted)] hover:text-[var(--text-main)]")} title={i.label}><i.icon size={14}/></button>)}</div>
        <div className="w-px h-8 bg-[var(--border)]"/>
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)]">{theme==='dark'?<Sparkles size={14}/>:<Sparkles size={14} className="fill-current"/>}</Button>
    </div>
);

/**
 * Mood / Vibe Selector
 * A 2-axis XY pad where X=Valence (Sad->Happy) and Y=Arousal (Calm->Excited).
 * Automatically selects a scale and tempo based on position.
 */
export const MoodSelector: React.FC<{ theme: string; currentScale: ScaleType; currentKey: Note; onManualScaleSelect: (s: ScaleType) => void; onTempoChange: (bpm: number) => void; mood: { valence: number, arousal: number }; onMoodChange: (v: number, a: number) => void; }> = ({ theme, currentScale, currentKey, onManualScaleSelect, onTempoChange, mood, onMoodChange }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const update = (e: any) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        // Normalize to -1 to 1
        const v = (x * 2) - 1;
        const a = -((y * 2) - 1);
        onMoodChange(v, a);
        
        // Find closest scale definition based on coordinates
        let minDist = Infinity;
        let closest: ScaleType = currentScale;
        Object.entries(SCALE_DEFS).forEach(([st, def]) => {
            const d = Math.sqrt(Math.pow(v - def.scaleCoordinates.v, 2) + Math.pow(a - def.scaleCoordinates.a, 2));
            if (d < minDist) { minDist = d; closest = st as ScaleType; }
        });
        if (closest !== currentScale) {
            onManualScaleSelect(closest);
        }
        onTempoChange(getTempoFromArousal(a));
    };

    return (
        <div className="h-full w-full p-6 flex flex-col items-center justify-center relative bg-[var(--bg-main)]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)' }} />
            <div 
                ref={ref}
                className="w-64 h-64 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full relative shadow-2xl cursor-crosshair interact-base touch-none"
                onMouseDown={(e) => { setIsDragging(true); update(e); }}
                onMouseMove={(e) => { if (isDragging) update(e); }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => { setIsDragging(true); update(e); }}
                onTouchMove={(e) => { if (isDragging) update(e); }}
                onTouchEnd={() => setIsDragging(false)}
            >
                {/* Axes */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--border)]" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border)]" />
                
                {/* Scale Points Indicators */}
                {Object.entries(SCALE_DEFS).map(([st, def]) => {
                    const x = (def.scaleCoordinates.v + 1) / 2 * 100;
                    const y = (-def.scaleCoordinates.a + 1) / 2 * 100;
                    const isActive = st === currentScale;
                    return (
                        <div key={st} className="absolute w-2 h-2 -ml-1 -mt-1 rounded-full transition-all duration-500"
                            style={{ left: `${x}%`, top: `${y}%`, backgroundColor: isActive ? 'var(--accent)' : 'var(--text-muted)', transform: isActive ? 'scale(2)' : 'scale(1)', opacity: isActive ? 1 : 0.5 }}
                        />
                    );
                })}

                {/* Draggable Cursor */}
                <div 
                    className="absolute w-6 h-6 -ml-3 -mt-3 border-2 border-[var(--text-main)] rounded-full shadow-lg pointer-events-none transition-all duration-75 flex items-center justify-center"
                    style={{ left: `${(mood.valence + 1) / 2 * 100}%`, top: `${(-mood.arousal + 1) / 2 * 100}%` }}
                >
                    <div className="w-1.5 h-1.5 bg-[var(--text-main)] rounded-full" />
                </div>
            </div>
            <div className="mt-8 text-center space-y-1">
                <Typo variant="label" className="text-[var(--accent)]">{getCompassLabel(mood.valence, mood.arousal)}</Typo>
                <Typo variant="h2">{currentKey} {currentScale}</Typo>
                <Typo variant="sub">{SCALE_DEFS[currentScale].meta.desc}</Typo>
            </div>
        </div>
    );
};

/**
 * Gravity Stage
 * A visualizer that places the diatonic chords in a circle (Orbit).
 * Allows rapid auditioning of chords by clicking them.
 */
export const GravityStage: React.FC<{ currentKey: Note; scaleType: ScaleType; chords: Chord[]; onAddChord: (c: Chord) => void; onChordClick: (c: Chord) => void; contextChord: Chord | null }> = ({ currentKey, scaleType, chords, onAddChord, onChordClick, contextChord }) => {
    const layout = useMemo(() => generateOrbitalLayout(chords), [chords]);
    
    return (
        <div className="h-full w-full relative bg-[var(--bg-main)] overflow-hidden flex items-center justify-center">
             {/* Decorative Center */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[400px] h-[400px] border border-[var(--border)] rounded-full opacity-20 animate-[spin_60s_linear_infinite]" />
                <div className="w-[250px] h-[250px] border border-[var(--border)] rounded-full opacity-30 absolute animate-[spin_40s_linear_infinite_reverse]" />
             </div>
             
             {/* Orbital Chords */}
             {layout.map((c, i) => {
                const isActive = contextChord?.symbol === c.symbol;
                const x = c.x || 50;
                const y = c.y || 50;
                
                return (
                    <div 
                        key={c.symbol}
                        className={cn(
                            "absolute w-16 h-16 -ml-8 -mt-8 rounded-full flex flex-col items-center justify-center border transition-all duration-500 cursor-pointer hover:scale-110 interact-base shadow-lg z-10 group",
                            isActive ? "border-[var(--accent)] bg-[var(--bg-surface)] shadow-[0_0_20px_var(--accent)] scale-110" : "border-[var(--border)] bg-[var(--bg-element)] hover:border-[var(--text-muted)]"
                        )}
                        style={{ left: `${x}%`, top: `${y}%` }}
                        onClick={() => onChordClick(c)}
                    >
                        <span className={cn("text-xs font-bold", isActive ? "text-[var(--accent)]" : "text-[var(--text-main)]")}>{c.symbol}</span>
                        <span className="text-[8px] text-[var(--text-muted)] font-mono">{c.romanNumeral}</span>
                        
                        {/* Quick Add Action */}
                        <div 
                            className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--accent)] text-black rounded-full p-1 cursor-pointer hover:scale-125 shadow-lg"
                            onClick={(e) => { e.stopPropagation(); onAddChord(c); }}
                        >
                            <Plus size={12} strokeWidth={3} />
                        </div>
                    </div>
                );
             })}
        </div>
    );
};

/**
 * Theory Tools Panel
 * Provides a structured list of chords categorized by music theory relationships.
 */
export const TheoryTools: React.FC<{ currentKey: Note; scaleType: ScaleType; chords: Chord[]; progression: Chord[]; onAppendChords: (cs: Chord[]) => void; onSetKey: (n: Note) => void; onSetScale: (s: ScaleType) => void; onChordSelect: (c: Chord) => void; onHover: (c: Chord | null) => void; scaleNotes: Note[] }> = ({ currentKey, scaleType, chords, onChordSelect, onHover, scaleNotes }) => {
    const secDoms = useMemo(() => generateSecondaryDominants(currentKey, scaleType), [currentKey, scaleType]);
    const borrowed = useMemo(() => generateBorrowedChords(currentKey, scaleType), [currentKey, scaleType]);

    const renderChordBtn = (c: Chord) => (
        <button 
            key={c.symbol + c.theoryInfo}
            className="flex flex-col items-start p-2 rounded-lg bg-[var(--bg-element)] border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--bg-surface)] interact-base group text-left w-full relative overflow-hidden"
            onClick={() => onChordSelect(c)}
            onMouseEnter={() => onHover(c)}
            onMouseLeave={() => onHover(null)}
        >
             <div className="flex w-full justify-between items-center">
                <span className="font-bold text-sm text-[var(--text-main)]">{c.symbol}</span>
                <span className="text-[9px] font-mono text-[var(--text-muted)] bg-[var(--bg-main)] px-1 rounded">{c.romanNumeral}</span>
             </div>
             <span className="text-[10px] text-[var(--text-muted)] line-clamp-1">{c.theoryInfo || c.emotionalDesc}</span>
             <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 text-[var(--accent)]"><Plus size={12}/></div>
        </button>
    );

    return (
        <div className="h-full w-full bg-[var(--bg-main)] overflow-y-auto p-4 space-y-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2"><Activity size={14} className="text-[var(--accent)]"/><Typo variant="label">DIATONIC ({scaleType})</Typo></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {chords.map(renderChordBtn)}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2"><Zap size={14} className="text-yellow-500"/><Typo variant="label">SECONDARY DOMINANTS</Typo></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {secDoms.map(renderChordBtn)}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2"><Sparkles size={14} className="text-purple-500"/><Typo variant="label">BORROWED / MODAL INTERCHANGE</Typo></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {borrowed.map(renderChordBtn)}
                </div>
            </div>
        </div>
    );
};

/**
 * AI Assistant Panel
 * Uses Google Gemini to analyze the current progression and suggest next chords.
 */
export const AiAssistant: React.FC<{ mood: { valence: number, arousal: number }; currentKey: Note; currentScale: ScaleType; progression: Chord[]; onAppendChords: (cs: Chord[]) => void; }> = ({ mood, currentKey, currentScale, progression, onAppendChords }) => {
    const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
    const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleSuggest = async () => {
        setLoading(true);
        const res = await generateSuggestions(currentKey, currentScale, mood.valence, mood.arousal, progression);
        setSuggestions(res);
        setLoading(false);
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        const res = await analyzeHarmony(progression, currentKey, currentScale);
        setAnalysis(res);
        setAnalyzing(false);
    };

    return (
        <div className="h-full w-full bg-[var(--bg-main)] overflow-y-auto p-4 flex flex-col gap-6">
             {/* Analysis Section */}
             <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Brain size={16} className="text-[var(--accent)]"/><Typo variant="h3">Analysis</Typo></div>
                    <Button size="sm" onClick={handleAnalyze} disabled={analyzing || progression.length===0}>{analyzing?<Loader2 size={12} className="animate-spin"/>:"Analyze"}</Button>
                </div>
                {analysis ? (
                    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                        <Typo variant="body" className="text-[var(--text-main)] italic">"{analysis.summary}"</Typo>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="p-2 bg-[var(--bg-element)] rounded flex flex-col"><Typo variant="label">Emotion</Typo><span className="text-xs">{analysis.emotionalArc}</span></div>
                            <div className="p-2 bg-[var(--bg-element)] rounded flex flex-col"><Typo variant="label">Complexity</Typo><span className="text-xs">{analysis.harmonicComplexity}</span></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 opacity-50"><Typo variant="sub">Add chords and click analyze to get insights.</Typo></div>
                )}
             </div>

             {/* Suggestions Section */}
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Sparkles size={16} className="text-[var(--accent)]"/><Typo variant="h3">Suggestions</Typo></div>
                    <Button size="sm" onClick={handleSuggest} disabled={loading}>{loading?<Loader2 size={12} className="animate-spin"/>:<RefreshCw size={12}/>}</Button>
                </div>
                
                {suggestions.length > 0 ? (
                    <div className="grid gap-3">
                        {suggestions.map((s, i) => {
                            const c = buildChord(s.root, s.quality as any, { extension: s.extension, romanNumeral: s.roman, theoryInfo: s.explanation });
                            return (
                                <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-[var(--bg-element)] border border-[var(--border)] group hover:border-[var(--accent)] transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-[var(--text-main)]">{c.symbol}</span>
                                            <Badge variant="outline">{s.confidence}% Match</Badge>
                                        </div>
                                        <Typo variant="sub" className="line-clamp-2">{s.explanation}</Typo>
                                    </div>
                                    <Button size="icon" className="shrink-0 opacity-0 group-hover:opacity-100" onClick={() => onAppendChords([c])}><Plus size={14}/></Button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 opacity-50 border border-dashed border-[var(--border)] rounded-xl">
                        <Typo variant="sub">Ask AI for the next chord based on current mood.</Typo>
                    </div>
                )}
             </div>
        </div>
    );
};
