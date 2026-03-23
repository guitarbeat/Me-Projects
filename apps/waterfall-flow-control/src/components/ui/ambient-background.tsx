import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type FinancialMood = 'positive' | 'negative' | 'neutral';

interface AmbientBackgroundProps {
  mood?: FinancialMood;
  className?: string;
}

/**
 * AmbientBackground - Subtle animated gradient that responds to financial health
 *
 * - Positive: Warm amber/gold glow
 * - Negative: Cool blue/violet glow
 * - Neutral: Soft gray ambient
 */
export const AmbientBackground = ({
  mood = 'neutral',
  className,
}: AmbientBackgroundProps) => {
  const prefersReducedMotion = useReducedMotion();

  const moodGradients: Record<FinancialMood, string> = {
    positive: 'from-amber-500/8 via-transparent to-emerald-500/5',
    negative: 'from-blue-500/8 via-transparent to-violet-500/6',
    neutral: 'from-muted/10 via-transparent to-muted/5',
  };

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      {/* Primary ambient orb - top left */}
      <div
        className={cn(
          'absolute -left-1/4 -top-1/4 h-[60vh] w-[60vh] rounded-full',
          'bg-gradient-radial',
          moodGradients[mood],
          'blur-3xl transition-all duration-1000',
          !prefersReducedMotion && 'animate-ambient-drift'
        )}
        style={{
          background:
            mood === 'positive'
              ? 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)'
              : mood === 'negative'
                ? 'radial-gradient(circle, hsl(var(--info) / 0.08) 0%, transparent 70%)'
                : 'radial-gradient(circle, hsl(var(--muted) / 0.1) 0%, transparent 70%)',
        }}
      />

      {/* Secondary ambient orb - bottom right */}
      <div
        className={cn(
          'absolute -bottom-1/4 -right-1/4 h-[50vh] w-[50vh] rounded-full',
          'blur-3xl transition-all duration-1000',
          !prefersReducedMotion && 'animate-ambient-drift-reverse'
        )}
        style={{
          background:
            mood === 'positive'
              ? 'radial-gradient(circle, hsl(var(--success) / 0.06) 0%, transparent 70%)'
              : mood === 'negative'
                ? 'radial-gradient(circle, hsl(var(--destructive) / 0.05) 0%, transparent 70%)'
                : 'radial-gradient(circle, hsl(var(--border) / 0.08) 0%, transparent 70%)',
          animationDelay: '2s',
        }}
      />

      {/* Tertiary accent - center glow */}
      <div
        className={cn(
          'absolute left-1/2 top-1/2 h-[40vh] w-[40vh] -translate-x-1/2 -translate-y-1/2 rounded-full',
          'blur-3xl transition-all duration-1000 opacity-30',
          !prefersReducedMotion && 'animate-pulse-soft'
        )}
        style={{
          background:
            mood === 'positive'
              ? 'radial-gradient(circle, hsl(var(--chart-1) / 0.1) 0%, transparent 60%)'
              : mood === 'negative'
                ? 'radial-gradient(circle, hsl(var(--info) / 0.06) 0%, transparent 60%)'
                : 'radial-gradient(circle, hsl(var(--muted) / 0.05) 0%, transparent 60%)',
        }}
      />
    </div>
  );
};
