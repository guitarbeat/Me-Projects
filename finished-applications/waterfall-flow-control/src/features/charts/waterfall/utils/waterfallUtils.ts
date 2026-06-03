export const COLORS = {
  income: 'hsl(var(--primary))',
  expense: 'hsl(var(--destructive))',
  text: 'hsl(var(--muted-foreground))',
  background: 'hsl(var(--background))',
} as const;

export const getPersonColor = (isIncome: boolean, person?: string): string => {
  if (isIncome) return '#10B981'; // Emerald - matching sankey

  // For expenses, use same colors as sankey diagram
  const personColors: Record<string, string> = {
    'Aaron Woods': '#10B981', // Emerald - for Aaron Woods
    'Yvonne Bledsoe': '#8B5CF6', // Violet - for Yvonne Bledsoe
    Brandon: '#F59E0B', // Amber - for Brandon
    'IRS/Other': '#6B7280', // Gray - for IRS/Other
  };

  return personColors[person || ''] || '#EF4444'; // Default red for other expenses
};
