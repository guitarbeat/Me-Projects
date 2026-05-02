import React, { useState, useRef, useEffect } from 'react';
import { AppConfig } from '../types';
import YearGrid from './YearGrid';

interface PreviewAreaProps {
  config: AppConfig;
  gridRef: React.RefObject<HTMLDivElement>;
}

const PreviewArea: React.FC<PreviewAreaProps> = ({ config, gridRef }) => {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsPanning(true);
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startPos.current.x,
      y: e.clientY - startPos.current.y,
    });
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => setIsPanning(false);

  // Zoom controls
  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.05, Math.min(3.0, prev + delta)));
  };

  const fitToScreen = () => {
    if (!mainRef.current || !gridRef.current) return;

    const container = mainRef.current;
    const content = gridRef.current;

    // Get dimensions
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    // offsetWidth includes borders and padding of the YearGrid
    const contentW = content.offsetWidth;
    const contentH = content.offsetHeight;

    if (contentW === 0 || contentH === 0) return;

    // Add padding (40px total = 20px per side)
    const padding = 40;
    const availableW = Math.max(0, containerW - padding);
    const availableH = Math.max(0, containerH - padding);

    const scaleX = availableW / contentW;
    const scaleY = availableH / contentH;

    // Fit completely within view
    const newZoom = Math.min(scaleX, scaleY);

    // Clamp zoom to reasonable limits (allow smaller zoom for large grids)
    const clampedZoom = Math.min(Math.max(newZoom, 0.05), 3.0);

    setZoom(clampedZoom);
    setPosition({ x: 0, y: 0 });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Allow shortcuts even if certain non-text inputs are focused (e.g. checkbox, range)
      const isTextInput =
        target.tagName === 'INPUT' &&
        [
          'text',
          'password',
          'number',
          'email',
          'tel',
          'url',
          'search',
          'date',
          'datetime-local',
          'color',
        ].includes((target as HTMLInputElement).type);

      if (target.tagName === 'TEXTAREA' || target.isContentEditable || isTextInput) return;

      // Check both key and code to support Numpad and various layouts
      if (['=', '+'].includes(e.key) || e.code === 'NumpadAdd') {
        handleZoom(0.1);
      } else if (['-', '_'].includes(e.key) || e.code === 'NumpadSubtract') {
        handleZoom(-0.1);
      } else if (e.key === '0' || e.code === 'Numpad0') {
        fitToScreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoom, fitToScreen]);

  return (
    <main
      ref={mainRef}
      className="flex-1 bg-[#050505] relative flex items-center justify-center overflow-hidden h-full w-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      {/* Zoom Controls */}
      <div
        className="absolute bottom-6 right-6 flex gap-2 z-10 select-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleZoom(-0.1)}
          aria-label="Zoom Out"
          title="Zoom Out (Minus)"
          aria-keyshortcuts="-"
          className="w-8 h-8 bg-[#222] rounded hover:bg-[#333] text-white flex items-center justify-center border border-[#333] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">remove</span>
        </button>
        <button
          onClick={fitToScreen}
          aria-label="Fit to Screen"
          title="Fit to Screen (0)"
          aria-keyshortcuts="0"
          className="px-3 h-8 bg-[#222] rounded hover:bg-[#333] text-white text-xs font-mono border border-[#333] active:scale-95 transition-transform"
          className="px-3 h-8 bg-[#222] rounded hover:bg-[#333] text-white text-xs font-mono border border-[#333] active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          className="px-3 h-8 bg-[#222] rounded hover:bg-[#333] text-white text-xs font-mono border border-[#333] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none active:scale-95 transition-transform"
        >
          FIT
        </button>
        <button
          onClick={() => handleZoom(0.1)}
          aria-label="Zoom In"
          title="Zoom In (Plus)"
          aria-keyshortcuts="+"
          className="w-8 h-8 bg-[#222] rounded hover:bg-[#333] text-white flex items-center justify-center border border-[#333] active:scale-95 transition-transform"
          className="w-8 h-8 bg-[#222] rounded hover:bg-[#333] text-white flex items-center justify-center border border-[#333] active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none"
          className="w-8 h-8 bg-[#222] rounded hover:bg-[#333] text-white flex items-center justify-center border border-[#333] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-none active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </div>

      {/* Render Content */}
      <div
        ref={containerRef}
        className={`origin-center ${isPanning ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
        }}
      >
        <YearGrid config={config} domRef={gridRef} />
      </div>
    </main>
  );
};

export default PreviewArea;
