import React from 'react';
import type { EventData } from '@/types/event-data';

interface BottomProps {
  events: EventData[];
  onEventDelete: (id: string) => void;
  onEventEdit: (event: EventData) => void;
}

const Bottom: React.FC<BottomProps> = ({ events, onEventDelete, onEventEdit }) => {
  return (
    <div className="calendar-bottom">
      <h3>Events</h3>
      <ul>
        {events.map((event) => {
          const eventWithDescription = event as EventData & { description?: string };

          return (
            <li key={event.id}>
              <strong>{event.title}</strong>
              {eventWithDescription.description ? <div>{eventWithDescription.description}</div> : null}
              <button onClick={() => onEventEdit(event)}>Edit</button>
              <button onClick={() => onEventDelete(event.id)}>Delete</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Bottom;
