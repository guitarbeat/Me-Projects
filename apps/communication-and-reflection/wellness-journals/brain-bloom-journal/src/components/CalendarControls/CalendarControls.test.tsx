import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CalendarControls from './CalendarControls';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('CalendarControls', () => {
    const defaultProps = {
        currentView: 'day' as const,
        onViewChange: jest.fn(),
        showWeekends: true,
        onToggleWeekends: jest.fn(),
        showCurrentTime: true,
        onToggleCurrentTime: jest.fn(),
        timeFormat: '12h' as const,
        onTimeFormatChange: jest.fn(),
        currentDate: new Date(),
        onDateChange: jest.fn(),
        onTodayClick: jest.fn(),
    };

    const renderWithTooltip = (ui: React.ReactNode) => {
        return render(
            <TooltipProvider>
                {ui}
            </TooltipProvider>
        );
    };

    it('renders navigation buttons with correct aria-labels for day view', () => {
        renderWithTooltip(<CalendarControls {...defaultProps} currentView="day" />);
        expect(screen.getByLabelText('Previous day')).toBeInTheDocument();
        expect(screen.getByLabelText('Next day')).toBeInTheDocument();
    });

    it('renders navigation buttons with correct aria-labels for week view', () => {
        renderWithTooltip(<CalendarControls {...defaultProps} currentView="week" />);
        expect(screen.getByLabelText('Previous week')).toBeInTheDocument();
        expect(screen.getByLabelText('Next week')).toBeInTheDocument();
    });

    it('renders navigation buttons with correct aria-labels for month view', () => {
        renderWithTooltip(<CalendarControls {...defaultProps} currentView="month" />);
        expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
        expect(screen.getByLabelText('Next month')).toBeInTheDocument();
    });
});
