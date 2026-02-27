# Quick Start

This guide gets Billy Bass moving in minutes.

## Prerequisites

- Arduino Uno/Nano
- 2x MX1508 motor drivers
- Big Mouth Billy Bass toy
- Microphone/sound sensor → A0
- Breadboard, jumpers, 5V/2A supply
- Arduino IDE 1.8.x/2.x
- MX1508 library (included in `libraries/MX1508` or install via Library Manager)

## Wiring

- Mouth motor → MX1508 Driver 1 → Arduino D5, D3
- Body/tail motor → MX1508 Driver 2 → Arduino D6, D9
- Microphone/sensor → 5V, GND, Signal → A0
- Power: 5V to Arduino VIN and MX1508 VCC; GNDs common

## Upload & Run

1. Open `BTBillyBass.ino`
2. Select correct board/port
3. Upload
4. Open Serial Monitor at 9600 baud
5. You should see a welcome banner; type `h` for the menu

## First Test

- `o` open mouth, `c` close mouth
- `f` flap tail, `b` body forward
- `r` reset to home

## Enable Audio Reactivity

- `a` toggles audio reactivity
- `l` toggles manual/auto (audio reactivity works when manual is OFF)

## Optional Calibration

- `p` print current settings
- `t` set mouth timing (open,close in ms)
- `y` set body timing (forward,back in ms)
- `m` set mouth speed (0–180)
- `n` set body speed (0–180)

Defaults on first boot:

- Mouth times: 400ms open, 400ms close
- Body times: 800ms forward, 800ms back
- Speeds: mouth 100, body 100

## Troubleshooting

- No motion: check 5V, grounds, driver IN pins
- Audio not reactive: sensor to A0, `a` to enable, `l` to exit manual
- Erratic: reduce speeds, increase timings, ensure solid power

For deeper details see Technical Overview and Troubleshooting.