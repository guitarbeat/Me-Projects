# Kanye 2049 Tribute — Documentation

Welcome to the project documentation. This site contains everything you need to develop, customize, and maintain the Kanye 2049 tribute website.

## What is this project?
A retro‑futuristic tribute website inspired by kanye2049.com. It recreates a BIOS‑style boot sequence, ambient audio, and interactive UI around a dystopian 2049 narrative.

## Quick start

```bash
# Install dependencies
npm install

# Start the development server (BrowserSync)
npm run serve

# Build for production
npm run build
```

- App will open at http://localhost:3000
- Build output is in `dist/`

## Project layout

```
src/
  scss/           # Styles (SCSS)
  js/             # JavaScript (jQuery based)
  img/ sound/     # Assets
  index.html      # Entry document
gulpfile.mjs      # Gulp 4 build
```

## Documentation

- Development Guide: ./development.md
- API Reference: ./api.md
- Troubleshooting: ./troubleshooting.md
- Contributing: ../CONTRIBUTING.md

## Licensing
This project is licensed under the ISC License. See the repository `LICENSE` if present or the license note in the README.