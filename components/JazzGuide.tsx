
import React, { useState } from 'react';
import { Chord, ScaleType, Note } from '../types';
import { buildChord, getScaleSuggestionForChord, CIRCLE_KEYS, getChromaticIndex, RELATIVE_MINORS } from '../utils/musicTheory';
import { Compass, Palette, Map, ArrowRight, RotateCcw, Plus, Zap, Box } from 'lucide-react';

interface JazzGuideProps {
  currentKey: Note;
  scaleType: ScaleType;
  progression: Chord[];
  onAppendChords: (chords: Chord[]) => void;
  onSetKey: (key: Note) => void;
}

type GuideTab = 'cycle' | 'syllabus' | 'form';

const JazzGuide: React.FC<JazzGuideProps> = ({ currentKey, scaleType, progression, onAppendChords, onSetKey }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('cycle');
  const [cycleTarget, setCycleTarget] = useState<Note>(currentKey);

  // --- Logic for Cycle (ii-V-I) ---
  const handleAddII_V_I = () => {
      // Calculate ii and V based on Target (which acts as I)
      // In Circle of Fifths (C at 12):
      // C (I) is target.
      // G (V) is 1 step Clockwise (Right).
      // D (ii) is 2 steps Clockwise (Right of V).
      // Movement is D -> G -> C (Counter-Clockwise).
      
      const chromatic = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']; // Simplified lookup
      // Actually use CIRCLE_KEYS logic for accuracy if preferred, but semitones are safer for chord building
      
      const targetIdx = CIRCLE_KEYS.indexOf(cycleTarget);
      const vIdx = (targetIdx + 1) % 12;
      const iiIdx = (targetIdx + 2) % 12;
      
      const noteV = CIRCLE_KEYS[vIdx];
      const noteII = CIRCLE_KEYS[iiIdx]; 
      // Need to map circle keys (which might use sharps/flats inconsistently) to chord builder preferences
      // For simplicity, we pass the note name directly to buildChord which handles enharmonics via index
      
      const ii = buildChord(noteII === 'F#' ? 'F#' : RELATIVE_MINORS[iiIdx].replace('m',''), 'Minor', 'm7', 1, 'Pre-Dominant', 'ii7');
      const V = buildChord(noteV, 'Dominant', '7', 4, 'Dominant', 'V7');
      const I = buildChord(cycleTarget, 'Major', 'Maj7', 0, 'Tonic', 'Imaj7');

      onAppendChords([ii, V, I]);
  };

  const handleBackcycle = () => {
      // Generate a "Chain of Dominants"
      // Pick a random start point, do 3 dominants moving counter-clockwise
      const startIdx = Math.floor(Math.random() * 12);
      const c1 = CIRCLE_KEYS[(startIdx + 2) % 12];
      const c2 = CIRCLE_KEYS[(startIdx + 1) % 12];
      const c3 = CIRCLE_KEYS[startIdx];

      const chord1 = buildChord(c1, 'Dominant', '7', 0, 'Chain Start', 'V7/V');
      const chord2 = buildChord(c2, 'Dominant', '7', 0, 'Chain Mid', 'V7');
      const chord3 = buildChord(c3, 'Major', 'Maj7', 0, 'Resolution', 'I');

      onAppendChords([chord1, chord2, chord3]);
  };

  // --- Logic for Form (AABA) ---
  const handleAddSectionA = () => {
      // Standard 4-bar Turnaround: I - vi - ii - V
      const scaleNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // Simplified for demo, ideally use getScaleNotes
      // We'll trust buildChord to find the right notes for the current key
      
      // Note: This assumes Major key for A section
      const I = buildChord(currentKey, 'Major', 'Maj7', 0, 'Home', 'I');
      // Find vi relative to currentKey. 
      // Quick hack: Use circle relative minor for I
      const idx = CIRCLE_KEYS.indexOf(currentKey);
      const viRoot = RELATIVE_MINORS[idx].replace('m', '');
      
      const vi = buildChord(viRoot, 'Minor', 'm7', 5, 'Turnaround Start', 'vi');
      
      // Find ii (2 steps clockwise from Key)
      const iiRoot = CIRCLE_KEYS[(idx + 2) % 12] === 'F#' ? 'F#' : RELATIVE_MINORS[(idx + 2) % 12].replace('m',''); 
      // Actually Circle logic: ii is relative minor of IV. IV is -1 index. 
      // Let's reuse the II from the Cycle logic which was (Target + 2).
      // Wait, Circle: C -> G -> D. D is ii. Yes.
      
      // Re-calculate cleanly
      const iiTargetIdx = (idx + 2) % 12;
      // Note: Circle keys are Dominants. Relative minors are listed in RELATIVE_MINORS.
      // D is at index 2 relative to C?
      // Circle: C(0), G(1), D(2). Yes.
      const iiNote = CIRCLE_KEYS[iiTargetIdx]; // D
      const ii = buildChord(iiNote, 'Minor', 'm7', 1, 'Pre-Dominant', 'ii');

      const vTargetIdx = (idx + 1) % 12; // G
      const vNote = CIRCLE_KEYS[vTargetIdx];
      const V = buildChord(vNote, 'Dominant', '7', 4, 'Dominant', 'V');

      onAppendChords([I, vi, ii, V]);
  };

  const handleAddBridge = () => {
      // Modulate to a new key (Tritone or 3 steps away)
      const idx = CIRCLE_KEYS.indexOf(currentKey);
      const bridgeIdx = (idx + 6) % 12; // Tritone jump (Opposite side)
      const newKey = CIRCLE_KEYS[bridgeIdx];
      
      onSetKey(newKey);
      
      // Add a ii-V-I in this new key
      const iiIdx = (bridgeIdx + 2) % 12;
      const vIdx = (bridgeIdx + 1) % 12;
      
      const ii = buildChord(CIRCLE_KEYS[iiIdx], 'Minor', 'm7', 1, 'Bridge ii', 'ii');
      const V = buildChord(CIRCLE_KEYS[vIdx], 'Dominant', '7', 4, 'Bridge V', 'V');
      const I = buildChord(newKey, 'Major', 'Maj7', 0, 'Bridge I', 'I');
      
      onAppendChords([ii, V, I]);
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      
      {/* Tabs */}
      <div className="flex items-center border-b border-white/5 bg-[#111113]">
         <button
            onClick={() => setActiveTab('cycle')}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${activeTab === 'cycle' ? 'text-white bg-[#161618]' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <Compass size={14} className={activeTab === 'cycle' ? 'text-[var(--accent)]' : ''} />
            The Cycle
            {activeTab === 'cycle' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"></div>}
         </button>
         <button
            onClick={() => setActiveTab('syllabus')}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${activeTab === 'syllabus' ? 'text-white bg-[#161618]' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <Palette size={14} className={activeTab === 'syllabus' ? 'text-[var(--accent)]' : ''} />
            Syllabus
            {activeTab === 'syllabus' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"></div>}
         </button>
         <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all relative ${activeTab === 'form' ? 'text-white bg-[#161618]' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <Map size={14} className={activeTab === 'form' ? 'text-[var(--accent)]' : ''} />
            Form Grid
            {activeTab === 'form' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]"></div>}
         </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0e0e10] p-6">
        
        {/* MODE: THE CYCLE */}
        {activeTab === 'cycle' && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <div className="p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                        <RotateCcw size={14} /> Counter-Clockwise Movement
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Jazz harmony moves backwards around the circle. Pick a target (I), find its neighbor to the right (V), and the neighbor to the right of that (ii).
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Select Target (I)</span>
                        <select 
                            value={cycleTarget} 
                            onChange={(e) => setCycleTarget(e.target.value as Note)}
                            className="bg-[#18181b] border border-white/10 rounded px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-[var(--accent)]"
                        >
                            {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>

                    {/* Visualizer Chain */}
                    <div className="flex items-center justify-center gap-2 py-6">
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center text-slate-400 font-bold text-sm">
                                {CIRCLE_KEYS[(CIRCLE_KEYS.indexOf(cycleTarget) + 2) % 12]}
                            </div>
                            <span className="text-[9px] font-bold text-slate-600 uppercase">ii (Pre)</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-600" />
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-12 h-12 rounded-full bg-[#18181b] border border-white/10 flex items-center justify-center text-slate-400 font-bold text-sm">
                                {CIRCLE_KEYS[(CIRCLE_KEYS.indexOf(cycleTarget) + 1) % 12]}
                            </div>
                            <span className="text-[9px] font-bold text-slate-600 uppercase">V (Dom)</span>
                        </div>
                        <ArrowRight size={14} className="text-slate-600" />
                        <div className="flex flex-col items-center gap-1">
                            <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)] flex items-center justify-center text-[var(--accent)] font-bold text-lg shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                {cycleTarget}
                            </div>
                            <span className="text-[9px] font-bold text-[var(--accent)] uppercase">I (Tonic)</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddII_V_I}
                        className="w-full py-3 bg-[#18181b] hover:bg-[#202024] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={14} /> Insert ii - V - I
                    </button>
                </div>
                
                <div className="border-t border-white/5 pt-6">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded text-purple-400"><Zap size={14} /></div>
                        <div>
                            <h5 className="text-xs font-bold text-slate-300 uppercase mb-1">Stuck? Backcycle.</h5>
                            <p className="text-[10px] text-slate-500">
                                Jump to a random spot and create a "Chain of Dominants" moving home.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleBackcycle}
                        className="w-full py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                    >
                        Generate Random Chain
                    </button>
                </div>
            </div>
        )}

        {/* MODE: SYLLABUS */}
        {activeTab === 'syllabus' && (
            <div className="space-y-4 animate-in fade-in duration-300">
                <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-lg mb-6">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2 flex items-center gap-2">
                        <Palette size={14} /> Chord-Scale Palette
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Chords are the skeleton; scales are the skin. Use this chart to decide which mode to play over each chord in your timeline.
                    </p>
                </div>

                {progression.length === 0 ? (
                     <div className="text-center py-12 opacity-50">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Timeline Empty</p>
                     </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {progression.map((chord, i) => {
                            const suggestion = getScaleSuggestionForChord(chord);
                            return (
                                <div key={i} className="flex items-center justify-between p-3 bg-[#18181b] border border-white/5 rounded-lg group hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-mono text-slate-500 w-4">{i+1}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{chord.symbol}</span>
                                            <span className="text-[9px] text-slate-500 uppercase tracking-wider">{chord.functionLabel}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-[var(--accent)] uppercase bg-[var(--accent)]/5 px-2 py-1 rounded border border-[var(--accent)]/20">
                                            {suggestion}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )}

        {/* MODE: FORM GRID */}
        {activeTab === 'form' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="p-4 bg-orange-900/10 border border-orange-500/20 rounded-lg">
                    <h4 className="text-xs font-bold text-orange-400 uppercase mb-2 flex items-center gap-2">
                        <Map size={14} /> The Blueprint (AABA)
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Jazz standards often follow a grid. Use the A Section to establish home, and the Bridge (B) to jump to the opposite side of the circle for contrast.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 p-4 border border-dashed border-white/20 rounded-xl flex items-center justify-between bg-[#18181b]/50">
                        <div>
                            <h5 className="text-sm font-bold text-white mb-1">Section A</h5>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Establish Home Key ({currentKey})</p>
                        </div>
                        <button 
                            onClick={handleAddSectionA}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-[10px] font-bold uppercase transition-all"
                        >
                            Add 4 Bars
                        </button>
                    </div>

                    <div className="col-span-2 p-4 border border-dashed border-white/20 rounded-xl flex items-center justify-between bg-[#18181b]/50 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                        <div className="pl-2">
                            <h5 className="text-sm font-bold text-white mb-1">Section B (Bridge)</h5>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Modulate & Create Contrast</p>
                        </div>
                        <button 
                            onClick={handleAddBridge}
                            className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 rounded-md text-[10px] font-bold uppercase transition-all"
                        >
                            Modulate & Add
                        </button>
                    </div>

                    <div className="col-span-2 p-4 border border-dashed border-white/20 rounded-xl flex items-center justify-between bg-[#18181b]/50 opacity-50 hover:opacity-100 transition-opacity">
                        <div>
                            <h5 className="text-sm font-bold text-white mb-1">Return to A</h5>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Finish the Loop</p>
                        </div>
                        <button 
                            onClick={() => { onSetKey(cycleTarget); handleAddSectionA(); }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-md text-[10px] font-bold uppercase transition-all"
                        >
                            Add Final A
                        </button>
                    </div>
                </div>
                
                <div className="flex justify-center gap-1 mt-4 opacity-30">
                     {[1,2,3,4].map(i => <Box key={i} size={12} />)}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default JazzGuide;
