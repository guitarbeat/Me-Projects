
import React, { useState } from 'react';
import { Chord } from '../types';
import { getChordExtensions, getChromaticIndex, analyzeHarmonicDensity, CHROMATIC_SHARPS, polarToCartesian } from '../utils/musicTheory';
import { Zap, Music, Binary, ArrowLeftRight, BarChart3, PieChart, Layers } from 'lucide-react';
import { Surface, Typo, IconButton, SectionHeader, cn } from './UI';

const INTERVALS = ['R', 'm2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7'];

export const PitchConstellation: React.FC<{ notes: string[], root: string, size?: number, showLabels?: boolean, labelMode?: 'note' | 'interval' | 'number' }> = React.memo(({ notes, root, size = 280, showLabels = true, labelMode = 'note' }) => {
  const c = size / 2, r = size * 0.35;
  const rootIdx = getChromaticIndex(root);
  const activeIndices = new Set(notes.map(n => getChromaticIndex(n)));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible select-none" aria-hidden="true">
      <circle cx={c} cy={c} r={r} fill="none" stroke="#27272a" strokeWidth={1} />
      <circle cx={c} cy={c} r={r * 0.7} fill="none" stroke="#27272a" strokeWidth={1} strokeDasharray="4 4" />
      
      <path d={Array.from(activeIndices).map((i: number) => {
          const { x, y } = polarToCartesian(c, c, r, i * 30);
          return `M ${c} ${c} L ${x} ${y}`;
      }).join(' ')} stroke="var(--accent)" strokeWidth={1.5} strokeOpacity="0.4" />
      
      <path d={(() => {
          const sorted = (Array.from(activeIndices) as number[]).sort((a,b) => a-b);
          if (sorted.length < 2) return '';
          return sorted.map((i, idx) => {
              const { x, y } = polarToCartesian(c, c, r, i * 30);
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ') + ' Z';
      })()} fill="var(--accent)" fillOpacity="0.05" stroke="var(--accent)" strokeWidth={1} strokeOpacity="0.3" />

      {CHROMATIC_SHARPS.map((note, i) => {
          const isActive = activeIndices.has(i);
          const isRoot = i === rootIdx;
          const { x, y } = polarToCartesian(c, c, r, i * 30);
          const { x: lx, y: ly } = polarToCartesian(c, c, r * 1.18, i * 30);
          
          return (
            <g key={i} className="transition-all duration-300">
                <circle 
                    cx={x} cy={y} 
                    r={isActive ? (isRoot ? 5 : 3.5) : 1.5} 
                    fill={isActive ? (isRoot ? "white" : "var(--accent)") : "#3f3f46"} 
                    className="transition-all duration-300"
                />
                {isActive && isRoot && <circle cx={x} cy={y} r={8} fill="none" stroke="white" strokeOpacity="0.3" />}
                
                {showLabels && isActive && (
                    <text 
                        x={lx} y={ly} 
                        textAnchor="middle" 
                        dominantBaseline="middle" 
                        className="text-[10px] font-bold font-mono fill-zinc-300"
                    >
                        {labelMode === 'note' ? notes.find(n => getChromaticIndex(n) === i) : labelMode === 'interval' ? INTERVALS[(i - rootIdx + 12) % 12] : i}
                    </text>
                )}
            </g>
          );
      })}
    </svg>
  );
});

export const UnifiedHarmonicScope: React.FC<{ chord: Chord | null, scaleNotes: string[] }> = ({ chord, scaleNotes }) => {
    const [mode, setMode] = useState<'note' | 'interval' | 'number'>('note');
    if (!chord) return (
        <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
            <Layers size={48} strokeWidth={1}/>
            <Typo variant="label">Scope Idle</Typo>
        </div>
    );

    const ext = getChordExtensions(chord, scaleNotes || []);
    const stats = analyzeHarmonicDensity(chord);
    
    return (
        <div className="flex flex-col h-full bg-[#09090b]">
            <SectionHeader title={chord.symbol} icon={PieChart}>
                <div className="flex gap-1 bg-[#18181b] p-1 rounded-lg border border-white/5">
                    {[ {id:'note',i:Music}, {id:'interval',i:ArrowLeftRight}, {id:'number',i:Binary} ].map(b => (
                        <IconButton 
                            key={b.id} icon={b.i} active={mode === b.id} onClick={() => setMode(b.id as any)} size={14} className="w-7 h-7 rounded"
                        />
                    ))}
                </div>
            </SectionHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                <div className="flex justify-center py-4 relative">
                    <PitchConstellation notes={chord.notes} root={chord.root} labelMode={mode} size={200} />
                </div>
                
                <div className="space-y-4">
                    <Typo variant="label" className="flex gap-2 items-center text-zinc-500"><BarChart3 size={12}/> Analysis</Typo>
                    <div className="grid grid-cols-1 gap-4">
                        {[ 
                           {l:"Tension", v:stats.tension, c:"bg-rose-500"}, 
                           {l:"Brightness", v:stats.brightness, c:"bg-amber-400"}, 
                           {l:"Complexity", v:stats.complexity, c:"bg-purple-500"} 
                        ].map(s => (
                            <div key={s.l} className="group">
                                <div className="flex justify-between items-end mb-1.5">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{s.l}</span>
                                    <span className="text-[10px] font-mono text-zinc-500">{s.v}%</span>
                                </div>
                                <div className="h-1 bg-[#18181b] rounded-full overflow-hidden">
                                    <div className={`h-full ${s.c} transition-all duration-1000 ease-out`} style={{width:`${s.v}%`}}/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <Typo variant="label" className="flex gap-2 items-center text-zinc-500"><Zap size={12}/> Color Tones</Typo>
                    <div className="grid grid-cols-2 gap-2">
                        {ext.length ? ext.map(e => (
                            <Surface key={e.degree} className="px-3 py-2 flex justify-between items-center bg-[#18181b] border-transparent">
                                <span className="font-bold text-[var(--accent)] text-xs font-mono">{e.intervalName}</span>
                                <Typo variant="body" className="text-xs">{e.note}</Typo>
                            </Surface>
                        )) : (
                            <div className="col-span-2 p-3 border border-dashed border-white/5 rounded-lg text-center">
                                <Typo variant="mono" className="opacity-30">No upper extensions</Typo>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
