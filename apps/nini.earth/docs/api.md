# Kanye 2049 Tribute - API Reference

This document covers the JavaScript API, configuration options, and customization points.

## Table of Contents
- Global Configuration
- System Object API
- Audio System
- UI Components
- Event System
- Customization Guide
- Performance Considerations
- Browser Support
- Troubleshooting

## Global Configuration
```javascript
var displayBoot = true;    // Controls boot sequence display
var crtEffect = true;      // Enables/disables CRT effect
var ambientSound = false;  // Background ambient audio
```
Compatibility: IE11 polyfills; iOS audio handling; touch optimization.

## System Object API
Properties:
- `view`: jQuery container
- `bios`: jQuery BIOS element
- `started`: boolean
- `loading`: object
- `ambientAudio`: Audio
- `audioPlayer`: HTMLAudioElement
- `isIPhone`: boolean

Methods:
- `system.init()`
- `system.setBodyHeight()`
- `system.setLoading(state)`
- `system.formatAMPM(date)`
- `system.displayTime()`
- `system.boot()`
- `system.resumeTrack()` / `pauseTrack()` / `stopTrack()`

## Audio System
Ambient audio example:
```javascript
system.ambientAudio.loop = true;
system.ambientAudio.volume = 0;
system.ambientAudio.addEventListener('timeupdate', function(){ /* seamless loop */ });
```
Media Session handlers:
```javascript
navigator.mediaSession.setActionHandler('play', () => system.resumeTrack());
navigator.mediaSession.setActionHandler('pause', () => system.pauseTrack());
navigator.mediaSession.setActionHandler('seekto', d => { system.audioPlayer.currentTime = d.seekTime; });
```

## UI Components
Share popup skeleton:
```javascript
var sharePopups = {
  triggers: $('.share-popup'),
  init: function() {},
  popup: function(target) {}
};
```
GA events example:
```html
<button class="ga-ce" data-category="music" data-action="play" data-label="track-1">Play Track</button>
```

## Event System
User interaction to start system:
```javascript
$(window).on('keyup click', function(){ if (!system.started) { /* init */ } });
```
State classes:
- `body.crt`, `body.loading`, `body.media-playing`, `body.show-hidden-files`, `.login.loaded`

## Customization Guide
- Boot sequence text: assign `system.text = [ ... ]`
- Add audio in `src/sound/` and update media session metadata
- Toggle CRT: `var crtEffect = false`
- Replace loading cursor `img/loader.png`
- Responsive SCSS with mixins

## Performance Considerations
- Audio: compressed formats, lazy load, optional preloading
- Images: WebP with fallbacks, responsive sources
- JS: minimize DOM queries, use delegation, debounce

## Browser Support
Chrome 60+, Firefox 55+, Safari 12+, Edge 79+, IE11 (limited with polyfills)

## Troubleshooting
- iOS audio: require user interaction; set `ambientSound = false`
- CRT effect: ensure `crtEffect = true` and CSS loaded
- Share popups: browsers may block; consider Web Share API fallback

Contribute updates here when APIs change.