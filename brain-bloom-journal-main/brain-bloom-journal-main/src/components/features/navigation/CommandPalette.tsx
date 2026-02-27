import { memo, useCallback } from 'react';
import { 
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, 
  CommandItem, CommandList, CommandSeparator 
} from '@/components/ui';
import { BookOpen, MessageSquare, Sun, Moon, Monitor, Download, RefreshCw, PlusCircle, Zap } from '@/lib/icons/icon-imports';
import { useTheme } from '@/contexts/ThemeContext';
import { toast, usePWAInstall } from '@/hooks';
import type { ViewMode } from '@/hooks/features';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewChange: (view: ViewMode) => void;
  onNewEntry?: () => void;
}

export const CommandPalette = memo<CommandPaletteProps>(({ open, onOpenChange, onViewChange, onNewEntry }) => {
  const { setTheme, theme } = useTheme();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  const handle = useCallback((fn: () => void) => {
    return () => {
      fn();
      onOpenChange(false);
    };
  }, [onOpenChange]);

  const cycleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          {onNewEntry && (
            <CommandItem onSelect={handle(onNewEntry)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Entry
              <kbd className="ml-auto text-xs text-muted-foreground">⌘N</kbd>
            </CommandItem>
          )}
          <CommandItem onSelect={handle(cycleTheme)}>
            <Zap className="mr-2 h-4 w-4" />
            Toggle Theme
            <kbd className="ml-auto text-xs text-muted-foreground">⌘T</kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={handle(() => onViewChange('compose'))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Compose
            <kbd className="ml-auto text-xs text-muted-foreground">⌘1</kbd>
          </CommandItem>
          <CommandItem onSelect={handle(() => onViewChange('archive'))}>
            <BookOpen className="mr-2 h-4 w-4" />
            Archive
            <kbd className="ml-auto text-xs text-muted-foreground">⌘2</kbd>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={handle(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </CommandItem>
          <CommandItem onSelect={handle(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </CommandItem>
          <CommandItem onSelect={handle(() => setTheme('system'))}>
            <Monitor className="mr-2 h-4 w-4" />
            System
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="App">
          {isInstallable && !isInstalled && (
            <CommandItem onSelect={handle(async () => {
              const accepted = await promptInstall();
              if (accepted) {
                toast({ title: 'Installed', description: 'App is now installed.' });
              }
            })}>
              <Download className="mr-2 h-4 w-4" />
              Install App
            </CommandItem>
          )}
          <CommandItem onSelect={handle(() => window.location.reload())}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
});

CommandPalette.displayName = 'CommandPalette';