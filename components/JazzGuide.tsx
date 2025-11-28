
import React, { useState } from 'react';
import { Note } from '../types';
import { buildChord, CIRCLE_KEYS, RELATIVE_MINORS, getScaleSuggestionForChord } from '../utils/musicTheory';
import { Compass, Layers, Grid, ArrowRight, Plus, Box } from 'lucide-react';
import { Surface, Typo, Button, Badge, Tabs, SectionHeader, Select } from './UI';

export default ({ currentKey, onAppendChords, onSetKey, progression }: any) => {
  const [tab, setTab] = useState('cycle');
  const [target, setTarget] = useState<Note>(currentKey);

  const actions = {
    cycle: () => {
        const idx = CIRCLE_KEYS.indexOf(target);
        const ii = buildChord(CIRCLE_KEYS[(idx + 2) % 12], 'Minor', { extension: 'm7', degree: 1, emotion: 'Pre', roman: 'ii7' });
        const V = buildChord(CIRCLE_KEYS[(idx + 1) % 12], 'Dominant', { extension: '7', degree: 4, emotion: 'Dom', roman: 'V7' });
        const I = buildChord(target, 'Major', { extension: 'Maj7', degree: 0, emotion: 'Tonic', roman: 'Imaj7' });
        onAppendChords([ii, V, I]);
    },
    sectionA: () => {
        const idx = CIRCLE_KEYS.indexOf(currentKey);
        const I = buildChord(currentKey, 'Major', { extension: 'Maj7', degree: 0, emotion: 'I', roman: 'I' });
        const vi = buildChord(RELATIVE_MINORS[idx].replace('m',''), 'Minor', { extension: 'm7', degree: 5, emotion: 'vi', roman: 'vi' });
        const ii = buildChord(CIRCLE_KEYS[(idx+2)%12], 'Minor', { extension: 'm7', degree: 1, emotion: 'ii', roman: 'ii' });
        const V = buildChord(CIRCLE_KEYS[(idx+1)%12], 'Dominant', { extension: '7', degree: 4, emotion: 'V', roman: 'V' });
        onAppendChords([I, vi, ii, V]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0c0e]">
      <Tabs 
        items={[
            {id: 'cycle', icon: Compass, label: 'Generator'},
            {id: 'syllabus', icon: Grid, label: 'Timeline'},
            {id: 'form', icon: Layers, label: 'Templates'}
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {tab === 'cycle' && (
            <div className="flex flex-col min-h-full">
                <SectionHeader title="Functional Harmony" icon={Compass} />
                <div className="p-8 space-y-8 max-w-lg mx-auto w-full">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <Typo variant="h3">2-5-1 Generator</Typo>
                            <Typo variant="body" className="text-xs opacity-60">Generate cadences in any key</Typo>
                        </div>
                        <div className="flex flex-col items-end">
                            <Typo variant="label" className="mb-1">Target Key</Typo>
                            <Select value={target} onChange={(e) => setTarget(e.target.value as Note)}>
                                {CIRCLE_KEYS.map(k => <option key={k} value={k}>{k}</option>)}
                            </Select>
                        </div>
                    </div>
                        
                    <Surface className="p-8 flex flex-col items-center gap-8 bg-[#121214]/50">
                        <div className="flex items-center justify-center gap-4 w-full">
                            {[ 
                                {n: CIRCLE_KEYS[(CIRCLE_KEYS.indexOf(target)+2)%12], l:'ii', c:'border-zinc-800 text-zinc-500'}, 
                                {n: CIRCLE_KEYS[(CIRCLE_KEYS.indexOf(target)+1)%12], l:'V', c:'border-zinc-800 text-zinc-500'}, 
                                {n: target, l:'I', active: true, c: 'border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_30px_-10px_var(--accent)]'} 
                            ].map((x,i) => (
                                <React.Fragment key={i}>
                                    <Surface className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${x.c}`}>
                                        <span className="text-2xl font-bold">{x.n}</span>
                                        <span className="text-[10px] font-mono uppercase opacity-60 mt-1">{x.l}</span>
                                    </Surface>
                                    {i < 2 && <ArrowRight size={16} className="text-zinc-700" />}
                                </React.Fragment>
                            ))}
                        </div>
                        <Button onClick={actions.cycle} variant="primary" icon={Plus} className="w-full h-10">Insert Progression</Button>
                    </Surface>

                    <div className="text-center opacity-40 px-8">
                        <Typo variant="body" className="text-xs italic">
                            "The ii-V-I is the cornerstone of jazz harmony, establishing a tonal center through strong root movement."
                        </Typo>
                    </div>
                </div>
            </div>
        )}
        
        {tab === 'syllabus' && (
            <div className="flex flex-col min-h-full">
                <SectionHeader title="Chord Syllabus" icon={Grid} />
                <div className="p-4 space-y-2">
                    {!progression.length ? (
                        <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                            <Box size={40} strokeWidth={1}/>
                            <Typo variant="label">Timeline Empty</Typo>
                        </div>
                    ) : progression.map((c: any, i: number) => (
                        <Surface key={i} className="flex justify-between p-4 items-center group hover:border-white/10 transition-colors">
                            <div className="flex gap-4 items-center">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-mono text-zinc-500 group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">{i+1}</div>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <Typo variant="h3" className="text-base">{c.symbol}</Typo>
                                        <span className="text-[10px] font-mono text-zinc-500">{c.romanNumeral}</span>
                                    </div>
                                    <Typo variant="label" className="normal-case opacity-50">{c.functionLabel}</Typo>
                                </div>
                            </div>
                            <Badge variant="outline" className="opacity-50 group-hover:opacity-100 transition-opacity">
                                {getScaleSuggestionForChord(c)}
                            </Badge>
                        </Surface>
                    ))}
                </div>
            </div>
        )}

        {tab === 'form' && (
            <div className="flex flex-col min-h-full">
                <SectionHeader title="Standard Forms" icon={Layers} />
                <div className="p-6 grid gap-4">
                    <Surface className="p-6 flex justify-between items-center group hover:border-[var(--accent)]/50 transition-colors cursor-pointer" onClick={actions.sectionA}>
                        <div className="space-y-2">
                            <Typo variant="h3">Rhythm Changes (A Section)</Typo>
                            <div className="flex gap-2 text-xs font-mono text-zinc-500">
                                <span className="text-[var(--accent)]">I</span>
                                <span>•</span>
                                <span>vi</span>
                                <span>•</span>
                                <span>ii</span>
                                <span>•</span>
                                <span>V</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-[var(--accent)] group-hover:text-black transition-all">
                            <Plus size={20} />
                        </div>
                    </Surface>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
