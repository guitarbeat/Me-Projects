import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '../ui';
import { useStore } from '../../lib';
import { ScaleType } from '../../types';

export const GlobalSettings = () => {
    const { key, setKey, scale, setScale, bpm, setBpm, isScaleLocked, toggleScaleLock, mood } = useStore();
    
    // Calculate current emotional zone
    const getEmotionalZone = () => {
        const { valence, arousal } = mood;
        if (arousal > 0.5 && valence > 0.5) return 'Euphoric';
        if (arousal > 0.5 && valence < 0.5) return 'Energetic';
        if (arousal < 0.5 && valence > 0.5) return 'Calm';
        if (arousal < 0.5 && valence < 0.5) return 'Melancholy';
        return 'Neutral';
    };

    return (
        <div className="h-full w-full bg-[var(--bg-soft)] p-2 overflow-y-auto custom-scrollbar space-y-2">
            
            {/* Mood - Single Line */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2 py-1 flex items-center justify-between text-[9px]">
                <span className="font-medium text-[var(--text-main)] capitalize">{getEmotionalZone()}</span>
                <div className="flex items-center gap-1 font-mono font-bold">
                    <span className="text-[var(--text-muted)]">V:{(mood.valence * 100).toFixed(0)}</span>
                    <span className="text-[var(--text-muted)]">A:{(mood.arousal * 100).toFixed(0)}</span>
                    <span className="text-[var(--accent)]">T:{(mood.tension * 100).toFixed(0)}</span>
                </div>
            </div>
            
            {/* Key - Compact Grid */}
            <div className="grid grid-cols-6 gap-0.5">
                {['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map(k => (
                    <button 
                        key={k} 
                        onClick={() => setKey(k)}
                        className={cn(
                            "h-5 text-[9px] font-bold rounded transition-all",
                            key === k 
                                ? "bg-[var(--accent)] text-white" 
                                : "bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]"
                        )}
                    >
                        {k}
                    </button>
                ))}
            </div>

            {/* Scale + Lock - Single Row */}
            <div className="flex gap-1">
                <select 
                    value={scale} 
                    onChange={(e) => setScale(e.target.value as ScaleType)}
                    className="flex-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2 py-1 text-[10px] font-bold outline-none focus:border-[var(--accent)] text-[var(--text-main)]"
                >
                    {Object.values(ScaleType).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                    onClick={toggleScaleLock}
                    className={cn(
                        "w-6 shrink-0 flex items-center justify-center rounded-md transition-all",
                        isScaleLocked 
                            ? "bg-[var(--accent)] text-white" 
                            : "bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)]"
                    )}
                >
                    {isScaleLocked ? <Lock size={10} strokeWidth={2.5}/> : <Unlock size={10} strokeWidth={2.5}/>}
                </button>
            </div>

            {/* BPM - Minimal Slider */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-md px-2 py-1 flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold text-[var(--accent)] w-8">{bpm}</span>
                <input 
                    type="range" min="40" max="220" 
                    value={bpm} 
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="flex-1 h-1 accent-[var(--accent)]"
                />
            </div>
        </div>
    );
};

export const MiniGlobalSettings = () => {
    const { key, scale, bpm } = useStore();
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-3 py-2 bg-[var(--bg-soft)]">
            {/* Key Display */}
            <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-50" />
                <span className="text-xs font-black tracking-wider text-[var(--accent)]">{key}</span>
                <span className="text-[9px] font-medium text-[var(--text-dim)]">{scale}</span>
            </div>
            
            {/* BPM Display */}
            <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                    <div className="w-0.5 h-2 rounded-full bg-[var(--text-dim)] opacity-30" />
                    <div className="w-0.5 h-2.5 rounded-full bg-[var(--text-dim)] opacity-50" />
                    <div className="w-0.5 h-2 rounded-full bg-[var(--text-dim)] opacity-30" />
                </div>
                <span className="text-[9px] font-mono font-bold text-[var(--text-dim)]">{bpm}</span>
            </div>
        </div>
    );
};
