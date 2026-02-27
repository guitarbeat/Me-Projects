# Design Document: Root Directory Restructuring

## Overview

This design describes a systematic approach to reorganizing the project root directory by consolidating configuration files, organizing documentation, archiving migration artifacts, and establishing a clean, maintainable structure.

## Target Structure

```
root/
├── .git/                    # Git repository
├── .github/                 # GitHub workflows
├── .kiro/                   # Kiro specs and config
├── .lovable/                # Lovable config
├── .vscode/                 # VS Code settings
├── config/                  # All configuration files
│   ├── eslint.config.js
│   ├── jest.config.cjs
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── tsconfig.jest.json
│   ├── vite.config.ts
│   ├── components.json
│   └── .jscpd.json
├── docs/                    # All documentation
│   ├── README.md → ../README.md (symlink or keep in root)
│   ├── CHANGELOG.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── DEPLOYMENT.md
│   ├── ERROR_HANDLING.md
│   ├── NEWSPRINT_DESIGN_SYSTEM.md
│   ├── NEWSPRINT_IMPLEMENTATION_SUMMARY.md
│   ├── SECURITY.md
│   ├── SUPPORT.md
│   ├── TODO.md
│   └── archive/
│       └── migration/
│           ├── DEPENDENCY_ANALYSIS.md
│           ├── IMPORT_PATH_MAPPING.md
│           ├── INTEGRATION_SUMMARY.md
│           └── MIGRATION_REPORT.md
├── node_modules/            # Dependencies
├── packages/                # Monorepo packages
├── public/                  # Static assets
├── scripts/                 # Build and utility scripts
├── src/                     # Source code
├── supabase/                # Supabase config
├── .gitignore              # Git ignore rules
├── index.html              # Entry HTML
├── package.json            # Package manifest
├── pnpm-lock.yaml          # Lock file
└── README.md               # Project readme
```

## File Movement Plan

### Phase 1: Configuration Consolidation

**Move to /config:**
- `eslint.config.js` → `config/eslint.config.js` (already exists, verify)
- `jest.config.cjs` → `config/jest.config.cjs` (already exists, verify)
- `postcss.config.js` → `config/postcss.config.js` (already exists, verify)
- `tailwind.config.ts` → `config/tailwind.config.ts` (already exists, verify)
- `tsconfig.json` → `config/tsconfig.json` (already exists, verify)
- `tsconfig.app.json` → `config/tsconfig.app.json` (already exists, verify)
- `tsconfig.node.json` → `config/tsconfig.node.json` (already exists, verify)
- `tsconfig.jest.json` → `config/tsconfig.jest.json`
- `vite.config.ts` → `config/vite.config.ts` (already exists, verify)
- `components.json` → remove (duplicate of config/components.json)

### Phase 2: Documentation Organization

**Move to /docs:**
- `CHANGELOG.md` → `docs/CHANGELOG.md`
- `CODE_OF_CONDUCT.md` → `docs/CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md` → `docs/CONTRIBUTING.md`
- `DEPLOYMENT.md` → `docs/DEPLOYMENT.md`
- `SECURITY.md` → `docs/SECURITY.md`
- `SUPPORT.md` → `docs/SUPPORT.md`

**Move to /docs/archive/migration:**
- `DEPENDENCY_ANALYSIS.md` → `docs/archive/migration/DEPENDENCY_ANALYSIS.md`
- `IMPORT_PATH_MAPPING.md` → `docs/archive/migration/IMPORT_PATH_MAPPING.md`
- `INTEGRATION_SUMMARY.md` → `docs/archive/migration/INTEGRATION_SUMMARY.md`
- `MIGRATION_REPORT.md` → `docs/archive/migration/MIGRATION_REPORT.md`

**Delete:**
- `migration-analysis.json` (temporary artifact)
- `typecheck_errors.log` (temporary log file)

**Keep in root:**
- `README.md` (GitHub convention)

### Phase 3: Reference Updates

**Files that need updates:**

1. **package.json** - Update script references to config files
2. **vite.config.ts** - Update tsconfig references
3. **jest.config.cjs** - Update tsconfig references
4. **tsconfig.json** - Update extends paths
5. **tsconfig.app.json** - Update extends paths
6. **tsconfig.node.json** - Update extends paths
7. **tsconfig.jest.json** - Update extends paths
8. **README.md** - Update documentation links
9. **.github/workflows/** - Update config file paths if referenced

## Implementation Strategy

### Step 1: Verify Duplicates
- Compare root config files with /config versions
- Identify which version is more recent/correct
- Document any differences

### Step 2: Move Configuration Files
- Move unique config files to /config
- Remove duplicate root config files
- Update all references in package.json and other configs

### Step 3: Organize Documentation
- Create /docs/archive/migration directory
- Move documentation files to appropriate locations
- Delete temporary artifacts

### Step 4: Update References
- Update all import paths
- Update all config file references
- Update documentation links

### Step 5: Verify
- Run build to ensure configs work
- Run tests to ensure everything still works
- Check for broken links in documentation

## Risk Mitigation

1. **Backup**: Git commit before starting ensures rollback capability
2. **Incremental**: Move files in phases to isolate issues
3. **Verification**: Test after each phase
4. **Documentation**: Update README with new structure

## Success Criteria

- Root directory contains ≤15 files
- All configuration in /config directory
- All documentation in /docs directory
- All builds and tests pass
- No broken references or links
