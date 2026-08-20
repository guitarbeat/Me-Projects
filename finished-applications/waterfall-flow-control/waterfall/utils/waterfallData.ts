export interface WaterfallChartData {
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

// Fast lookup for month abbreviations to avoid slow toLocaleDateString formatting
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatShortDate = (dateString: string): string => {
  // Fast path for YYYY-MM-DD format (significantly faster than Date parsing)
  if (dateString.length === 10) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      return `${SHORT_MONTHS[m]} ${d}`;
    }
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const processWaterfallData = (
  data: WaterfallChartData[]
): WaterfallDataPoint[] => {
  const sortedTransactions = [...data].sort((a, b) => {
    if (a.amount > 0 && b.amount <= 0) return -1;
    if (a.amount <= 0 && b.amount > 0) return 1;
    // ⚡ Bolt Performance Optimization: Direct string comparison avoids expensive Date allocations in hot loops (~10x faster)
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
  // ⚡ Bolt: Fast manual loop avoids `flatMap` array allocations and `Math.max(...args)` stack overflow limits
  let maxValue = 0;
  let minValue = 0;
  for (let i = 0; i < waterfallData.length; i++) {
    const d = waterfallData[i];
    if (d.cumulative > maxValue) maxValue = d.cumulative;
    if (d.cumulative < minValue) minValue = d.cumulative;
    if (d.openValue > maxValue) maxValue = d.openValue;
    if (d.openValue < minValue) minValue = d.openValue;
  }

  const range = Math.max(maxValue - minValue, 1000);
  const padding = range * 0.2;

  return {
    min: minValue - padding,
    max: maxValue + padding,
  };
};
