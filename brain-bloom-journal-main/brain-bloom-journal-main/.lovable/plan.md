

## Plan: Delete the `packages/` Directory

Since all code from `packages/` has been fully migrated into `src/`, the entire `packages/` directory is dead code and should be removed.

### What will be deleted

The following directories and all their contents:

- `packages/design-tokens/` -- migrated to `src/index.css` and `src/styles/themes.css`
- `packages/features/` -- migrated to `src/components/features/`, `src/components/Calendar/`, `src/components/SettingsPage/`
- `packages/hooks/` -- migrated to `src/hooks/`
- `packages/services/` -- migrated to `src/services/`
- `packages/styles/` -- migrated to `src/styles/`
- `packages/types/` -- migrated to `src/types/`
- `packages/ui/` -- migrated to `src/components/ui/`
- `packages/utils/` -- migrated to `src/utils/`

### Verification steps before deletion

1. Confirm no files in `src/` import from `packages/` (already verified -- zero matches)
2. Confirm no `@tampana/*` workspace references remain in `package.json` (already done by user)
3. Confirm `vite.config.ts` and `tsconfig.json` aliases point only to `src/` (already updated)

### Post-deletion

- No code changes needed in `src/` -- all imports already reference local paths
- User should generate a lock file by running `npm install` or `bun install` and committing the result

### Technical details

This is a pure cleanup operation: ~80 files deleted, zero files modified. The build should remain unaffected since nothing references `packages/` anymore.

