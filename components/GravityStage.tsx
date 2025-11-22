

import React, { useMemo, useState } from 'react';
import { Chord, ScaleType } from '../types';
import { SCALE_PALETTES, getHarmonicCompatibility } from '../utils/musicTheory';
import { Plus, GripVertical, ArrowRight } from 'lucide-react';
import { PitchConstellation } from './Visualizers';

interface GravityStageProps {
  currentKey: string;
  scaleType: ScaleType;
  chords: Chord[];
  onAddChord: (chord: Chord) => void;
  onInspectChord: (chord: Chord) => void;
  triggerMode?: 'drag' | 'click';
  onChordClick?: (chord: Chord) => void;
  onDragStart?: (chord: Chord) => void;
  onDragEnd?: () => void;
}

// Fixed positions based on Harmonic Function (The Harmonic Compass)
const getFunctionalPosition = (roman: string, index: number, total: number) => {
  // Center: Tonic
  if (roman === 'I' || roman === 'i') return { x: 50, y: 50, scale: 1.5, z: 20 };
  
  // East: Dominant (Tension)
  if (roman === 'V' || roman === 'v' || roman === 'V7') return { x: 80, y: 50, scale: 1.2, z: 10 };
  
  // West: Subdominant (Drift)
  if (roman === 'IV' || roman === 'iv') return { x: 20, y: 50, scale: 1.1, z: 10 };
  
  // North: Relative Minor / Submediant
  if (roman === 'vi' || roman === 'VI' || roman === 'bVI') return { x: 50, y: 20, scale: 1.1, z: 10 };
  
  // South: Supertonic (Pre-dominant)
  if (roman === 'ii' || roman === 'ii°') return { x: 50, y: 80, scale: 1.0, z: 10 };
  
  // North-East: Mediant
  if (roman === 'iii' || roman === 'III') return { x: 75, y: 25, scale: 0.9, z: 5 };
  
  // South-East: Leading Tone
  if (roman === 'vii°' || roman === 'bVII') return { x: 75, y: 75, scale: 0.8, z: 5 };

  // Fallback for non-diatonic/extensions: Orbit the periphery
  const angle = (index * (360 / total)) * (Math.PI / 180);
  return {
      x: 50 + (40 * Math.cos(angle)),
      y: 50 + (40 * Math.sin(angle)),
      scale: 0.8,
      z: 1
  };
};

const GravityStage: React.FC<GravityStageProps> = ({ 
  currentKey, scaleType, chords, onAddChord, onInspectChord,
  triggerMode = 'drag', onChordClick, onDragStart, onDragEnd
}) => {
  const [hoveredChord, setHoveredChord] = useState<Chord | null>(null);
  
  const nodes = useMemo(() => {
    return chords.map((chord, i) => {
        const pos = getFunctionalPosition(chord.romanNumeral, i, chords.length);
        return { ...chord, ...pos };
    });
  }, [chords]);

  const palette = SCALE_PALETTES[scaleType] || SCALE_PALETTES[ScaleType.Major];

  // Calculate connection lines based on Harmonic Affinity
  const connections = useMemo(() => {
      if (!hoveredChord) return [];
      
      return nodes.filter(n => n.root !== hoveredChord.root).map(target => {
          const affinity = getHarmonicCompatibility(hoveredChord, target);
          // Only draw lines for strong relationships (V-I, etc)
          if (affinity.score >= 0.8) return { target, affinity };
          return null;
      }).filter(Boolean) as { target: typeof nodes[0], affinity: any }[];
  }, [hoveredChord, nodes]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, chord: Chord) => {
      if (triggerMode === 'click') return;
      if (onDragStart) onDragStart(chord);
      e.dataTransfer.setData('application/json', JSON.stringify(chord));
  };

  return (
    <div className="w-full h-full bg-transparent relative select-none flex items-center justify-center overflow-hidden">
        
        {/* Scientific Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
             <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white"></div>
             <div className="absolute top-1/2 left-0 right-0 h-px bg-white"></div>
             <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border border-white rounded-full"></div>
        </div>
        
        {/* Axis Labels */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-600 tracking-widest uppercase pointer-events-none">Relative (vi)</div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-slate-600 tracking-widest uppercase pointer-events-none">Pre-Dominant (ii)</div>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-mono text-slate-600 tracking-widest uppercase pointer-events-none">Subdominant (IV)</div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-mono text-slate-600 tracking-widest uppercase pointer-events-none">Dominant (V)</div>

        {/* Resolution Lines (Only visible on hover) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {hoveredChord && connections.map((conn, i) => {
                // Find coordinates of hovered chord
                const startNode = nodes.find(n => n.root === hoveredChord.root);
                if (!startNode) return null;
                
                return (
                    <g key={i}>
                        <line 
                            x1={`${startNode.x}%`} y1={`${startNode.y}%`} 
                            x2={`${conn.target.x}%`} y2={`${conn.target.y}%`} 
                            stroke={conn.affinity.score > 0.9 ? palette.accent : 'white'}
                            strokeWidth={conn.affinity.score > 0.9 ? 2 : 1}
                            opacity={0.4}
                            strokeDasharray="4 4"
                        />
                        {/* Animated Flow Dot */}
                        <circle r="2" fill="white">
                            <animateMotion 
                                dur="1s" 
                                repeatCount="indefinite"
                                path={`M${startNode.x * window.innerWidth / 100},${startNode.y * window.innerHeight / 100} L${conn.target.x * window.innerWidth / 100},${conn.target.y * window.innerHeight / 100}`} 
                            />
                        </circle>
                    </g>
                );
            })}
        </svg>

        {/* The Harmonic Compass Nodes */}
        {nodes.map((node, i) => {
            const isHovered = hoveredChord?.root === node.root;
            const isCenter = node.romanNumeral === 'I' || node.romanNumeral === 'i';
            
            // If this is the central chord, we MERGE the PitchConstellation here
            const showConstellation = isCenter || isHovered;

            return (
                <div
                    key={`${node.root}-${i}`}
                    draggable={triggerMode === 'drag'}
                    onDragStart={(e) => handleDragStart(e, node)}
                    onClick={() => triggerMode === 'click' && onChordClick && onChordClick(node)}
                    onMouseEnter={() => {
                        setHoveredChord(node);
                        if (onInspectChord) onInspectChord(node);
                    }}
                    onMouseLeave={() => setHoveredChord(null)}
                    style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                        zIndex: isHovered ? 50 : node.z,
                        transform: `translate(-50%, -50%) scale(${node.scale})`,
                    }}
                    className={`
                        absolute 
                        flex items-center justify-center
                        transition-all duration-500 ease-out
                    `}
                >
                    {/* The Node Visualization */}
                    <div className={`
                        relative rounded-full flex items-center justify-center transition-all duration-500
                        ${showConstellation ? 'bg-[#09090b] border border-white/10 shadow-2xl scale-150' : 'bg-white/5 border border-white/5 hover:bg-white/10'}
                    `}
                    style={{
                        width: showConstellation ? '180px' : '70px',
                        height: showConstellation ? '180px' : '70px',
                        boxShadow: isCenter ? `0 0 60px -10px ${palette.accent}40` : 'none'
                    }}
                    >
                        {showConstellation ? (
                            <div className="animate-in zoom-in duration-300">
                                <PitchConstellation 
                                    notes={node.notes} 
                                    root={node.root} 
                                    size={160} 
                                    showLabels={isHovered} // Only show note names when hovering
                                    labelMode="interval" // Scientific view: show Intervals, not just names
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center bg-[#09090b]/80 backdrop-blur px-2 rounded">
                                        <div className="text-2xl font-bold text-white">{node.symbol}</div>
                                        <div className="text-xs font-mono text-[var(--accent)]">{node.romanNumeral}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <span className={`text-xs font-bold text-white block`}>
                                    {node.symbol}
                                </span>
                                <span className={`text-[9px] font-mono text-slate-500 block`}>
                                    {node.romanNumeral}
                                </span>
                            </div>
                        )}

                        {/* Drag Handle Indicator */}
                        {triggerMode === 'drag' && !showConstellation && (
                             <div className="absolute -top-1 -right-1 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100">
                                 <Plus size={8} className="text-white" />
                             </div>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
  );
};

export default GravityStage;
