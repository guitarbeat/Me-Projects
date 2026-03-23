# Project Structure

This document describes the organization of the Tampana project.

## Directory Layout

### `/config` - Configuration Files
All build tool, linter, and framework configuration files are consolidated here:
- **eslint.config.js** - ESLint linting rules
- **jest.config.cjs** - Jest testing framework configuration
- **postcss.config.js** - PostCSS processing configuration
- **tailwind.config.ts** - Tailwind CSS utility framework configuration
- **tsconfig.*.json** - TypeScript compiler configurations
- **vite.config.ts** - Vite build tool configuration
- **components.json** - shadcn/ui component library configuration
- **.jscpd.json** - Code duplication detection configuration

### `/docs` - Documentation
All project documentation is organized here:
- **CHANGELOG.md** - Version history and release notes
- **CODE_OF_CONDUCT.md** - Community guidelines
- **CONTRIBUTING.md** - Development and contribution guidelines
- **DEPLOYMENT.md** - Deployment instructions and procedures
- **ERROR_HANDLING.md** - Error handling patterns
- **NEWSPRINT_DESIGN_SYSTEM.md** - Design system documentation
- **UI_COMPONENT_STANDARD.md** - UI component library standard and migration guide
- **SECURITY.md** - Security policies and vulnerability reporting
- **SUPPORT.md** - Support resources and help
- **TODO.md** - Development roadmap and priorities
- **archive/** - Historical documentation and migration artifacts

### `/src` - Source Code
Application source code:
- **components/** - React components organized by feature
  - **ui/** - shadcn/ui base components (buttons, cards, inputs, etc.)
  - **common/** - Common utilities and compatibility wrappers
  - **emotion/** - Emotion tracking components
  - **n8n/** - N8N integration components
  - **features/** - Feature-specific components
  - See [UI Component Standard](./UI_COMPONENT_STANDARD.md) for details
- **contexts/** - React context providers
- **hooks/** - Custom React hooks
- **integrations/** - Third-party integrations (Supabase, etc.)
- **lib/** - Utility libraries and helpers
- **pages/** - Page components
- **services/** - Business logic and API services
- **types/** - TypeScript type definitions

### `/public` - Static Assets
Static files served directly:
- Images, icons, and other assets
- Service worker files
- Manifest files

### `/scripts` - Build Scripts
Utility scripts for development and deployment:
- Build verification scripts
- Deployment checks
- Analysis tools

### `/supabase` - Supabase Configuration
Supabase backend configuration and migrations

### Root Directory
The root directory contains only essential files:
- **package.json** - Project dependencies and scripts
- **README.md** - Project overview and quick start
- **index.html** - Application entry point
- **.gitignore** - Git ignore rules
- **pnpm-lock.yaml** - Dependency lock file
- Configuration wrappers (lightweight files that reference /config)

## Configuration Wrappers

Configuration files in the root (like `eslint.config.js`, `vite.config.ts`) are lightweight wrappers that re-export the actual configurations from the `/config` directory. This approach:
- Keeps the root directory clean
- Maintains tool compatibility (tools expect configs in root)
- Centralizes actual configuration in `/config`

Example wrapper:
```javascript
// Root: eslint.config.js
import actualConfig from './config/eslint.config.js';
export default actualConfig;
```

## Archive Directory

The `/docs/archive` directory preserves historical documentation:
- **migration/** - Documentation from previous migration efforts
  - Dependency analysis reports
  - Import path mapping documentation
  - Integration summaries
  - Migration reports

These files provide context about architectural decisions and project evolution.

## Benefits of This Structure

1. **Clean Root** - Only 12 files in root directory (target: ≤15)
2. **Organized Configs** - All configuration in one place
3. **Centralized Docs** - Easy to find project information
4. **Preserved History** - Migration artifacts archived for reference
5. **Maintainable** - Clear conventions for future development
6. **Tool Compatible** - Wrappers maintain compatibility with build tools

## Finding Configuration

When you need to modify configuration:
1. Check the root for wrapper files
2. Follow the import to `/config` directory
3. Edit the actual configuration file in `/config`
4. The wrapper automatically uses your changes

## Finding Documentation

All documentation is in `/docs`:
- Active documentation at `/docs/*.md`
- Historical documentation at `/docs/archive/`
- README.md stays in root per GitHub convention
