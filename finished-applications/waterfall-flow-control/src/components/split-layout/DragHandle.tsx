import { cn } from '@/lib/utils';

interface DragHandleProps {
  drag: boolean;
  active: boolean;
  locked: boolean;
}

export const DragHandle = ({ drag, active, locked }: DragHandleProps) => (
  <div
    className={cn(
      'transition-all duration-150',
      drag ? 'scale-x-110' : 'scale-100',
      locked && 'opacity-40'
    )}
  >
    <div
      className={cn(
        'rounded-full transition-all duration-200',
        drag
          ? 'w-7 h-[3px] bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.3)]'
          : active
            ? 'w-6 h-[3px] bg-foreground/30'
            : 'w-5 h-[2.5px] bg-foreground/20',
        locked && 'bg-amber-500/60'
      )}
    />
  </div>
);
