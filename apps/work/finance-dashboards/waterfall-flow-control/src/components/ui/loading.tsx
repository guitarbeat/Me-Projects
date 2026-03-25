import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================
// SPINNER COMPONENT
// ============================================

const spinnerVariants = cva('animate-spin text-muted-foreground', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-8 w-8',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Optional loading text */
  text?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size, text, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        className
      )}
      {...props}
    >
      <Loader2 className={spinnerVariants({ size })} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )
);
Spinner.displayName = 'Spinner';

// ============================================
// SKELETON COMPONENT
// ============================================

const skeletonVariants = cva('bg-muted/50 rounded animate-pulse', {
  variants: {
    shape: {
      line: 'h-4 w-full',
      circle: 'rounded-full aspect-square',
      card: 'h-32 w-full rounded-xl',
      avatar: 'h-10 w-10 rounded-full',
      button: 'h-10 w-24 rounded-lg',
      text: 'h-3 w-3/4',
    },
  },
  defaultVariants: {
    shape: 'line',
  },
});

interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

// ============================================
// SHIMMER SKELETON COMPONENT
// ============================================

const Shimmer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden bg-muted/50 rounded',
      'before:absolute before:inset-0',
      'before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent',
      'before:animate-shimmer',
      className
    )}
    {...props}
  />
));
Shimmer.displayName = 'Shimmer';

// ============================================
// LAYOUT SKELETON PRESETS
// ============================================

interface LayoutSkeletonProps {
  className?: string;
}

/** Skeleton for stat/metric cards */
const StatCardSkeleton = ({ className }: LayoutSkeletonProps) => (
  <div className={cn('p-4 sm:p-6 space-y-3', className)}>
    <div className="flex items-center gap-3">
      <Shimmer className="h-10 w-10 rounded-lg" />
      <Shimmer className="h-4 w-20" />
    </div>
    <Shimmer className="h-8 w-32" />
    <Shimmer className="h-3 w-24" />
  </div>
);

/** Skeleton for transaction rows */
const TransactionRowSkeleton = ({ className }: LayoutSkeletonProps) => (
  <div className={cn('flex items-center justify-between p-3', className)}>
    <div className="flex items-center gap-3 flex-1">
      <Shimmer className="h-4 w-4" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>
    <Shimmer className="h-4 w-16" />
  </div>
);

/** Skeleton for mobile transaction cards */
const MobileTransactionCardSkeleton = ({ className }: LayoutSkeletonProps) => (
  <div className={cn('p-4 space-y-3 rounded-xl border bg-card/50', className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Shimmer className="h-4 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
      <Shimmer className="h-6 w-16" />
    </div>
    <div className="flex gap-2">
      <Shimmer className="h-5 w-16 rounded-full" />
      <Shimmer className="h-5 w-12 rounded-full" />
    </div>
  </div>
);

/** Skeleton for chart areas */
const ChartSkeleton = ({ className }: LayoutSkeletonProps) => (
  <div className={cn('p-4 sm:p-6 space-y-4', className)}>
    <div className="flex justify-between items-center">
      <Shimmer className="h-5 w-32" />
      <div className="flex gap-2">
        <Shimmer className="h-8 w-8 rounded" />
        <Shimmer className="h-8 w-8 rounded" />
      </div>
    </div>
    <Shimmer className="h-64 w-full rounded-lg" />
  </div>
);

/** Full dashboard skeleton layout */
const DashboardSkeleton = ({ className }: LayoutSkeletonProps) => (
  <div className={cn('space-y-6 p-4', className)}>
    {/* Header */}
    <div className="flex justify-between items-center">
      <Shimmer className="h-8 w-48" />
      <div className="flex gap-2">
        <Shimmer className="h-10 w-10 rounded-lg" />
        <Shimmer className="h-10 w-10 rounded-lg" />
      </div>
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border bg-card/50">
        <StatCardSkeleton />
      </div>
      <div className="rounded-xl border bg-card/50">
        <StatCardSkeleton />
      </div>
      <div className="rounded-xl border bg-card/50">
        <StatCardSkeleton />
      </div>
    </div>

    {/* Chart */}
    <div className="rounded-xl border bg-card/50">
      <ChartSkeleton />
    </div>

    {/* Transactions */}
    <div className="rounded-xl border bg-card/50 p-4 space-y-2">
      <TransactionRowSkeleton />
      <TransactionRowSkeleton />
      <TransactionRowSkeleton />
    </div>
  </div>
);

// ============================================
// UNIFIED LOADING COMPONENT
// ============================================

interface LoadingProps {
  /** Type of loading indicator */
  type?: 'spinner' | 'skeleton' | 'shimmer' | 'page';
  /** Layout preset for page type */
  layout?: 'dashboard' | 'list' | 'card' | 'chart';
  /** Size for spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Shape for skeleton */
  shape?: 'line' | 'circle' | 'card' | 'avatar' | 'button' | 'text';
  /** Loading text */
  text?: string;
  /** Additional className */
  className?: string;
}

/**
 * Loading - Unified loading state component
 *
 * Factory pattern for context-aware loading states.
 *
 * @example
 * <Loading type="spinner" size="md" />
 * <Loading type="skeleton" shape="card" />
 * <Loading type="page" layout="dashboard" />
 */
const Loading = ({
  type = 'spinner',
  layout = 'dashboard',
  size = 'md',
  shape = 'line',
  text,
  className,
}: LoadingProps) => {
  switch (type) {
    case 'spinner':
      return <Spinner size={size} text={text} className={className} />;
    case 'skeleton':
      return <Skeleton shape={shape} className={className} />;
    case 'shimmer':
      return <Shimmer className={className} />;
    case 'page':
      switch (layout) {
        case 'dashboard':
          return <DashboardSkeleton className={className} />;
        case 'chart':
          return <ChartSkeleton className={className} />;
        case 'list':
          return (
            <div className={cn('space-y-2', className)}>
              {Array.from({ length: 5 }).map((_, i) => (
                <TransactionRowSkeleton key={i} />
              ))}
            </div>
          );
        case 'card':
          return <MobileTransactionCardSkeleton className={className} />;
        default:
          return <DashboardSkeleton className={className} />;
      }
    default:
      return <Spinner size={size} text={text} className={className} />;
  }
};

export {
  Loading,
  Spinner,
  Skeleton,
  Shimmer,
  StatCardSkeleton,
  TransactionRowSkeleton,
  MobileTransactionCardSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  spinnerVariants,
  skeletonVariants,
};
