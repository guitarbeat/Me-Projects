import React from 'react';

interface Props {
  showWeekends: boolean;
  toggleWeekends: () => void;
  timeFormat24h: boolean;
  toggleTimeFormat: () => void;
  themeName: 'light' | 'dark';
  toggleTheme: () => void;
  eventDuration: number;
  onChangeEventDuration: (minutes: number) => void;
  notifications: boolean;
  onChangeNotifications: (v: boolean) => void;
}

const SettingsPage: React.FC<Props> = ({
  showWeekends,
  toggleWeekends,
  timeFormat24h,
  toggleTimeFormat,
  themeName,
  toggleTheme,
  eventDuration,
  onChangeEventDuration,
  notifications,
  onChangeNotifications
}) => {
  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <label>
        <input type="checkbox" checked={showWeekends} onChange={toggleWeekends} /> Show weekends
      </label>
      <label>
        <input type="checkbox" checked={timeFormat24h} onChange={toggleTimeFormat} /> Use 24-hour time
      </label>
      <label>
        Theme: <strong>{themeName}</strong>
        <button onClick={toggleTheme} style={{ marginLeft: 8 }}>Toggle theme</button>
      </label>
      <label>
        Default event duration (minutes):
        <input type="number" value={eventDuration} onChange={(e) => onChangeEventDuration(Number(e.target.value) || 0)} />
      </label>
      <label>
        <input type="checkbox" checked={notifications} onChange={(e) => onChangeNotifications(e.target.checked)} /> Enable notifications
      </label>
    </div>
  );
};

export default SettingsPage;
