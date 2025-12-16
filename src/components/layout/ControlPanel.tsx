

import React, { useState, useRef } from 'react';
import { cn, IconButton } from '../ui';
// Re-export panel components
import { useStore } from '../../lib';
import { 
    Play, Pause,
    ListMusic, Network, Keyboard, Zap,
    PanelLeftClose, PanelLeftOpen,
    PenTool, LucideIcon, Save, Settings
} from 'lucide-react';
import { SplitView } from './split-view';
import { SongwritingBoard, MiniSongwritingBoard } from '../tools/SongwritingBoard';
import { ProjectLibrary } from '../tools/ProjectLibrary';
import { HarmonicSpace, MiniHarmonicMap } from '../tools/HarmonicMap';
import { ProgressionStrip, ChordPalette, MiniSequencer, MiniChordPalette } from '../tools/Sequencer';
import { CircleOfFifths } from '../tools/CircleOfFifths';
import { MoodSelector, MiniMoodSelector } from '../tools/MoodSelector';
import { GlobalSettings, MiniGlobalSettings } from '../tools/GlobalSettings';


const FloatingToggle = ({ isVisible, onClick }: { isVisible: boolean, onClick: () => void }) => {
    // Start at bottom-left with some padding
    const [pos, setPos] = useState({ x: 20, y: 20 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        isDragging.current = false;
        dragStart.current = { x: e.clientX, y: e.clientY };
        (e.target as Element).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (e.buttons !== 1) return; // Only process if primary button is held
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            isDragging.current = true;
            // Update position (inverted Y since we use bottom, but let's use standard Top/Left for drag to be easier?
            // Actually user asked for "placed in the corner", usually bottom-left. 
            // Let's use fixed Top/Left to avoid coordinate confusion or use transform.
            // Let's stick to bottom/left relative updates if we track delta.
            setPos(p => ({ x: p.x + dx, y: p.y - dy })); // -dy because y goes UP for 'bottom' style
            dragStart.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        (e.target as Element).releasePointerCapture(e.pointerId);
        if (!isDragging.current) {
            onClick();
        }
        isDragging.current = false;
    };

    return (
        <div 
            className={cn(
                "fixed z-[100] transition-opacity duration-300 touch-none",
                isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            style={{ left: pos.x, bottom: pos.y }}
        >
            <button
                ref={buttonRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="bg-black text-white hover:bg-neutral-900 border border-neutral-800 rounded-full w-10 h-10 shadow-2xl flex items-center justify-center p-0 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform"
                title="Show Sidebar (Drag to move)"
            >
                <PanelLeftOpen size={18} />
            </button>
        </div>
    );
};

export default function ControlPanel() {
    const { 
        key: currentKey, 
        scale, 
        isPlaying, 
        togglePlay,
    } = useStore();

    // Flexible Panel State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [visiblePanels, setVisiblePanels] = useState({
        map: true,
        sequencer: true,
        palette: true,
        mood: true,
        songwriting: true,
        settings: true,
        library: true
    });



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
        { id: 'palette', icon: Keyboard, label: 'Chord Palette' },
        { id: 'mood', icon: Zap, label: 'Mood Selector' },
        { id: 'songwriting', icon: PenTool, label: 'Songwriting Board' },
        { id: 'settings', icon: Settings, label: 'Global Settings' },
        { id: 'library', icon: Save, label: 'Project Library' }
    ];

    const activePanels = [
        {
            id: 'map',
            content: (
                <HarmonicSpace />
            ),
            defaultSize: 40,
            collapsible: true, // Allow collapsing
            collapsedSize: 6, // Mini state size (~50px)
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
            minSize: 15,
            miniOverlay: <MiniSequencer />
        },
        {
            id: 'palette',
            content: (
                <div className="h-full w-full flex flex-row">
                    {/* Side-by-side Layout */}
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
            ),
            defaultSize: 15,
            collapsible: true,
            collapsedSize: 6,
            minSize: 15,
            miniOverlay: <MiniChordPalette />
        },
        {
            id: 'songwriting',
            content: <SongwritingBoard />,
            defaultSize: 15, // Reduced default size so it doesn't take too much space initially if all open
            collapsible: true,
            collapsedSize: 6,
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
            minSize: 15,
            // Example Accessory: Quick Settings on the handle
            miniOverlay: <MiniMoodSelector />
        },
        {
            id: 'settings',
            label: 'Global Settings',
            content: <GlobalSettings />,
            defaultSize: 15,
            minSize: 12,
            miniOverlay: <MiniGlobalSettings />
        },
        {
            id: 'library',
            label: 'Project Library',
            content: <ProjectLibrary />,
            defaultSize: 25,
            minSize: 20,
            miniOverlay: <div className="flex items-center justify-center w-full h-full"><Save size={14} className="text-[var(--accent)]" /></div>
        }
    ].filter(p => visiblePanels[p.id as keyof typeof visiblePanels]);

    return (
        <div className="h-full flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans transition-colors duration-500">

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

                    {/* Bottom Controls - Collapse Sidebar Button */}
                        <IconButton 
                        onClick={() => setIsSidebarCollapsed(true)}
                        variant="ghost"
                        icon={PanelLeftClose}
                        className="opacity-50 hover:opacity-100"
                        title="Collapse Sidebar"
                    />

                </div>

                {/* EXPAND SIDEBAR TRIGGER (Visible when collapsed) */}
                {/* Draggable Implementation */}
                <FloatingToggle 
                    isVisible={isSidebarCollapsed} 
                    onClick={() => setIsSidebarCollapsed(false)} 
                />

                <div className={cn(
                    "flex-1 flex flex-col min-w-0 bg-transparent p-2 gap-2 overflow-hidden",
                )}>
                    <div className="h-full w-full bg-black p-0">
                        <SplitView 
                            panels={activePanels}
                            direction="vertical"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

