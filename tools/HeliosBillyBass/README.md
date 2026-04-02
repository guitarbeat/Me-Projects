# HeliosBillyBass

Consolidated animatronics workspace for Big Mouth Billy Bass firmware, assistant tooling, and shared hardware resources.

## Overview

This repository keeps the Billy Bass work in one place without mixing the different tracks together. Active firmware, archived experiments, the Raspberry Pi assistant stack, shared libraries, and supporting docs each have a clear home.

## Repository Structure

- `projects/billy-bass-v2/` - active Arduino firmware work
- `projects/archive/` - archived prototypes and earlier experiments
- `projects/billy-b-assistant/` - Raspberry Pi assistant, tests, setup scripts, and web configuration UI
- `shared/` - reusable libraries and utility code
- `docs/` - shared hardware guides and historical notes
- `verification/` - saved screenshots from verification runs

## Projects

### Billy Bass V2

**Location:** `projects/billy-bass-v2/`  
**Entry Point:** `billybass_v2.ino`

Fresh starting point for current Arduino-based control work.

### Billy Bass Bluetooth (Archived)

**Location:** `projects/archive/billy-bass-bluetooth/BTBillyBass/`  
**Entry Point:** `BTBillyBass.ino`

Archived Bluetooth-enabled controller kept for reference.

### Billy B Assistant

**Location:** `projects/billy-b-assistant/`  
**Entry Point:** `main.py`

Python-based voice assistant project with sound assets, setup scripts, tests, and a local web configuration flow.

## Getting Started

1. For Arduino work, open `projects/billy-bass-v2/billybass_v2.ino` in the Arduino IDE.
2. For archived reference code, browse `projects/archive/billy-bass-bluetooth/BTBillyBass/`.
3. For the assistant workflow, start with `projects/billy-b-assistant/README.md`.
4. For shared hardware guidance, use `docs/hardware-setup.md`.
5. For reusable helpers, check `shared/utils/`.

## Development Conventions

- Add new firmware work under `projects/<project-name>/`.
- Keep project-specific assets with the project that uses them.
- Put cross-project libraries and helpers in `shared/`.
- Save verification screenshots under `verification/`.

## History

This monorepo replaces earlier fragmented Billy Bass repositories with a cleaner `projects/`, `shared/`, `docs/`, and `verification/` layout.

## License

MIT License. See project directories for any project-specific notes.

## Credits

- Original code: Jordan Bunker <jordan@hierotechnics.com> (2019)
- Enhancements: Manual control, timed actions, assistant tooling, and documentation
- Hardware: Big Mouth Billy Bass animatronic
