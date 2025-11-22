
import React from 'react';
import { Chord } from '../types';
import { analyzeVoiceLeading } from '../utils/musicTheory';

interface VoiceLeadingConnectorProps {
  prevChord: Chord;
  nextChord: Chord;
  height?: number;
}

const VoiceLeadingConnector: React.FC<VoiceLeadingConnectorProps> = ({ prevChord, nextChord, height = 80 }) => {
  const analysis = analyzeVoiceLeading(prevChord, nextChord);

  return (
    <div className="relative w-12 sm:w-16 h-full flex items-center justify-center group/connector z-0">
      {/* Default State: Simple Line */}
      <div className="w-full h-px bg-white/10 group-hover/connector:opacity-0 transition-opacity"></div>
      <div className={`absolute w-2 h-2 rounded-full ${analysis.type === 'smooth' ? 'bg-emerald-500/50' : 'bg-white/10'} group-hover/connector:opacity-0 transition-opacity`}></div>

      {/* Hover State: Constellation View */}
      <div className="absolute inset-y-0 -left-4 -right-4 opacity-0 group-hover/connector:opacity-100 transition-opacity duration-300 bg-[#09090b]/90 backdrop-blur-xl border-x border-white/10 z-50 flex flex-col items-center justify-center pointer-events-none rounded-lg shadow-2xl transform scale-110">
          <div className="text-[8px] font-bold uppercase text-slate-500 mb-2 tracking-widest">Voice Leading</div>
          
          <div className="relative w-full h-20 px-4">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {analysis.lines.map((line, i) => {
                      const y1 = 10 + (line.start * 25);
                      const y2 = 10 + (line.end * 25);
                      
                      return (
                        <g key={i}>
                            <line 
                                x1="0" y1={y1} 
                                x2="100" y2={y2} 
                                stroke={line.color} 
                                strokeWidth="2" 
                                strokeDasharray={line.color === '#f87171' ? '4 2' : 'none'}
                            />
                            <circle cx="0" cy={y1} r="3" fill={line.color} />
                            <circle cx="100" cy={y2} r="3" fill={line.color} />
                        </g>
                      );
                  })}
              </svg>
          </div>
          
          <div className="mt-2 flex gap-2 text-[7px] font-mono uppercase">
              <span className="text-emerald-400">● Step</span>
              <span className="text-amber-400">● Guide</span>
              <span className="text-red-400">● Leap</span>
          </div>
      </div>
    </div>
  );
};

export default VoiceLeadingConnector;
