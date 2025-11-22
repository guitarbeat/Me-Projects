
import React from 'react';
import { Chord, ScaleType } from '../types';
import { analyzeVoiceLeading, getScaleSuggestionForChord } from '../utils/musicTheory';
import { PitchConstellation } from './Visualizers';
import { ArrowDown, Zap, Activity, Anchor, MoveRight } from 'lucide-react';

interface TheoryAnalysisProps {
  currentKey: string;
  scaleType: ScaleType;
  progression: Chord[];
}

const TheoryAnalysis: React.FC<TheoryAnalysisProps> = ({ currentKey, scaleType, progression }) => {
  
  if (progression.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-60 p-8">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <Activity size={24} />
        </div>
        <div className="text-center max-w-[250px]">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Analysis Ready
            </h4>
            <p className="text-[10px]">
                Add chords to the timeline to generate a structural breakdown, voice leading paths, and pitch constellations.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 bg-[#111113] shrink-0 flex items-center justify-between">
         <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Activity size={14} className="text-[var(--accent)]"/> Structural Report
         </h3>
         <span className="text-[9px] font-mono text-slate-600">{progression.length} BARS</span>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#0e0e10]">
         <div className="relative space-y-0">
            {/* Vertical Connecting Line */}
            <div className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

            {progression.map((chord, i) => {
                const nextChord = progression[i + 1];
                const voiceLeading = nextChord ? analyzeVoiceLeading(chord, nextChord) : null;
                const scaleSuggestion = getScaleSuggestionForChord(chord);
                const isLast = i === progression.length - 1;

                return (
                    <div key={i} className="relative mb-8 last:mb-0 animate-in slide-in-from-bottom-4 fade-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                        
                        <div className="flex gap-6">
                            {/* Timeline Marker */}
                            <div className="flex-none flex flex-col items-center z-10">
                                <div className={`
                                    w-14 h-14 rounded-full border-2 flex items-center justify-center bg-[#0c0c0e] shadow-xl
                                    ${chord.romanNumeral.includes('I') || chord.romanNumeral.includes('i') 
                                        ? 'border-[var(--accent)] text-[var(--accent)]' 
                                        : 'border-white/10 text-slate-400'}
                                `}>
                                    <span className="text-xs font-bold font-mono">{i + 1}</span>
                                </div>
                            </div>

                            {/* Analysis Card */}
                            <div className="flex-1 min-w-0">
                                <div className="bg-[#18181b] border border-white/5 rounded-xl p-5 hover:border-white/20 transition-all group relative overflow-hidden">
                                    
                                    <div className="flex items-start justify-between mb-4 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-xl font-bold text-white tracking-tight">{chord.symbol}</h4>
                                                <span className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-bold uppercase text-slate-300">
                                                    {chord.romanNumeral}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                                {chord.functionLabel}
                                            </div>
                                        </div>
                                        
                                        {/* Pitch Constellation Mini - ALWAYS VISIBLE NOW */}
                                        <div className="bg-black/20 rounded-full p-1 border border-white/5">
                                            <PitchConstellation 
                                                notes={chord.notes} 
                                                root={chord.root} 
                                                size={70} 
                                                showLabels={false} 
                                            />
                                        </div>
                                    </div>

                                    {/* Insights Grid */}
                                    <div className="grid grid-cols-2 gap-2 relative z-10">
                                        <div className="p-2 bg-black/20 rounded border border-white/5">
                                            <div className="text-[8px] uppercase text-slate-500 font-bold mb-1">Recommended Scale</div>
                                            <div className="text-[10px] text-[var(--accent)] font-bold">{scaleSuggestion}</div>
                                        </div>
                                        <div className="p-2 bg-black/20 rounded border border-white/5">
                                            <div className="text-[8px] uppercase text-slate-500 font-bold mb-1">Chord Quality</div>
                                            <div className="text-[10px] text-slate-300">{chord.emotionalDesc || 'Standard'}</div>
                                        </div>
                                    </div>

                                </div>

                                {/* Voice Leading Connection Info */}
                                {!isLast && voiceLeading && (
                                    <div className="mt-4 ml-4 flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                                        <ArrowDown size={12} className="text-slate-600" />
                                        <div className="flex items-center gap-2 bg-black/20 px-2 py-1 rounded-full border border-white/5">
                                            <span className={voiceLeading.type === 'smooth' ? 'text-emerald-500' : 'text-amber-500'}>
                                                {voiceLeading.type === 'smooth' ? '● Smooth Motion' : '● Angular Leap'}
                                            </span>
                                            <span className="text-slate-700">|</span>
                                            <span>Target: {nextChord.symbol}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* End Marker */}
            {progression.length > 0 && (
                <div className="flex gap-6 opacity-30">
                    <div className="w-14 flex justify-center">
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 pt-1">End of Sequence</div>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default TheoryAnalysis;
