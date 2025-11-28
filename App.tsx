
import React, { useState, useEffect, useRef } from 'react';
import { Chord, ScaleType, Note, InstrumentType, generateChordsForScale, audioEngine } from './lib';
import { Header, ProgressionStrip, GravityStage, TheoryTools, ComplicationBar, Controls, cn } from './components';

export default function App() {
    const [key, setKey] = useState<Note>('C');
    const [scale, setScale] = useState<ScaleType>(ScaleType.Major);
    const [bpm, setBpm] = useState(100);
    const [progression, setProgression] = useState<Chord[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playIndex, setPlayIndex] = useState<number|null>(null);
    const [tab, setTab] = useState('orbit');
    const [inst, setInst] = useState<InstrumentType>('rhodes');
    
    // Split View State
    const [topHeight, setTopHeight] = useState(380);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const chords = generateChordsForScale(key, scale, 'triad');
    const contextChord = progression[progression.length-1];

    useEffect(() => { document.documentElement.style.setProperty('--accent', scale === ScaleType.Major ? '#38bdf8' : '#818cf8'); }, [scale]);

    // Audio Handlers
    const play = (c: Chord) => audioEngine.playChord(c);
    const add = (c: Chord|Chord[]) => { const next = Array.isArray(c)?c:[c]; setProgression(p=>[...p, ...next]); if(next[0]) play(next[0]); };
    const toggle = () => {
        if(isPlaying) { audioEngine.stop(); setIsPlaying(false); setPlayIndex(null); }
        else { setIsPlaying(true); audioEngine.playProgression(progression, bpm, setPlayIndex, () => { setIsPlaying(false); setPlayIndex(null); }); }
    };

    // Split View Logic
    const handleDrag = (clientY: number) => {
        if (!containerRef.current) return;
        const h = Math.max(200, Math.min(containerRef.current.clientHeight - 200, clientY));
        setTopHeight(h);
    };

    useEffect(() => {
        if (!isDragging) return;
        const move = (e: MouseEvent|TouchEvent) => handleDrag('touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY);
        const up = () => { setIsDragging(false); }; 
        document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
        document.addEventListener('touchmove', move); document.addEventListener('touchend', up);
        return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up); };
    }, [isDragging]);

    return (
        <div ref={containerRef} className="flex flex-col h-screen bg-black text-zinc-200 overflow-hidden font-sans select-none touch-none p-2 gap-2">
            {/* Top Panel: Timeline & Header */}
            <div style={{height: topHeight}} className="flex flex-col min-h-0 relative z-10 bg-gradient-to-b from-[#18181b] to-[#0c0c0e] shadow-2xl transition-[height] duration-75 ease-linear rounded-[32px] overflow-hidden ring-1 ring-white/10">
                <Header bpm={bpm} setBpm={setBpm} isPlaying={isPlaying} togglePlay={toggle} keyNote={key} setKey={setKey} scale={scale} setScale={setScale} />
                <ProgressionStrip progression={progression} setProgression={setProgression} activeIndex={playIndex} />
            </div>
            
            {/* Dynamic Complication Bar (Splitter & Tab Controller) */}
            <ComplicationBar 
                active={tab} 
                onChange={setTab} 
                onDragStart={()=>setIsDragging(true)}
                isDragging={isDragging}
                data={{ key, scale, instrument: inst }}
            />

            {/* Bottom Panel: Workbench */}
            <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] relative z-0 rounded-[32px] overflow-hidden ring-1 ring-white/10 pt-8">
                <div className="flex-1 relative overflow-hidden">
                    {tab==='orbit' && <GravityStage chords={chords} onAdd={add} contextChord={contextChord}/>}
                    {tab==='theory' && <TheoryTools chords={chords} onAdd={add} progression={progression} k={key}/>}
                    {tab==='sound' && <Controls currentInstrument={inst} onSetInstrument={(i:any)=>{setInst(i); audioEngine.setInstrument(i)}} chords={chords} play={play} />}
                </div>
            </div>
        </div>
    );
}
