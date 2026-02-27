# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation improvements
- Contributing guidelines
- Changelog tracking
- Better project structure documentation
- **Complete README.md with installation, usage, and N8N integration guides**
- **N8N Integration Documentation** with webhook setup and workflow examples

### Changed
- Updated README with better structure and information
- Removed outdated Vue Cal integration documentation
- Cleaned up unused dependencies from package.json
- Fixed TODO comment in EmotionalCalendar component

### Fixed
- **Critical TypeScript compilation errors** - build now passes successfully
- **Unused variables in App.tsx** - commented out for future toolbar implementation
- **N8NDataExport.tsx button variant props** - changed from `variant` to `$variant`
- **SplitScreen component export issues** - properly exported SplitScreenProps interface
- **Security vulnerabilities** - applied safe npm audit fixes for axios and brace-expansion
- Removed unused imports and prepared functions for future features

### Removed
- Outdated VUE_CAL_INTEGRATION.md file
- Unused dependencies: @emotion/react, @emotion/styled, @fullcalendar/*, @mui/*, date-fns, firebase, moment, react-big-calendar, react-dnd, react-grid-layout

## [1.0.0] - 2024-12-19

### Added
- Initial release of Tampana emotion tracking application
- Interactive calendar with Vue Cal integration
- Emoji grid for emotion selection
- Dark theme support
- Multiple calendar views (day, week, month)
- Customizable interface options
- Responsive design
- TypeScript support
- Testing setup with Jest and React Testing Library

### Features
- Emotion tagging for calendar events
- Drag and drop emoji selection
- Real-time calendar updates
- Customizable time formats
- Weekend toggle functionality
- Event creation and editing
- Visual feedback for emotional states