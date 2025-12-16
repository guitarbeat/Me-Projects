
import React, { useState } from 'react';
import { cn, IconButton } from '../ui';
// Re-export panel components
import { useStore } from '../../lib';
import { 
    Play, Pause,
    ListMusic, Network, Keyboard, Zap,
    PanelLeftClose, PanelLeftOpen,
    PenTool, LucideIcon, Save
} from 'lucide-react';
import { SplitView } from './split-view';
import { SongwritingBoard, MiniSongwritingBoard } from '../tools/SongwritingBoard';
import { ProjectLibrary } from '../overlays/ProjectLibrary';
import { ChordEditor } from '../tools/ChordEditor';
import { HarmonicSpace, MiniHarmonicMap } from '../tools/HarmonicMap';
import { ProgressionStrip, ChordPalette, MiniSequencer, MiniChordPalette } from '../tools/Sequencer'; // Note: ChordPalette is the list component
import { CircleOfFifths } from '../tools/CircleOfFifths';
import { MoodSelector, MiniMoodSelector } from '../tools/MoodSelector';

export default function ControlPanel() {
    const { 
        key: currentKey, 
        scale, 
        isPlaying, 
        togglePlay,

        progression,
        selectedChordIndex,
        setSelectedChordIndex,
        handleProgression,
    } = useStore();

    const selectedChord = (selectedChordIndex !== null && progression[selectedChordIndex]) ? progression[selectedChordIndex] : null;

    // Flexible Panel State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [visiblePanels, setVisiblePanels] = useState({
        map: true,
        sequencer: true,
        palette: true,
        mood: false,
        songwriting: false
    });

    const [showLibrary, setShowLibrary] = useState(false);

    // Handlers
    const togglePanel = (key: keyof typeof visiblePanels) => {
        setVisiblePanels(prev => {
            const next = { ...prev, [key]: !prev[key] };
            return next;
        });
    };


    const PANEL_TOGGLES: { id: keyof typeof visiblePanels; icon: LucideIcon; label: string }[] = [
        { id: 'map', icon: Network, label: 'Harmonic Map' },
        { id: 'sequencer', icon: ListMusic, label: 'Sequencer' },
        { id: 'palette', icon: PenTool, label: 'Chord Palette' },
        { id: 'songwriting', icon: Keyboard, label: 'Songwriting' },
        { id: 'mood', icon: Zap, label: 'Mood Selector' },
    ];

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-500">
            {showLibrary && <ProjectLibrary onClose={() => setShowLibrary(false)} />}

            {/* MAIN CONTENT AREA ROW */}
            <div className="flex-1 min-h-0 flex overflow-hidden relative">
                
                {/* GLOBAL CONTROLS SIDEBAR */}
                <div className={cn(
                    "border-r border-[var(--border)] flex flex-col items-center py-4 gap-3 shrink-0 z-40 bg-[var(--bg-main)] transition-all duration-300 ease-in-out relative overflow-hidden",
                    isSidebarCollapsed ? "w-0 border-r-0 opacity-0 px-0" : "w-14 opacity-100"
                )}>
                    
                    {/* Transport (Play/Pause) on Top */}
                    <IconButton 
                        onClick={togglePlay}
                        variant={isPlaying ? "primary" : "secondary"}
                        icon={isPlaying ? Pause : Play}
                        className={cn("w-8 h-8 rounded-full", isPlaying && "text-black")}
                        title={isPlaying ? "Pause" : "Play"}
                    />

                    <div className="w-6 h-px bg-[var(--border)]" />

                    {/* Show/Hide Toggles */}
                    {PANEL_TOGGLES.map(panel => (
                        <IconButton
                            key={panel.id}
                            onClick={() => togglePanel(panel.id)}
                            variant={visiblePanels[panel.id] ? "primary" : "ghost"}
                            icon={panel.icon}
                            title={panel.label}
                            className={cn(visiblePanels[panel.id] && "bg-[var(--bg-element)] text-[var(--accent)] border-[var(--border)]")}
                        />
                    ))}

                    <div className="flex-1" />

                    {/* Bottom Controls */}
                    


                    <IconButton 
                            onClick={() => setShowLibrary(true)}
                            variant="ghost"
                            icon={Save}
                            title="Save / Load Project"
                    />

                    {/* Collapse Sidebar Button */}
                     <IconButton 
                        onClick={() => setIsSidebarCollapsed(true)}
                        variant="ghost"
                        icon={PanelLeftClose}
                        className="opacity-50 hover:opacity-100"
                        title="Collapse Sidebar"
                    />

                </div>

                {/* EXPAND SIDEBAR TRIGGER (Visible when collapsed) */}
                <div className={cn(
                    "absolute left-2 bottom-2 z-50 transition-all duration-300",
                    isSidebarCollapsed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none"
                )}>
                    <IconButton 
                        onClick={() => setIsSidebarCollapsed(false)}
                        variant="secondary"
                        icon={PanelLeftOpen}
                        className="shadow-md bg-[var(--bg-element)] border border-[var(--border)]"
                        title="Show Sidebar"
                    />
                </div>

                <div className={cn(
                    "flex-1 flex flex-col min-w-0 bg-transparent p-2 gap-2 overflow-hidden",
                )}>
                    <div className="h-full w-full bg-black p-0">
                        <SplitView 
                            panels={[
                                {
                                    id: 'map',
                                            content: (
                                                <HarmonicSpace />
                                            ),
                                            defaultSize: 40,
                                            collapsible: true, // Allow collapsing
                                            collapsedSize: 6, // Mini state size (~50px)
                                            isCollapsed: !visiblePanels.map,
                                            onCollapseChange: (c) => setVisiblePanels(prev => ({ ...prev, map: !c })),
                                            minSize: 15,
                                            miniOverlay: <MiniHarmonicMap />
                                        },
                                        {
                                            id: 'sequencer',
                                            content: (
                                                <ProgressionStrip showPalette={false} />
                                            ),
                                            defaultSize: 30,
                                            collapsible: true,
                                            collapsedSize: 6,
                                            isCollapsed: !visiblePanels.sequencer,
                                            onCollapseChange: (c) => setVisiblePanels(prev => ({ ...prev, sequencer: !c })),
                                            minSize: 15,
                                            miniOverlay: <MiniSequencer />
                                        },
                                        {
                                            id: 'palette',
                                            content: (
                                                selectedChord ? (
                                                     <div className="h-full w-full bg-[var(--bg-soft)] p-2">
                                                        <ChordEditor 
                                                            selectedChord={selectedChord} 
                                                            selectedChordIndex={selectedChordIndex} 
                                                            progression={progression} 
                                                            handleProgression={handleProgression} 
                                                            onClose={() => setSelectedChordIndex(null)} 
                                                        />
                                                     </div>
                                                ) : (
                                                    <div className="h-full w-full flex flex-row">
                                                        {/* Side-by-side Layout for Independent Panel */}
                                                        <div className="w-[180px] h-full shrink-0 border-r border-[var(--border)] bg-[var(--bg-soft)] flex items-center justify-center p-2">
                                                                <CircleOfFifths 
                                                                currentKey={`${currentKey} ${scale === 'Major' ? '' : 'm'}`.trim()} 
                                                                className="w-full h-full"
                                                                />
                                                        </div>
                                                        <div className="flex-1 min-w-0 h-full bg-[var(--bg-soft)]">
                                                            <ChordPalette className="p-2 h-full" />
                                                        </div>
                                                    </div>
                                                )
                                            ),
                                            defaultSize: 15,
                                            collapsible: true,
                                            collapsedSize: 6,
                                            isCollapsed: !visiblePanels.palette,
                                            onCollapseChange: (c) => setVisiblePanels(prev => ({ ...prev, palette: !c })),
                                            minSize: 15,
                                            miniOverlay: <MiniChordPalette />
                                        },
                                        {
                                            id: 'songwriting',
                                            content: <SongwritingBoard />,
                                            defaultSize: 15, // Reduced default size so it doesn't take too much space initially if all open
                                            collapsible: true,
                                            collapsedSize: 6,
                                            isCollapsed: !visiblePanels.songwriting,
                                            onCollapseChange: (c) => setVisiblePanels(prev => ({ ...prev, songwriting: !c })),
                                            minSize: 15,
                                            miniOverlay: <MiniSongwritingBoard />
                                        },
                                        {
                                            id: 'mood',
                                            content: (
                                                <MoodSelector />
                                            ),
                                            defaultSize: 15,
                                            collapsible: true,
                                            collapsedSize: 6,
                                            isCollapsed: !visiblePanels.mood,
                                            onCollapseChange: (c) => setVisiblePanels(prev => ({ ...prev, mood: !c })),
                                            minSize: 15,
                                            // Example Accessory: Quick Settings on the handle
                                            miniOverlay: <MiniMoodSelector />
                                        }
                                    ]}
                                    direction="vertical"
                                />
                            </div>
                    </div>
                </div>
            </div>
    );
}

