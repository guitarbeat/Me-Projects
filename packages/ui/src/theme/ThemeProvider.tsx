import React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  /** Convenience alias for theme === 'dark' */
  isDarkMode: boolean;
  /** Alias for toggleTheme */
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'theme';

function readInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  // Migrate flo-and-tell legacy key
  const legacy = localStorage.getItem('darkMode');
  if (legacy !== null) {
    try {
      return JSON.parse(legacy) ? 'dark' : 'light';
    } catch {
      /* ignore */
    }
  }

  return 'dark';
}

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      toggleTheme,
      isDarkMode: theme === 'dark',
      toggleDarkMode: toggleTheme,
    }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
