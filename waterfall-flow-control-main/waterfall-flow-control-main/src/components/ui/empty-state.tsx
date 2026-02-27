import * as React from 'react';
import {
  AlertCircle,
  FileX,
  Inbox,
  Plus,
  Search,
  TrendingUp,
  LucideIcon,
  Sparkles,
  Star,
} from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Heading, Body } from '@/components/ui/text';
import { TypewriterText } from '@/components/ui/typewriter-text';
import { useReducedMotion } from '@/hooks/useReducedMotion';
// ============================================
// EMPTY STATE COMPONENT
// ============================================

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

// Decorative sparkle positions for the animated illustration
const sparklePositions = [
  { top: '-8px', right: '-8px', delay: 'sparkle-delay-1' },
  { top: '50%', left: '-12px', delay: 'sparkle-delay-2' },
  { bottom: '-6px', right: '20%', delay: 'sparkle-delay-3' },
];

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'success' | 'glass';
}

interface EmptyStateProps
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
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Whether to show decorative background pattern */
  showPattern?: boolean;
  /** Whether to use Surface wrapper (adds border and background) */
  bordered?: boolean;
  /** Enable animated effects (typewriter, bouncy button, floating icon) */
  animated?: boolean;
}

/**
 * EmptyState - Unified empty state component
 *
 * Uses Surface and typography primitives for consistent styling.
 * Supports multiple variants, sizes, and action buttons.
 *
 * @example
 * <EmptyState
 *   icon="chart"
 *   title="No transactions yet"
 *   description="Add your first transaction to get started"
 *   action={{ label: "Add Transaction", onClick: handleAdd }}
 * />
 */
const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
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

    // Resolve icon - either from map or use as custom component
    const Icon = typeof icon === 'string' ? iconMap[icon] : icon;

    // Trigger button animation after typewriter completes
    const handleTypewriterComplete = React.useCallback(() => {
      // Small delay before button bounces in
      setTimeout(() => setShowButton(true), 200);
    }, []);

    // If not animating, show button immediately
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
        {/* Decorative background pattern */}
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
          {/* Animated icon container with floating effect and sparkles */}
          <div
            className={cn(
              iconContainerVariants({ variant, size }),
              shouldAnimate && 'animate-float-gentle'
            )}
          >
            <Icon className={iconVariants({ variant, size })} />

            {/* Decorative sparkles around the icon */}
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

          {/* Text content with typewriter effect */}
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

          {/* Actions with bouncy animation */}
          {(action || secondaryAction) && (
            <div
              className={cn(
                'flex flex-col sm:flex-row items-center gap-3 mt-2',
                shouldAnimate && !showButton && 'opacity-0',
                shouldAnimate && showButton && 'animate-bounce-in'
              )}
            >
              {action && (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || 'default'}
                  size={size === 'sm' ? 'sm' : 'lg'}
                  className="gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                  {action.icon ? (
                    <action.icon className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  {action.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant={secondaryAction.variant || 'ghost'}
                  size={size === 'sm' ? 'sm' : 'default'}
                  className="gap-2"
                >
                  {secondaryAction.icon && (
                    <secondaryAction.icon className="h-4 w-4" />
                  )}
                  {secondaryAction.label}
                </Button>
              )}
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

// ============================================
// PRESET EMPTY STATES
// ============================================

interface PresetEmptyStateProps
  extends Omit<EmptyStateProps, 'icon' | 'title' | 'description'> {
  onAction?: () => void;
}

/** Empty state for no transactions */
const EmptyTransactions = ({ onAction, ...props }: PresetEmptyStateProps) => (
  <EmptyState
    icon="chart"
    title="No transactions yet"
    description="Start tracking your finances by adding your first transaction"
    action={
      onAction ? { label: 'Add Transaction', onClick: onAction } : undefined
    }
    variant="primary"
    {...props}
  />
);

/** Empty state for no search results */
const EmptySearch = ({ onAction, ...props }: PresetEmptyStateProps) => (
  <EmptyState
    icon="search"
    title="No results found"
    description="Try adjusting your search or filters to find what you're looking for"
    action={
      onAction
        ? { label: 'Clear Search', onClick: onAction, variant: 'outline' }
        : undefined
    }
    {...props}
  />
);

/** Empty state for errors */
const EmptyError = ({ onAction, ...props }: PresetEmptyStateProps) => (
  <EmptyState
    icon="error"
    title="Something went wrong"
    description="We encountered an error loading your data. Please try again."
    action={onAction ? { label: 'Try Again', onClick: onAction } : undefined}
    variant="error"
    {...props}
  />
);

export {
  EmptyState,
  EmptyTransactions,
  EmptySearch,
  EmptyError,
  emptyStateVariants,
};
