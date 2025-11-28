
import React, { useState, useEffect } from 'react';
import { Chord, Note, ScaleType } from '../types';
import { generateSuggestions, analyzeHarmony, AiSuggestion } from '../services/geminiService';
import { buildChord, CIRCLE_KEYS } from '../utils/musicTheory';
import { Compass, BookOpen, Sparkles, Loader2, Plus, ArrowRight, RefreshCw, Zap, MoreHorizontal, Lightbulb, Music2 } from 'lucide-react';
import { Surface, Typo, Button, Badge, IconButton, Card, Tabs, SectionHeader } from './UI';

interface AiAssistantProps {
  currentKey: Note;
  scaleType: ScaleType;
  progression: Chord[];
  onAppendChords: (chords: Chord[]) => void;
  onSetKey: (key: Note) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ currentKey, scaleType, progression, onAppendChords }) => {
  const [activeTab, setActiveTab] = useState('insights');
  
  // AI State
  const [analysis, setAnalysis] = useState<string>("");
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // Auto-analyze when progression changes
  useEffect(() => {
      const timer = setTimeout(() => {
          if (progression.length > 0 && activeTab === 'insights') handleAnalyze();
      }, 2000);
      return () => clearTimeout(timer);
  }, [progression.length, activeTab]);

  const handleAnalyze = async () => {
    if (!progression.length) return;
    setIsAnalyzing(true);
    const text = await analyzeHarmony(progression, currentKey);
    setAnalysis(text);
    setIsAnalyzing(false);
    
    // Also trigger suggestions if empty
    if (suggestions.length === 0) handleSuggest();
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    const suggs = await generateSuggestions(progression, currentKey, scaleType);
    setSuggestions(suggs);
    setIsSuggesting(false);
  };

  const applySuggestion = (s: AiSuggestion) => {
    const chord = buildChord(s.root, s.quality as any, { 
        extension: s.extension, 
        roman: s.roman, 
        emotion: s.explanation 
    });
    onAppendChords([chord]);
    // Optional: Remove applied suggestion or refresh
    setSuggestions(prev => prev.filter(i => i !== s)); 
  };

  const PresetCard = ({ title, chords, desc }: { title: string, chords: string[], desc: string }) => (
      <Card onClick={() => { /* Logic to load preset would go here */ }} className="group">
          <div className="flex justify-between items-start mb-2">
              <Typo variant="h3" className="group-hover:text-[var(--accent)] transition-colors">{title}</Typo>
              <Badge variant="outline">{chords.length} Chords</Badge>
          </div>
          <div className="flex gap-1 mb-3 overflow-hidden">
              {chords.map((c, i) => (
                  <span key={i} className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-zinc-400">{c}</span>
              ))}
          </div>
          <Typo variant="body" className="text-xs opacity-60">{desc}</Typo>
      </Card>
  );

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <Tabs 
        items={[
            {id: 'insights', icon: Sparkles, label: 'Insights'},
            {id: 'explore', icon: Compass, label: 'Explore'}, 
            {id: 'library', icon: BookOpen, label: 'Library'} 
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
        
        {activeTab === 'insights' && (
          <div className="flex flex-col min-h-full">
            <SectionHeader title="Context Awareness" icon={Sparkles}>
                <IconButton 
                    icon={RefreshCw} 
                    size={14} 
                    onClick={() => { handleAnalyze(); handleSuggest(); }} 
                    className={isAnalyzing || isSuggesting ? "animate-spin" : ""} 
                    disabled={isAnalyzing || isSuggesting} 
                />
            </SectionHeader>
            
            <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl mx-auto w-full">
                {/* Analysis Block */}
                <Surface className="p-5 relative border-l-2 border-l-[var(--accent)] overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-[var(--accent)]"><Lightbulb size={48} /></div>
                    <div className="relative z-10">
                        {isAnalyzing ? (
                            <div className="flex items-center gap-3 text-zinc-400 py-2">
                                <Loader2 className="animate-spin" size={16} />
                                <Typo variant="body" className="animate-pulse">Analyzing harmonic structure...</Typo>
                            </div>
                        ) : analysis ? (
                            <div>
                                <Typo variant="label" className="mb-2 text-[var(--accent)]">Harmonic Narrative</Typo>
                                <Typo variant="body" className="text-zinc-300 italic leading-relaxed">"{analysis}"</Typo>
                            </div>
                        ) : (
                            <div className="text-center opacity-50 py-4">
                                <Typo variant="body">Play or add chords to generate insights.</Typo>
                            </div>
                        )}
                    </div>
                </Surface>

                {/* Suggestions Block */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <Typo variant="label" className="flex items-center gap-2"><Zap size={12}/> AI Suggestions</Typo>
                        {isSuggesting && <Loader2 size={12} className="animate-spin text-zinc-500" />}
                    </div>
                    
                    {suggestions.length > 0 ? (
                        <div className="grid gap-3">
                            {suggestions.map((s, i) => (
                                <Card key={i} onClick={() => applySuggestion(s)} className="flex-row items-center gap-4 hover:border-[var(--accent)] group">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                                        <Plus size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-white text-lg">{s.root}{s.quality === 'Minor' ? 'm' : ''}<span className="text-sm font-normal opacity-70">{s.extension}</span></span>
                                            <span className="text-[10px] font-mono text-[var(--accent)] px-1.5 py-0.5 rounded bg-[var(--accent)]/10">{s.roman}</span>
                                        </div>
                                        <div className="text-xs text-zinc-500 truncate">{s.explanation}</div>
                                    </div>
                                    <div className="text-xs font-bold text-zinc-600">{s.confidence}%</div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                            <Typo variant="body" className="opacity-50">No suggestions available.</Typo>
                            <Button variant="ghost" onClick={handleSuggest} className="mt-2 mx-auto">Generate Ideas</Button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'explore' && (
             <div className="flex flex-col min-h-full">
                <SectionHeader title="Theory Explorer" icon={Compass} />
                <div className="p-6 grid grid-cols-2 gap-4">
                    <Card className="items-center justify-center p-8 text-center gap-2 aspect-square">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2"><Music2 size={24}/></div>
                        <Typo variant="h3">Scale Modes</Typo>
                        <Typo variant="body" className="text-xs opacity-50">Explore parallel modes</Typo>
                    </Card>
                    <Card className="items-center justify-center p-8 text-center gap-2 aspect-square">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2"><RefreshCw size={24}/></div>
                        <Typo variant="h3">Substitutions</Typo>
                        <Typo variant="body" className="text-xs opacity-50">Tritone & secondary</Typo>
                    </Card>
                    <div className="col-span-2 p-4 opacity-50 text-center text-xs font-mono text-zinc-500 mt-4">More tools coming soon...</div>
                </div>
             </div>
        )}

        {activeTab === 'library' && (
            <div className="flex flex-col min-h-full">
                <SectionHeader title="Progression Library" icon={BookOpen} />
                <div className="p-6 space-y-4">
                    <PresetCard title="Neo-Soul Walk" chords={['Cm9', 'F13', 'Bbmaj9', 'G7alt']} desc="Smooth, jazzy movement with tension." />
                    <PresetCard title="Epic Cinematic" chords={['Am', 'Fmaj7', 'C', 'G/B']} desc="Heroic and expansive soundscape." />
                    <PresetCard title="Lo-Fi Chill" chords={['Dbmaj9', 'Cm7', 'Fm9', 'Ab13']} desc="Relaxed, nostalgic vibes." />
                    <PresetCard title="Mystery" chords={['Emadd9', 'Cmaj7#11', 'F#m11', 'B7b9']} desc="Dark, unresolved tension." />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistant;
