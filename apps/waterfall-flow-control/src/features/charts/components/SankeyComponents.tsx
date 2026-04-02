import * as d3 from 'd3';

export const SankeyEmptyState = () => (
  <div className="h-full flex items-center justify-center">
    <div className="text-center text-muted-foreground">
      <div className="text-2xl mb-2">🌊</div>
      <div className="text-sm">No data</div>
    </div>
  </div>
);

export const SankeyLegend = ({
  colorScale,
  isMobile,
}: {
  colorScale: d3.ScaleOrdinal<string, string>;
  isMobile: boolean;
}) => (
  <div
    className={`flex items-center justify-center gap-${isMobile ? '2' : '4'} mt-2 text-xs text-muted-foreground`}
  >
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded"
        style={{ backgroundColor: colorScale('revenue') }}
      ></div>
      <span className={isMobile ? 'text-xs' : ''}>Revenue</span>
    </div>
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded"
        style={{ backgroundColor: colorScale('balance') }}
      ></div>
      <span className={isMobile ? 'text-xs' : ''}>Balance</span>
    </div>
    <div className="flex items-center gap-1">
      <div
        className="w-2 h-2 rounded"
        style={{ backgroundColor: colorScale('expense') }}
      ></div>
      <span className={isMobile ? 'text-xs' : ''}>Expense</span>
    </div>
  </div>
);
