
import React from 'react';
import { Chord, ScaleType } from '../types';
import { analyzeVoiceLeading, getScaleSuggestionForChord } from '../utils/musicTheory';
import { Activity, Layers, ArrowDown } from 'lucide-react';
import { Typo, Surface, Badge, SectionHeader } from './UI';

export default ({ progression }: { currentKey: string; scaleType: ScaleType; progression: Chord[] }) => {
  if (!progression.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-30 p-8 gap-4 bg-[#0c0c0e]">
        <Layers size={48} strokeWidth={1} />
        <Typo variant="label">Timeline Empty</Typo>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <SectionHeader title="Structural Analysis" icon={Activity}>
        <Badge variant="outline">{progression.length} Chords</Badge>
      </SectionHeader>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
         {/* Connector Line */}
         <div className="absolute left-[43px] top-6 bottom-6 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
         
         <div className="space-y-6">
            {progression.map((chord, i) => {
                const next = progression[i + 1];
                const vl = next ? analyzeVoiceLeading(chord, next) : null;
                const isTonic = chord.romanNumeral.match(/^i|^I/);
                
                return (
                    <div key={i} className="relative flex gap-6 animate-in slide-in-from-bottom-2 fade-in duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                        {/* Index Node */}
                        <div className={`w-9 h-9 mt-0.5 rounded-full flex items-center justify-center border-2 z-10 bg-[#0c0c0e] shrink-0 transition-colors ${isTonic ? 'border-[var(--accent)] text-[var(--accent)] shadow-[0_0_15px_-5px_var(--accent)]' : 'border-[#27272a] text-zinc-500'}`}>
                            <span className="text-[10px] font-bold font-mono">{i + 1}</span>
                        </div>

                        {/* Card Content */}
                        <Surface className={`flex-1 p-4 group hover:border-[var(--accent)]/30 transition-colors ${isTonic ? 'bg-[var(--accent)]/5' : ''}`}>
                             <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Typo variant="h3">{chord.symbol}</Typo>
                                    <Badge variant={isTonic ? 'accent' : 'default'}>{chord.romanNumeral}</Badge>
                                </div>
                                <span className="text-[10px] uppercase font-bold text-zinc-600">{chord.functionLabel || 'Diatonic'}</span>
                             </div>
                             
                             <div className="flex justify-between items-end">
                                 <div className="space-y-0.5">
                                    <Typo variant="label" className="opacity-50">Suggestion</Typo>
                                    <div className="text-xs text-zinc-300 font-mono">{getScaleSuggestionForChord(chord)}</div>
                                 </div>
                                 <div className="text-right space-y-0.5">
                                    <Typo variant="label" className="opacity-50">Emotion</Typo>
                                    <div className="text-xs text-zinc-400 italic">"{chord.emotionalDesc}"</div>
                                 </div>
                             </div>

                             {/* Voice Leading Info */}
                             {vl && (
                                <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                             <ArrowDown size={12} className={vl.type === 'jump' ? 'text-rose-500' : 'text-emerald-500'} />
                                             <span className={`text-[10px] font-bold uppercase ${vl.type === 'jump' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                {vl.contour} Motion
                                             </span>
                                        </div>
                                         <span className="text-[9px] font-mono text-zinc-500">{vl.commonTones} Common Tones</span>
                                    </div>
                                    <div className="flex gap-0.5 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                         {vl.lines.map((l, idx) => (
                                            <div key={idx} className="flex-1 transition-all" style={{ backgroundColor: l.color, opacity: l.diff === 0 ? 0.3 : 1 }} />
                                         ))}
                                    </div>
                                </div>
                             )}
                        </Surface>
                    </div>
                );
            })}
         </div>
      </div>
    </div>
  );
};
