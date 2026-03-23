import { Moon, Sun, Monitor } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

const getTimeBasedTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  // Dark from 7pm to 6am
  return hour >= 19 || hour < 6 ? 'dark' : 'light';
};

export const DarkModeToggle = () => {
  const [mode, setMode] = useState<ThemeMode>('auto');

  const applyVisualTheme = useCallback((theme: 'light' | 'dark') => {
    const html = document.documentElement;
    html.classList.remove('light', 'dim', 'dark');
    html.classList.add(theme);
  }, []);

  const handleModeChange = (newMode: ThemeMode) => {
    if (!newMode) return;
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);

    if (newMode === 'auto') {
      applyVisualTheme(getTimeBasedTheme());
    } else {
      applyVisualTheme(newMode);
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    const initialMode =
      savedMode && ['light', 'dark', 'auto'].includes(savedMode)
        ? savedMode
        : 'auto';

    setMode(initialMode);
    if (initialMode === 'auto') {
      applyVisualTheme(getTimeBasedTheme());
    } else {
      applyVisualTheme(initialMode);
    }
  }, [applyVisualTheme]);

  // Update theme every minute when in auto mode
  useEffect(() => {
    if (mode !== 'auto') return;

    const interval = setInterval(() => {
      applyVisualTheme(getTimeBasedTheme());
    }, 60000);

    return () => clearInterval(interval);
  }, [mode, applyVisualTheme]);

  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(v: string) => handleModeChange(v as ThemeMode)}
      className="bg-muted/50 rounded-lg p-1"
    >
      <ToggleGroupItem
        value="light"
        aria-label="Light mode"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-2"
      >
        <Sun className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="auto"
        aria-label="Auto mode (time-based)"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-2"
      >
        <Monitor className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="dark"
        aria-label="Dark mode"
        className="data-[state=on]:bg-background data-[state=on]:shadow-sm px-2"
      >
        <Moon className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
