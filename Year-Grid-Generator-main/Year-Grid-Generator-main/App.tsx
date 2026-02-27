import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PreviewArea from './components/PreviewArea';
import YearGrid from './components/YearGrid';
import { AppConfig } from './types';
import { useDebounce } from './hooks';

// Declare html2canvas for TS since it is loaded via CDN
declare const html2canvas: any;

const STORAGE_KEY = 'year-grid-config-v1';

const DEFAULT_CONFIG: AppConfig = {
  date: new Date().toISOString().split('T')[0],
  mode: 'horizontal',
  granularity: 'day',
  itemsPerRow: 12,
  isMondayFirst: false,
  showMonths: true,
  showDays: true,
  showYearLabel: true,
  showActiveLabel: false,
  activeLabelFormat: 'date',
  dotSize: 14,
  gap: 4,
  radius: 2,
  fontSize: 10,
  fontFamily: "'Inter', sans-serif",
  colors: {
    bg: '#0a0a0a',
    text: '#525252',
    empty: '#1f1f1f',
    fill: '#ea580c'
  },
  transparentBg: false
};

// --- URL Helpers ---
const encodeConfig = (config: AppConfig): string => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(config)));
  } catch (e) {
    console.warn('Failed to encode config', e);
    return '';
  }
};

const decodeConfig = (str: string): Partial<AppConfig> | null => {
  try {
    if (!str) return null;
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch (e) {
    console.warn('Failed to decode config from URL', e);
    return null;
  }
};

const App: React.FC = () => {
  // 1. Initialize state from URL > LocalStorage > Default
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const configParam = searchParams.get('config');
      
      if (configParam) {
        const decoded = decodeConfig(configParam);
        if (decoded) {
          return {
            ...DEFAULT_CONFIG,
            ...decoded,
            colors: { ...DEFAULT_CONFIG.colors, ...(decoded.colors || {}) }
          };
        }
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          colors: { ...DEFAULT_CONFIG.colors, ...(parsed.colors || {}) }
        };
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error);
    }
    return DEFAULT_CONFIG;
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Initialize viewMode safely once
  const [viewMode] = useState<'editor' | 'image'>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === 'image' ? 'image' : 'editor';
    } catch {
      return 'editor';
    }
  });

  // Debounce config updates to prevent expensive synchronous I/O on every keystroke/slider move
  // Debounce config updates to prevent excessive URL updates during slider dragging
  const debouncedConfig = useDebounce(config, 500);

  // 2. Sync Config to URL & LocalStorage
  // Debounce updates to prevent excessive history/storage writes during rapid state changes (e.g. sliders)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const encoded = encodeConfig(config);

        if (params.get('config') !== encoded) {
          params.set('config', encoded);
          window.history.replaceState(null, '', `?${params.toString()}`);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.error('Error syncing state:', e);
  const debouncedConfig = useDebounce(config, 500);

  useEffect(() => {
    // Debounce the state synchronization to prevent blocking the main thread
    // with expensive synchronous operations (history.replaceState, localStorage.setItem)
    // during rapid updates (e.g. dragging sliders)
    const handler = setTimeout(() => {
      try {
        const params = new URLSearchParams(window.location.search);
        const encoded = encodeConfig(config);

        if (params.get('config') !== encoded) {
          params.set('config', encoded);
          window.history.replaceState(null, '', `?${params.toString()}`);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (e) {
        console.error('Error syncing state:', e);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [config]);
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = encodeConfig(debouncedConfig);
      
      if (params.get('config') !== encoded) {
        params.set('config', encoded);
        window.history.replaceState(null, '', `?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [config]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(debouncedConfig));
    } catch (e) {
      console.error('Error syncing state:', e);
    }
  }, [debouncedConfig]);

  const handleDownload = async () => {
    if (!gridRef.current || typeof html2canvas === 'undefined') {
      alert('Image generation library not loaded yet. Please wait a moment.');
      return;
    }

    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: config.transparentBg ? null : config.colors.bg,
        scale: 3,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `year-grid-${config.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 3. Render "Image View" (Standalone)
  if (viewMode === 'image') {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center p-8"
        style={{ backgroundColor: config.transparentBg ? 'transparent' : config.colors.bg }}
      >
        <YearGrid config={config} />
      </div>
    );
  }

  // 4. Render Standard Editor
  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#050505] text-white overflow-hidden">
      <Sidebar 
        config={config} 
        setConfig={setConfig} 
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      <PreviewArea config={config} gridRef={gridRef} />
    </div>
  );
};

export default App;