
import React, { useRef, useEffect, useState } from 'react';
import { Chord } from '../types';
import { X, Trash2, Music2, PlusCircle, Activity } from 'lucide-react';
import { getShapeClassForFunction, getHarmonicCompatibility, HarmonicAffinity } from '../utils/musicTheory';
import { PitchConstellation } from './Visualizers';
import VoiceLeadingConnector from './VoiceLeadingConnector';

interface ProgressionStripProps {
  progression: Chord[];
  onRemove: (index: number) => void;
  onClear: () => void;
  isPlaying: boolean;
  activeIndex: number | null;
  onDropChord: (chord: Chord) => void;
  draggingChord: Chord | null;
}

const ProgressionStrip: React.FC<ProgressionStripProps> = ({ 
  progression, onRemove, onClear, isPlaying, activeIndex, onDropChord, draggingChord
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [harmonicAffinity, setHarmonicAffinity] = useState<HarmonicAffinity | null>(null);

  useEffect(() => {
    if (isPlaying && activeIndex !== null && containerRef.current) {
      const children = containerRef.current.children;
      if (children[activeIndex]) {
        children[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }
  }, [isPlaying, activeIndex]);

  // Calculate affinity when dragging state changes or list changes
  useEffect(() => {
      if (isDragOver && draggingChord && progression.length > 0) {
          const lastChord = progression[progression.length - 1];
          const affinity = getHarmonicCompatibility(lastChord, draggingChord);
          setHarmonicAffinity(affinity);
      } else {
          setHarmonicAffinity(null);
      }
  }, [isDragOver, draggingChord, progression]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
        const chordData = e.dataTransfer.getData('application/json');
        if (chordData) {
            const chord = JSON.parse(chordData);
            onDropChord(chord);
        }
    } catch (err) {
        console.error("Failed to parse dropped chord", err);
    }
  };

  // Dynamic styles for the drop zone based on affinity
  const getDropZoneStyles = () => {
      if (!isDragOver) return "border-white/5 opacity-30";
      
      if (harmonicAffinity) {
          // Map score to opacity and shadow intensity
          if (harmonicAffinity.score >= 0.8) return "border-emerald-400/50 bg-emerald-900/20 shadow-[0_0_30px_-5px_rgba(52,211,153,0.3)] scale-105";
          if (harmonicAffinity.score >= 0.5) return "border-cyan-400/50 bg-cyan-900/20 shadow-[0_0_20px_-5px_rgba(34,211,238,0.2)]";
          return "border-rose-500/50 bg-rose-900/20 opacity-80";
      }

      // Default neutral glow if no history to compare
      return "border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_20px_-5px_var(--accent)] scale-105";
  };

  return (
    <div 
        className={`w-full h-full flex flex-col relative group/strip overflow-hidden transition-colors duration-300 bg-[#0c0c0e]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      
      {/* Clear Action */}
      {progression.length > 0 && (
        <button 
            onClick={onClear} 
            className="absolute top-4 right-4 z-30 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 p-2 rounded-lg transition-all backdrop-blur-md border border-white/5"
            title="Clear Timeline"
        >
            <Trash2 size={14} />
        </button>
      )}

      {/* Timeline Content */}
      <div className="flex-1 w-full overflow-x-auto overflow-y-visible custom-scrollbar pb-8 pt-24 -mt-12">
        
        {/* Empty State */}
        {progression.length === 0 && !isDragOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 mt-12">
                <Music2 size={64} className="text-slate-500 mb-6" />
                <p className="text-lg font-bold text-slate-500 uppercase tracking-[0.25em]">Studio Empty</p>
                <p className="text-xs text-slate-600 mt-2 font-mono">Drag harmonic structure here</p>
            </div>
        )}

        {/* Linear Stream */}
        <div 
            ref={containerRef}
            className="h-full flex items-center px-10 sm:px-20 min-w-max"
        >
            {progression.map((chord, index) => {
                const isActive = index === activeIndex;
                const isLast = index === progression.length - 1;
                const shapeClass = getShapeClassForFunction(chord.romanNumeral, chord.quality);
                
                const isDominant = chord.functionLabel === 'Dominant' || chord.functionLabel?.includes('V');
                const rotationFix = isDominant ? 'rotate-[-45deg] scale-110' : '';

                return (
                    <React.Fragment key={`${index}-${chord.root}-${chord.quality}`}>
                        <div className="relative flex flex-col items-center group/chord-wrapper z-10">
                             
                            {/* Hover Popup with Pitch Constellation (Harmonic X-Ray) */}
                            <div className="absolute bottom-full mb-6 opacity-0 group-hover/chord-wrapper:opacity-100 transition-all duration-300 pointer-events-none z-[100] scale-90 group-hover/chord-wrapper:scale-100 translate-y-4 group-hover/chord-wrapper:translate-y-0 ease-out">
                                <div className="bg-[#18181b]/90 backdrop-blur-2xl p-3 rounded-2xl border border-white/10 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] flex flex-col items-center min-w-[150px]">
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-2">Harmonic Structure</div>
                                    <PitchConstellation 
                                        notes={chord.notes} 
                                        root={chord.root} 
                                        size={120} 
                                        showLabels={true}
                                        labelMode="interval"
                                    />
                                </div>
                                <div className="w-3 h-3 bg-[#18181b] border-r border-b border-white/10 rotate-45 absolute bottom-[-6px] left-1/2 -translate-x-1/2"></div>
                            </div>

                            {/* Chord Block */}
                            <div 
                                className={`
                                    relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center
                                    transition-all duration-300 cursor-default
                                    ${shapeClass}
                                    ${isActive 
                                        ? 'bg-[var(--accent)] shadow-[0_0_50px_-10px_var(--accent)] z-20 scale-105 ring-1 ring-white/30' 
                                        : 'bg-[#18181b] border border-white/10 hover:border-white/30 hover:bg-[#202024] shadow-lg group-hover/chord-wrapper:scale-105 group-hover/chord-wrapper:shadow-[0_0_30px_-10px_rgba(255,255,255,0.15)]'
                                    }
                                `}
                            >
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemove(index); }} 
                                    className={`
                                        absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover/chord-wrapper:opacity-100 transition-all hover:scale-110 z-30
                                        ${isDominant ? 'translate-x-2 translate-y-2' : ''}
                                    `}
                                >
                                    <X size={12} />
                                </button>

                                <div className={`flex flex-col items-center justify-center ${rotationFix}`}>
                                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest mb-1 ${isActive ? 'text-black/70' : 'text-[var(--accent)]'}`}>
                                        {chord.romanNumeral}
                                    </span>
                                    <div className={`text-2xl sm:text-3xl font-bold tracking-tighter leading-none ${isActive ? 'text-black' : 'text-white'}`}>
                                        {chord.symbol}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Bar # */}
                            <div className="absolute -bottom-8 text-[9px] font-mono text-slate-600 opacity-50">
                                {index + 1}
                            </div>
                        </div>

                        {!isLast && (
                            <VoiceLeadingConnector prevChord={chord} nextChord={progression[index + 1]} />
                        )}
                    </React.Fragment>
                );
            })}
            
            {/* INTELLIGENT DROP ZONE (The Ghost Slot) */}
            {/* This appears when dragging or at the end of list to add more */}
            <div className={`relative ml-8 transition-all duration-500 ease-out flex flex-col items-center justify-center`}>
                <div className={`
                    w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500
                    ${getDropZoneStyles()}
                `}>
                    {harmonicAffinity ? (
                        <>
                            <Activity size={24} className={`mb-2 ${harmonicAffinity.color}`} />
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${harmonicAffinity.color}`}>
                                {harmonicAffinity.label}
                            </span>
                        </>
                    ) : (
                        <div className="w-2 h-2 bg-white/20 rounded-full animate-ping"></div>
                    )}
                </div>
                
                {/* Harmonic Data readout below drop zone */}
                {harmonicAffinity && (
                    <div className="absolute -bottom-10 whitespace-nowrap animate-in slide-in-from-top-2 fade-in">
                        <span className="text-[9px] text-slate-500 font-mono bg-black/40 px-2 py-1 rounded">
                            {harmonicAffinity.description}
                        </span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressionStrip;
