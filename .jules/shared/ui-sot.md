# Shared UI SoT

Canonical package: `packages/ui` → `@me-projects/ui`.

Consumers today: `apps/flo-and-tell`, `incubator/flowmail`.

## Put here

- `cn()`
- `ThemeProvider` / `useTheme` (`theme: 'light' | 'dark'`, `.dark` class)
- `useToast` / toast primitives / `Toaster`
- Near-identical shadcn primitives (label, avatar, tooltip, card, tabs, select, alert-dialog)
- Tailwind preset (`@me-projects/ui/tailwind-preset`) — semantic colors, radius, accordion

## Keep app-local

- Brand tokens and fonts (flo coral/Comfortaa; flowmail `--app-*` panels)
- Branded `button` / `input`
- Auth / Supabase
- CDN Tailwind apps (harmonic-studio, lenticular-lab, scanforge) until they migrate

## Rule

Do not re-copy shared shadcn primitives into apps. Re-export from `@me-projects/ui` or import directly.
