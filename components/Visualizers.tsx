
import React, { useMemo, useState } from 'react';
import { Chord } from '../types';
import { getChordExtensions, getChromaticIndex, analyzeHarmonicDensity } from '../utils/musicTheory';
import { Zap, Music, Binary, ArrowLeftRight, BarChart3 } from 'lucide-react';

const CHROMATIC_REF = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const INTERVALS = ['R', 'm2', 'M2', 'm3', 'M3', 'P4', 'd5', 'P5', 'm6', 'M6', 'm7', 'M7'];

type LabelMode = 'note' | 'interval' | 'number';

interface PitchConstellationProps {
  notes: string[];
  root: string;
  size?: number;
  showLabels?: boolean;
  labelMode?: LabelMode;
}

// --- Pro Pitch Constellation Component ---
export const PitchConstellation: React.FC<PitchConstellationProps> = React.memo(({ 
  notes, 
  root, 
  size = 280, 
  showLabels = true,
  labelMode = 'note'
}) => {
  const center = size / 2;
  const isSmall = size < 120;
  
  const radius = size * (isSmall ? 0.35 : 0.32); 
  const labelRadius = size * (isSmall ? 0.44 : 0.43); 
  
  // Dynamic styling based on size
  const strokeWidthRing = Math.max(1, size * 0.005);
  const strokeWidthMain = Math.max(1.5, size * 0.008);
  const dotRadiusActive = Math.max(2, size * 0.022);
  const dotRadiusInactive = Math.max(1.5, size * 0.015);
  
  const fontSizeMain = Math.max(8, size * 0.04);
  const fontSizeSub = Math.max(7, size * (isSmall ? 0.12 : 0.03));

  // Calculate indices for robust matching (Sharps vs Flats)
  const rootIndex = getChromaticIndex(root);
  const activeIndices = notes.map(n => getChromaticIndex(n));

  // Calculate points for all 12 chromatic steps
  const points = CHROMATIC_REF.map((defaultNote, i) => {
    const angleDeg = (i * 30) - 90;
    const angleRad = angleDeg * (Math.PI / 180);
    
    // Robust matching: Check by Index, not just name
    const isActive = activeIndices.includes(i);
    const isRoot = i === rootIndex;
    
    // Use the actual spelling from the input notes if available (e.g., show 'Eb' instead of 'D#')
    const matchingInputNote = notes.find(n => getChromaticIndex(n) === i);
    const displayNote = matchingInputNote || defaultNote;

    // Calculate Interval relative to root
    const intervalIndex = (i - rootIndex + 12) % 12;
    const intervalLabel = INTERVALS[intervalIndex];

    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
      lx: center + labelRadius * Math.cos(angleRad),
      ly: center + labelRadius * Math.sin(angleRad),
      note: displayNote,
      index: i,
      intervalLabel,
      isActive,
      isRoot
    };
  });

  // Filter active points for the shape
  const activePoints = points.filter(p => p.isActive);
  
  // Construct Path - Radial Spokes (Center Outwards)
  const pathData = activePoints.map(p => `M ${center} ${center} L ${p.x} ${p.y}`).join(' ');

  return (
    <div className="flex items-center justify-center relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={isSmall ? '' : 'drop-shadow-lg'}>
        {/* Outer Ring */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeWidth={strokeWidthRing} opacity="0.5" />
        
        {/* Dotted Label Guide Ring */}
        {showLabels && !isSmall && (
             <circle cx={center} cy={center} r={radius * 1.25} fill="none" stroke="#1e293b" strokeWidth={strokeWidthRing} strokeDasharray="4 4" opacity="0.3" />
        )}

        {/* The Geometric Shape - Radial Spokes */}
        <path d={pathData} fill="none" stroke="var(--accent)" strokeWidth={strokeWidthMain} strokeLinecap="round" />

        {/* Clock Face Points */}
        {points.map((p) => (
          <g key={p.index}>
             {/* Tick Marks - Only for INACTIVE points */}
             {!p.isActive && (
                 <line 
                    x1={center + (radius - (isSmall ? 2 : 5)) * Math.cos(((p.index * 30) - 90) * Math.PI / 180)}
                    y1={center + (radius - (isSmall ? 2 : 5)) * Math.sin(((p.index * 30) - 90) * Math.PI / 180)}
                    x2={center + radius * Math.cos(((p.index * 30) - 90) * Math.PI / 180)}
                    y2={center + radius * Math.sin(((p.index * 30) - 90) * Math.PI / 180)}
                    stroke="#475569"
                    strokeWidth={strokeWidthRing}
                    opacity={0.6}
                 />
             )}

             {/* The Dot */}
             <circle 
                cx={p.x} cy={p.y} 
                r={p.isActive ? (p.isRoot ? dotRadiusActive * 1.5 : dotRadiusActive) : dotRadiusInactive} 
                fill={p.isActive ? (p.isRoot ? "white" : "var(--accent)") : "#1e293b"} 
                stroke={p.isActive ? (p.isRoot ? "var(--accent)" : "none") : "#475569"}
                strokeWidth={p.isActive ? strokeWidthMain : 1}
             />

             {/* Labels */}
             {showLabels && (
               <>
                 {!isSmall && (
                    <text 
                        x={p.lx} y={p.ly - 6}
                        textAnchor="middle" dominantBaseline="middle" 
                        className={`font-bold ${p.isActive ? 'fill-white' : 'fill-slate-500'}`}
                        style={{ fontSize: fontSizeMain }}
                    >
                        {labelMode === 'note' ? p.note : 
                         labelMode === 'interval' ? p.intervalLabel : 
                         p.index}
                    </text>
                 )}
                 {/* Secondary Inner Label (Always Integer Notation for reference, unless Number mode is active) */}
                 {labelMode !== 'number' && !isSmall && (
                    <text 
                        x={p.lx} y={p.ly + 6}
                        textAnchor="middle" dominantBaseline="middle" 
                        className={`font-mono font-bold ${p.isActive ? 'fill-[var(--accent)]' : 'fill-slate-600'}`}
                        style={{ fontSize: fontSizeSub, opacity: 0.6 }}
                    >
                        {p.index}
                    </text>
                 )}
               </>
             )}
          </g>
        ))}
        
        {/* Center Point */}
        <circle cx={center} cy={center} r={dotRadiusActive} fill="#1e293b" stroke="var(--accent)" strokeWidth={1} strokeOpacity="0.3" />
      </svg>
    </div>
  );
});

export const UnifiedHarmonicScope: React.FC<{ chord: Chord | null, scaleNotes: string[] }> = ({ chord, scaleNotes }) => {
    const [labelMode, setLabelMode] = useState<LabelMode>('note');

    if (!chord) return (
        <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 p-8">
            <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full flex items-center justify-center mb-4">
                <Zap size={24} />
            </div>
            <p className="text-xs uppercase tracking-widest">Select a chord</p>
        </div>
    );

    const extensions = getChordExtensions(chord, scaleNotes || []);
    const stats = analyzeHarmonicDensity(chord);

    return (
        <div className="flex flex-col h-full bg-[#0c0c0e] relative">
            
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-start justify-between">
                <div>
                    <h3 className="text-5xl font-bold text-white tracking-tighter mb-2">{chord.symbol}</h3>
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-[var(--accent)] text-black text-[10px] font-bold rounded uppercase tracking-wider">
                            {chord.romanNumeral}
                        </span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                            {chord.quality} {chord.extension !== 'Triad' && chord.extension}
                        </span>
                    </div>
                </div>
                
                {/* Label Mode Toggle */}
                <div className="flex flex-col gap-1">
                     <span className="text-[9px] font-bold uppercase text-slate-500 text-right">View Mode</span>
                     <div className="flex bg-white/5 p-0.5 rounded-lg">
                         <button 
                            onClick={() => setLabelMode('note')}
                            className={`p-1.5 rounded transition-all ${labelMode === 'note' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Show Notes"
                         >
                             <Music size={14} />
                         </button>
                         <button 
                            onClick={() => setLabelMode('interval')}
                            className={`p-1.5 rounded transition-all ${labelMode === 'interval' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Show Intervals"
                         >
                             <ArrowLeftRight size={14} />
                         </button>
                         <button 
                            onClick={() => setLabelMode('number')}
                            className={`p-1.5 rounded transition-all ${labelMode === 'number' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            title="Show Numbers"
                         >
                             <Binary size={14} />
                         </button>
                     </div>
                </div>
            </div>

            {/* Main Visualization Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center">
                
                <div className="w-full py-6 border-b border-white/5 bg-[#0c0c0e] flex justify-center">
                     <PitchConstellation 
                        notes={chord.notes} 
                        root={chord.root} 
                        size={280} 
                        labelMode={labelMode}
                    />
                </div>
                
                {/* Harmonic Profile Stats */}
                <div className="w-full p-6 border-b border-white/5">
                    <h4 className="text-[9px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2 tracking-widest">
                        <BarChart3 size={10} className="text-[var(--accent)]" /> Harmonic Profile
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: "Tension", value: stats.tension, color: "bg-rose-500" },
                            { label: "Brightness", value: stats.brightness, color: "bg-amber-400" },
                            { label: "Complexity", value: stats.complexity, color: "bg-purple-500" }
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[9px] uppercase font-bold">
                                    <span className="text-slate-400">{stat.label}</span>
                                    <span className="text-white">{stat.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${stat.color} transition-all duration-500 ease-out`} 
                                        style={{ width: `${stat.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extensions / Color Notes */}
                <div className="w-full p-6">
                    <h4 className="text-[9px] font-bold uppercase text-slate-500 mb-4 flex items-center gap-2 tracking-widest">
                        <Zap size={10} className="text-[var(--accent)]" /> Color Tones
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-2">
                        {extensions.length > 0 ? extensions.map(ext => (
                            <div key={ext.degree} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-black/40 rounded text-[10px] font-mono font-bold text-[var(--accent)]">
                                        {ext.intervalName}
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-200">{ext.note}</span>
                                        <span className="text-[9px] text-slate-500 uppercase tracking-wide">{ext.descriptor}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        )) : (
                             <div className="p-4 rounded-lg border border-dashed border-white/10 text-center">
                                <p className="text-[10px] text-slate-600 uppercase tracking-wide">No colored extensions</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
