
import React from 'react';
import { Chord } from '../types';
import { analyzeVoiceLeading } from '../utils/musicTheory';
import { Surface, Typo, cn } from './UI';

interface VoiceLeadingConnectorProps {
  prevChord: Chord;
  nextChord: Chord;
  height?: number;
}

const VoiceLeadingConnector: React.FC<VoiceLeadingConnectorProps> = ({ prevChord, nextChord }) => {
  const analysis = analyzeVoiceLeading(prevChord, nextChord);
  const color = analysis.type === 'smooth' ? 'text-emerald-400' : analysis.type === 'jump' ? 'text-rose-400' : 'text-amber-400';
  const dotColor = analysis.type === 'smooth' ? 'bg-emerald-500' : analysis.type === 'jump' ? 'bg-rose-500' : 'bg-amber-500';

  return (
    <div className="relative w-12 h-full flex items-center justify-center group/connector z-0">
      {/* Thread */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/connector:via-white/30 transition-all"></div>
      
      {/* Orb */}
      <div className={cn(
          "absolute w-1.5 h-1.5 rounded-full transition-all duration-300 border border-black",
          dotColor,
          "group-hover/connector:scale-125 group-hover/connector:shadow-[0_0_10px_currentColor]"
      )}></div>

      {/* Hover Card */}
      <div className="absolute top-1/2 -translate-y-1/2 -left-16 -right-16 opacity-0 group-hover/connector:opacity-100 transition-all duration-300 z-50 pointer-events-none scale-90 group-hover/connector:scale-100 blur-sm group-hover/connector:blur-0">
          <Surface glass className="p-4 flex flex-col items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border-white/10 min-w-[180px] bg-[#0c0c0e]/90">
              <div className="flex justify-between w-full mb-3 pb-2 border-b border-white/5">
                  <Typo variant="label" className="text-zinc-500">Leading</Typo>
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", color)}>{analysis.type}</span>
              </div>
              
              <div className="relative w-full h-12 w-32 mb-3">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
                      {analysis.lines.map((line, i) => {
                          const y1 = 10 + (line.start * 25);
                          const y2 = 10 + (line.end * 25);
                          return (
                            <g key={i}>
                                <path 
                                    d={`M 0 ${y1} C 50 ${y1}, 50 ${y2}, 100 ${y2}`}
                                    stroke={line.color} 
                                    strokeWidth="0.5" 
                                    fill="none"
                                    strokeDasharray={line.color === '#f87171' ? '2 2' : 'none'}
                                    opacity={0.8}
                                />
                                <circle cx="0" cy={y1} r="1" fill={line.color} />
                                <circle cx="100" cy={y2} r="1" fill={line.color} />
                            </g>
                          );
                      })}
                  </svg>
              </div>
              
              <div className="w-full flex justify-between text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
                  <span>{analysis.contour}</span>
                  <span>{analysis.commonTones} Common</span>
              </div>
          </Surface>
      </div>
    </div>
  );
};

export default VoiceLeadingConnector;
