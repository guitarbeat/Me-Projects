import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import type { EventData } from '@/types/event-data';
import EventModal from './EventModal';

export interface EmotionalCalendarHandle {
  handleViewChange: (view: 'day' | 'week' | 'month') => void;
  handleTodayClick: () => void;
  handleAddEvent: () => void;
  handleEditMode: () => void;
  handleClearEvents: () => void;
}

interface EmotionalCalendarProps {
  currentView: 'day' | 'week' | 'month';
  showWeekends: boolean;
  timeFormat: '12h' | '24h';
  onEventsUpdate: (events: EventData[]) => void;
  defaultEventDurationMinutes: number;
}

const EmotionalCalendar = forwardRef<EmotionalCalendarHandle, EmotionalCalendarProps>(({ currentView, showWeekends, timeFormat, onEventsUpdate, defaultEventDurationMinutes }, ref) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [initialTime, setInitialTime] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    onEventsUpdate(events);
  }, [events, onEventsUpdate]);

  const buildEventTimes = (start: Date, end?: Date) => {
    const safeEnd = end ?? new Date(start.getTime() + defaultEventDurationMinutes * 60 * 1000);
    return { start, end: safeEnd };
  };

  const handleSaveEvent = (partialEvent: Partial<EventData>) => {
    const fallbackStart = initialTime?.start ?? new Date();
    const { start, end } = buildEventTimes(partialEvent.start ?? fallbackStart, partialEvent.end);
    const event: EventData = {
      id: partialEvent.id ?? `${Date.now()}`,
      title: partialEvent.title ?? 'New event',
      start,
      end,
      emotion: partialEvent.emotion ?? 'neutral',
      emoji: partialEvent.emoji ?? '🙂',
      class: partialEvent.class,
      background: partialEvent.background,
      split: partialEvent.split,
      allDay: partialEvent.allDay,
    };

    setEvents((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === event.id);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = event;
        return next;
      }
      return [...prev, event];
    });
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  useImperativeHandle(ref, () => ({
    handleViewChange: (view) => console.log('change view', view),
    handleTodayClick: () => console.log('today clicked'),
    handleAddEvent: () => {
      const start = new Date();
      const { end } = buildEventTimes(start);
      setInitialTime({ start, end });
      setEditingEvent(null);
      setIsModalOpen(true);
    },
    handleEditMode: () => console.log('edit mode'),
    handleClearEvents: () => setEvents([])
  }));

  return (
    <div className="emotional-calendar">
      <p>View: {currentView}</p>
      <p>Weekends: {String(showWeekends)}</p>
      <p>Time format: {timeFormat}</p>
      <p>Default event duration: {defaultEventDurationMinutes} minutes</p>
      <ul>
        {events.map((ev) => (
          <li key={ev.id}>{ev.title}</li>
        ))}
      </ul>
      <EventModal
        isOpen={isModalOpen}
        event={editingEvent}
        initialTime={initialTime ?? undefined}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />
    </div>
  );
});

export default EmotionalCalendar;
