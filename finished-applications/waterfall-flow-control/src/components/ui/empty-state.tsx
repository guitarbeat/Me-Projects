import * as React from 'react';
import {
  AlertCircle,
  FileX,
  Inbox,
  Search,
  TrendingUp,
  LucideIcon,
  Sparkles,
  Star,
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Surface } from '@/components/ui/surface';
import { Heading, Body } from '@/components/ui/text';
import { TypewriterText } from '@/components/ui/typewriter-text';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const emptyStateVariants = cva('text-center', {
  variants: {
    size: {
      sm: 'py-8 px-4',
      default: 'py-12 px-6',
      lg: 'py-16 px-8',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const iconContainerVariants = cva(
  'rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-105 relative',
  {
    variants: {
      variant: {
        default: 'from-muted/50 to-muted/20',
        error: 'from-destructive/20 to-destructive/5',
        success: 'from-success/20 to-success/5',
        primary: 'from-primary/20 to-primary/5',
      },
      size: {
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const iconVariants = cva('transition-colors', {
  variants: {
    variant: {
      default: 'text-muted-foreground',
      error: 'text-destructive',
      success: 'text-success',
      primary: 'text-primary',
    },
    size: {
      sm: 'h-8 w-8',
      default: 'h-10 w-10',
      lg: 'h-12 w-12',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const iconMap = {
  error: FileX,
  info: AlertCircle,
  empty: Inbox,
  search: Search,
  chart: TrendingUp,
  sparkles: Sparkles,
};

type IconType = keyof typeof iconMap;

const sparklePositions = [
  { top: '-8px', right: '-8px', delay: 'sparkle-delay-1' },
  { top: '50%', left: '-12px', delay: 'sparkle-delay-2' },
  { bottom: '-6px', right: '20%', delay: 'sparkle-delay-3' },
];

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>,
    VariantProps<typeof emptyStateVariants> {
  /** Main heading text */
  title?: React.ReactNode;
  /** Supporting description text */
  description?: React.ReactNode;
  /** Predefined icon type or custom icon component */
  icon?: IconType | LucideIcon;
  /** Visual style variant */
  variant?: 'default' | 'error' | 'success' | 'primary';
  /** Primary action button node */
  action?: React.ReactNode;
  /** Secondary action button node */
  secondaryAction?: React.ReactNode;
  /** Whether to show decorative background pattern */
  showPattern?: boolean;
  /** Whether to use Surface wrapper (adds border and background) */
  bordered?: boolean;
  /** Enable animated effects (typewriter, bouncy button, floating icon) */
  animated?: boolean;
}

/**
 * EmptyState - Unified generic empty state component
 *
 * Uses Surface and typography primitives for consistent styling.
 * Supports multiple variants, sizes, and action button slots.
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      title = 'No data available',
      description = 'Get started by adding your first item',
      icon = 'empty',
      variant = 'default',
      size,
      action,
      secondaryAction,
      showPattern = true,
      bordered = true,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const [showButton, setShowButton] = React.useState(false);
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = animated && !prefersReducedMotion;

    const Icon = typeof icon === 'string' ? iconMap[icon] : icon;

    const handleTypewriterComplete = React.useCallback(() => {
      setTimeout(() => setShowButton(true), 200);
    }, []);

    React.useEffect(() => {
      if (!shouldAnimate) {
        setShowButton(true);
      }
    }, [shouldAnimate]);

    const content = (
      <div
        ref={ref}
        className={cn(
          emptyStateVariants({ size }),
          'group relative overflow-hidden',
          className
        )}
        {...props}
      >
        {showPattern && (
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
          </div>
        )}

        <div className="relative flex flex-col items-center gap-4">
          <div
            className={cn(
              iconContainerVariants({ variant, size }),
              shouldAnimate && 'animate-float-gentle'
            )}
          >
            <Icon className={iconVariants({ variant, size })} />

            {shouldAnimate &&
              sparklePositions.map((pos, i) => (
                <Star
                  key={i}
                  className={cn(
                    'absolute h-3 w-3 text-primary/60 animate-sparkle',
                    pos.delay
                  )}
                  style={{
                    top: pos.top,
                    right: pos.right,
                    left: pos.left,
                    bottom: pos.bottom,
                  }}
                  fill="currentColor"
                />
              ))}
          </div>

          <div className="space-y-2 max-w-sm">
            <Heading level={4} className="text-balance">
              {shouldAnimate && typeof title === 'string' ? (
                <TypewriterText
                  text={title}
                  speed={40}
                  delay={300}
                  onComplete={handleTypewriterComplete}
                />
              ) : (
                title
              )}
            </Heading>
            <Body muted size="sm" className="text-balance min-h-[1.5em]">
              {shouldAnimate && typeof description === 'string' ? (
                <TypewriterText
                  text={description}
                  speed={25}
                  delay={
                    typeof title === 'string'
                      ? 300 + title.length * 40 + 200
                      : 500
                  }
                />
              ) : (
                description
              )}
            </Body>
          </div>

          {(action || secondaryAction) && (
            <div
              className={cn(
                'flex flex-col sm:flex-row items-center gap-3 mt-2',
                shouldAnimate && !showButton && 'opacity-0',
                shouldAnimate && showButton && 'animate-bounce-in'
              )}
            >
              {action}
              {secondaryAction}
            </div>
          )}
        </div>
      </div>
    );

    if (bordered) {
      return (
        <Surface
          variant="subtle"
          padding="none"
          className={cn(
            'border-dashed',
            variant === 'error' && 'border-destructive/50',
            variant === 'success' && 'border-success/50',
            variant === 'primary' && 'border-primary/50'
          )}
        >
          {content}
        </Surface>
      );
    }

    return content;
  }
);
EmptyState.displayName = 'EmptyState';
