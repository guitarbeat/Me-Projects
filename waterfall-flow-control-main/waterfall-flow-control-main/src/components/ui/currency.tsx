import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ============================================
// CURRENCY DISPLAY COMPONENT
// ============================================

const currencyVariants = cva(
  'font-mono tabular-nums font-semibold transition-colors',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
      },
      variant: {
        default: 'text-foreground',
        positive: 'text-primary',
        negative: 'text-destructive',
        success: 'text-success',
        muted: 'text-muted-foreground',
        auto: '', // Color based on value sign
      },
    },
    defaultVariants: {
      size: 'base',
      variant: 'auto',
    },
  }
);

interface CurrencyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof currencyVariants> {
  /** The currency amount to display */
  value: number;
  /** Whether to animate the number changing */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Show +/- sign for positive/negative values */
  showSign?: boolean;
  /** Show trend arrow icon */
  showTrend?: boolean;
  /** Currency symbol (default: $) */
  symbol?: string;
  /** Number of decimal places (default: 0) */
  decimals?: number;
}

/**
 * Currency - Unified currency/money display component
 *
 * Combines animation, trend indicators, and consistent styling.
 * Replaces AnimatedCurrency, AmountDisplay, and formatCurrency patterns.
 *
 * @example
 * <Currency value={1500} animated showTrend />
 * <Currency value={-500} variant="negative" size="lg" />
 * <Currency value={0} variant="muted" />
 */
const Currency = React.forwardRef<HTMLDivElement, CurrencyProps>(
  (
    {
      value,
      animated = false,
      animationDuration = 1000,
      showSign = false,
      showTrend = false,
      symbol = '$',
      decimals = 0,
      size,
      variant = 'auto',
      className,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(
      animated ? 0 : Math.abs(value)
    );
    const previousValue = useRef(0);
    const animationRef = useRef<number>();

    // Determine color variant based on value
    const colorVariant =
      variant === 'auto'
        ? value > 0
          ? 'positive'
          : value < 0
            ? 'negative'
            : 'muted'
        : variant;

    // Animate value changes
    useEffect(() => {
      if (!animated) {
        setDisplayValue(Math.abs(value));
        return;
      }

      const startValue = previousValue.current;
      const endValue = Math.abs(value);
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Easing: easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        const current = startValue + (endValue - startValue) * eased;
        setDisplayValue(current);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          previousValue.current = endValue;
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [value, animated, animationDuration]);

    // Format the display value
    const formattedValue = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(displayValue);

    // Build the display string
    const isPositive = value > 0;
    const isNegative = value < 0;
    const signPrefix =
      showSign && value !== 0
        ? isPositive
          ? '+'
          : '-'
        : isNegative
          ? '-'
          : '';

    // Icon sizing
    const iconSize = {
      xs: 'h-3 w-3',
      sm: 'h-3.5 w-3.5',
      base: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
      '2xl': 'h-7 w-7',
      '3xl': 'h-8 w-8',
    }[size || 'base'];

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1',
          currencyVariants({ size, variant: colorVariant }),
          className
        )}
        {...props}
      >
        {showTrend &&
          value !== 0 &&
          (isPositive ? (
            <TrendingUp className={iconSize} />
          ) : (
            <TrendingDown className={iconSize} />
          ))}
        <span>
          {signPrefix}
          {symbol}
          {formattedValue}
        </span>
      </div>
    );
  }
);
Currency.displayName = 'Currency';

export { Currency, currencyVariants };
