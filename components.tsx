
import React, { useState, useEffect, useRef, useMemo, Component } from 'react';
import { Play, Square, Gauge, Zap, Activity, Moon, Sun, ChevronDown, Music, Check, Brain, Plus, X, Sparkles, Loader2, PanelLeft, Trash2, Magnet, BookOpen, ArrowRight, Ban, Mic, FileSearch, AlertTriangle } from 'lucide-react';
import { 
  CIRCLE_KEYS, Chord, Note, ScaleType, SplitAccessory,
  generateOrbitalLayout, getTempoFromArousal,
  generateSecondaryDominants, generateBorrowedChords, SCALE_DEFS,
  generateSuggestions, analyzeHarmony, AiSuggestion, AiAnalysis, buildChord, getIntervalDescription, ChordComplexity, audioEngine, getCompassLabel
} from './lib';

const INSTRUMENTS = [
  {id:'rhodes', label:'Electric Keys', icon:Music, desc:'Warm, bell-like tones'},
  {id:'pad', label:'Ethereal Pad', icon:Activity, desc:'Sustained atmospheric wash'},
  {id:'pluck', label:'Glass Pluck', icon:Zap, desc:'Short, sharp, percussive'},
  {id:'synth', label:'Analog Synth', icon:Mic, desc:'Rich harmonics'}
];

export const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

// --- UTILITY COMPONENTS ---

// Helper to set a custom drag image (the "Ghost")
const setDragGhost = (e: React.DragEvent, text: string) => {
    // Only works if browser supports setDragImage and dataTransfer exists
    if (e.dataTransfer && e.dataTransfer.setDragImage) {
        const el = document.createElement('div');
        // Tailwind classes to style the ghost pill
        el.className = "fixed top-0 left-0 bg-[var(--accent)] text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-xl z-[9999] pointer-events-none transform -translate-x-[1000px] border border-white/20 whitespace-nowrap";
        el.innerText = text;
        document.body.appendChild(el);
        e.dataTransfer.setDragImage(el, 0, 0);
        // Clean up DOM element after drag starts
        setTimeout(() => document.body.removeChild(el), 0);
    }
};

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: any): ErrorBoundaryState { 
    return { hasError: true }; 
  }

  componentDidCatch(error: any, errorInfo: any) { 
    console.error("Uncaught error:", error, errorInfo); 
  }

  render() {
    if (this.state.hasError) {
      // Use fallback if provided, otherwise default error UI
      return this.props.fallback || <div className="p-4 text-red-500 text-sm flex items-center gap-2"><AlertTriangle size={16}/><span>Something went wrong.</span></div>;
    }
    return this.props.children;
  }
}

export const Typo: React.FC<{ variant?: 'h1'|'h2'|'h3'|'label'|'mono'|'body'|'sub'; as?: any; children: React.ReactNode; className?: string }> = ({ variant='body', as, children, className }) => {
    const Component = as || (variant?.startsWith('h') ? variant : 'div');
    const s = { 
      h1: "text-2xl font-light text-[var(--text-main)]", h2: "text-lg font-medium text-[var(--text-main)]", h3: "text-sm font-medium text-[var(--text-main)]", 
      label: "text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]", mono: "font-mono text-[10px] text-[var(--text-muted)]", 
      body: "text-sm text-[var(--text-muted)] leading-relaxed", sub: "text-xs text-[var(--text-dim)]" 
    };
    return <Component className={cn(s[variant], className)}>{children}</Component>;
};

export const Surface: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: 'panel'|'element'|'card'|'ghost'|'tooltip'; interactive?: boolean; active?: boolean }> = ({ children, className, interactive, variant='panel', active, ...props }) => {
    const v = { 
      panel: "bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl", element: "bg-[var(--bg-element)] border border-[var(--border)] rounded-lg", 
      card: "bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl", ghost: "bg-transparent border border-transparent rounded-lg", 
      tooltip: "bg-[#09090b] border border-[var(--border)] shadow-xl rounded-md z-50 text-xs" 
    };
    return <div className={cn("interact-base", v[variant], interactive && "cursor-pointer interact-lift", active && "border-[var(--accent)] bg-[var(--bg-surface)] ring-1 ring-[var(--accent)]", className)} {...props}>{children}</div>;
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger'; size?: 'sm'|'md'|'icon'; icon?: any; active?: boolean }> = ({ variant='secondary', size='md', className, children, icon: Icon, active, ...props }) => {
    const v = { primary: "bg-[var(--accent)] text-black shadow-md border border-transparent", secondary: "bg-[var(--bg-element)] text-[var(--text-main)] border border-[var(--border)]", ghost: "bg-transparent text-[var(--text-muted)] border border-transparent", danger: "bg-red-500/10 text-red-400 border border-red-500/20" };
    const s = { sm: "px-2 py-0 h-7 text-[10px]", md: "px-4 py-2 text-sm h-10", icon: "p-2 h-8 w-8" };
    
    // Use interact-scale for ghost/icon buttons for a lighter feel, interact-push for solid buttons
    const interactionClass = (variant === 'ghost' || size === 'icon') ? 'interact-scale' : 'interact-push';

    return <button className={cn("flex items-center justify-center gap-1.5 rounded-md font-medium interact-base disabled:opacity-50 disabled:pointer-events-none outline-none select-none", v[variant], s[size], interactionClass, active && "bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--border)]", className)} {...props}>{Icon && <Icon size={14}/>}{children}</button>;
};

export const IconButton: React.FC<any> = ({size='icon', ...props}) => <Button size={size} variant="ghost" {...props} />;

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {variant?:'default'|'ghost', size?:'sm'|'md'}> = ({variant='default', size='md', className, ...props}) => 
  <input className={cn("font-bold outline-none interact-base interact-input", size==='sm'?"h-7 text-[11px] px-2 rounded-[6px]":"h-8 text-xs px-3 rounded-md", variant==='default'?"bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-hover)] placeholder:text-[var(--text-dim)] shadow-sm":"bg-transparent border border-transparent text-[var(--text-main)] hover:bg-[var(--bg-element)]", className)} {...props}/>;

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {variant?:'default'|'ghost', size?:'sm'|'md'}> = ({variant='default', size='md', className, ...props}) => 
  <div className="relative group w-full"><select className={cn("appearance-none w-full font-bold outline-none interact-base interact-input cursor-pointer", size==='sm'?"h-7 text-[11px] px-2 rounded-[6px] pr-5":"h-8 text-xs px-3 rounded-md pr-8", variant==='default'?"bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--border-hover)] shadow-sm":"bg-transparent border border-transparent text-[var(--text-main)] hover:bg-[var(--bg-element)]", className)} {...props}/><div className="absolute right-1 top-1/2 -translate-x-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-main)] interact-base"><ChevronDown size={size==='sm'?12:14}/></div></div>;

export const Badge: React.FC<{children:React.ReactNode, variant?:'default'|'outline'|'accent'|'scientific', className?:string}> = ({children, variant='default', className}) => 
  <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border select-none interact-base", variant==='accent'?"bg-[var(--accent)] text-black border-transparent":variant==='outline'?"bg-transparent border-[var(--border)] text-[var(--text-muted)]":variant==='scientific'?"bg-[var(--bg-main)] border-[var(--accent)] text-[var(--accent)]":"bg-[var(--bg-element)] text-[var(--text-muted)] border-[var(--border)]", className)}>{children}</span>;

export const Tabs: React.FC<{items:{id:string, label:string, icon?:any}[], active:string, onChange:(id:string)=>void, className?:string}> = ({items, active, onChange, className}) => 
  <div className={cn("flex border-b border-[var(--border)] bg-[var(--bg-panel)] w-full overflow-x-auto scrollbar-hide", className)}>{items.map(t=><button key={t.id} onClick={()=>onChange(t.id)} className={cn("flex-1 py-3 px-4 min-w-fit text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 interact-base outline-none", active===t.id?"border-[var(--accent)] text-[var(--text-main)]":"border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-element)]")}>{t.icon && <t.icon size={14} className={active===t.id?"text-[var(--accent)]":"opacity-50"}/>}<span>{t.label}</span></button>)}</div>;

export const Card = Surface;

// --- SWIFT-STYLE PANEL WRAPPER ---
export const PanelWrapper: React.FC<{
    minimise: number;
    overscroll: number;
    isFull: boolean;
    bgColor: string;
    children: React.ReactNode;
    overlay: React.ReactNode;
    anchor: 'top' | 'bottom';
}> = ({ minimise, overscroll, isFull, bgColor, children, overlay, anchor }) => {
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
                    <div className="flex gap-1">
                        {leading.map(item => (
                            <ScaleDownButton key={item.id} onClick={item.action} isActive={item.active}>
                                <item.icon size={18} strokeWidth={2.5} />
                            </ScaleDownButton>
                        ))}
                    </div>
                    <div
                        className="w-14 h-8 flex items-center justify-center cursor-row-resize touch-none group hover:bg-white/5 rounded-lg transition-colors active:bg-white/10"
                        onMouseDown={onDragStart}
                        onTouchStart={onDragStart}
                    >
                        <div className="w-10 h-1 bg-[#48484a] rounded-full group-hover:bg-[#636366] interact-base group-active:scale-x-110" />
                    </div>
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

// --- TIMELINE NODE ---
const PIXELS_PER_BEAT = 40, SNAP_GRID = 0.25;
export const TimelineNode: React.FC<{ chord: Chord; index: number; isActive: boolean; onRemove: (i:number)=>void; onResize: (i:number, beats:number)=>void; onDragStart: (e:React.DragEvent<HTMLDivElement>)=>void; onDragEnter: ()=>void; onDragLeave: ()=>void; onDrop: (e:React.DragEvent<HTMLDivElement>)=>void; isDropTarget: boolean; isDragging: boolean; }> = ({ chord, index, isActive, onRemove, onResize, onDragStart, onDragEnter, onDragLeave, onDrop, isDropTarget, isDragging }) => {
    const [tempWidth, setTempWidth] = useState<number|null>(null);
    const [isExiting, setIsExiting] = useState(false);
    const width = (tempWidth!==null?tempWidth:chord.duration*PIXELS_PER_BEAT);
    const handleResize = (dx:number) => setTempWidth(Math.max(PIXELS_PER_BEAT*0.5, (chord.duration*PIXELS_PER_BEAT)+dx));
    const handleResizeEnd = () => { if(tempWidth!==null){ onResize(index, Math.round((tempWidth/PIXELS_PER_BEAT)/SNAP_GRID)*SNAP_GRID); setTempWidth(null); } };
    const handleRemove = (e:React.MouseEvent) => { e.stopPropagation(); setIsExiting(true); setTimeout(()=>onRemove(index), 300); };
    return (
        <div draggable={!chord.isRest} onDragStart={(e) => { 
                onDragStart(e); 
                setDragGhost(e, chord.symbol); // Visual Enhancement
                if(e.dataTransfer){
                     e.dataTransfer.setData('reorder_index', index.toString());
                     (e.dataTransfer as any).effectAllowed = 'move';
                }
            }} 
            onDragOver={(e)=>{
                e.preventDefault();
                // Safer check for dataTransfer
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
            {/* ENHANCED DROP TARGET VISUAL */}
            {isDropTarget && (
                <div className="absolute -left-1.5 top-0 bottom-0 w-3 z-50 flex items-center justify-center pointer-events-none -translate-x-1/2">
                    <div className="h-full w-1 bg-[var(--accent)] shadow-[0_0_15px_var(--accent)] rounded-full animate-pulse" />
                    <div className="absolute bg-[var(--bg-surface)] border border-[var(--accent)] text-[var(--accent)] rounded-full p-0.5 shadow-lg transform scale-75 animate-bounce">
                        <Plus size={10} strokeWidth={3} />
                    </div>
                </div>
            )}
            
            <div className={cn("h-full w-full rounded-md border flex flex-col overflow-hidden relative shadow-sm interact-base interact-lift-sm", isActive?"border-[var(--accent)] bg-[var(--bg-surface)] shadow-md z-10 scale-[1.02]":chord.isRest?"border-[var(--border)] bg-[var(--bg-main)] opacity-60":"border-[var(--border)] bg-[var(--bg-element)]")}>
                 <div className="absolute inset-0 pointer-events-none flex" style={{opacity:0.1}}>{Array.from({length:Math.ceil(width/PIXELS_PER_BEAT)}).map((_,i)=><div key={i} className="h-full border-r border-[var(--text-muted)] flex-1" style={{width:`${PIXELS_PER_BEAT}px`,flex:'none'}}/>)}</div>
                 {chord.isRest && <div className="absolute inset-0 opacity-10" style={{backgroundImage:'linear-gradient(45deg, var(--text-muted) 25%, transparent 25%, transparent 50%, var(--text-muted) 50%, var(--text-muted) 75%, transparent 75%, transparent)',backgroundSize:'6px 6px'}}/>}
                 <div className="relative z-10 p-0.5 h-full flex flex-row items-center justify-between gap-0.5">
                     <div className="flex items-center gap-1 min-w-0">
                        {!chord.isRest ? <span className={cn("text-[7px] font-bold font-mono px-0.5 rounded-[2px] leading-none shrink-0 interact-base", isActive?"bg-[var(--accent)] text-black":"bg-[var(--bg-main)] text-[var(--text-muted)]")}>{chord.romanNumeral}</span> : null}
                        {!chord.isRest ? <span className={cn("font-bold tracking-tight truncate leading-none interact-base", isActive?"text-[var(--text-main)] text-[10px]":"text-[var(--text-muted)] text-[9px]")}>{chord.symbol}</span> : <Ban size={10} className="text-[var(--text-muted)] opacity-50 ml-0.5"/>}
                     </div>
                     <button onClick={handleRemove} disabled={isExiting} className="text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover/node:opacity-100 interact-base interact-scale p-0.5 rounded hover:bg-red-500/10 shrink-0"><X size={8}/></button>
                 </div>
                 {!chord.isRest && <div onMouseDown={(e)=>{e.stopPropagation();e.preventDefault();const s=e.clientX;const mv=(ev:MouseEvent)=>handleResize(ev.clientX-s);const up=()=>{document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);handleResizeEnd()};document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);}} className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize group z-50 flex items-center justify-center hover:bg-[var(--accent)]/10 interact-base"><div className="w-0.5 h-2 bg-[var(--text-muted)] rounded-full group-hover:bg-[var(--accent)] interact-base opacity-50 group-hover:scale-y-125"/></div>}
                 {chord.isRest && <div className="absolute right-0 top-0 bottom-0 w-full flex items-center justify-center pointer-events-none"><div className="w-full h-px bg-[var(--text-muted)] opacity-20 -rotate-45 transform origin-center"/></div>}
            </div>
            <div className="absolute -bottom-2.5 left-0 right-0 text-center opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none"><span className="text-[6px] font-mono font-bold text-[var(--text-muted)]">{chord.duration}</span></div>
        </div>
    );
};

export const ProgressionStrip: React.FC<{ progression: Chord[]; onRemove: (i:number)=>void; activeIndex: number|null; onDropChord: (c:Chord, index?:number)=>void; draggingChord: Chord|null; availableChords: Chord[]; onLoadTemplate?: (c:Chord[])=>void; onClear?: ()=>void; onQuantize?: ()=>void; isPlaying?: boolean; onReorder?: (from: number, to: number) => void; onResize?: (index: number, duration: number) => void; timeSignature: { num: number, den: number }; onSetTimeSignature: (ts: { num: number, den: number }) => void; }> = ({ progression, onRemove, activeIndex, onDropChord, availableChords, onReorder, onResize, timeSignature, onSetTimeSignature, onClear, onQuantize }) => {
    const scrollRef = useRef<HTMLDivElement>(null), [draggingIndex, setDraggingIndex] = useState<number|null>(null), [dropTarget, setDropTarget] = useState<number|null>(null), [sidebarWidth, setSidebarWidth] = useState(60);
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
        const onMove = (clientX: number) => { setSidebarWidth(Math.max(50, Math.min(120, startWidth + (clientX - startX)))); };
        const mouseMove = (ev: MouseEvent) => onMove(ev.clientX);
        const touchMove = (ev: TouchEvent) => onMove(ev.touches[0].clientX);
        const stop = () => { if (isTouch) { document.removeEventListener('touchmove', touchMove); document.removeEventListener('touchend', stop); } else { document.removeEventListener('mousemove', mouseMove); document.removeEventListener('mouseup', stop); } };
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
                            (e.dataTransfer as any).effectAllowed='move';
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
                els.push(<div key={`bar-${i}`} className="flex flex-col items-center justify-start h-9 w-px bg-[var(--border)] mx-0.5 relative shrink-0"><span className="absolute -top-3 text-[6px] font-mono font-bold text-[var(--text-dim)]">{barNum}</span></div>);
            }
        });
        
        // Add Button / End Drop Target
        const isEndTarget = dropTarget === progression.length;
        els.push(
            <div key="add-btn" 
                onClick={()=>{const t=availableChords.find(c=>c.romanNumeral==='I'||c.romanNumeral==='i');if(t)onDropChord(t)}} 
                onDragOver={(e)=>{
                    e.preventDefault(); 
                    setDropTarget(progression.length); 
                    if(e.dataTransfer) (e.dataTransfer as any).dropEffect='move';
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
        <div style={{width:sidebarWidth}} className="border-r border-[var(--border)] bg-[var(--bg-panel)] flex flex-col items-center py-2 px-1 gap-4 shrink-0 h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] select-none relative transition-none">
            <div onMouseDown={handleSidebarResize} onTouchStart={handleSidebarResize} className="absolute top-0 right-0 bottom-0 w-8 -mr-4 cursor-col-resize z-50 flex justify-center group/resize touch-none"><div className="w-px h-full bg-transparent group-hover/resize:bg-[var(--accent)] interact-base opacity-50"/></div>
            <div className="shrink-0"><Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--text-muted)] hover:text-[var(--text-main)]"><PanelLeft size={16}/></Button></div>
            <div className="flex flex-col items-center gap-1 w-full px-1.5">{sidebarWidth>55 && <Typo variant="label" className="text-[9px] opacity-60">METER</Typo>}<div onClick={cycleTimeSignature} className="w-full aspect-square bg-[var(--bg-surface)] border border-[var(--border)] interact-lift rounded-xl flex flex-col items-center justify-center cursor-pointer group select-none relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 interact-base pointer-events-none"/><span className="text-xl font-black leading-none text-[var(--text-main)] group-hover:text-[var(--accent)] interact-base translate-y-0.5">{timeSignature.num}</span><span className="text-xl font-black leading-none text-[var(--text-main)] group-hover:text-[var(--accent)] interact-base -translate-y-0.5">{timeSignature.den}</span></div></div>
            <div className="mt-auto w-full px-1 mb-1 flex flex-col gap-1">
                <Button variant="ghost" size="icon" onClick={onClear} className="w-full h-8 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10"><Trash2 size={14}/></Button>
                <Button variant="ghost" size="icon" onClick={onQuantize} className="w-full h-8 text-[var(--text-muted)] hover:text-[var(--accent)]"><Magnet size={14}/></Button>
            </div>
        </div>
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[var(--bg-main)] relative select-none">
             <div className="h-full flex items-center px-4 gap-1 min-w-max" ref={scrollRef}>{timelineElements}</div>
        </div>
      </div>
    );
};

// --- HEADER ---
export const Header: React.FC<any> = ({ isPlaying, togglePlay, theme, toggleTheme, instrument, setInstrument, keyNote, setKey, scale, setScale, bpm, setBpm }) => (
    <div className="h-[68px] flex items-center px-6 gap-6 bg-[var(--bg-panel)] shrink-0 z-30 select-none border-b border-[var(--border)]">
        <Button onClick={togglePlay} variant="primary" size="icon" className="h-10 w-10 rounded-full shadow-[0_4px_12px_rgba(209,58,52,0.3)] hover:shadow-[0_6px_20px_rgba(209,58,52,0.5)] interact-scale">{isPlaying ? <Square fill="currentColor" size={16}/> : <Play fill="currentColor" className="ml-0.5" size={16}/>}</Button>
        <div className="h-8 w-px bg-[var(--border)]"/>
        <div className="flex flex-col gap-0.5"><Typo variant="label">KEY</Typo><div className="flex items-center gap-2"><Select value={keyNote} onChange={(e)=>setKey(e.target.value)} size="sm" className="w-14" variant="ghost">{CIRCLE_KEYS.map(k=><option key={k} value={k}>{k}</option>)}</Select><Select value={scale} onChange={(e)=>setScale(e.target.value)} size="sm" className="w-24" variant="ghost">{Object.values(ScaleType).map(s=><option key={s} value={s}>{s}</option>)}</Select></div></div>
        <div className="h-8 w-px bg-[var(--border)]"/>
        <div className="flex flex-col gap-0.5"><Typo variant="label">TEMPO</Typo><div className="flex items-center gap-2"><div className="relative group w-16 interact-base"><Input type="number" value={bpm} onChange={(e)=>setBpm(parseInt(e.target.value))} className="w-full text-center pr-3 font-mono" size="sm" variant="ghost"/><span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] text-[var(--text-muted)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">BPM</span></div></div></div>
        <div className="flex-1"/>
        <div className="flex items-center gap-1 bg-[var(--bg-element)] p-1 rounded-lg border border-[var(--border)]">{INSTRUMENTS.map(i => <button key={i.id} onClick={()=>setInstrument(i.id)} className={cn("p-1.5 rounded-md interact-scale relative group", instrument===i.id?"bg-[var(--bg-surface)] text-[var(--accent)] shadow-sm":"text-[var(--text-muted)] hover:text-[var(--text-main)]")}><i.icon size={16}/><Surface variant="tooltip" className="absolute top-full right-0 mt-2 p-2 w-32 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"><div className="font-bold mb-0.5">{i.label}</div><div className="text-[var(--text-dim)] text-[10px]">{i.desc}</div></Surface></button>)}</div>
    </div>
);

// --- MOOD SELECTOR ---
export const MoodSelector: React.FC<any> = ({ theme, currentScale, currentKey, onManualScaleSelect, onTempoChange, mood, onMoodChange }) => {
    const handleMove = (e: any) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        const v = (x * 2 - 1), a = ((1 - y) * 2 - 1);
        onMoodChange(v, a);
    };

    return (
        <div className="w-full h-full flex flex-col p-6 items-center justify-center">
             <Typo variant="h2" className="mb-6 opacity-80 font-light tracking-wide">How should this feel?</Typo>
             <div className="relative w-64 h-64 rounded-3xl cursor-pointer shadow-2xl interact-lift touch-none border border-[var(--border)] overflow-hidden" 
                 onMouseDown={(e)=>{handleMove(e); const mv=(ev:MouseEvent)=>handleMove(ev); const up=()=>{window.removeEventListener('mousemove',mv); window.removeEventListener('mouseup',up)}; window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up)}}
                 onTouchStart={(e)=>{handleMove(e); const mv=(ev:TouchEvent)=>handleMove(ev); const up=()=>{window.removeEventListener('touchmove',mv); window.removeEventListener('touchend',up)}; window.addEventListener('touchmove',mv); window.addEventListener('touchend',up)}}
                 style={{background: `radial-gradient(circle at ${((mood.valence+1)/2)*100}% ${(1-(mood.arousal+1)/2)*100}%, var(--accent), transparent 70%), var(--bg-surface)`}}
             >
                 <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(var(--text-muted) 1px, transparent 1px)', backgroundSize: '20px 20px'}}/>
                 <div className="absolute top-4 left-0 right-0 text-center text-[10px] font-bold text-[var(--text-muted)] opacity-50">HIGH ENERGY</div>
                 <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] font-bold text-[var(--text-muted)] opacity-50">CALM</div>
                 <div className="absolute left-4 top-0 bottom-0 flex items-center text-[10px] font-bold text-[var(--text-muted)] opacity-50 -rotate-90 origin-center">NEGATIVE</div>
                 <div className="absolute right-4 top-0 bottom-0 flex items-center text-[10px] font-bold text-[var(--text-muted)] opacity-50 rotate-90 origin-center">POSITIVE</div>
                 <div className="absolute w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 border-[var(--bg-main)] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none interact-base" style={{left: `${((mood.valence+1)/2)*100}%`, top: `${(1-(mood.arousal+1)/2)*100}%`}}/>
             </div>
             <Typo variant="mono" className="mt-6 text-[var(--accent)]">{getCompassLabel(mood.valence, mood.arousal)}</Typo>
        </div>
    );
};

// --- GRAVITY STAGE ---
export const GravityStage: React.FC<any> = ({ currentKey, scaleType, chords, onAddChord, onChordClick, contextChord }) => {
    const layout = useMemo(() => generateOrbitalLayout(chords), [chords]);
    return (
        <div className="w-full h-full relative overflow-hidden bg-[var(--bg-main)] flex items-center justify-center">
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{background: 'radial-gradient(circle at center, var(--accent), transparent 60%)'}}/>
            {layout.map((c: Chord, i: number) => (
                <div key={i} 
                    className={cn("absolute flex flex-col items-center justify-center w-16 h-16 rounded-full cursor-pointer interact-base interact-scale border border-[var(--border)] bg-[var(--bg-surface)] shadow-lg hover:border-[var(--accent)] group z-10")}
                    style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}
                    onClick={() => { onChordClick(c); onAddChord(c); }}
                    draggable
                    onDragStart={(e) => { 
                        if(e.dataTransfer) e.dataTransfer.setData('application/json', JSON.stringify(c)); 
                        setDragGhost(e, c.symbol);
                    }}
                >
                    <span className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--accent)]">{c.symbol}</span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">{c.romanNumeral}</span>
                </div>
            ))}
            <div className="absolute bottom-4 left-0 right-0 text-center"><Typo variant="sub">Drag chords to timeline</Typo></div>
        </div>
    );
};

// --- THEORY TOOLS ---
export const TheoryTools: React.FC<any> = ({ currentKey, scaleType, onAppendChords }) => {
    const [mode, setMode] = useState<'secondary'|'borrowed'>('secondary');
    const chords = useMemo(() => mode === 'secondary' ? generateSecondaryDominants(currentKey, scaleType) : generateBorrowedChords(currentKey, scaleType), [currentKey, scaleType, mode]);
    
    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <Typo variant="h2">Advanced Harmony</Typo>
                <div className="flex bg-[var(--bg-element)] rounded-lg p-1 border border-[var(--border)]">
                    <button onClick={()=>setMode('secondary')} className={cn("px-3 py-1 text-xs font-medium rounded-md interact-base", mode==='secondary'?"bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm":"text-[var(--text-muted)] hover:text-[var(--text-main)]")}>Secondary Dominants</button>
                    <button onClick={()=>setMode('borrowed')} className={cn("px-3 py-1 text-xs font-medium rounded-md interact-base", mode==='borrowed'?"bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm":"text-[var(--text-muted)] hover:text-[var(--text-main)]")}>Borrowed Chords</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {chords.map((c, i) => (
                    <Card key={i} interactive className="p-4 flex flex-col gap-2 relative group" onClick={()=>onAppendChords([c])} draggable onDragStart={(e)=>{
                        if(e.dataTransfer) e.dataTransfer.setData('application/json', JSON.stringify(c));
                        setDragGhost(e, c.symbol);
                    }}>
                         <div className="flex justify-between items-start">
                             <span className="text-xl font-bold text-[var(--text-main)] group-hover:text-[var(--accent)]">{c.symbol}</span>
                             <Badge variant="scientific">{c.romanNumeral}</Badge>
                         </div>
                         <Typo variant="sub" className="line-clamp-2">{c.theoryInfo}</Typo>
                         <div className="mt-auto pt-2 flex items-center gap-1 text-[var(--text-dim)] text-[10px] uppercase font-bold tracking-wider"><Sparkles size={10}/><span>{c.emotionalDesc}</span></div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// --- AI ASSISTANT ---
export const AiAssistant: React.FC<any> = ({ mood, currentKey, currentScale, progression, onAppendChords }) => {
    const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
    const [analysis, setAnalysis] = useState<AiAnalysis | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>('suggest');

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            if (activeTab === 'suggest') {
                const res = await generateSuggestions(currentKey, currentScale, mood.valence, mood.arousal, progression);
                setSuggestions(res);
            } else {
                const res = await analyzeHarmony(progression, currentKey, currentScale);
                setAnalysis(res);
            }
        } catch (e) {
            console.error(e);
            setError("AI service is temporarily unavailable. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[var(--bg-panel)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[var(--accent)]"><Brain size={18} /><Typo variant="h2">Harmonic Intelligence</Typo></div>
                <div className="flex bg-[var(--bg-element)] rounded-lg p-0.5 border border-[var(--border)]">
                    <button onClick={()=>{setActiveTab('suggest'); setError(null);}} className={cn("px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md interact-base", activeTab==='suggest'?"bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm":"text-[var(--text-muted)] hover:text-[var(--text-main)]")}>Suggest</button>
                    <button onClick={()=>{setActiveTab('analyze'); setError(null);}} className={cn("px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md interact-base", activeTab==='analyze'?"bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm":"text-[var(--text-muted)] hover:text-[var(--text-main)]")}>Analyze</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
                {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 border border-dashed border-red-500/30 rounded-xl bg-red-500/5">
                        <AlertTriangle className="text-red-400 mb-3" size={32} />
                        <Typo variant="body" className="text-red-300 font-medium">{error}</Typo>
                        <Button variant="secondary" onClick={handleGenerate} className="mt-4"><Sparkles size={14}/> Try Again</Button>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
                        <Typo variant="mono">CONSULTING NEURAL ENGINE...</Typo>
                    </div>
                ) : (
                    <>
                        {activeTab === 'suggest' && (
                            <div className="space-y-4">
                                {suggestions.length === 0 && (
                                    <div className="text-center py-12 opacity-50">
                                        <Sparkles className="mx-auto mb-4 text-[var(--accent)]" size={32} />
                                        <Typo variant="body">Generate intelligent chord suggestions based on your current progression and mood.</Typo>
                                    </div>
                                )}
                                {suggestions.map((s, i) => (
                                    <Card key={i} interactive className="p-4 flex flex-row items-center justify-between group" onClick={() => {
                                        const c = buildChord(s.root, s.quality as any, { extension: s.extension, roman: s.roman, emotion: s.explanation });
                                        onAppendChords([c]);
                                    }}>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--accent)]">{s.root}{s.quality === 'Minor' ? 'm' : ''}{s.extension}</span>
                                                <Badge variant="outline">{s.roman}</Badge>
                                                <Badge variant="accent" className="opacity-0 group-hover:opacity-100 transition-opacity">{(s.confidence * 100).toFixed(0)}% Match</Badge>
                                            </div>
                                            <Typo variant="sub">{s.explanation}</Typo>
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-[var(--bg-element)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-[var(--accent)] group-hover:text-black interact-scale transition-colors"><Plus size={16} /></div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {activeTab === 'analyze' && (
                            <div className="space-y-6">
                                {!analysis && (
                                    <div className="text-center py-12 opacity-50">
                                        <FileSearch className="mx-auto mb-4 text-[var(--accent)]" size={32} />
                                        <Typo variant="body">Get a deep theoretical breakdown of your harmonic structure.</Typo>
                                    </div>
                                )}
                                {analysis && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <Surface variant="element" className="p-4 flex flex-col gap-2">
                                                <Typo variant="label">Harmonic Score</Typo>
                                                <div className="text-3xl font-light text-[var(--accent)]">{analysis.rating}/100</div>
                                            </Surface>
                                            <Surface variant="element" className="p-4 flex flex-col gap-2">
                                                <Typo variant="label">Complexity</Typo>
                                                <div className="text-lg font-medium text-[var(--text-main)]">{analysis.harmonicComplexity}</div>
                                            </Surface>
                                        </div>
                                        <Surface variant="panel" className="p-5 space-y-4">
                                            <div><Typo variant="label" className="mb-1 block">SUMMARY</Typo><Typo variant="body" className="text-[var(--text-main)]">{analysis.summary}</Typo></div>
                                            <div className="h-px bg-[var(--border)]" />
                                            <div><Typo variant="label" className="mb-1 block">EMOTIONAL ARC</Typo><Typo variant="body" className="italic opacity-80">{analysis.emotionalArc}</Typo></div>
                                        </Surface>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="p-4 border-t border-[var(--border)] shrink-0 bg-[var(--bg-glass)] backdrop-blur-md">
                <Button variant="primary" onClick={handleGenerate} disabled={loading} className="w-full h-12 text-sm uppercase tracking-widest font-bold shadow-lg shadow-[var(--accent)]/20 hover:shadow-[var(--accent)]/40">
                    {loading ? 'Processing...' : activeTab === 'suggest' ? 'Generate Ideas' : 'Run Deep Analysis'}
                </Button>
            </div>
        </div>
    );
};
