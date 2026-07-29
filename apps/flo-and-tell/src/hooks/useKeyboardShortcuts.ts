import { useEffect, useCallback, useState } from 'react';
import { hapticLight } from '@/lib/haptics';

interface ShortcutConfig {
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onToday?: () => void;
  onOpenSharing?: () => void;
  onOpenProfile?: () => void;
  enabled?: boolean;
}

/**
 * Hook for keyboard shortcuts (desktop power users)
 * - Arrow keys: month navigation
 * - T: jump to today
 * - S: open sharing
 * - P: open profile
 * - ?: show shortcuts overlay
 */
export const useKeyboardShortcuts = ({
  onPrevMonth,
  onNextMonth,
  onToday,
  onOpenSharing,
  onOpenProfile,
  enabled = true,
}: ShortcutConfig) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) {
        return;
      }

      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ignore if any modifier key is pressed (except for known combinations)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          hapticLight();
          onPrevMonth?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          hapticLight();
          onNextMonth?.();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          hapticLight();
          onToday?.();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          hapticLight();
          onOpenSharing?.();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          hapticLight();
          onOpenProfile?.();
          break;
        case '?':
          e.preventDefault();
          setShowHelp((prev) => !prev);
          break;
        case 'Escape':
          if (showHelp) {
            e.preventDefault();
            setShowHelp(false);
          }
          break;
      }
    },
    [
      enabled,
      onPrevMonth,
      onNextMonth,
      onToday,
      onOpenSharing,
      onOpenProfile,
      showHelp,
    ]
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return {
    showHelp,
    setShowHelp,
  };
};

export const shortcuts = [
  { key: '←', description: 'Previous month' },
  { key: '→', description: 'Next month' },
  { key: 'T', description: 'Jump to today' },
  { key: 'S', description: 'Open sharing' },
  { key: 'P', description: 'Open profile' },
  { key: '?', description: 'Toggle this help' },
  { key: 'Esc', description: 'Close dialogs' },
];
