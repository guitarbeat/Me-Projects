import { useState, useRef, lazy, useEffect, Suspense } from 'react';
import styled from 'styled-components';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { EventData } from '@/types/event-data';
import { useErrorNotifications } from '@/hooks/useErrorNotifications';
import ErrorNotificationSystem from './components/ErrorNotificationSystem';
import ErrorBoundary from './ErrorBoundary';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { getStorageItem, setStorageItem } from '@/utils/storage';
import { Analytics } from '@vercel/analytics/react';
import './index.css';
import './styles/emotional-calendar.css';
import './styles/typography.css';

// Lazy load components
const Calendar = lazy(() => import('./components/Calendar/Calendar'));
const DataExport = lazy(() => import('./components/DataExport/DataExport'));

// Types for refs exposed by children
export interface DataExportHandle {
  handleExport: () => void;
  handleExportJSON: () => void;
  handleExportCSV: () => void;
  handleExportSummary: () => void;
}

const GlobalStyle = styled.div`
  html, body, #root {
    height: 100%;
    margin: 0;
    overflow: visible;
  }

  body {
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    background-color: #000;
    color: #fff;
  }
`;

const AppContainer = styled.div<{ $isDark: boolean }>`
  position: fixed;
  inset: 0;
  overflow: visible;
  background: ${props => props.$isDark ? '#1a1a1a' : '#f0f2f5'};
  width: 100vw;
  height: 100vh;
  color: ${props => props.$isDark ? '#e0e0e0' : '#333333'};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`;

function ThemedApp() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { notifications, dismissNotification } = useErrorNotifications();
  const [events, setEvents] = useState<EventData[]>([]);
  const [showWeekends, setShowWeekends] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const result = getStorageItem('tampanaShowWeekends', { silent: true });
      if (result.success && (result.data === 'true' || result.data === 'false')) {
        return result.data === 'true';
      }
    }
    return true;
  });
  const [timeFormat24h, setTimeFormat24h] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const result = getStorageItem('tampanaTimeFormat24h', { silent: true });
      if (result.success && (result.data === 'true' || result.data === 'false')) {
        return result.data === 'true';
      }
    }
    return false;
  });
  const [defaultEventDuration, setDefaultEventDuration] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const result = getStorageItem('tampanaSettings', {
        defaultValue: {},
        silent: true
      });
      if (result.success && typeof result.data?.eventDuration === 'number') {
        return result.data.eventDuration;
      }
    }
    return 60;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const result = getStorageItem('tampanaSettings', {
        defaultValue: {},
        silent: true
      });
      if (result.success && typeof result.data?.notifications === 'boolean') {
        return result.data.notifications;
      }
    }
    return true;
  });

  const dataExportRef = useRef<DataExportHandle | null>(null);

  useEffect(() => {
    setStorageItem('tampanaShowWeekends', String(showWeekends), { silent: true });
  }, [showWeekends]);

  useEffect(() => {
    setStorageItem('tampanaTimeFormat24h', String(timeFormat24h), { silent: true });
  }, [timeFormat24h]);

  useEffect(() => {
    const prevResult = getStorageItem('tampanaSettings', {
      defaultValue: {},
      silent: true
    });
    const prev = prevResult.success ? prevResult.data || {} : {};
    const next = { ...prev, eventDuration: defaultEventDuration };
    setStorageItem('tampanaSettings', next, { silent: true });
  }, [defaultEventDuration]);

  useEffect(() => {
    const prevResult = getStorageItem('tampanaSettings', {
      defaultValue: {},
      silent: true
    });
    const prev = prevResult.success ? prevResult.data || {} : {};
    const next = { ...prev, notifications: notificationsEnabled };
    setStorageItem('tampanaSettings', next, { silent: true });
  }, [notificationsEnabled]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      switch (e.key.toLowerCase()) {
        case 'e': dataExportRef.current?.handleExport(); break;
        default: break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleEventsUpdate = (updatedEvents: EventData[]) => {
    setEvents(updatedEvents);
  };

  const toggleWeekends = () => {
    setShowWeekends(!showWeekends);
  };

  const toggleTimeFormat = () => {
    setTimeFormat24h(!timeFormat24h);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <AppContainer $isDark={isDark}>
      <GlobalStyle />
      <Suspense fallback={<PlaceholderContent><p>Loading...</p></PlaceholderContent>}>
        <Calendar />
      </Suspense>
      <Suspense fallback={null}>
        <DataExport ref={dataExportRef} events={events} enableToasts={notificationsEnabled} />
      </Suspense>
      <ErrorNotificationSystem
        notifications={notifications}
        onDismiss={dismissNotification}
      />
      <PerformanceMonitor />
    </AppContainer>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ThemedApp />
        <Analytics />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
