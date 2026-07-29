# Agent notes (single source of truth)

All Jules / Lovable / Kiro agent journals, plans, and specs for this monorepo live **here**. Do not recreate per-app `.jules/`, `.lovable/`, or `.kiro/` content trees.

Thin redirect stubs may exist at old tool paths (`apps/*/.lovable/README.md`, `incubator/.kiro/README.md`); they point back to this tree only.

## Layout

```text
.jules/
  shared/           # Cross-app learnings
  apps/<folder>/    # Per finished app (matches apps/ kebab folder)
    bolt.md         # Performance
    palette.md      # Accessibility
    sentinel.md     # Security
    plans/          # Feature plans (formerly .lovable)
  incubator/<folder>/
    specs/          # Specs & audits (formerly .kiro)
```

## Index

| Path | Contents |
|------|----------|
| [`shared/bolt.md`](shared/bolt.md) | Cross-app date / sorting perf notes |
| [`shared/ui-sot.md`](shared/ui-sot.md) | Shared UI package convention |
| [`apps/flo-and-tell/`](apps/flo-and-tell/) | bolt, palette, sentinel + plans |
| [`apps/harmonic-studio/`](apps/harmonic-studio/) | bolt, palette, sentinel |
| [`apps/helios-billy-bass/`](apps/helios-billy-bass/) | palette |
| [`apps/scanforge/`](apps/scanforge/) | bolt, palette, sentinel |
| [`incubator/flowmail/specs/`](incubator/flowmail/specs/) | Modular architecture verification |

## Out of scope

- App CI: `apps/*/.github/`, root `.github/`
- IDE settings: `incubator/.vscode/`
- Product docs: each app’s `docs/`
