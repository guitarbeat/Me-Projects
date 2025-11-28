
import React from 'react';
import { Play, Square, PanelBottomOpen, PanelBottomClose, Settings2 } from 'lucide-react';
import { ScaleType, Note } from '../types';
import { IconButton, Button } from './UI';

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
}

const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying, onPlay, onStop, canPlay,
  bpm, currentKey, scaleType,
  isPaletteOpen, onTogglePalette,
  onOpenSettings
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 h-24 px-6 flex items-center justify-between z-50 pointer-events-none">
      
      {/* Left: Panel Toggle */}
      <div className="pointer-events-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-full p-1.5 shadow-2xl hover:bg-black/60 transition-colors">
         <IconButton 
            icon={isPaletteOpen ? PanelBottomClose : PanelBottomOpen} 
            active={!isPaletteOpen} 
            onClick={onTogglePalette}
            aria-label="Toggle Panel"
            className="w-10 h-10 rounded-full border-none"
        />
      </div>

      {/* Center: HUD */}
      <div className="pointer-events-auto backdrop-blur-xl bg-[#0a0a0c]/80 border border-white/10 rounded-full py-2 px-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-8">
         {/* Desktop Info */}
         <div className="hidden sm:flex items-center gap-6">
            <div className="flex flex-col items-center leading-none gap-1">
                <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Key</span>
                <span className="text-zinc-100 font-bold">{currentKey}</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center leading-none gap-1">
                 <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Mode</span>
                 <span className="text-zinc-100 font-medium text-xs">{scaleType.split(' ')[0]}</span>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center leading-none gap-1">
                 <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Tempo</span>
                 <span className="text-[var(--accent)] font-mono text-xs">{bpm}</span>
            </div>
         </div>
         
         {/* Mobile Condensed Info */}
         <div className="sm:hidden flex items-baseline gap-3">
             <span className="text-sm font-bold text-white">{currentKey}</span>
             <span className="text-xs text-[var(--accent)] font-mono opacity-80">{bpm}</span>
         </div>
         
         <div className="w-px h-8 bg-white/5 mx-2" />

         <Button 
            variant={isPlaying ? "danger" : "primary"} 
            onClick={isPlaying ? onStop : onPlay} 
            disabled={!canPlay} 
            icon={isPlaying ? Square : Play}
            className="w-24 sm:w-auto h-9 shadow-none" 
         >
            {isPlaying ? "Stop" : "Play"}
         </Button>
      </div>

      {/* Right: Settings */}
      <div className="pointer-events-auto backdrop-blur-xl bg-black/40 border border-white/10 rounded-full p-1.5 shadow-2xl hover:bg-black/60 transition-colors">
         <IconButton icon={Settings2} onClick={onOpenSettings} aria-label="Settings" className="w-10 h-10 rounded-full border-none" />
      </div>
    </header>
  );
};

export default ControlBar;
