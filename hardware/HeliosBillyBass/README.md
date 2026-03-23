# HeliosBillyBass

Consolidated Arduino animatronics workspace with full history preserved via git subtree.

## Overview

This repository groups multiple firmware efforts for the singing fish and supporting Helios documentation. It provides a unified workspace for developing and maintaining Arduino-based control systems for Big Mouth Billy Bass animatronics.

## Repository Structure

  - `projects/billy-bass-v2/` – fresh attempt at controlling the fish
  - `projects/archive/billy-bass-bluetooth/` – archived Bluetooth Billy Bass prototype (read-only)
  - `projects/helios/` – documentation site, examples, and supporting materials
  - `shared/` – shared libraries and utilities
    - `libraries/` – common Arduino libraries (MX1508, arduinoFFT)
    - `utils/` – shared utility functions and configuration
- `docs/` – hardware setup and minimal shared docs

Each project keeps its own source, docs, and libraries within its folder, while shared resources are available to all projects.

## Projects

### Billy Bass Bluetooth (Archived)
**Location:** `projects/archive/billy-bass-bluetooth/BTBillyBass/`  
**Entry Point:** `BTBillyBass.ino`

Arduino-based controller for Big Mouth Billy Bass animatronic fish with audio reactivity.

**Features:**
- Audio-reactive mouth and body/tail movement
- Manual control via serial commands
- Calibration of timing and speed
- Safety limits and debug tooling

**Hardware Requirements:**
- Arduino Uno/Nano
- 2x MX1508 motor drivers
- Big Mouth Billy Bass
- Microphone/sound sensor → A0
- Pins: A0 (audio), D3/D5 (mouth), D6/D9 (body)

**Documentation:** See `projects/archive/billy-bass-bluetooth/BTBillyBass/docs/` for detailed guides.

### Billy Bass V2 (Active Development)
**Location:** `projects/billy-bass-v2/`  
**Entry Point:** `billybass_v2.ino`

Fresh starting point for a new attempt to control Big Mouth Billy Bass. This is the active development branch.


## Getting Started

1. **For new development:** Navigate to `projects/billy-bass-v2/` and open `billybass_v2.ino` in the Arduino IDE.

2. **For reference:** Check `projects/archive/billy-bass-bluetooth/BTBillyBass/` for the archived prototype implementation.

3. **For documentation:** See `docs/` for shared guides or `projects/helios/docs/` for comprehensive project documentation.

4. **For hardware setup:** See `docs/hardware-setup.md` for common hardware configuration.

5. **For shared utilities:** Use `shared/utils/` for common functions and configuration.

## Development Conventions

- Add new firmware projects under `projects/<project-name>/`
- Keep each project self-contained with its own source, docs, examples, and libraries
- Shared utilities may later live under top-level `tools/` or `shared/`

## History

This monorepo consolidates previous repositories while preserving their history. It replaces legacy `btb/` and `helios/` content with a clearer `projects/` layout.

## License

MIT License - See individual project directories for specific license details.

## Credits

- Original Code: Jordan Bunker <jordan@hierotechnics.com> (2019)
- Enhancements: Manual control with timed actions and documentation suite
- Hardware: Big Mouth Billy Bass animatronic
