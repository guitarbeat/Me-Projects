export interface ChartData {
  name: string;
  date: string;
  amount: number;
  balance: number;
  person: string;
  cumulative: number;
}

export interface WaterfallDataPoint {
  name: string;
  date: string;
  amount: number;
  cumulative: number;
  person: string;
  stackBase: number;
  displayAmount: number;
  shortDate: string;
  isIncome: boolean;
  isExpense: boolean;
  stepValue: number;
  openValue: number;
}

export const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${Math.abs(value).toLocaleString()}`;
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const processWaterfallData = (
  data: ChartData[]
): WaterfallDataPoint[] => {
  const sortedTransactions = [...data].sort((a, b) => {
    if (a.amount > 0 && b.amount <= 0) return -1;
    if (a.amount <= 0 && b.amount > 0) return 1;
    // Optimize date sorting by using string comparison for ISO dates
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
  });

  let runningTotal = 0;
  return sortedTransactions.map(transaction => {
    const openValue = runningTotal;
    runningTotal += transaction.amount;

    return {
      name: transaction.name,
      date: transaction.date,
      amount: transaction.amount,
      cumulative: runningTotal,
      person: transaction.person,
      stackBase: transaction.amount >= 0 ? openValue : runningTotal,
      displayAmount: Math.abs(transaction.amount),
      shortDate: formatShortDate(transaction.date),
      isIncome: transaction.amount > 0,
      isExpense: transaction.amount < 0,
      stepValue: runningTotal,
      openValue: openValue,
    };
  });
};

export const calculateChartBounds = (waterfallData: WaterfallDataPoint[]) => {
  const allValues = waterfallData.flatMap(d => [d.cumulative, d.openValue, 0]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = Math.max(maxValue - minValue, 1000);
  const padding = range * 0.2;

  return {
    min: minValue - padding,
    max: maxValue + padding,
  };
};
