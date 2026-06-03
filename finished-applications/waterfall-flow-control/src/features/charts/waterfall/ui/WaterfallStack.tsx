import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================
// STACK (VERTICAL) COMPONENT
// ============================================

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'stretch',
    justify: 'start',
  },
});

interface WaterfallStackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

/**
 * Stack - Vertical stacking with consistent gaps
 *
 * @example
 * <Stack gap="md">
 *   <Child />
 *   <Child />
 * </Stack>
 */
const WaterfallStack = React.forwardRef<HTMLDivElement, WaterfallStackProps>(
  ({ className, gap, align, justify, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(stackVariants({ gap, align, justify }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
WaterfallStack.displayName = 'WaterfallStack';

// ============================================
// ROW (HORIZONTAL) COMPONENT
// ============================================

const rowVariants = cva('flex flex-row', {
  variants: {
    gap: {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    gap: 'md',
    align: 'center',
    justify: 'start',
    wrap: false,
  },
});

interface WaterfallRowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof rowVariants> {}

/**
 * Row - Horizontal layout with consistent gaps
 *
 * @example
 * <Row gap="sm" justify="between">
 *   <Button>Cancel</Button>
 *   <Button>Save</Button>
 * </Row>
 */
const WaterfallRow = React.forwardRef<HTMLDivElement, WaterfallRowProps>(
  ({ className, gap, align, justify, wrap, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(rowVariants({ gap, align, justify, wrap }), className)}
      {...props}
    >
      {children}
    </div>
  )
);
WaterfallRow.displayName = 'WaterfallRow';

// ============================================
// CENTER COMPONENT
// ============================================

interface WaterfallCenterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Make it full height of parent/viewport */
  full?: boolean;
}

/**
 * Center - Center content both horizontally and vertically
 *
 * @example
 * <Center full>
 *   <LoadingSpinner />
 * </Center>
 */
const WaterfallCenter = React.forwardRef<HTMLDivElement, WaterfallCenterProps>(
  ({ className, full, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center',
        full && 'min-h-screen w-full',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
WaterfallCenter.displayName = 'WaterfallCenter';

// ============================================
// SPACER COMPONENT
// ============================================

interface WaterfallSpacerProps {
  /** Size of the spacer */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Direction of spacing */
  axis?: 'horizontal' | 'vertical';
}

const spacerSizes = {
  xs: '1',
  sm: '2',
  md: '4',
  lg: '6',
  xl: '8',
};

/**
 * Spacer - Explicit spacing between elements
 *
 * @example
 * <Spacer size="lg" />
 */
const WaterfallSpacer = ({ size = 'md', axis = 'vertical' }: WaterfallSpacerProps) => (
  <div
    className={cn(
      axis === 'vertical' ? `h-${spacerSizes[size]}` : `w-${spacerSizes[size]}`,
      'flex-shrink-0'
    )}
    aria-hidden="true"
  />
);
WaterfallSpacer.displayName = 'WaterfallSpacer';

// ============================================
// DIVIDER COMPONENT
// ============================================

interface WaterfallDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Label to show in the middle */
  label?: string;
}

/**
 * Divider - Visual separator between content
 *
 * @example
 * <Divider label="or" />
 */
const WaterfallDivider = React.forwardRef<HTMLDivElement, WaterfallDividerProps>(
  ({ className, orientation = 'horizontal', label, ...props }, ref) => {
    if (label) {
      return (
        <div
          ref={ref}
          className={cn('flex items-center gap-4', className)}
          role="separator"
          {...props}
        >
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
          'bg-border',
          className
        )}
        role="separator"
        {...props}
      />
    );
  }
);
WaterfallDivider.displayName = 'WaterfallDivider';

export { WaterfallStack, WaterfallRow, WaterfallCenter, WaterfallSpacer, WaterfallDivider, stackVariants, rowVariants };
