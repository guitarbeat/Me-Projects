# Waterfall Flow Control

Component library extract (Sankey, waterfall charts, transactions, CSV import, split layout).

This is **not** a standalone npm workspace app. It depends on host-app aliases such as `@/components/ui`, `@/lib/utils`, `next-themes`, and `d3`.

## Layout

- `sankey/` — Sankey chart
- `waterfall/` — waterfall chart UI
- `transactions/` — transaction table and hooks
- `csv-import/` — CSV mapping dialog
- `CashFlowCharts/` — chart selector shell
- `SplitLayout.tsx` — dual-pane layout

Integrate by copying or linking these modules into a host React app that provides the shared UI kit.
