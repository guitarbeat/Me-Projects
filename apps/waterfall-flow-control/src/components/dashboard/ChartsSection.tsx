import { lazy, Suspense, useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { Loading, Stagger } from '@/components/ui';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import type { Transaction } from '@/types';

const WaterfallChart = lazy(() =>
  import('@/features/charts').then(m => ({ default: m.WaterfallChart }))
);
const SankeyChart = lazy(() =>
  import('@/features/charts').then(m => ({ default: m.SankeyChart }))
);

interface ChartsSectionProps {
  enabledTransactions: Transaction[];
}

const ChartModeToggle = ({
  chartMode,
  onToggle,
}: {
  chartMode: 'detailed' | 'summary';
  onToggle: () => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onToggle}
    className="h-7 text-xs"
    aria-label={chartMode === 'detailed' ? 'Show summary' : 'Show detailed'}
  >
    <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
    {chartMode === 'detailed' ? 'Summary' : 'Detailed'}
  </Button>
);

export const ChartsSection = memo(
  ({ enabledTransactions }: ChartsSectionProps) => {
    const [sankeyMode, setSankeyMode] = useState<'detailed' | 'summary'>(
      'detailed'
    );
    const [waterfallMode, setWaterfallMode] = useState<'detailed' | 'summary'>(
      'detailed'
    );

    const chartData = useMemo(() => {
      let runningBalance = 0;
      return enabledTransactions.map(transaction => {
        const amount = transaction.inflow - transaction.outflow;
        runningBalance += amount;
        return {
          name: transaction.name,
          date: transaction.date,
          amount,
          balance: runningBalance,
          person: transaction.person,
          cumulative: runningBalance,
        };
      });
    }, [enabledTransactions]);

    return (
      <Stagger delay={100} className="space-y-4">
        <CollapsibleSection
          title="Transaction Flow"
          storageKey="sankey-chart"
          headerAction={
            <ChartModeToggle
              chartMode={sankeyMode}
              onToggle={() =>
                setSankeyMode(prev =>
                  prev === 'detailed' ? 'summary' : 'detailed'
                )
              }
            />
          }
        >
          <div className="min-h-[300px] sm:min-h-[400px]">
            <Suspense
              fallback={
                <Loading
                  type="shimmer"
                  className="h-[300px] sm:h-[400px] w-full rounded-lg"
                />
              }
            >
              <SankeyChart
                transactions={enabledTransactions}
                chartMode={sankeyMode}
              />
            </Suspense>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title="Balance Progression"
          storageKey="waterfall-chart"
          headerAction={
            <ChartModeToggle
              chartMode={waterfallMode}
              onToggle={() =>
                setWaterfallMode(prev =>
                  prev === 'detailed' ? 'summary' : 'detailed'
                )
              }
            />
          }
        >
          <div className="h-[300px] sm:h-[400px]">
            <Suspense
              fallback={
                <Loading
                  type="shimmer"
                  className="h-[300px] sm:h-[400px] w-full rounded-lg"
                />
              }
            >
              <WaterfallChart data={chartData} chartMode={waterfallMode} />
            </Suspense>
          </div>
        </CollapsibleSection>
      </Stagger>
    );
  }
);

ChartsSection.displayName = 'ChartsSection';
