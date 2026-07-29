# Me-Projects

Personal monorepo of finished apps and incubator work.

## Layout

| Path | Role |
|------|------|
| `apps/` | Finished applications |
| `incubator/` | Work in progress |
| `packages/ui` | **Shared UI SoT** (`@me-projects/ui`) for shadcn apps — `cn`, toast, ThemeProvider, shared primitives, Tailwind preset |
| `.jules/` | **Single SoT** for agent journals, plans, and specs (see [`.jules/README.md`](.jules/README.md)) |

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
| Agent notes | Root `.jules/` only | `shared/`, `apps/<folder>/`, `incubator/<folder>/` |

Do not recreate per-app `.jules/`, `.lovable/`, or `.kiro/` content trees. Redirect stubs may remain at old tool paths.

### Other

- Visual / ad-hoc verification assets live under `__tests__/`
- App docs belong in each app’s `docs/` (keep root `README.md`)
- **CI SoT:** root [`.github/workflows/`](.github/workflows/) only (nested app `.github/` is unused by GitHub)
- **Lockfile SoT:** root `package-lock.json` (npm workspaces). Nested workspace locks / pnpm locks are removed; Helios `webconfig` keeps its own locks (not a workspace)
- **Prettier / pre-commit SoT:** root `.prettierrc`, `.prettierignore`, `.pre-commit-config.yaml`
- **Shared UI SoT:** [`packages/ui`](packages/ui) (`@me-projects/ui`) for flo-and-tell + flowmail — do not re-copy shadcn primitives; brand CSS stays app-local
- **ESLint:** still per-app for now
- Agent notes: root `.jules/` only; IDE settings (e.g. `incubator/.vscode/`) stay out of `.jules/`

```bash
npm run format        # Prettier write (repo root)
npm run format:check
```
