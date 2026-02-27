import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmotionalCalendar, { EmotionalCalendarHandle } from '../Calendar/EmotionalCalendar';

// Mock child components
jest.mock('../Calendar/EventModal', () => ({ isOpen, onSave, event, initialTime }) => {
    if (!isOpen) return null;

    const handleSave = () => {
        const saveData = {
            id: event?.id,
            title: 'Test Event',
            start: event?.start || initialTime?.start || new Date(),
            // Intentionally omit 'end' to simulate the bug
        };
        onSave(saveData);
    };

    return (
        <div data-testid="event-modal">
            <button onClick={handleSave}>Save</button>
        </div>
    );
});

// Mock VueCalWrapper to prevent it from breaking the test
jest.mock('../Calendar/VueCalWrapper', () => (props) => <div data-testid="vue-cal-wrapper" {...props} />);
jest.mock('../../services/n8nClient', () => ({
    postEventChange: jest.fn(),
}));

describe('EmotionalCalendar Component', () => {
    it('should set a default end time when creating an event without one', async () => {
        const handleEventsUpdate = jest.fn();
        const defaultEventDurationMinutes = 45;

        const calendarRef = React.createRef<EmotionalCalendarHandle>();

        render(
            <EmotionalCalendar
                ref={calendarRef}
                onEventsUpdate={handleEventsUpdate}
                defaultEventDurationMinutes={defaultEventDurationMinutes}
            />
        );

        // Use the ref to trigger adding an event, which opens the modal
        act(() => {
            calendarRef.current?.handleAddEvent();
        });

        // Wait for the modal to be rendered
        await screen.findByTestId('event-modal');

        // Simulate saving the event from the modal
        fireEvent.click(screen.getByText('Save'));

        // Check if onEventsUpdate was called
        await waitFor(() => {
            expect(handleEventsUpdate).toHaveBeenCalled();
        });

        const lastCallArgs = handleEventsUpdate.mock.calls[handleEventsUpdate.mock.calls.length - 1];
        const updatedEvents = lastCallArgs[0];
        const newEvent = updatedEvents.find(e => e.title === 'Test Event');

        expect(newEvent).toBeDefined();
        expect(newEvent.end).toBeInstanceOf(Date);

        const expectedEndTime = new Date(newEvent.start.getTime() + defaultEventDurationMinutes * 60 * 1000);
        expect(newEvent.end.getTime()).toBe(expectedEndTime.getTime());
    });
});
