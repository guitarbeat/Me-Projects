import { COLORS } from '../utils/waterfallUtils';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      person: string;
      date: string;
      amount: number;
      cumulative: number;
    };
  }>;
}

export const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const isIncome = data.amount >= 0;

  return (
    <div className="bg-card border rounded-lg p-3 shadow-lg backdrop-blur-sm">
      <div className="space-y-2">
        <div className="border-b border-border pb-2">
          <p className="font-semibold text-card-foreground text-sm">
            {data.name}
          </p>
          <p className="text-xs text-muted-foreground">{data.person}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(data.date).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isIncome ? 'Income' : 'Expense'}
            </span>
            <span
              className={`font-mono text-sm font-medium ${isIncome ? 'text-primary' : 'text-destructive'}`}
            >
              {isIncome ? '+' : '-'}${Math.abs(data.amount).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Running Total</span>
            <span className="font-mono text-sm font-medium">
              ${data.cumulative.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Legend = () => (
  <div className="flex items-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: COLORS.income }}
      />
      <span>Income</span>
    </div>
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: COLORS.expense }}
      />
      <span>Expense</span>
    </div>
  </div>
);

export const EmptyState = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <div className="text-2xl mb-2">📊</div>
      <div className="text-sm">No data</div>
    </div>
  </div>
);
