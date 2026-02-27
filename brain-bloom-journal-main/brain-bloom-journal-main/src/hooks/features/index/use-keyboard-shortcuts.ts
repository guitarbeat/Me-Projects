import { useEffect } from 'react';

export type ViewMode = 'compose' | 'archive';

export interface KeyboardShortcutHandlers {
  onCommandK: () => void;
  onViewChange?: (view: ViewMode) => void;
  onThemeToggle?: () => void;
  onNewEntry?: () => void;
  onSearch?: () => void;
}

export const useKeyboardShortcuts = ({
  onCommandK,
  onViewChange,
  onThemeToggle,
  onNewEntry,
  onSearch,
}: KeyboardShortcutHandlers) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      
      // Cmd/Ctrl + K: Open command palette
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onCommandK();
        return;
      }

      // Cmd/Ctrl + 1-2: Switch views
      if (isCmdOrCtrl && onViewChange) {
        const viewMap: Record<string, ViewMode> = {
          '1': 'compose',
          '2': 'archive',
        };
        if (viewMap[e.key]) {
          e.preventDefault();
          onViewChange(viewMap[e.key]);
          return;
        }
      }

      // Cmd/Ctrl + T: Toggle theme
      if (isCmdOrCtrl && e.key.toLowerCase() === 't' && onThemeToggle) {
        e.preventDefault();
        onThemeToggle();
        return;
      }

      // Cmd/Ctrl + N: New entry
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n' && onNewEntry) {
        e.preventDefault();
        onNewEntry();
        return;
      }

      // Cmd/Ctrl + /: Search
      if (isCmdOrCtrl && e.key === '/' && onSearch) {
        e.preventDefault();
        onSearch();
        return;
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCommandK, onViewChange, onThemeToggle, onNewEntry, onSearch]);
};
