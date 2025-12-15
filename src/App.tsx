

import React, { Suspense } from 'react';
import { useStore, useUrlSync } from './lib';
import { ProgressionStrip, cn, ControlPanel, PanelStack, ResizableTopPanel, MoodSelector, SongwritingBoard } from './components';
import { Loader2 } from 'lucide-react';

// Lazy load heavy visualization components
const HarmonicSpace = React.lazy(() => import('./components/tonnetz').then(module => ({ default: module.HarmonicSpace })));

// --- SUB-COMPONENTS ---

const BackgroundLayers = () => (
    <>
        <div className="absolute inset-0 pointer-events-none z-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 50% 0%, var(--bg-surface) 0%, transparent 100%)'
        }}/>
         <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}/>
    </>
);

const Workspace = ({ view }: { view: string }) => (
    <div className="h-full w-full relative">
        <div className={cn("h-full w-full", view === 'sequencer' ? 'block' : 'hidden')}>
            {/* Palette is now in Control Panel, passed false here */}
            <ProgressionStrip showPalette={false} />
        </div>

        <div className={cn("h-full w-full", view === 'songwriting' ? 'block' : 'hidden')}>
            <SongwritingBoard />
        </div>

        <div className={cn("h-full w-full", view === 'harmony' ? 'block' : 'hidden')}>
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="animate-spin" size={16} /></div>}>
                <HarmonicSpace />
            </Suspense>
        </div>
    </div>
);

// --- MAIN APP ---

export default function App() {
    // --- APP STATE (Global Store) ---
    const { view } = useStore();

    // Enable deep linking/URL synchronization
    useUrlSync();

    // ============================================
    // PANEL CONFIGURATION - EASILY CHANGE NUMBER OF PANELS!
    // ============================================
    // 
    // To change the number of panels, simply add or remove objects from this array.
    // 
    // Current setup: 3 panels
    // 
    // Examples:
    // - 2 panels: Remove one of the objects below
    // - 4 panels: Add another object with id, content, defaultSize, etc.
    // - 5+ panels: Keep adding objects!
    // 
    // Each panel needs:
    //   - id: unique string identifier
    //   - content: React component to render
    //   - defaultSize: percentage (0-100) of available space
    //   - minSize: minimum percentage (optional)
    //   - maxSize: maximum percentage (optional)
    //   - collapsible: true/false (optional, allows collapsing)
    //   - collapsedSize: size when collapsed (optional, default 0)
    // ============================================
    
    const panelConfig = [
        {
            id: 'control',
            content: <ControlPanel />,
            defaultSize: 25,  // 25% of available height
            minSize: 15,
            maxSize: 40,
            collapsible: true,  // Can be collapsed by clicking the top handle
            collapsedSize: 0,
        },
        {
            id: 'workspace',
            content: <Workspace view={view} />,
            defaultSize: 55,  // 55% of available height
            minSize: 30,
        },
        {
            id: 'mood',
            content: <MoodSelector />,
            defaultSize: 20,  // 20% of available height
            minSize: 15,
            collapsible: true,  // Can be collapsed by clicking the handle
            collapsedSize: 0,
        },
        // Add more panels here! Example:
        // {
        //     id: 'fourth-panel',
        //     content: <YourComponent />,
        //     defaultSize: 15,
        //     minSize: 10,
        //     collapsible: true,
        // },
    ];

    // Alternative: Use ResizableTopPanel for the top panel (different resize behavior)
    // Uncomment this and comment out the panelConfig above to use the old style
    /*
    return (
        <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans relative selection:bg-[var(--accent)] selection:text-black transition-colors duration-300">
            <BackgroundLayers />
            <ResizableTopPanel minHeight={100} maxHeight={300} defaultHeight={200}>
                <ControlPanel />
            </ResizableTopPanel>
            <div className="flex-1 relative min-h-0 z-10">
                <PanelStack
                    panels={[
                        {
                            id: 'workspace',
                            content: <Workspace view={view} />,
                            defaultSize: 60,
                            minSize: 40,
                        },
                        {
                            id: 'mood',
                            content: <MoodSelector />,
                            defaultSize: 40,
                            minSize: 20,
                            collapsible: true,
                        },
                    ]}
                />
            </div>
        </div>
    );
    */

    return (
        <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans relative selection:bg-[var(--accent)] selection:text-black transition-colors duration-300">
            <BackgroundLayers />

            {/* All panels in one flexible stack */}
            <div className="flex-1 relative min-h-0 z-10">
                <PanelStack panels={panelConfig} />
            </div>
        </div>
    );
}