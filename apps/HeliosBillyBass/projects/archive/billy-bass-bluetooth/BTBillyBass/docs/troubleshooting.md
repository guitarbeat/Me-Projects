# Troubleshooting

## Fish won't move
- Check 5V and grounds
- Verify MX1508 VCC and IN pins
- Confirm correct Arduino pins (D3/D5, D6/D9)
- Send `r` to reset motors

## Audio not working
- Sensor SIG to A0
- `a` to enable audio
- `l` to exit manual mode
- Lower `SILENCE_THRESHOLD` in `src/core/Config.h` if needed

## Erratic movement
- Tighten mechanical connections
- Reduce speed; increase timing
- Ensure stable 5V supply

## Serial commands not working
- Serial Monitor at 9600 baud
- Close/reopen the monitor
- Re-upload the sketch

## Emergency
- `r` resets motors to home
- Power cycle if unresponsive