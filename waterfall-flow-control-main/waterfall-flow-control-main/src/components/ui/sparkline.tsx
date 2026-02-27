import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  variant?: 'positive' | 'negative' | 'neutral';
  showArea?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * Sparkline - Tiny inline SVG chart for trends
 *
 * Lightweight, animated, and accessible mini visualization.
 */
export const Sparkline = ({
  data,
  width = 60,
  height = 24,
  variant = 'neutral',
  showArea = true,
  animated = true,
  className,
}: SparklineProps) => {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const { path, areaPath } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', areaPath: '' };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const effectiveHeight = height - padding * 2;
    const effectiveWidth = width - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * effectiveWidth;
      const y =
        padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
      return { x, y };
    });

    const linePath = points
      .map(
        (point, i) =>
          `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`
      )
      .join(' ');

    const areaPathStr = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${padding} ${height - padding} Z`;

    return { path: linePath, areaPath: areaPathStr };
  }, [data, width, height]);

  const colorClass = {
    positive: 'text-primary',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  }[variant];

  const fillOpacity = {
    positive: '0.15',
    negative: '0.1',
    neutral: '0.08',
  }[variant];

  if (data.length < 2) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <div className="h-px w-8 bg-muted-foreground/30" />
      </div>
    );
  }

  const pathLength = data.length * 15; // Approximate path length

  return (
    <svg
      width={width}
      height={height}
      className={cn(
        'block overflow-visible transition-opacity duration-300',
        'group-hover:opacity-100',
        className
      )}
      aria-hidden="true"
    >
      {/* Area fill */}
      {showArea && (
        <path
          d={areaPath}
          fill="currentColor"
          fillOpacity={fillOpacity}
          className={cn(colorClass, 'transition-opacity duration-300')}
        />
      )}

      {/* Line stroke */}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(colorClass, shouldAnimate && 'animate-draw-in')}
        style={
          shouldAnimate
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                ['--path-length' as string]: pathLength,
              }
            : undefined
        }
      />

      {/* End dot */}
      <circle
        cx={width - 2}
        cy={height / 2}
        r={2}
        fill="currentColor"
        className={cn(
          colorClass,
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        )}
      />
    </svg>
  );
};

/**
 * SparklineBar - Tiny bar chart variant
 */
interface SparklineBarProps {
  data: number[];
  width?: number;
  height?: number;
  variant?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

export const SparklineBar = ({
  data,
  width = 48,
  height = 20,
  variant = 'neutral',
  className,
}: SparklineBarProps) => {
  const prefersReducedMotion = useReducedMotion();

  const bars = useMemo(() => {
    if (data.length === 0) return [];

    const max = Math.max(...data) || 1;
    const barWidth = Math.max(2, (width - (data.length - 1) * 1) / data.length);
    const gap = 1;

    return data.map((value, index) => {
      const barHeight = Math.max(2, (value / max) * height);
      return {
        x: index * (barWidth + gap),
        y: height - barHeight,
        width: barWidth,
        height: barHeight,
        delay: index * 50,
      };
    });
  }, [data, width, height]);

  const colorClass = {
    positive: 'fill-primary',
    negative: 'fill-destructive',
    neutral: 'fill-muted-foreground',
  }[variant];

  return (
    <svg
      width={width}
      height={height}
      className={cn('block overflow-visible', className)}
      aria-hidden="true"
    >
      {bars.map((bar, index) => (
        <rect
          key={index}
          x={bar.x}
          y={bar.y}
          width={bar.width}
          height={bar.height}
          rx={1}
          className={cn(
            colorClass,
            'opacity-60 group-hover:opacity-100 transition-all duration-300',
            !prefersReducedMotion && 'origin-bottom animate-scale-in'
          )}
          style={
            !prefersReducedMotion
              ? {
                  animationDelay: `${bar.delay}ms`,
                  animationFillMode: 'both',
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
};
