
import React, { useMemo, useState, useEffect } from 'react';
import { Chord } from '../types';
import { getHarmonicCompatibility, generateOrbitalLayout } from '../utils/musicTheory';
import { Plus } from 'lucide-react';
import { cn } from './UI';

const SectorLabel = ({ angle, label, radius = 45 }: { angle: number, label: string, radius?: number }) => {
    const rad = (angle * Math.PI) / 180;
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);
    return (
        <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold tracking-[0.2em] text-white/20 uppercase font-mono pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%` }}
        >
            {label}
        </div>
    );
};

export default ({ currentKey, scaleType, chords, onAddChord, onInspectChord, triggerMode = 'drag', onChordClick, onDragStart, contextChord }: any) => {
  const [hover, setHover] = useState<Chord | null>(null);
  const [selected, setSelected] = useState<Chord | null>(null);
  
  const nodes = useMemo(() => generateOrbitalLayout(chords), [chords]);
  const activeTarget = hover || selected;
  const source = contextChord; 

  useEffect(() => { setSelected(null); }, [currentKey, scaleType]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent | React.KeyboardEvent, n: any) => {
      e.stopPropagation();
      if (triggerMode === 'click') { onChordClick(n); return; }
      if (selected?.root === n.root) { onAddChord(n); setSelected(null); } 
      else { setSelected(n); onChordClick(n); onInspectChord?.(n); }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, n: any) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleInteraction(e, n);
      }
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-transparent group/stage" onClick={() => setSelected(null)}>
        <div className="relative w-full h-full max-w-full max-h-full aspect-square mx-auto p-12">
            
            {/* Minimal Background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <defs>
                    <radialGradient id="star-glow" cx="0.5" cy="0.5" r="0.5">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.1"/>
                        <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
                    </radialGradient>
                </defs>
                
                {/* Orbital Rings */}
                <circle cx="50%" cy="50%" r="28%" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <circle cx="50%" cy="50%" r="38%" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="2 6" />
                
                {/* Center Glow */}
                <circle cx="50%" cy="50%" r="20%" fill="url(#star-glow)" />

                {/* Connections */}
                {source && nodes.map((t: any, i: number) => {
                    if (t.root === source.root) return null;
                    const sourceNode = nodes.find((n: any) => n.root === source.root);
                    if (!sourceNode) return null;
                    const aff = getHarmonicCompatibility(source, t);
                    const isTargetHovered = (activeTarget?.root === t.root);
                    if (aff.score > 0.6 || isTargetHovered) {
                        return (
                            <line 
                                key={i} x1={`${sourceNode.x}%`} y1={`${sourceNode.y}%`} x2={`${t.x}%`} y2={`${t.y}%`} 
                                stroke={isTargetHovered ? 'var(--accent)' : 'white'} 
                                strokeWidth={isTargetHovered ? 1.5 : 0.5} 
                                strokeOpacity={isTargetHovered ? 0.6 : (aff.score > 0.8 ? 0.1 : 0.03)} 
                            />
                        );
                    }
                    return null;
                })}
            </svg>

            <SectorLabel angle={270} label="Mediant" />
            <SectorLabel angle={90} label="Submediant" />
            <SectorLabel angle={180} label="Subdominant" />
            <SectorLabel angle={0} label="Dominant" />

            {/* Nodes */}
            {nodes.map((n: any, i: number) => {
                const isHover = hover?.root === n.root;
                const isSelected = selected?.root === n.root;
                const isCenter = n.romanNumeral.match(/^I|^i$|^1$/);
                const isSuggested = (contextChord && !hover && !selected && contextChord.root !== n.root && getHarmonicCompatibility(contextChord, n).score > 0.8);

                return (
                    <div 
                        key={i} role="button" tabIndex={0}
                        draggable={triggerMode === 'drag'} 
                        onDragStart={(e) => { onDragStart?.(n); e.dataTransfer.setData('application/json', JSON.stringify(n)); }} 
                        onClick={(e) => handleInteraction(e, n)}
                        onKeyDown={(e) => handleKeyDown(e, n)}
                        onMouseEnter={() => { setHover(n); onInspectChord?.(n); }} 
                        onMouseLeave={() => setHover(null)} 
                        style={{ left: `${n.x}%`, top: `${n.y}%`, zIndex: (isHover || isSelected) ? 50 : n.z }} 
                        className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                    >
                        {isSuggested && <div className="absolute inset-0 -m-8 rounded-full border border-[var(--accent)] opacity-10 animate-ping pointer-events-none"/>}
                        
                        <div className={cn(
                            "relative flex flex-col items-center justify-center transition-all duration-500 rounded-full border backdrop-blur-md",
                            isCenter 
                                ? "w-20 h-20 bg-[#09090b] border-[var(--accent)] text-white z-10 shadow-[0_0_50px_-15px_var(--accent)]" 
                                : "w-14 h-14 bg-[#121214] border-white/5 text-zinc-500 hover:border-[var(--accent)]/30 hover:bg-[#18181b] hover:scale-110 hover:shadow-[0_0_30px_-10px_var(--accent)] hover:text-zinc-200",
                            isSelected && "scale-125 border-[var(--accent)] bg-black text-white shadow-[0_0_60px_-10px_var(--accent)] z-50 ring-1 ring-[var(--accent)]/50"
                        )}>
                            <span className={cn("font-bold tracking-tighter leading-none", isCenter ? "text-xl" : "text-base")}>{n.symbol}</span>
                            <span className={cn("font-mono uppercase tracking-wider text-[8px] mt-1 opacity-70", isCenter ? "text-[var(--accent)]" : "text-zinc-600")}>{n.romanNumeral}</span>
                            
                            {/* Selection Action */}
                            <div className={cn("absolute inset-0 flex items-center justify-center bg-[var(--accent)] rounded-full transition-all duration-200", isSelected ? "opacity-90 scale-100" : "opacity-0 scale-50 pointer-events-none")}>
                                <Plus className="text-black" size={24} strokeWidth={3} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
