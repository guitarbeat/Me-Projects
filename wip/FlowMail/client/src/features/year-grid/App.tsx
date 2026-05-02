import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { NotebookPen, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppConfig, Activity } from '../../types';
import Sidebar from '../../components/Sidebar';
import PreviewArea from '../../components/PreviewArea';
import { Button } from '@/components/ui/button';

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
  dotShape: 'rounded',
  maxIntensityThreshold: 5,
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
  const [, navigate] = useLocation();
  const [config, setConfig] = useState<AppConfig>(() => {
    // 1. Try to load from localStorage first
    const saved = localStorage.getItem('year-grid-config');
    let baseConfig = DEFAULT_CONFIG;

    if (saved) {
      try {
        baseConfig = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved config', e);
      }
    }

    // 2. Override with URL params if present
    const params = new URLSearchParams(window.location.search);
    const urlConfig: Partial<AppConfig> = {};

    if (params.has('date')) urlConfig.date = params.get('date')!;
    if (params.has('mode')) urlConfig.mode = params.get('mode') as any;
    if (params.has('gran')) urlConfig.granularity = params.get('gran') as any;
    if (params.has('size')) urlConfig.dotSize = parseInt(params.get('size')!, 10);
    if (params.has('gap')) urlConfig.gap = parseInt(params.get('gap')!, 10);
    if (params.has('rad')) urlConfig.radius = parseInt(params.get('rad')!, 10);
    if (params.has('fill')) urlConfig.colors = { ...baseConfig.colors, fill: params.get('fill')! };
    if (params.has('bg')) urlConfig.colors = { ...baseConfig.colors, bg: params.get('bg')! };

    return { ...baseConfig, ...urlConfig };
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch real activities
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  // Group activities by date
  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    activities.forEach((activity) => {
      if (!activity.timestamp) return;
      const dateKey = new Date(activity.timestamp).toISOString().split('T')[0];
      map[dateKey] = (map[dateKey] || 0) + 1;
    });
    return map;
  }, [activities]);

  // Specific activities for selected date
  const selectedActivities = useMemo(() => {
    if (!selectedDate) return [];
    return activities.filter(
      (a) => a.timestamp && new Date(a.timestamp).toISOString().split('T')[0] === selectedDate
    );
  }, [activities, selectedDate]);

  // Unified Analytics
  const stats = useMemo(() => {
    const total = activities.length;
    const values = Object.values(activityMap);
    const peak = values.length > 0 ? Math.max(...values) : 0;
    const peakDate = Object.entries(activityMap).find(([_, v]) => v === peak)?.[0];

    // Active days in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeRecent = Object.keys(activityMap).filter(
      (date) => new Date(date) >= thirtyDaysAgo
    ).length;

    return { total, peak, peakDate, activeRecent };
  }, [activities, activityMap]);

  // Persistence: Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('year-grid-config', JSON.stringify(config));
  }, [config]);

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      setConfig(DEFAULT_CONFIG);
      localStorage.removeItem('year-grid-config');
    }
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
      link.download = `activity-grid-${config.date}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportToJournal = () => {
    if (!selectedDate) return;

    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const activitySummary = selectedActivities
      .map((a) => `- [${a.action.toUpperCase()}] ${a.emailSubject} (from ${a.emailSender})`)
      .join('\n');

    const note = `### Flow Summary for ${formattedDate}\n\nToday I processed ${selectedActivities.length} items:\n\n${activitySummary}\n\n**Reflection:** `;

    navigate(`/journal?date=${selectedDate}&note=${encodeURIComponent(note)}`);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#0a0a0a] text-white overflow-hidden relative rounded-2xl border border-[var(--app-panel-border)] shadow-2xl">
      <Sidebar
        config={config}
        setConfig={setConfig}
        onDownload={handleDownload}
        isDownloading={isDownloading}
        onReset={handleReset}
      />
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Analytics Header */}
        <div className="grid grid-cols-4 gap-4 p-6 bg-white/5 border-b border-white/5 backdrop-blur-md">
          {[
            {
              label: 'Total Flow Actions',
              value: stats.total,
              sub: 'Lifetime logs',
              color: 'text-orange-500',
            },
            {
              label: 'Consistent Days',
              value: stats.activeRecent,
              sub: 'Last 30 days',
              color: 'text-emerald-500',
            },
            {
              label: 'Peak Momentum',
              value: stats.peak,
              sub: stats.peakDate ? new Date(stats.peakDate).toLocaleDateString() : '--',
              color: 'text-blue-500',
            },
            {
              label: 'Productivity Index',
              value: `${Math.round((stats.activeRecent / 30) * 100)}%`,
              sub: 'Consistency rate',
              color: 'text-violet-500',
            },
          ].map((s, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                {s.label}
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
                <span className="text-[10px] text-gray-600 font-medium truncate italic">
                  {s.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 relative overflow-hidden">
          <PreviewArea
            config={config}
            activityMap={activityMap}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            gridRef={gridRef}
          />

          {/* Day Details Panel */}
          <AnimatePresence>
            {selectedDate && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-4 right-4 bottom-4 w-72 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <div>
                    <h3 className="text-sm font-bold text-white">Day Summary</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      Flow Actions
                    </p>
                    <div className="text-2xl font-bold text-orange-500">
                      {activityMap[selectedDate] || 0} items
                    </div>
                  </div>

                  {selectedActivities.length > 0 && (
                    <div className="space-y-2">
                      {selectedActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="p-2 rounded bg-white/5 border border-white/5 text-[11px] leading-tight transition-colors hover:bg-white/10"
                        >
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="text-orange-400 font-bold uppercase tracking-tighter">
                              {activity.action}
                            </span>
                            <span className="text-gray-600 font-mono">
                              {activity.timestamp
                                ? new Date(activity.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                          <div className="text-gray-300 font-medium truncate">
                            {activity.emailSubject}
                          </div>
                          <div className="text-gray-500 truncate text-[10px]">
                            {activity.emailSender}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedActivities.length === 0 && (
                    <div className="py-8 text-center text-gray-600 italic text-xs">
                      No inbox actions recorded for this day.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-white/5 border-t border-white/10 space-y-2">
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
                    onClick={handleExportToJournal}
                  >
                    <NotebookPen className="w-4 h-4" />
                    Reflect on this Day
                  </Button>
                  <p className="text-[9px] text-gray-500 text-center leading-tight">
                    This will pre-fill a new Journal entry with your processed items for reflection.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
