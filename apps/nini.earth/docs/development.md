# Development Guide

This guide provides setup instructions, coding standards, workflows, and build details for working on the Kanye 2049 tribute website.

## Prerequisites
- Node.js >= 14
- npm >= 6
- Git >= 2

## Setup
```bash
git clone https://github.com/guitarbeat/nini.earth.git
cd nini.earth
npm install
npm run serve
```
Open http://localhost:3000

## Scripts
- `npm run serve`: Start BrowserSync dev server with watch/build
- `npm run build`: Production build (minified CSS/JS, copied assets)
- `npm run clean`: Remove `dist/`

## Gulp tasks
- `styles`: Compile SCSS → minified CSS
- `scripts`: Minify JavaScript
- `images`: Copy/optimize images
- `html`: Copy HTML files
- `favicons`: Copy favicon and related assets
- `staticFiles`: Copy fonts/sounds/videos
- `watch`: Watch files and rebuild
- `build`: Run all build tasks in parallel

## Project structure
```
src/
  scss/ _main.scss _variables.scss _functions.scss _normalize.scss _rem.scss _utilities.scss
  js/   script.js jquery/
  img/ sound/ video/ fonts/ bootstrap/
  index.html 404.html humans.txt site.webmanifest

dist/            # Build output
gulpfile.mjs     # Build config
package.json     # Scripts and dependencies
```

## Coding standards

### JavaScript
- ES6+ features; prefer `const`/`let` over `var`
- Meaningful names; add JSDoc for functions and complex objects
- Event delegation and minimal DOM queries

```javascript
/**
 * Formats a date to AM/PM format with month and day
 * @param {Date} date
 * @returns {string}
 */
function formatAMPM(date) { /* ... */ }
```

### SCSS
- Use partials, import via `_main.scss`
- BEM naming, variables and mixins for reuse

```scss
$primary-color: #000;
$border-radius: 10px;
.screen { background-color: $primary-color; }
```

### HTML & accessibility
- Semantic elements, proper heading hierarchy
- ARIA labels, keyboard navigation, alt text

## Workflow
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and add/update docs
3. Commit using Conventional Commits
4. Push and open a Pull Request

### Conventional commits
```
feat(scope): add new capability
fix(ui): correct CRT toggle behavior
docs(api): update media session examples
```

## Testing guidelines
- Cross‑browser: Chrome, Firefox, Safari, Edge, iOS Safari, Android Chrome
- Responsive: mobile/tablet/desktop
- Functionality: boot sequence, audio playback, share, CRT effect, loading states
- Performance: < 3s load; optimized assets; no console errors

## Performance guidelines
- Cache DOM lookups; use event delegation; debounce frequent events
- Efficient CSS selectors; batch layout changes
- Images: WebP with fallbacks; responsive images
- Audio: MP3/OGG; lazy load where appropriate

## Deployment
```bash
npm run build
# Upload contents of dist/ to hosting
```
Checklist: verify built files locally, enable HTTPS, test live site, check analytics and logs

## Documentation updates
- Update README for high‑level changes
- Add/adjust JSDoc where relevant
- Update `docs/api.md` and `docs/troubleshooting.md` as needed
