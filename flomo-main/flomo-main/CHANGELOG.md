# Changelog

All notable changes to Flo and Tell will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Major refactoring of component architecture for better maintainability
- Improved TypeScript type safety with dedicated type files

## [1.0.1] - 2025-10-06

### Fixed

- **Critical**: Fixed authentication timeout issues (increased from 4-5s to 10s)
- **Critical**: Updated edge function to use modern Deno imports
- Fixed RPC function timeouts in user profile fetching
- Resolved compilation errors in Calendar component

### Added

- Created `CalendarGrid` component for better code organization
- Added `useCalendarNavigation` custom hook for calendar state management
- Added TypeScript type definitions in `src/types/calendar.ts` and `src/types/user.ts`
- Created comprehensive `REFACTORING_PLAN.md` documentation
- Added `CHANGELOG.md` to track version history

### Changed

- Refactored Calendar component to use modular hooks
- Updated README.md with better quick start instructions
- Updated todo.md with recent completion status
- Improved error handling in authentication flow

### Technical

- Increased timeout values for better reliability in slow network conditions
- Modernized Deno edge function imports to use JSR
- Enhanced component reusability and separation of concerns

## [1.0.0] - 2025-09-25

### Added

- Initial release of Flo and Tell
- Period tracking with calendar interface
- User profiles with cat avatars
- Dark mode support
- Anonymous authentication system
- Admin dashboard for user management
- Floating user bubbles for quick login
- AI-powered cycle insights
- Responsive design for mobile and desktop

### Features

- Username-based authentication (no passwords)
- Period day tracking and visualization
- Cycle predictions and statistics
- Multi-user support with profiles
- Real-time updates
- Supabase backend integration

[Unreleased]: https://github.com/yourusername/flo-and-tell/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/yourusername/flo-and-tell/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/yourusername/flo-and-tell/releases/tag/v1.0.0
