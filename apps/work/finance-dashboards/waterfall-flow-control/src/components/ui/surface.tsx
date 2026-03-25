import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const surfaceVariants = cva(
  'rounded-xl border text-card-foreground transition-all duration-300',
  {
    variants: {
      variant: {
        default:
          'bg-card/95 backdrop-blur-sm border-border/50 shadow-lg shadow-foreground/5',
        elevated:
          'bg-card backdrop-blur-xl border-border/40 shadow-xl shadow-foreground/10',
        subtle: 'bg-card/60 backdrop-blur-md border-border/30 shadow-sm',
        glow: 'bg-card/90 backdrop-blur-xl border-primary/20 shadow-lg shadow-primary/10',
        ghost: 'bg-transparent border-transparent shadow-none',
      },
      padding: {
        none: '',
        compact: 'p-3 sm:p-4',
        default: 'p-4 sm:p-6',
        spacious: 'p-6 sm:p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.98]',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'glow',
        interactive: true,
        className: 'hover:shadow-primary/20 hover:border-primary/30',
      },
      {
        variant: 'elevated',
        interactive: true,
        className: 'hover:shadow-2xl',
      },
    ],
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      interactive: false,
    },
  }
);

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {
  /** Animation stagger index for coordinated entry animations */
  stagger?: number;
  /** Whether the surface is in a loading state */
  loading?: boolean;
  /** Custom loading skeleton to display when loading */
  skeleton?: React.ReactNode;
}

const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  (
    {
      className,
      variant,
      padding,
      interactive,
      stagger,
      loading,
      skeleton,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const animationStyle =
      stagger !== undefined
        ? { ...style, animationDelay: `${stagger * 50}ms` }
        : style;

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            surfaceVariants({ variant, padding, interactive: false }),
            'animate-pulse',
            className
          )}
          style={animationStyle}
          {...props}
        >
          {skeleton || <SurfaceSkeleton />}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          surfaceVariants({ variant, padding, interactive }),
          stagger !== undefined && 'animate-fade-up',
          className
        )}
        style={animationStyle}
        data-stagger={stagger}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Surface.displayName = 'Surface';

// Default skeleton for Surface loading state
const SurfaceSkeleton = () => (
  <div className="space-y-3">
    <div className="h-4 bg-muted/50 rounded w-1/3" />
    <div className="h-3 bg-muted/50 rounded w-2/3" />
    <div className="h-3 bg-muted/50 rounded w-1/2" />
  </div>
);

// Surface subcomponents for structure
const SurfaceHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
SurfaceHeader.displayName = 'SurfaceHeader';

const SurfaceTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-tight tracking-tight',
      className
    )}
    {...props}
  />
));
SurfaceTitle.displayName = 'SurfaceTitle';

const SurfaceDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground leading-relaxed', className)}
    {...props}
  />
));
SurfaceDescription.displayName = 'SurfaceDescription';

const SurfaceContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
SurfaceContent.displayName = 'SurfaceContent';

const SurfaceFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
SurfaceFooter.displayName = 'SurfaceFooter';

export {
  Surface,
  SurfaceHeader,
  SurfaceTitle,
  SurfaceDescription,
  SurfaceContent,
  SurfaceFooter,
  surfaceVariants,
};
