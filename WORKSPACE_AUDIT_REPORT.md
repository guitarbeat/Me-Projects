# Workspace Audit Report

## 1. Directory Merge Analysis

Based on the directory structure analysis, several directories share similar semantic meanings and can be logically merged or standardized to reduce cognitive load and simplify the workspace.

### A. Testing & Verification Directories
**Current Paths:**
- `*/verification/` (e.g., `finished-applications/HeliosBillyBass/verification`, `finished-applications/flomo/verification`, `finished-applications/waterfall-flow-control/verification`, `wip/FlowMail/verification`)
- `*/src/test/` or `*/test/` (e.g., `finished-applications/flomo/src/test`, `finished-applications/waterfall-flow-control/src/test`, `finished-applications/HeliosBillyBass/projects/billy-b-assistant/test`)

**Semantic Rationale:**
"Verification" (screenshots, validation scripts) and "test" (unit/integration tests) serve the same overarching goal: ensuring the application works as intended. Having them split across root and `src` directories increases cognitive load. They should be unified under a single, descriptive testing directory.

### B. Documentation Directories
**Current Paths:**
- `*/docs/` (e.g., `finished-applications/HeliosBillyBass/docs`, `finished-applications/flomo/docs`, `finished-applications/nini.earth/docs`, `wip/FlowMail/docs`)
- Root-level markdown files (e.g., `README.md`, `API.md`, `CONTRIBUTING.md`, `DEVELOPMENT.md`, `IMPROVEMENTS.md`, `YEAR_GRID_GUIDE.md`, `todo.md`)

**Semantic Rationale:**
While `README.md` should remain at the root as the entry point, other markdown guides and documents clutter the root directory. They share the semantic purpose of documentation and should all reside within the `docs/` folder.

### C. Agent Configuration Directories
**Current Paths:**
- `*/.Jules/` (e.g., `finished-applications/HeliosBillyBass/.Jules`, `finished-applications/flomo/.Jules`, `finished-applications/scanforge/.Jules`, `finished-applications/waterfall-flow-control/.Jules`)
- `*/.lovable/`
- `wip/.kiro/`

**Semantic Rationale:**
As per memory constraints, we should standardise on the lowercase `.jules/` directory for configuration and metadata files to prevent case-sensitive path collisions across different operating systems. All agent-specific configurations should be unified or at least strictly follow this lowercase convention.

## 2. Naming Suggestions

To make the workspace "hyper-descriptive" and intuitive:

| Current Name | Proposed Name | Rationale |
|---|---|---|
| `verification/` & `src/test/` | `__tests__/` or `.tests/` | Standardized naming convention for all testing-related files (unit tests, E2E tests, visual verification screenshots). |
| `finished-applications/` | `apps/` | Shorter, standard monorepo convention. The "finished" status is implied if it's not in `wip/` or can be handled via tags/metadata. |
| `wip/` | `drafts/` or `incubator/` | "wip" is fine, but "drafts" clearly indicates these are projects not yet ready for production use. |
| `docs/` & various root `.md` files | `docs/` | Consolidate `CONTRIBUTING.md`, `DEVELOPMENT.md`, etc., into `docs/guides/` or `docs/internal/`. |
| `.Jules/` | `.jules/` | Standardize to lowercase to prevent OS path collision issues as noted in memory. |

## 3. Proposed Visual Directory Layout

This layout demonstrates the streamlined, consolidated structure.

```text
.
├── apps/                        # Replaces finished-applications/
│   ├── HeliosBillyBass/
│   │   ├── .jules/              # Standardized lowercase
│   │   ├── docs/                # Contains all .md files except README
│   │   │   ├── guides/
│   │   │   └── reference/
│   │   ├── projects/
│   │   ├── shared/
│   │   ├── src/
│   │   └── __tests__/           # Replaces verification/ & test/
│   ├── flomo/
│   │   ├── .jules/
│   │   ├── config/
│   │   ├── docs/
│   │   ├── public/
│   │   ├── src/
│   │   ├── supabase/
│   │   └── __tests__/           # Contains visual verifications & unit tests
│   ├── lenticular-lab/
│   ├── nini.earth/
│   ├── scanforge/
│   └── waterfall-flow-control/
├── incubator/                   # Replaces wip/
│   └── FlowMail/
│       ├── .jules/
│       ├── docs/
│       ├── client/
│       ├── server/
│       ├── shared/
│       ├── scripts/
│       └── __tests__/
└── package.json
```
