import React from 'react';
import { Music2, X, Lock, Unlock } from 'lucide-react';
import { cn, IconButton } from '../ui';
import { ScaleType, CIRCLE_KEYS } from '../../lib';

interface SettingsPopoverProps {
    onClose: () => void;
    currentKey: string;
    setKey: (k: string) => void;
    scale: string;
    setScale: (s: string) => void;
    bpm: number;
    setBpm: (b: number) => void;
    isScaleLocked: boolean;
    toggleScaleLock: () => void;
}

export const SettingsPopover: React.FC<SettingsPopoverProps> = ({ 
    onClose, 
    currentKey, setKey, 
    scale, setScale, 
    bpm, setBpm, 
    isScaleLocked, toggleScaleLock 
}) => (
    <div className="absolute left-14 bottom-4 z-50 w-72 bg-[var(--bg-panel)] rounded-2xl p-4 flex flex-col gap-5 border border-[var(--border)] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[var(--text-main)] rounded-md text-[var(--bg-main)]">
                    <Music2 size={12} strokeWidth={3} />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-main)]">Global Settings</h4>
            </div>
            <IconButton onClick={onClose} icon={X} size="sm" variant="ghost" className="h-6 w-6 rounded-full hover:bg-[var(--bg-element)]" />
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-4">
            
            {/* Key Selection */}
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider px-1">Root Key</label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                    {CIRCLE_KEYS.map(k => (
                        <button 
                            key={k} 
                            onClick={() => setKey(k)}
                            className={cn(
                                "h-7 text-[10px] font-bold rounded-lg transition-all",
                                currentKey === k 
                                    ? "bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm border border-[var(--border)]" 
                                    : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                            )}
                        >
                            {k}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scale & Lock */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                     <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Tonality</label>
                </div>
                <div className="flex gap-2">
                     <div className="relative flex-1">
                        <select 
                            value={scale} 
                            onChange={(e) => setScale(e.target.value as ScaleType)}
                            className="w-full bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-3 pl-3 pr-8 py-2 text-xs font-bold outline-none focus:border-[var(--accent)] appearance-none text-[var(--text-main)]"
                        >
                            {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                             <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-[var(--text-main)]" />
                        </div>
                     </div>
                     <button
                        onClick={toggleScaleLock}
                        className={cn(
                            "w-9 shrink-0 flex items-center justify-center rounded-xl border transition-all",
                            isScaleLocked 
                                ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--bg-main)] shadow-sm" 
                                : "bg-[var(--bg-surface)] border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                        )}
                        title={isScaleLocked ? "Unlock Scale" : "Lock Scale"}
                    >
                        {isScaleLocked ? <Lock size={12} strokeWidth={2.5}/> : <Unlock size={12} strokeWidth={2.5}/>}
                    </button>
                </div>
            </div>

            {/* Tempo */}
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">Tempo</label>
                    <span className="text-[10px] font-mono font-bold text-[var(--accent)]">{bpm} BPM</span>
                </div>
                <div className="h-8 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] px-3 flex items-center relative overflow-hidden group">
                     {/* Progress bar visual */}
                    <div className="absolute left-0 top-0 bottom-0 bg-[var(--text-main)]/5" style={{width: `${((bpm-40)/(220-40))*100}%`}} />
                    
                    <input 
                        type="range" min="40" max="220" 
                        value={bpm} 
                        onChange={(e) => setBpm(Number(e.target.value))}
                        className="w-full h-full opacity-0 absolute inset-0 cursor-ew-resize z-10"
                    />
                    <div className="flex-1 flex items-center justify-center gap-1 opacity-50 pointer-events-none">
                         <div className="w-1 h-3 rounded-full bg-[var(--text-main)] text-[var(--text-main)]" />
                         <div className="w-0.5 h-2 rounded-full bg-[var(--text-main)] text-[var(--text-main)] opacity-50" />
                         <div className="w-0.5 h-2 rounded-full bg-[var(--text-main)] text-[var(--text-main)] opacity-50" />
                          <div className="w-0.5 h-2 rounded-full bg-[var(--text-main)] text-[var(--text-main)] opacity-50" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);
