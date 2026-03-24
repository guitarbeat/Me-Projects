import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #2a2a2a;
  border-bottom: 1px solid #333;
  gap: 16px;
`;

const ViewSwitcher = styled.div`
  display: flex;
  background: #1a1a1a;
  border-radius: 8px;
  padding: 4px;
  gap: 2px;
`;

const ViewButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? '#4ECDC4' : 'transparent'};
  color: ${props => props.$active ? '#000' : '#fff'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;

  &:hover {
    background: ${props => props.$active ? '#45B7B8' : '#333'};
  }
`;

const SettingsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #ccc;

  input {
    appearance: none;
    width: 40px;
    height: 20px;
    background: #333;
    border-radius: 10px;
    position: relative;
    cursor: pointer;
    transition: background 0.2s ease;

    &:checked {
      background: #4ECDC4;
    }

    &::before {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: white;
      top: 2px;
      left: 2px;
      transition: transform 0.2s ease;
    }

    &:checked::before {
      transform: translateX(20px);
    }
  }
`;

const TimeFormatSelector = styled.select`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4ECDC4;
  }

  option {
    background: #1a1a1a;
    color: #fff;
  }
`;

const NavigationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #333;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #444;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TodayButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #4ECDC4;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #45B7B8;
  }
`;

const DateDisplay = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  min-width: 200px;
  text-align: center;
`;

interface CalendarControlsProps {
  currentView: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  showWeekends: boolean;
  onToggleWeekends: (show: boolean) => void;
  showCurrentTime: boolean;
  onToggleCurrentTime: (show: boolean) => void;
  timeFormat: '12h' | '24h';
  onTimeFormatChange: (format: '12h' | '24h') => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTodayClick: () => void;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentView,
  onViewChange,
  showWeekends,
  onToggleWeekends,
  showCurrentTime,
  onToggleCurrentTime,
  timeFormat,
  onTimeFormatChange,
  currentDate,
  onDateChange,
  onTodayClick
}) => {
  const formatDateDisplay = (date: Date, view: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };

    if (view === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    } else if (view === 'week') {
      // Show week range
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }

    return date.toLocaleDateString('en-US', options);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    onDateChange(newDate);
  };

  const getNavigationLabel = (direction: 'prev' | 'next') => {
    const action = direction === 'prev' ? 'Previous' : 'Next';
    // Ensure view is lowercase for the label
    const view = currentView.toLowerCase();
    return `${action} ${view}`;
  };

  const prevLabel = getNavigationLabel('prev');
  const nextLabel = getNavigationLabel('next');

  return (
    <ControlsContainer>
      <NavigationControls>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavButton onClick={() => navigateDate('prev')} aria-label={prevLabel}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </NavButton>
          </TooltipTrigger>
          <TooltipContent>
            <p>{prevLabel}</p>
          </TooltipContent>
        </Tooltip>
        
        <DateDisplay>
          {formatDateDisplay(currentDate, currentView)}
        </DateDisplay>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <NavButton onClick={() => navigateDate('next')} aria-label={nextLabel}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </NavButton>
          </TooltipTrigger>
          <TooltipContent>
            <p>{nextLabel}</p>
          </TooltipContent>
        </Tooltip>
        
        <TodayButton onClick={onTodayClick}>
          Today
        </TodayButton>
      </NavigationControls>

      <ViewSwitcher>
        <ViewButton 
          $active={currentView === 'day'}
          onClick={() => onViewChange('day')}
        >
          Day
        </ViewButton>
        <ViewButton 
          $active={currentView === 'week'}
          onClick={() => onViewChange('week')}
        >
          Week
        </ViewButton>
        <ViewButton 
          $active={currentView === 'month'}
          onClick={() => onViewChange('month')}
        >
          Month
        </ViewButton>
      </ViewSwitcher>

      <SettingsGroup>
        <ToggleSwitch>
          <input
            type="checkbox"
            checked={showWeekends}
            onChange={(e) => onToggleWeekends(e.target.checked)}
          />
          Weekends
        </ToggleSwitch>

        <ToggleSwitch>
          <input
            type="checkbox"
            checked={showCurrentTime}
            onChange={(e) => onToggleCurrentTime(e.target.checked)}
          />
          Current Time
        </ToggleSwitch>

        <TimeFormatSelector
          value={timeFormat}
          onChange={(e) => onTimeFormatChange(e.target.value as '12h' | '24h')}
        >
          <option value="12h">12 Hour</option>
          <option value="24h">24 Hour</option>
        </TimeFormatSelector>
      </SettingsGroup>
    </ControlsContainer>
  );
};

export default CalendarControls;
