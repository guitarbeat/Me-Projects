import React, { useState } from 'react';
import Top from './Top';
import Bottom from './Bottom';
import type { EventData } from '@/types/event-data';

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showWeekends, setShowWeekends] = useState(true);
  const [timeFormat24h, setTimeFormat24h] = useState(false);
  const [themeName, setThemeName] = useState<'light' | 'dark'>('light');
  const [defaultEventDuration, setDefaultEventDuration] = useState<number>(30);

  const handleEventsUpdate = (updatedEvents: EventData[]) => setEvents(updatedEvents);
  const toggleWeekends = () => setShowWeekends((prev) => !prev);
  const toggleTimeFormat = () => setTimeFormat24h((prev) => !prev);
  const toggleTheme = () => setThemeName((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <div className="calendar-root">
      <Top
        events={events}
        handleEventsUpdate={handleEventsUpdate}
        notificationsEnabled={notificationsEnabled}
        setNotificationsEnabled={setNotificationsEnabled}
        showWeekends={showWeekends}
        toggleWeekends={toggleWeekends}
        timeFormat24h={timeFormat24h}
        toggleTimeFormat={toggleTimeFormat}
        themeName={themeName}
        toggleTheme={toggleTheme}
        defaultEventDuration={defaultEventDuration}
        setDefaultEventDuration={setDefaultEventDuration}
      />
      <Bottom
        events={events}
        onEventDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
        onEventEdit={(event) => setEvents((prev) => prev.map((e) => (e.id === event.id ? event : e)))}
      />
    </div>
  );
};

export default Calendar;
