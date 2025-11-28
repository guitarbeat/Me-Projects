
import React, { useRef, useEffect, useState } from 'react';
import { Chord } from '../types';
import { X, Plus } from 'lucide-react';
import VoiceLeadingConnector from './VoiceLeadingConnector';
import { Typo, cn } from './UI';

const TimelineNode: React.FC<{ chord: Chord, index: number, isActive: boolean, onRemove: (i: number) => void }> = ({ chord, index, isActive, onRemove }) => {
    return (
        <div className="relative flex flex-col items-center group/wrapper z-10 perspective-[1000px]">
            <button 
                className={cn(
                    "relative w-28 h-36 rounded-xl border flex flex-col items-center justify-between py-6 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group/node outline-none overflow-hidden",
                    isActive 
                        ? "bg-[#18181b]/90 border-[var(--accent)] text-white scale-110 shadow-[0_0_50px_-10px_var(--accent)] z-20 translate-y-[-4px]" 
                        : "bg-[#09090b]/60 border-white/5 text-zinc-500 hover:border-white/20 hover:bg-[#121214]/80 hover:shadow-xl hover:text-zinc-200 hover:-translate-y-1 backdrop-blur-md"
                )}
            >
                {/* Active Glow Overlay */}
                {isActive && <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/10 via-transparent to-transparent opacity-100" />}
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                    <span className="text-3xl font-light tracking-tighter">{chord.symbol}</span>
                    <span className={cn(
                        "text-[9px] font-bold font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors",
                        isActive ? "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10" : "text-zinc-600 border-white/5 bg-white/5"
                    )}>
                        {chord.romanNumeral}
                    </span>
                </div>
                
                <span className={cn(
                    "relative z-10 text-[8px] font-medium uppercase tracking-[0.2em] transition-colors",
                    isActive ? "text-zinc-400" : "text-zinc-700 group-hover/node:text-zinc-500"
                )}>
                    {chord.emotionalDesc}
                </span>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover/node:opacity-100 transition-opacity z-30">
                    <div 
                        onClick={(e) => { e.stopPropagation(); onRemove(index); }}
                        className="p-1.5 bg-black/50 hover:bg-red-500/20 hover:text-red-400 text-zinc-500 rounded-lg transition-colors backdrop-blur-sm"
                    >
                        <X size={10} />
                    </div>
                </div>
            </button>
            
            <div className="mt-6 opacity-0 group-hover/wrapper:opacity-100 transition-opacity absolute top-full flex flex-col items-center gap-2 pointer-events-none">
                 <div className="w-px h-4 bg-gradient-to-b from-white/20 to-transparent" />
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Chord {index + 1}</span>
            </div>
        </div>
    );
};

const AddNode: React.FC<{ onDrop: (e: React.DragEvent) => void, active: boolean, onClick: () => void }> = ({ onDrop, active, onClick }) => (
    <div 
        onClick={onClick}
        onDragOver={(e) => { e.preventDefault(); }}
        onDrop={onDrop}
        className={cn(
            "w-28 h-36 rounded-xl border border-dashed flex items-center justify-center transition-all cursor-pointer group",
            active 
                ? "border-[var(--accent)] bg-[var(--accent)]/5 shadow-[0_0_30px_-5px_var(--accent)]" 
                : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"
        )}
    >
        <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
            active ? "bg-[var(--accent)] text-black scale-110" : "bg-white/5 text-zinc-700 group-hover:bg-white/10 group-hover:text-zinc-300 group-hover:scale-110"
        )}>
            <Plus size={18} />
        </div>
    </div>
);

interface ProgressionStripProps {
    progression: Chord[];
    onRemove: (index: number) => void;
    onClear: () => void;
    isPlaying: boolean;
    activeIndex: number | null;
    onDropChord: (c: Chord) => void;
    draggingChord: Chord | null;
    onLoadTemplate: (chords: Chord[]) => void;
    availableChords: Chord[];
}

const ProgressionStrip: React.FC<ProgressionStripProps> = ({ 
    progression, onRemove, activeIndex, onDropChord, draggingChord, availableChords 
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        if (activeIndex !== null && scrollRef.current) {
            const node = scrollRef.current.children[activeIndex] as HTMLElement;
            if (node) {
                node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [activeIndex]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'));
            if (data.root && data.quality) onDropChord(data);
        } catch (err) {}
    };

    return (
        <div className="relative w-full h-full flex flex-col justify-center py-16">
            <div 
                ref={scrollRef}
                className="flex items-center gap-6 px-[50vw] overflow-x-auto custom-scrollbar scroll-smooth h-full pb-10 pt-4"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {progression.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <Typo variant="label" className="opacity-20 text-sm tracking-[0.5em] font-light">Drag Chords to Compose</Typo>
                    </div>
                )}

                {progression.map((chord, i) => (
                    <React.Fragment key={i}>
                        <TimelineNode 
                            chord={chord} 
                            index={i} 
                            isActive={i === activeIndex} 
                            onRemove={onRemove}
                        />
                        {i < progression.length - 1 && (
                            <div className="h-36 flex items-center px-1">
                                <VoiceLeadingConnector prevChord={chord} nextChord={progression[i+1]} />
                            </div>
                        )}
                    </React.Fragment>
                ))}

                <div className="pl-6">
                    <AddNode 
                        onDrop={handleDrop} 
                        active={dragOver || !!draggingChord} 
                        onClick={() => {
                            const tonic = availableChords.find(c => c.romanNumeral === 'I' || c.romanNumeral === 'i');
                            if (tonic) onDropChord(tonic);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProgressionStrip;
