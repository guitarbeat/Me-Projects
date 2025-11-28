
import React from 'react';
import { Note } from '../types';
import MoodSelector from './MoodSelector';
import { IconButton, Typo, cn } from './UI';
import { X } from 'lucide-react';

export default ({ currentScale, currentKey, onMoodSelect, onManualScaleSelect, onTempoChange, setCurrentKey, onClose }: any) => {
  const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  
  return (
    <div className="fixed inset-0 z-[100] bg-[#09090b] flex flex-col animate-in fade-in zoom-in-95 duration-200">
         {/* Header Overlay */}
         <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-50 pointer-events-none">
            <div className="pointer-events-auto">
                <Typo variant="h2">Vibe Check</Typo>
                <Typo variant="body" className="opacity-60">Set the emotional baseline</Typo>
            </div>
            <button 
                onClick={onClose} 
                className="pointer-events-auto bg-black/50 hover:bg-white/10 text-white rounded-full p-3 backdrop-blur-md transition-colors"
                aria-label="Close Settings"
            >
                <X size={24} />
            </button>
         </div>

         {/* Main Full-Screen Mood Area */}
         <div className="flex-1 relative min-h-0 pt-16 sm:pt-0">
            <MoodSelector 
                currentScale={currentScale} 
                currentKey={currentKey} 
                onMoodSelect={onMoodSelect} 
                onManualScaleSelect={onManualScaleSelect} 
                onTempoChange={onTempoChange} 
            />
         </div>

         {/* Footer Key Selector */}
         <div className="shrink-0 bg-[#111113] border-t border-white/5 p-6 pb-10 sm:pb-8 z-40">
             <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6">
                 <div className="shrink-0 text-center sm:text-left">
                    <Typo variant="label" className="mb-1 block">Root Key</Typo>
                    <Typo variant="h2" className="leading-none">{currentKey}</Typo>
                 </div>
                 
                 <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                    <div className="flex sm:grid sm:grid-cols-12 gap-2 min-w-max sm:min-w-0">
                        {keys.map(k => (
                            <button 
                                key={k} 
                                onClick={() => setCurrentKey(k as Note)} 
                                className={cn(
                                    "h-10 sm:h-12 w-10 sm:w-auto flex items-center justify-center rounded-lg text-sm font-bold transition-all", 
                                    currentKey === k 
                                        ? "bg-[var(--accent)] text-black shadow-[0_0_15px_-5px_var(--accent)] scale-105" 
                                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {k}
                            </button>
                        ))}
                    </div>
                 </div>
             </div>
         </div>
    </div>
  );
};
