
import React, { useState } from 'react';
import { Chord, ScaleType } from '../types';
import { getCompatibleModes, getScaleNotes, SCALE_DEFS } from '../utils/musicTheory';
import { audioEngine } from '../utils/audioEngine';
import { SectionHeader, Typo, Badge, cn } from './UI';
import { Ruler, Play, Sparkles, ArrowRight, Music2 } from 'lucide-react';

interface ScaleMatcherProps {
    activeChord: Chord;
}

const ScaleMatcher: React.FC<ScaleMatcherProps> = ({ activeChord }) => {
    const modes = getCompatibleModes(activeChord);
    const [playingMode, setPlayingMode] = useState<ScaleType | null>(null);

    const playScale = (scale: ScaleType) => {
        setPlayingMode(scale);
        const notes = getScaleNotes(activeChord.root, scale);
        audioEngine.playDiscovery(notes, 0.2);
        setTimeout(() => setPlayingMode(null), notes.length * 200 + 500);
    };

    return (
        <div className="flex flex-col h-full bg-[#0c0c0e]">
            <SectionHeader title="Harmonic Context" icon={Ruler} />
            
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                {/* Hero Section: Active Chord */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-zinc-800 to-zinc-950 p-6 flex items-center justify-between group shadow-xl">
                    <div className="absolute top-0 right-0 p-3 opacity-10"><Music2 size={64} /></div>
                    <div className="absolute inset-0 bg-[var(--accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="z-10 relative">
                        <Typo variant="label" className="mb-1 text-[var(--accent)]">Target Harmony</Typo>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-white tracking-tighter">{activeChord.symbol}</span>
                            <span className="text-lg font-mono text-zinc-500">{activeChord.quality}</span>
                        </div>
                        <div className="flex gap-2 mt-2 items-center">
                            <Badge variant="outline" className="bg-black/40 backdrop-blur">{activeChord.romanNumeral}</Badge>
                            <span className="text-[10px] uppercase font-bold text-zinc-600 border-l border-zinc-700 pl-2">{activeChord.emotionalDesc}</span>
                        </div>
                    </div>
                </div>

                {/* List of Compatible Modes */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <Typo variant="label" className="flex items-center gap-2">
                            <Sparkles size={12} className="text-purple-400" />
                            Modal Matches
                        </Typo>
                        <span className="text-[10px] text-zinc-600 font-mono">{modes.length} Options</span>
                    </div>

                    {modes.map((m) => {
                        const def = SCALE_DEFS[m.scale];
                        const isPlaying = playingMode === m.scale;
                        const notes = getScaleNotes(activeChord.root, m.scale);
                        
                        return (
                            <div 
                                key={m.scale}
                                className={cn(
                                    "relative rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer group hover:scale-[1.02]",
                                    isPlaying 
                                        ? "bg-zinc-900 border-[var(--accent)] shadow-[0_0_20px_-10px_var(--accent)]" 
                                        : "bg-[#121214] border-white/5 hover:border-white/10 hover:shadow-lg"
                                )}
                                onClick={() => playScale(m.scale)}
                            >
                                {/* Progress Bar / Playback Indicator */}
                                {isPlaying && (
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-[var(--accent)] w-full animate-pulse" />
                                )}

                                <div className="p-4 flex items-center gap-4">
                                    {/* Play Button Icon */}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                        isPlaying ? "bg-[var(--accent)] text-black" : "bg-white/5 text-zinc-400 group-hover:bg-white/10 group-hover:text-white"
                                    )}>
                                        <Play size={16} fill="currentColor" className={isPlaying ? "" : "ml-0.5"} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <span className={cn("font-bold text-sm tracking-wide", isPlaying ? "text-white" : "text-zinc-300 group-hover:text-white")}>
                                                {m.scale}
                                            </span>
                                            <Badge variant={isPlaying ? 'accent' : 'outline'} className="text-[9px]">
                                                {m.colorNote}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 group-hover:text-zinc-400">
                                            <span>{m.nuance}</span>
                                        </div>

                                        {/* Mini Scale Visualizer (Dots) */}
                                        <div className="flex gap-1.5 mt-3">
                                            {notes.map((_, idx) => {
                                                const isRoot = idx === 0;
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className={cn(
                                                            "h-1.5 rounded-full transition-all duration-300",
                                                            isPlaying 
                                                                ? "bg-[var(--accent)] w-4 opacity-80" 
                                                                : isRoot ? "bg-zinc-500 w-3" : "bg-zinc-800 w-1.5 group-hover:bg-zinc-700"
                                                        )}
                                                        style={{ transitionDelay: `${idx * 50}ms` }}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                    
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2">
                                        <ArrowRight size={14} className="text-zinc-600" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ScaleMatcher;
