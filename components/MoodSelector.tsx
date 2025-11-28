
import React, { useRef, useEffect } from 'react';
import { ScaleType } from '../types';
import { getScaleNotes, SCALE_DEFS } from '../utils/musicTheory';
import { audioEngine } from '../utils/audioEngine';
import { Gauge, Sparkles, MoveDiagonal, Sun, Moon, Heart, Cloud, Zap } from "lucide-react";
import { Typo } from './UI';
import EmojiGridMapper from './EmojiGridMapper';

export default ({ currentScale, currentKey, onMoodSelect, onManualScaleSelect, onTempoChange }: any) => {
  const last = useRef<ScaleType | null>(null);
  const def = SCALE_DEFS[currentScale];
  const meta = def?.meta || { title: currentScale, desc: 'Custom Vibe', quote: 'Explore the unknown.', characteristic: 'Unique' };

  useEffect(() => { 
      if (currentScale !== last.current) { 
          setTimeout(() => audioEngine.playDiscovery(getScaleNotes(currentKey, currentScale)), 100); 
          last.current = currentScale; 
      } 
  }, [currentScale, currentKey]);

  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center bg-[#09090b] relative p-4 gap-8">
        {/* Left Info Panel */}
        <div className="text-center sm:text-right z-10 order-2 sm:order-1 sm:w-48 animate-in slide-in-from-left-4 duration-700">
            <Typo variant="label" className="text-[var(--accent)] mb-2 flex items-center justify-center sm:justify-end gap-1">
                Current Mode <Sparkles size={10}/>
            </Typo>
            <div className="relative inline-block">
                <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 uppercase leading-none tracking-tighter mb-2">
                    {meta.title}
                </h1>
                <div className="absolute -top-4 -right-4 text-[40px] opacity-5 select-none pointer-events-none font-serif italic">
                    {meta.title.charAt(0)}
                </div>
            </div>
            
            <div className="flex flex-col items-center sm:items-end gap-1 mt-2">
                <span className="text-xs font-bold text-white tracking-wide uppercase">{meta.desc}</span>
                <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-1.5 py-0.5 rounded border border-[var(--accent)]/20">
                    {meta.characteristic}
                </span>
            </div>
        </div>

        {/* Center Interaction Area */}
        <div className="relative z-20 order-1 sm:order-2 flex-shrink-0">
            <div className="absolute inset-0 bg-[var(--accent)] opacity-5 blur-[100px] rounded-full pointer-events-none"/>
            <div className="relative">
                 {/* Axis Labels */}
                <div className="absolute inset-0 pointer-events-none opacity-50 z-30">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center mt-2">
                        <Sun size={14} className="text-amber-400 mb-1"/>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">High Energy</span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center mb-2">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mb-1">Low Energy</span>
                        <Moon size={14} className="text-indigo-400"/>
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-row items-center -rotate-90 origin-center -translate-x-6 -ml-1">
                        <Cloud size={14} className="text-slate-400 mr-1"/>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Negative</span>
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row items-center rotate-90 origin-center translate-x-6 -mr-1">
                        <Heart size={14} className="text-rose-400 mr-1"/>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Positive</span>
                    </div>
                </div>
                <EmojiGridMapper onChange={onMoodSelect} scale={currentScale} onTempo={onTempoChange} onScaleSelect={onManualScaleSelect} />
            </div>
        </div>

        {/* Right Info Panel */}
        <div className="text-center sm:text-left z-10 order-3 sm:w-48 opacity-60 hover:opacity-100 transition-opacity hidden sm:block">
            <div className="space-y-4">
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><MoveDiagonal size={14} className="text-slate-400"/></div>
                    <div className="text-left">
                        <div className="text-[9px] font-bold text-white">DRAG TO EXPLORE</div>
                        <div className="text-[8px] text-slate-500">Find your emotional sound</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Gauge size={14} className="text-slate-400"/></div>
                    <div className="text-left">
                        <div className="text-[9px] font-bold text-white">TEMPO SYNC</div>
                        <div className="text-[8px] text-slate-500">High energy = High BPM</div>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5 text-[10px] font-serif italic text-slate-400 leading-relaxed">
                "{meta.quote}"
            </div>
        </div>
        
        {/* Mobile Quote Overlay */}
        <div className="sm:hidden order-3 text-[10px] font-serif italic text-slate-500 text-center max-w-[200px]">
             "{meta.quote}"
        </div>
    </div>
  );
};
