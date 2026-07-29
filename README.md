# Me-Projects

Personal monorepo of finished apps and incubator work.

## Layout

| Path | Role |
|------|------|
| `apps/` | Finished applications |
| `incubator/` | Work in progress |
| `.jules/` | Shared agent notes (lowercase) |

## Apps

| App | Command | Notes |
|-----|---------|-------|
| FlowMail | `npm run dev:flowmail` | Incubator |
| flomo | `npm run dev:flomo` | |
| lenticular-lab | `npm run dev:lenticular` | |
| nini.earth | `npm run dev:nini` | |
| scanforge | `npm run dev:scanforge` | |
| Harmonic Studio | `npm run dev:harmonic-studio` | `apps/harmonic-studio` |
| HeliosBillyBass | — | Multi-project (Arduino + webconfig); not an npm workspace |
| waterfall-flow-control | — | Component extract only; see its README |

## Quick start

```bash
npm install
npm run dev:flomo   # or another script above
```

Requires Node ≥ 18 and npm ≥ 8.

## Conventions

- Agent config dirs use lowercase `.jules/`
- Visual / ad-hoc verification assets live under `__tests__/`
- App docs belong in each app’s `docs/` (keep root `README.md`)
