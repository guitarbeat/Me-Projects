# Troubleshooting

Common issues and fixes for development and production.

## Build and dev server
- Port already in use
  - Change port in `gulpfile.mjs` BrowserSync config or free the port
  - Check usage: `lsof -i :3000` then `kill -9 <PID>`
- Gulp build errors
  - Clear modules and reinstall:
    ```bash
    rm -rf node_modules package-lock.json
    npm install
    ```
- BrowserSync not opening
  - Ensure dependencies installed; check console output for errors

## Audio playback
- Audio not playing (especially on iOS)
  - iOS requires user interaction before playing audio
  - Start ambient audio only after a click/tap
  - Consider `ambientSound = false` for iOS

## Visual effects
- CRT effect not visible
  - Verify `crtEffect = true`
  - Ensure CRT CSS is included and not overridden

## Share popups
- Popups blocked by browser
  - Many browsers block window popups by default
  - Consider Web Share API as a fallback on supported devices

## Performance
- Page feels slow
  - Optimize images (WebP + responsive sources)
  - Use compressed audio formats and lazy loading
  - Avoid excessive DOM manipulations; debounce frequent events

## Compatibility
- Supported browsers
  - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
  - IE11 supported with polyfills (limited)