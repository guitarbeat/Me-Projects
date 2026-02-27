import { useState, useRef, lazy, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import type { EventData } from '@/types/event-data';

const EmotionalCalendar = lazy(() => import('./EmotionalCalendar'));
const SettingsPage = lazy(() => import('../SettingsPage/SettingsPage'));

export interface EmotionalCalendarHandle {
  handleViewChange: (view: 'day' | 'week' | 'month') => void;
  handleTodayClick: () => void;
  handleAddEvent: () => void;
  handleEditMode: () => void;
  handleClearEvents: () => void;
}

interface TopProps {
  events: EventData[];
  handleEventsUpdate: (updatedEvents: EventData[]) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  showWeekends: boolean;
  toggleWeekends: () => void;
  timeFormat24h: boolean;
  toggleTimeFormat: () => void;
  themeName: 'light' | 'dark';
  toggleTheme: () => void;
  defaultEventDuration: number;
  setDefaultEventDuration: (duration: number) => void;
}

const Top: React.FC<TopProps> = ({
  events,
  handleEventsUpdate,
  notificationsEnabled,
  setNotificationsEnabled,
  showWeekends,
  toggleWeekends,
  timeFormat24h,
  toggleTimeFormat,
  themeName,
  toggleTheme,
  defaultEventDuration,
  setDefaultEventDuration
}) => {
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>(() => {
    if (typeof window !== 'undefined') {
      const savedResult = getStorageItem('tampanaCurrentView', { silent: true });
      if (savedResult.success && (savedResult.data === 'day' || savedResult.data === 'week' || savedResult.data === 'month')) {
        return savedResult.data as 'day' | 'week' | 'month';
      }

      const settingsResult = getStorageItem('tampanaSettings', {
        defaultValue: {},
        silent: true
      });
      if (settingsResult.success && (settingsResult.data?.defaultView === 'day' || settingsResult.data?.defaultView === 'week' || settingsResult.data?.defaultView === 'month')) {
        return settingsResult.data.defaultView as 'day' | 'week' | 'month';
      }
    }
    return 'week';
  });
  const [, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const result = getStorageItem('tampanaShowSettings', { silent: true });
      if (result.success && (result.data === 'true' || result.data === 'false')) {
        return result.data === 'true';
      }
    }
    return false;
  });

  const calendarRef = useRef<EmotionalCalendarHandle | null>(null);

  useEffect(() => {
    setStorageItem('tampanaCurrentView', currentView, { silent: true });
  }, [currentView]);

  useEffect(() => {
    setStorageItem('tampanaShowSettings', String(showSettings), { silent: true });
  }, [showSettings]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as any).isContentEditable)) return;
      switch (e.key.toLowerCase()) {
        case '1': setCurrentView('day'); calendarRef.current?.handleViewChange('day'); break;
        case '2': setCurrentView('week'); calendarRef.current?.handleViewChange('week'); break;
        case '3': setCurrentView('month'); calendarRef.current?.handleViewChange('month'); break;
        case 't': {
          const today = new Date();
          setCurrentDate(today);
          calendarRef.current?.handleTodayClick();
          break;
        }
        case 'w': toggleWeekends(); break;
        case 'f': toggleTimeFormat(); break;
        case 's': setShowSettings((prev) => !prev); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleWeekends, toggleTimeFormat]);

  return (
    <>
      {showSettings ? (
        <SettingsPage
          showWeekends={showWeekends}
          toggleWeekends={toggleWeekends}
          timeFormat24h={timeFormat24h}
          toggleTimeFormat={toggleTimeFormat}
          themeName={themeName}
          toggleTheme={toggleTheme}
          eventDuration={defaultEventDuration}
          onChangeEventDuration={setDefaultEventDuration}
          notifications={notificationsEnabled}
          onChangeNotifications={setNotificationsEnabled}
        />
      ) : (
        <EmotionalCalendar
          ref={calendarRef}
          currentView={currentView}
          showWeekends={showWeekends}
          timeFormat={timeFormat24h ? '24h' : '12h'}
          onEventsUpdate={handleEventsUpdate}
          defaultEventDurationMinutes={defaultEventDuration}
        />
      )}
    </>
  );
};

export default Top;
