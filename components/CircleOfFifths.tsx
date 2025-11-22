import React from 'react';
import { Note, Chord } from '../types';
import { CIRCLE_KEYS, RELATIVE_MINORS } from '../utils/musicTheory';

interface CircleOfFifthsProps {
  currentKey: Note;
  onKeySelect: (key: Note) => void;
  activeChord?: Chord | null;
  scaleNotes?: string[];
}

const CircleOfFifths: React.FC<CircleOfFifthsProps> = ({ currentKey, onKeySelect, activeChord, scaleNotes }) => {
  // SVG Config
  const size = 260;
  const center = size / 2;
  const outerRadius = 120;
  const innerRadius = 80;
  const holeRadius = 45;
  
  // Helper to calculate arc path
  const describeArc = (x: number, y: number, innerR: number, outerR: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, outerR, endAngle);
    const end = polarToCartesian(x, y, outerR, startAngle);
    const start2 = polarToCartesian(x, y, innerR, endAngle);
    const end2 = polarToCartesian(x, y, innerR, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", outerR, outerR, 0, largeArcFlag, 0, end.x, end.y,
      "L", end2.x, end2.y,
      "A", innerR, innerR, 0, largeArcFlag, 1, start2.x, start2.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Calculate indices for layout
  const currentIndex = CIRCLE_KEYS.indexOf(currentKey);
  
  // Helper to get harmonic degree label relative to current key (Major Scale Assumption for simplicity)
  // I = Current, IV = Left, V = Right
  // vi = Inner Current, ii = Inner Left, iii = Inner Right
  const getDegreeLabel = (index: number, isInner: boolean): string | null => {
      if (currentIndex === -1) return null;
      
      // Normalized difference logic
      let diff = index - currentIndex;
      // Handle wrapping: 11 - 0 = 11 -> -1 (Left). 0 - 11 = -11 -> +1 (Right)
      if (diff > 6) diff -= 12;
      if (diff < -6) diff += 12;

      if (!isInner) {
          if (diff === 0) return 'I';
          if (diff === 1) return 'V';
          if (diff === -1) return 'IV';
          if (diff === 5) return 'vii°'; // B is 5 steps CW from C
      } else {
          if (diff === 0) return 'vi';
          if (diff === 1) return 'iii';
          if (diff === -1) return 'ii';
      }
      return null;
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-4 w-full">
      
      <svg viewBox={`0 0 ${size} ${size}`} className="cf-arcs drop-shadow-2xl w-full max-w-[260px] h-auto">
        {/* Groups for each key */}
        {CIRCLE_KEYS.map((key, index) => {
          const startAngle = (index * 30) - 15;
          const endAngle = startAngle + 30;
          
          const isSelectedKey = key === currentKey;
          
          // Diatonic Logic: The "Wedge" of 6 neighbors + 1 dim (far right)
          let isDiatonic = false;
          if (currentIndex !== -1) {
              let diff = index - currentIndex;
              if (diff > 6) diff -= 12;
              if (diff < -6) diff += 12;
              // Neighbors (-1, 0, 1) and vii (5) are main Diatonic zones on circle
              if (Math.abs(diff) <= 1 || diff === 5) isDiatonic = true;
          }

          // Check if this specific slice note is the root of the active chord
          const isOuterActive = activeChord?.root === key;
          const isInnerActive = activeChord?.root === RELATIVE_MINORS[index];
          
          // Colors
          const outerFill = isOuterActive ? 'var(--accent)' : isSelectedKey ? 'var(--accent-dim)' : '#1e293b';
          const innerFill = isInnerActive ? 'var(--accent)' : '#0f172a';
          
          // Opacity for non-diatonic keys (dim them out)
          const opacity = isDiatonic ? 1 : 0.3;

          // Labels
          const outerLabel = getDegreeLabel(index, false);
          const innerLabel = getDegreeLabel(index, true);
          
          // Coordinates
          const labelAngle = index * 30;
          const majorPos = polarToCartesian(center, center, (outerRadius + innerRadius) / 2, labelAngle);
          const minorPos = polarToCartesian(center, center, (innerRadius + holeRadius) / 2, labelAngle);

          return (
            <g key={key} onClick={() => onKeySelect(key)} className="cursor-pointer group transition-opacity duration-500" style={{ opacity }}>
              {/* Outer Ring (Major) */}
              <path
                d={describeArc(center, center, innerRadius, outerRadius, startAngle, endAngle)}
                fill={outerFill}
                className={`cf-slice transition-all duration-300 ${isDiatonic ? 'hover:brightness-125' : ''}`}
                stroke="rgba(15, 23, 42, 0.5)"
              />
              
              {/* Inner Ring (Minor) */}
              <path
                d={describeArc(center, center, holeRadius, innerRadius, startAngle, endAngle)}
                fill={innerFill}
                className={`cf-slice transition-all duration-300 ${isDiatonic ? 'hover:brightness-125' : ''}`}
                stroke="rgba(15, 23, 42, 0.5)"
              />

              {/* Labels */}
              <text x={majorPos.x} y={majorPos.y} className="cf-text text-sm" fill={isOuterActive ? '#000' : 'var(--text-light)'} style={{ fontWeight: isSelectedKey || isOuterActive ? 800 : 500 }}>
                {key}
              </text>
              <text x={minorPos.x} y={minorPos.y} className="cf-text text-[10px]" fill={isInnerActive ? '#000' : 'var(--text-light)'} style={{ fontWeight: isInnerActive ? 800 : 400, opacity: 0.8 }}>
                {RELATIVE_MINORS[index]}
              </text>
              
              {/* Harmonic Function Labels (Superimposed) */}
              {outerLabel && isDiatonic && (
                  <text x={majorPos.x} y={majorPos.y - 14} className="text-[8px] font-mono font-bold fill-white opacity-50 pointer-events-none" textAnchor="middle">{outerLabel}</text>
              )}
              {innerLabel && isDiatonic && (
                  <text x={minorPos.x} y={minorPos.y + 10} className="text-[7px] font-mono font-bold fill-white opacity-40 pointer-events-none" textAnchor="middle">{innerLabel}</text>
              )}
            </g>
          );
        })}
        
        {/* Center decorative circle */}
        <circle cx={center} cy={center} r={holeRadius - 2} fill="var(--bg-color)" stroke="var(--accent)" strokeWidth="2" strokeOpacity="0.3" />
        <text x={center} y={center} className="cf-text font-mono text-[10px] uppercase tracking-widest fill-[var(--accent)]">
          Fifths
        </text>
      </svg>

      <div className="mt-2 text-center absolute bottom-0 pointer-events-none opacity-0">
        <p className="text-xs text-slate-500 uppercase tracking-widest">Current Root</p>
        <p className="text-4xl text-[var(--accent)] display-font">{currentKey}</p>
      </div>
    </div>
  );
};

export default CircleOfFifths;