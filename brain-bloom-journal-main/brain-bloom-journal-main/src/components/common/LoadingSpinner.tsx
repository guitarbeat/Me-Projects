import { memo } from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: { container: 'h-32', dots: 'w-1.5 h-1.5', text: 'text-xs' },
  md: { container: 'h-64', dots: 'w-2 h-2', text: 'text-sm' },
  lg: { container: 'min-h-screen', dots: 'w-2.5 h-2.5', text: 'text-base' },
};

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  message = "Loading...",
  className = "",
  size = 'md',
  fullScreen = false,
}) => {
  const sizes = sizeClasses[size];
  
  return (
    <div className={cn(
      fullScreen ? 'min-h-screen' : sizes.container,
      'bg-newsprint-bg flex flex-col items-center justify-center gap-4 animate-fade-in',
      className
    )}>
      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className={cn(
              sizes.dots,
              'bg-newsprint-foreground sharp-corners animate-pulse'
            )}
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
      <span className={cn(
        sizes.text,
        'text-newsprint-foreground font-newsprint-mono uppercase tracking-widest'
      )}>
        {message}
      </span>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';