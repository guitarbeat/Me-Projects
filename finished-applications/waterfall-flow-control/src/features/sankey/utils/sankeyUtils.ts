import * as d3 from 'd3';

export const createColorScale = () => {
  return d3
    .scaleOrdinal<string>()
    .domain(['revenue', 'balance', 'expense'])
    .range([
      'hsl(var(--primary))',
      'hsl(var(--accent))',
      'hsl(var(--destructive))',
    ]);
};
