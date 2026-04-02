import { useRef, useState, useEffect, useMemo, memo } from 'react';
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ComposedChart,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  ChartData,
  processWaterfallData,
  calculateChartBounds,
  formatCurrency,
} from '../utils/waterfallData';
import { CustomTooltip, EmptyState } from './WaterfallComponents';
import { getPersonColor } from '../utils/waterfallUtils';
import { toast } from 'sonner';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useIsMobile } from '@/hooks/useMobile';

interface WaterfallChartProps {
  data: ChartData[];
  chartMode: 'detailed' | 'summary';
}

export const WaterfallChart = memo(
  ({ data, chartMode }: WaterfallChartProps) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [isAnimated, setIsAnimated] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const isMobile = useIsMobile();

    // Trigger animation on mount
    useEffect(() => {
      if (!prefersReducedMotion) {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
      } else {
        setIsAnimated(true);
      }
    }, [prefersReducedMotion]);

    const handleExportPNG = async () => {
      if (!chartRef.current) return;

      try {
        // Find the SVG element within the chart container
        const svg = chartRef.current.querySelector('svg');
        if (!svg) {
          toast.error('Unable to find chart element');
          return;
        }

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const svgBlob = new Blob([svgData], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          canvas.width = svg.clientWidth || 800;
          canvas.height = svg.clientHeight || 600;

          if (!ctx) return;

          // Fill white background
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(blob => {
            if (!blob) return;
            const link = document.createElement('a');
            link.download = 'waterfall-chart.png';
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(link.href);
            toast.success('Chart exported as PNG');
          }, 'image/png');
        };

        img.src = url;
      } catch (error) {
        console.error('Export error:', error);
        toast.error('Failed to export chart');
      }
    };

    const waterfallData = useMemo(() => {
      if (chartMode === 'summary') {
        // Group all income into one bar, expenses by name
        const income = data.filter(d => d.amount > 0);
        const expenses = data.filter(d => d.amount < 0);
        const groupedExpenses = expenses.reduce(
          (acc, curr) => {
            if (!acc[curr.name]) acc[curr.name] = 0;
            acc[curr.name] += curr.amount;
            return acc;
          },
          {} as Record<string, number>
        );
        // Order: income, then each expense group in order of first appearance
        const expenseOrder: string[] = [];
        expenses.forEach(e => {
          if (!expenseOrder.includes(e.name)) expenseOrder.push(e.name);
        });
        const summaryData: ChartData[] = [];
        if (income.length > 0) {
          summaryData.push({
            name: 'Total Income',
            date: income[0].date,
            amount: income.reduce((sum, d) => sum + d.amount, 0),
            balance: 0, // will be recalculated
            person: '',
            cumulative: 0,
          });
        }
        expenseOrder.forEach(name => {
          summaryData.push({
            name,
            date: expenses.find(e => e.name === name)?.date || '',
            amount: groupedExpenses[name],
            balance: 0, // will be recalculated
            person: '',
            cumulative: 0,
          });
        });
        // Recalculate running balance
        let running = 0;
        summaryData.forEach(d => {
          running += d.amount;
          d.balance = running;
          d.cumulative = running;
        });
        return processWaterfallData(summaryData);
      } else {
        return processWaterfallData(data);
      }
    }, [data, chartMode]);

    const chartBounds = useMemo(
      () => calculateChartBounds(waterfallData),
      [waterfallData]
    );

    if (data.length === 0) {
      return <EmptyState />;
    }

    // Calculate minimum width for scrollable chart on mobile
    const minChartWidth = isMobile
      ? Math.max(waterfallData.length * 60, 400)
      : undefined;

    const chartContent = (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={waterfallData}
          margin={{
            top: 10,
            right: isMobile ? 10 : 20,
            left: isMobile ? 40 : 60,
            bottom: isMobile ? 50 : 60,
          }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            stroke="hsl(var(--border))"
            strokeWidth={1.2}
            strokeDasharray="4 2"
            vertical={true}
            horizontal={true}
            opacity={0.7}
          />
          <XAxis
            dataKey="shortDate"
            angle={-45}
            textAnchor="end"
            height={isMobile ? 50 : 60}
            fontSize={isMobile ? 10 : 11}
            stroke="hsl(var(--muted-foreground))"
            tick={{
              fontSize: isMobile ? 10 : 11,
              fill: 'hsl(var(--muted-foreground))',
            }}
            interval={0}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            domain={[0, chartBounds.max]}
            tickFormatter={formatCurrency}
            fontSize={isMobile ? 10 : 11}
            width={isMobile ? 40 : 60}
            tick={{
              fontSize: isMobile ? 10 : 11,
              fill: 'hsl(var(--muted-foreground))',
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
          />

          <Bar dataKey="stackBase" stackId="waterfall" fill="transparent" />

          <Bar
            dataKey="displayAmount"
            stackId="waterfall"
            radius={[4, 4, 0, 0]}
            isAnimationActive={!prefersReducedMotion && isAnimated}
            animationDuration={1000}
            animationBegin={0}
            animationEasing="ease-out"
          >
            {waterfallData.map((dataPoint, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPersonColor(dataPoint.isIncome, dataPoint.person)}
                stroke="hsl(var(--background))"
                strokeWidth={1}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  transformOrigin: 'bottom',
                  animation:
                    !prefersReducedMotion && isAnimated
                      ? `spring-rise 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 60}ms forwards`
                      : 'none',
                }}
              />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    );

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPNG}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export PNG
          </Button>
        </div>
        <div className="flex-1" ref={chartRef}>
          {/* Legend removed, now shared above */}

          {/* Mobile: Horizontal scroll wrapper */}
          {isMobile && waterfallData.length > 6 ? (
            <div className="relative h-full">
              {/* Scroll hint gradient */}
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none z-10" />
              <div className="overflow-x-auto hide-scrollbar h-full">
                <div style={{ minWidth: minChartWidth, height: '100%' }}>
                  {chartContent}
                </div>
              </div>
              {/* Scroll hint text */}
              <p className="text-xs text-muted-foreground text-center mt-1 opacity-60 absolute bottom-0 left-0 right-0">
                ← Scroll to explore →
              </p>
            </div>
          ) : (
            <div className="h-full w-full">{chartContent}</div>
          )}
        </div>
      </div>
    );
  }
);

WaterfallChart.displayName = 'WaterfallChart';
