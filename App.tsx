

import React, { Suspense } from 'react';
import { useStore, useUrlSync } from './lib';
import { ProgressionStrip, cn, ControlPanel, SplitView, ResizableTopPanel, MoodSelector, SongwritingBoard } from './components';
import { Loader2 } from 'lucide-react';

// Lazy load heavy visualization components
const HarmonicSpace = React.lazy(() => import('./tonnetz').then(module => ({ default: module.HarmonicSpace })));

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

    return (
        <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-sans relative selection:bg-[var(--accent)] selection:text-black transition-colors duration-300">
            <BackgroundLayers />

            {/* Top Control Panel */}
            <ResizableTopPanel 
                minHeight={100} 
                maxHeight={300} 
                defaultHeight={200}
            >
                <ControlPanel />
            </ResizableTopPanel>

            {/* Main Workspace */}
            <div className="flex-1 relative min-h-0 z-10">
                <SplitView
                    top={<Workspace view={view} />}
                    bottom={<MoodSelector />}
                />
            </div>
        </div>
    );
}