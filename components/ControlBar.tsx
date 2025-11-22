
import React, { useState } from 'react';
import { Play, Square, PanelBottomOpen, PanelBottomClose, Settings2, Share2, Check } from 'lucide-react';
import { ScaleType, Note } from '../types';

interface ControlBarProps {
  isPlaying: boolean;
  onPlay: (e: React.MouseEvent) => void;
  onStop: (e: React.MouseEvent) => void;
  canPlay: boolean;
  bpm: number;
  currentKey: Note;
  scaleType: ScaleType;
  isPaletteOpen: boolean;
  onTogglePalette: () => void;
  onOpenSettings: () => void;
  onShare: () => void;
}

const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying, onPlay, onStop, canPlay,
  bpm, currentKey, scaleType,
  isPaletteOpen, onTogglePalette,
  onOpenSettings, onShare
}) => {
  const [justCopied, setJustCopied] = useState(false);

  const handleShareClick = () => {
    onShare();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  return (
    <header className="flex-none h-16 px-4 sm:px-6 flex items-center justify-between relative z-30 border-b border-white/5 bg-[#111113]/80 backdrop-blur-md">
      
      {/* Left: Palette Toggle & Identity */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onTogglePalette} 
          className={`
            p-2 rounded-lg transition-all duration-200
            ${!isPaletteOpen ? 'bg-[var(--accent)] text-black shadow-[0_0_15px_-5px_var(--accent)]' : 'text-slate-400 hover:text-white bg-white/5'}
          `}
          title={isPaletteOpen ? "Minimize Palette" : "Open Palette"}
        >
          {isPaletteOpen ? <PanelBottomOpen size={18} /> : <PanelBottomClose size={18} />}
        </button>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-[var(--accent)] ${isPlaying ? 'animate-pulse' : ''}`}></div>
            <h1 className="text-sm font-bold text-white tracking-wide hidden sm:block">HARMONIC STUDIO</h1>
          </div>
          
          {/* Status Indicator (Mobile) */}
          <div className="sm:hidden flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
             <span>{currentKey} {scaleType}</span>
             <span className="text-slate-700">|</span>
             <span>{bpm} BPM</span>
          </div>
        </div>
      </div>

      {/* Center: Transport Controls */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-4 px-4 py-2 rounded-full bg-black/20 border border-white/5 backdrop-blur-sm">
             <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tempo</span>
                <span className="text-xs font-mono text-[var(--accent)]">{bpm}</span>
             </div>
             
             <div className="w-px h-6 bg-white/10"></div>
             
             <div className="flex flex-col items-center min-w-[80px] text-center">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Key</span>
                <span className="text-xs font-bold text-white truncate max-w-[80px]">{currentKey} {scaleType}</span>
             </div>
        </div>

        <button 
            onClick={isPlaying ? onStop : onPlay}
            disabled={!canPlay}
            className={`
                h-12 w-12 sm:h-10 sm:w-auto sm:px-6 rounded-full flex items-center justify-center gap-2 transition-all shadow-2xl border
                ${isPlaying 
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30 shadow-red-900/20' 
                    : 'bg-[var(--accent)] text-black hover:bg-white border-[var(--accent)] hover:scale-105 shadow-[0_0_20px_-5px_var(--accent)]'}
                ${!canPlay ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            `}
        >
            {isPlaying ? (
                <>
                    <Square size={14} fill="currentColor" />
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Stop</span>
                </>
            ) : (
                <>
                    <Play size={14} fill="currentColor" className="ml-0.5" />
                    <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-widest">Play</span>
                </>
            )}
        </button>
      </div>

      {/* Right: Functional Actions */}
      <div className="flex items-center gap-2">
         <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-white/5 rounded-lg" 
            title="Global Settings"
         >
             <Settings2 size={18} />
         </button>
         <button 
            onClick={handleShareClick}
            className={`p-2 transition-all rounded-lg flex items-center gap-2 ${justCopied ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-[var(--accent)] hover:bg-white/5'}`} 
            title="Copy Progression to Clipboard"
         >
             {justCopied ? <Check size={18} /> : <Share2 size={18} />}
         </button>
      </div>

    </header>
  );
};

export default ControlBar;
