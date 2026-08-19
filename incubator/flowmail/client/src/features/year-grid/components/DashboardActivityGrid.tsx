import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, AppConfig } from '../../../types';
import YearGrid from '../../../components/YearGrid';

const DASHBOARD_GRID_CONFIG: AppConfig = {
  date: new Date().toISOString().split('T')[0],
  mode: 'horizontal',
  granularity: 'day',
  itemsPerRow: 12, // This is ignored for Day granularity in the current YearGrid logic
  isMondayFirst: true,
  showMonths: true,
  showDays: true,
  showYearLabel: false,
  showActiveLabel: false,
  activeLabelFormat: 'date',
  dotSize: 10,
  gap: 2,
  radius: 2,
  fontFamily: "'Inter', sans-serif",
  fontSize: 8,
  colors: {
    bg: 'transparent',
    text: '#525252',
    empty: 'rgba(255,255,255,0.05)',
    fill: '#ea580c',
  },
  transparentBg: true,
};

export const DashboardActivityGrid: React.FC = () => {
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });

  const activityMap = useMemo(() => {
    // Optimization: Use string prefix matching instead of parsing Dates to avoid allocation overhead in loops.
    const map: Record<string, number> = {};
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      if (!activity.timestamp) continue;

      // API returns ISO timestamps. Fast path extraction if it's a string, fallback to Date parsing.
      const dateKey =
        typeof activity.timestamp === 'string'
          ? activity.timestamp.substring(0, 10)
          : new Date(activity.timestamp).toISOString().substring(0, 10);

      map[dateKey] = (map[dateKey] || 0) + 1;
    }
    return map;
  }, [activities]);

  return (
    <div className="w-full overflow-hidden flex justify-center py-2">
      <div className="scale-[0.85] origin-top">
        <YearGrid
          config={DASHBOARD_GRID_CONFIG}
          activityMap={activityMap}
          className="!p-0 !shadow-none"
        />
      </div>
    </div>
  );
};
