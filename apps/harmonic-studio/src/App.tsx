
import React from 'react';
import { useUrlSync } from './lib';
import { ControlPanel } from './components';

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

// --- MAIN APP ---

export default function App() {
    // Enable deep linking/URL synchronization
    useUrlSync();

    return (
        <div className="h-screen w-screen bg-black overflow-hidden relative selection:bg-yellow-500/30">
            {/* Background */}
            <BackgroundLayers />

            {/* Main Application Layout */}
            {/* ControlPanel manages the internal PanelStack and View switching */}
            <div className="relative z-10 w-full h-full">
                <ControlPanel />
            </div>
        </div>
    );
}