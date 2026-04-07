import { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Surface, Currency, Stagger, TextLabel } from '@/components/ui';
import { Sparkline } from '@/components/ui/sparkline';
import { useIsMobile } from '@/hooks/useMobile';

interface StatsCardsProps {
  totalInflow: number;
  totalOutflow: number;
  netAmount: number;
  /** Optional: Daily aggregates for sparklines [oldest...newest] */
  dailyInflow?: number[];
  dailyOutflow?: number[];
  dailyNet?: number[];
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  variant: 'income' | 'expense' | 'neutral';
  sparklineData?: number[];
  isMobile?: boolean;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  variant,
  sparklineData,
  isMobile,
}: StatCardProps) => {
  const isPositive =
    variant === 'income' || (variant === 'neutral' && value >= 0);
  const colorClass = isPositive ? 'text-primary' : 'text-destructive';
  const bgClass = isPositive
    ? 'bg-primary/10 group-hover:bg-primary/20 group-hover:shadow-primary/20'
    : 'bg-destructive/10 group-hover:bg-destructive/20 group-hover:shadow-destructive/20';

  const sparklineVariant = isPositive ? 'positive' : 'negative';

  return (
    <Surface variant="default" interactive className="group overflow-hidden">
      {/* Subtle gradient overlay */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          isPositive
            ? 'bg-gradient-to-br from-primary/5 to-transparent'
            : 'bg-gradient-to-br from-destructive/5 to-transparent'
        )}
      />

      <div
        className={cn(
          'flex items-center gap-4 relative z-10',
          // Mobile: more compact layout
          isMobile && 'gap-3'
        )}
      >
        <div
          className={cn(
            'p-3 rounded-xl transition-all duration-300 shadow-sm group-hover:shadow-md',
            bgClass,
            // Mobile: slightly smaller icon container
            isMobile && 'p-2.5'
          )}
        >
          <Icon
            className={cn(
              'h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300',
              'group-hover:scale-110 group-hover:rotate-3',
              colorClass
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <TextLabel className={cn('mb-1', isMobile && 'text-xs')}>
              {label}
            </TextLabel>
            {/* Sparkline trend - moved to header row for mobile */}
            {sparklineData && sparklineData.length >= 2 && (
              <Sparkline
                data={sparklineData}
                variant={sparklineVariant}
                width={isMobile ? 40 : 48}
                height={isMobile ? 16 : 20}
                className="opacity-60 group-hover:opacity-100"
              />
            )}
          </div>
          <Currency
            value={value}
            animated
            size={isMobile ? 'xl' : '2xl'}
            variant={isPositive ? 'positive' : 'negative'}
            className="font-semibold tracking-tight"
          />
        </div>
      </div>
    </Surface>
  );
};

export const StatsCards = ({
  totalInflow,
  totalOutflow,
  netAmount,
  dailyInflow,
  dailyOutflow,
  dailyNet,
}: StatsCardsProps) => {
  const isMobile = useIsMobile();

  // Generate mock sparkline data if not provided (for demo purposes)
  const mockSparklines = useMemo(() => {
    if (dailyInflow && dailyOutflow && dailyNet) {
      return { inflow: dailyInflow, outflow: dailyOutflow, net: dailyNet };
    }

    // Generate plausible mock data based on totals
    const generateMockData = (total: number, variance: number = 0.3) => {
      const days = 7;
      const avg = total / days;
      return Array.from({ length: days }, () =>
        Math.max(0, avg * (0.5 + Math.random() * variance * 2))
      );
    };

    return {
      inflow: totalInflow > 0 ? generateMockData(totalInflow, 0.4) : [],
      outflow: totalOutflow > 0 ? generateMockData(totalOutflow, 0.35) : [],
      net: [], // Net sparkline calculated from cumulative
    };
  }, [dailyInflow, dailyOutflow, dailyNet, totalInflow, totalOutflow]);

  return (
    <Stagger
      delay={100}
      className={cn(
        'grid gap-3',
        // Mobile: single column full-width cards, Desktop: 3 columns
        isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3 gap-4'
      )}
    >
      <StatCard
        icon={TrendingUp}
        label="Income"
        value={totalInflow}
        variant="income"
        sparklineData={mockSparklines.inflow}
        isMobile={isMobile}
      />
      <StatCard
        icon={TrendingDown}
        label="Expenses"
        value={totalOutflow}
        variant="expense"
        sparklineData={mockSparklines.outflow}
        isMobile={isMobile}
      />
      <StatCard
        icon={DollarSign}
        label="Net Balance"
        value={netAmount}
        variant="neutral"
        sparklineData={
          mockSparklines.net.length > 0 ? mockSparklines.net : undefined
        }
        isMobile={isMobile}
      />
    </Stagger>
  );
};
