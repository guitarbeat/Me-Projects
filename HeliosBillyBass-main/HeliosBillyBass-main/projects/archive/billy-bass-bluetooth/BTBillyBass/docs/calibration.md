# Calibration Guide

Use these commands to tune movement timing and speed.

## Defaults on startup
- Mouth timing: 400 ms open, 400 ms close
- Body timing: 800 ms forward, 800 ms back
- Mouth speed: 100
- Body speed: 100

## Commands
- `p` Print current settings
- `t` Mouth timing setup: enter open, then close (ms)
- `y` Body timing setup: enter forward, then back (ms)
- `m` Mouth speed (0–180)
- `n` Body speed (0–180)

## Tips
- Start with lower speeds (100) and shorter times (200–300 ms) during initial tests
- Increase gradually until movement completes smoothly without stalling
- If motors get warm or sound strained, reduce speed or increase timing
- Keep within `MAX_MOVEMENT_TIME = 1000 ms` and `MAX_SPEED = 180`