import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'sepia' | 'system';

interface ThemeContextType {
  theme: Theme;
  themeName: 'light' | 'dark' | 'sepia';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark' | 'sepia';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'sepia'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    const getResolvedTheme = (): 'light' | 'dark' | 'sepia' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme;
    };

    const resolved = getResolvedTheme();
    setResolvedTheme(resolved);

    // Add transition class for smooth theme switching
    root.classList.add('theme-transition');
    root.classList.remove('light', 'dark', 'sepia');
    root.classList.add(resolved);
    
    // Remove transition class after animation completes
    const timeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getResolvedTheme();
        setResolvedTheme(newResolved);
        root.classList.add('theme-transition');
        root.classList.remove('light', 'dark', 'sepia');
        root.classList.add(newResolved);
        setTimeout(() => root.classList.remove('theme-transition'), 300);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timeout);
    };
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'sepia'];
    const currentIndex = themes.indexOf(resolvedTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, themeName: resolvedTheme, setTheme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
