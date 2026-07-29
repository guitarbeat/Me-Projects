# Me-Projects

Personal monorepo of finished apps and incubator work.

## Layout

| Path | Role |
|------|------|
| `apps/` | Finished applications |
| `incubator/` | Work in progress |
| `.jules/` | Shared agent notes (lowercase) |

## Apps

| Product title | Folder | Command | Notes |
|---------------|--------|---------|-------|
| FlowMail | `incubator/flowmail` | `npm run dev:flowmail` | Incubator |
| Flo and Tell | `apps/flo-and-tell` | `npm run dev:flo-and-tell` | |
| Lenticular Studio | `apps/lenticular-lab` | `npm run dev:lenticular-lab` | |
| Kanye 2049 / niniOS | `apps/nini-earth` | `npm run dev:nini-earth` | |
| ScanForge | `apps/scanforge` | `npm run dev:scanforge` | |
| Harmonic Studio | `apps/harmonic-studio` | `npm run dev:harmonic-studio` | |
| Helios Billy Bass | `apps/helios-billy-bass` | — | Multi-project (Arduino + webconfig); not an npm workspace |
| Waterfall Flow Control | `apps/waterfall-flow-control` | — | Component extract only; see its README |

## Quick start

```bash
npm install
npm run dev:flo-and-tell   # or another script above
```

Requires Node ≥ 18 and npm ≥ 8.

## Conventions

### Naming

| Layer | Form | Example |
|-------|------|---------|
| App folder | `kebab-case` | `flo-and-tell` |
| npm package `name` | same as folder | `"flo-and-tell"` |
| Root scripts | `dev:<folder>` | `dev:flo-and-tell` |
| Product title (UI / README) | Title Case; may differ from folder | Flo and Tell |
| React components | `PascalCase.tsx` | `AppShell.tsx` |
| Hooks | `useCamelCase.ts` | `useToast.ts` |
| shadcn `components/ui` | kebab (library) | `alert-dialog.tsx` |
| Utils / lib | `camelCase.ts` | `n8nClient.ts` |
| Agent config dirs | `.jules/` | lowercase only |

### Other

- Visual / ad-hoc verification assets live under `__tests__/`
- App docs belong in each app’s `docs/` (keep root `README.md`)
