import { useState } from 'react';
import { AppConfig } from '../../types';
import Sidebar from '../../components/Sidebar';
import PreviewArea from '../../components/PreviewArea';

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
  dotSize: 12,
  gap: 3,
  radius: 2,
  fontFamily: "'Inter', sans-serif",
  fontSize: 10,
  colors: {
    bg: '#0a0a0a',
    text: '#525252',
    empty: '#1f1f1f',
    fill: '#ea580c',
  },
  transparentBg: false,
};

export default function YearGridApp() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      const gridElement = document.querySelector('[data-grid-export]') as HTMLElement;
      
      if (!gridElement) {
        console.error('Grid element not found');
        return;
      }

      const canvas = await html2canvas(gridElement, {
        backgroundColor: config.transparentBg ? null : config.colors.bg,
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `year-grid-${config.date}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      <button
        onClick={handleBack}
        className="absolute top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-[#333] bg-[#111] px-4 py-2 text-sm text-gray-400 transition-colors hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to FlowMail
      </button>
      <Sidebar
        config={config}
        setConfig={setConfig}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      <PreviewArea config={config} />
    </div>
  );
}
