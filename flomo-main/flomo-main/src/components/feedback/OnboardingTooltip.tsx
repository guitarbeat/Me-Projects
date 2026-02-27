import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingTooltipProps {
  message: string;
  show: boolean;
  onDismiss?: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const OnboardingTooltip = ({
  message,
  show,
  onDismiss,
  position = 'bottom',
  className,
}: OnboardingTooltipProps) => {
  if (!show) {
    return null;
  }

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-primary/90',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-primary/90',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-primary/90',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-primary/90',
  };

  return (
    <div
      className={cn(
        'absolute z-50 animate-fade-in',
        positionClasses[position],
        className
      )}
    >
      <div className="relative bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg shadow-lg text-sm font-quicksand whitespace-nowrap flex items-center gap-2">
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-0.5 hover:bg-primary-foreground/20 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Arrow */}
        <div
          className={cn(
            'absolute w-0 h-0 border-[6px]',
            arrowClasses[position]
          )}
        />
      </div>
    </div>
  );
};

// Pulsing indicator to draw attention
export const OnboardingPulse = ({ show }: { show: boolean }) => {
  if (!show) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
    </span>
  );
};
