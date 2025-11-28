
import React from 'react';
import { Note, Chord } from '../types';
import { CIRCLE_KEYS, RELATIVE_MINORS, polarToCartesian } from '../utils/musicTheory';
import { cn } from './UI';

interface CircleOfFifthsProps {
  currentKey: Note;
  onKeySelect: (key: Note) => void;
  activeChord?: Chord | null;
  scaleNotes?: string[];
}

const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ currentKey, onKeySelect, activeChord }) => {
  const size = 260;
  const center = size / 2;
  const outerRadius = 120;
  const innerRadius = 80;
  const holeRadius = 45;
  
  const describeArc = (x: number, y: number, innerR: number, outerR: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, outerR, endAngle);
    const end = polarToCartesian(x, y, outerR, startAngle);
    const start2 = polarToCartesian(x, y, innerR, endAngle);
    const end2 = polarToCartesian(x, y, innerR, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${end2.x} ${end2.y} A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${start2.x} ${start2.y} Z`;
  };

  const currentIndex = CIRCLE_KEYS.indexOf(currentKey);
  
  const getDegreeLabel = (index: number, isInner: boolean): string | null => {
      if (currentIndex === -1) return null;
      let diff = index - currentIndex;
      if (diff > 6) diff -= 12;
      if (diff < -6) diff += 12;

      if (!isInner) {
          if (diff === 0) return 'I';
          if (diff === 1) return 'V';
          if (diff === -1) return 'IV';
          if (diff === 5) return 'vii°'; 
      } else {
          if (diff === 0) return 'vi';
          if (diff === 1) return 'iii';
          if (diff === -1) return 'ii';
      }
      return null;
  };

  return (
    <div className="relative flex items-center justify-center flex-col py-8 w-full select-none">
      <svg viewBox={`0 0 ${size} ${size}`} className="cf-arcs drop-shadow-2xl w-full max-w-[280px] h-auto overflow-visible">
        {CIRCLE_KEYS.map((key, index) => {
          const startAngle = (index * 30) - 15;
          const endAngle = startAngle + 30;
          const isSelectedKey = key === currentKey;
          
          let isDiatonic = false;
          if (currentIndex !== -1) {
              let diff = index - currentIndex;
              if (diff > 6) diff -= 12;
              if (diff < -6) diff += 12;
              if (Math.abs(diff) <= 1 || diff === 5) isDiatonic = true;
          }

          const isOuterActive = activeChord?.root === key;
          const isInnerActive = activeChord?.root === RELATIVE_MINORS[index];
          
          // Palette: Zinc-900 base, Accent highlight
          const outerFill = isOuterActive ? 'var(--accent)' : isSelectedKey ? 'var(--accent)' : '#18181b'; 
          const innerFill = isInnerActive ? 'var(--accent)' : '#09090b';
          
          const opacity = isDiatonic ? (isSelectedKey ? 1 : 0.6) : 0.15;
          const strokeColor = isDiatonic ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.03)";

          const outerLabel = getDegreeLabel(index, false);
          const innerLabel = getDegreeLabel(index, true);
          const labelAngle = index * 30;
          const majorPos = polarToCartesian(center, center, (outerRadius + innerRadius) / 2, labelAngle);
          const minorPos = polarToCartesian(center, center, (innerRadius + holeRadius) / 2, labelAngle);

          return (
            <g key={key} onClick={() => onKeySelect(key)} className="cursor-pointer group transition-all duration-500" style={{ opacity }}>
              <path
                d={describeArc(center, center, innerRadius, outerRadius, startAngle, endAngle)}
                fill={outerFill}
                stroke={strokeColor}
                strokeWidth={1}
                className={cn("transition-all duration-300", isDiatonic && !isSelectedKey && "hover:fill-[#27272a]")}
              />
              <path
                d={describeArc(center, center, holeRadius, innerRadius, startAngle, endAngle)}
                fill={innerFill}
                stroke={strokeColor}
                strokeWidth={1}
                className={cn("transition-all duration-300", isDiatonic && "hover:fill-[#18181b]")}
              />
              
              <text 
                x={majorPos.x} y={majorPos.y} 
                className="text-sm font-bold pointer-events-none" 
                fill={isOuterActive || isSelectedKey ? '#000' : '#f4f4f5'} 
                style={{ textAnchor: 'middle', dominantBaseline: 'middle' }}
              >
                {key}
              </text>
              
              <text 
                x={minorPos.x} y={minorPos.y} 
                className="text-[10px] pointer-events-none" 
                fill={isInnerActive ? '#000' : '#a1a1aa'} 
                style={{ fontWeight: isInnerActive ? 800 : 400, textAnchor: 'middle', dominantBaseline: 'middle' }}
              >
                {RELATIVE_MINORS[index]}
              </text>
              
              {outerLabel && isDiatonic && (
                  <text x={majorPos.x} y={majorPos.y - 14} className="text-[8px] font-mono font-bold fill-white opacity-50 pointer-events-none" textAnchor="middle">{outerLabel}</text>
              )}
              {innerLabel && isDiatonic && (
                  <text x={minorPos.x} y={minorPos.y + 10} className="text-[7px] font-mono font-bold fill-white opacity-40 pointer-events-none" textAnchor="middle">{innerLabel}</text>
              )}
            </g>
          );
        })}
        
        {/* Center Hub */}
        <circle cx={center} cy={center} r={holeRadius - 4} fill="transparent" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.2" />
        <text x={center} y={center} className="font-mono text-[9px] uppercase tracking-[0.2em] fill-[var(--accent)] opacity-80" textAnchor="middle" dominantBaseline="middle">Circle</text>
      </svg>
      
      {/* Status Indicator */}
      <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2">
        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-1">Current Tonic</p>
        <p className="text-3xl text-white font-black tracking-tight">{currentKey}</p>
      </div>
    </div>
  );
};

export default CircleOfFifths;
