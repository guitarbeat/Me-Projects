# Project Organization

## Overview

This document describes the organized structure of the cycle-buddy-calendar project after cleanup and reorganization.

## Directory Structure

### Root Directory

```
cycle-buddy-calendar/
├── src/                    # Source code
├── public/                 # Public assets
├── supabase/              # Database migrations and config
├── config/                 # Configuration files
├── docs/                   # Documentation
├── scripts/                # Build and utility scripts
├── dist/                   # Build output (gitignored)
├── node_modules/           # Dependencies (gitignored)
├── .vercel/                # Vercel deployment config
├── .vscode/                # VS Code settings
├── .git/                   # Git repository
├── .qodo/                  # Qodo workspace
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Lock file
├── pnpm-lock.yaml          # PNPM lock file
├── bun.lockb               # Bun lock file
├── tsconfig.json           # TypeScript configuration
├── tsconfig.node.json      # Node TypeScript config
├── tsconfig.app.json       # App TypeScript config
├── vite.config.ts          # Vite build configuration
├── index.html              # Entry HTML file
├── README.md               # Project readme
├── LICENSE                 # License file
└── .gitignore              # Git ignore rules
```

### Configuration Files (`/config`)

- `eslint.config.js` - ESLint configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - Shadcn/ui components configuration
- `.prettierrc` - Prettier formatting rules

### Documentation (`/docs`)

- `ENVIRONMENT_SETUP.md` - Environment variables setup guide
- `MOBILE_BUBBLE_FIXES.md` - Mobile bubble improvements
- `API.md` - API documentation
- `BUBBLE_IMPROVEMENTS.md` - Bubble system improvements
- `CHANGELOG.md` - Project changelog
- `DEBUGGING_GUIDE.md` - Debugging system guide
- `DEBUG_SYSTEM_SUMMARY.md` - Debug system overview
- `PROJECT_ORGANIZATION.md` - This file

### Scripts (`/scripts`)

- Reserved for build scripts, deployment scripts, and utilities

## Key Improvements Made

### 1. ESLint Configuration

- ✅ Fixed all linting issues
- ✅ Updated configuration for TypeScript support
- ✅ Added proper React hooks rules
- ✅ Fixed conditional hook calls in FloatingUserBubbles

### 2. Code Quality

- ✅ Removed unused imports and variables
- ✅ Fixed React hooks rules violations
- ✅ Improved error handling in AuthContext
- ✅ Added timeout fallbacks for authentication

### 3. Security

- ✅ Moved API keys to Vercel environment variables
- ✅ Created local `.env.local` for development
- ✅ Removed hardcoded credentials from source code
- ✅ Updated `.gitignore` for security

### 4. Organization

- ✅ Grouped configuration files in `/config`
- ✅ Organized documentation in `/docs`
- ✅ Created `/scripts` folder for future utilities
- ✅ Cleaned up empty and duplicate files

## Development Workflow

### Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint code
npm run lint

# Build for production
npm run build
```

### Environment Variables

- **Development**: Uses `.env.local` file
- **Production**: Uses Vercel environment variables
- **Security**: No credentials in source code

### Configuration

- All config files are in `/config` directory
- ESLint config updated to work from new location
- Package.json scripts updated accordingly

## Maintenance

### Adding New Configuration

1. Place new config files in `/config` directory
2. Update package.json scripts if needed
3. Test that the configuration works

### Adding Documentation

1. Place new docs in `/docs` directory
2. Update this file if adding new categories
3. Keep documentation organized and searchable

### Code Quality

1. Run `npm run lint` before committing
2. Fix any new linting issues
3. Follow the established patterns in the codebase

## Benefits of This Organization

1. **Cleaner Root Directory** - Easier to find important files
2. **Better Separation of Concerns** - Config, docs, and source code separated
3. **Improved Maintainability** - Related files grouped together
4. **Enhanced Security** - Sensitive files properly gitignored
5. **Professional Structure** - Follows industry best practices
6. **Easier Onboarding** - New developers can quickly understand the project structure
