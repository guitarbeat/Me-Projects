import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';
import { shortcuts } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsHelp = ({
  open,
  onOpenChange,
}: KeyboardShortcutsHelpProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border border-border">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Press{' '}
          <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">
            ?
          </kbd>{' '}
          to toggle this help
        </p>
      </DialogContent>
    </Dialog>
  );
};
