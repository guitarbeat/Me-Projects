# Kanye 2049 Tribute

A retro-futuristic tribute website inspired by [kanye2049.com](https://kanye2049.com/). This project recreates the experience of the original site, featuring a narrative about a leaked Kanye West album in a dystopian future setting.

## 🎵 Narrative

The project is set in the year 2049. Kanye West has been missing for almost 30 years, and global warming is threatening human civilization. In this setting, the president makes contact with an alternate, utopian Earth that solved its climate crisis. This alternate reality sends a gift: a leaked Kanye West album. The president believes this album might hold the key to saving our planet.

The website includes links to resources about climate change and organizations working to combat it, blending entertainment with environmental awareness.

## 🚀 Features

- **Retro-futuristic UI**: Classic CRT monitor aesthetic with modern web technologies
- **Interactive Boot Sequence**: Authentic BIOS-style startup experience
- **Audio Integration**: Background ambient sounds and music player
- **Responsive Design**: Works across desktop and mobile devices
- **Media Session Support**: Integration with system media controls
- **Share Functionality**: Social media sharing capabilities

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (SCSS), JavaScript (ES6+)
- **Build Tool**: Gulp 4
- **CSS Framework**: Custom SCSS with responsive utilities
- **JavaScript Libraries**: jQuery
- **Development Server**: BrowserSync
- **Package Manager**: npm

## 📋 Prerequisites

- **Node.js** (v14 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js)

## 🏗️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/guitarbeat/nini.earth.git
cd nini.earth
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Development
```bash
# Start development server with live reload
npm run serve
```

This will:
- Compile SCSS to CSS
- Minify JavaScript
- Copy static assets
- Start a local development server
- Open the site in your browser at `http://localhost:3000`
- Enable live reload for development

### 4. Build for Production
```bash
# Build optimized files for production
gulp build
```

## 📁 Project Structure

```
nini.earth/
├── src/                    # Source files
│   ├── scss/              # SCSS stylesheets
│   │   ├── _main.scss     # Main styles
│   │   ├── _variables.scss # SCSS variables
│   │   ├── _functions.scss # Custom functions
│   │   ├── _normalize.scss # CSS reset
│   │   ├── _rem.scss      # REM utilities
│   │   └── _utilities.scss # Utility classes
│   ├── js/                # JavaScript files
│   │   ├── script.js      # Main application logic
│   │   └── jquery/        # jQuery library
│   ├── img/               # Images and graphics
│   ├── sound/             # Audio files
│   ├── video/             # Video files
│   ├── fonts/             # Custom fonts
│   ├── bootstrap/         # Bootstrap assets
│   ├── index.html         # Main HTML file
│   ├── 404.html          # Error page
│   ├── humans.txt        # Site credits
│   └── site.webmanifest  # PWA manifest
├── dist/                  # Built files (auto-generated)
├── gulpfile.mjs          # Gulp build configuration
├── package.json          # Project dependencies
└── README.md            # This file
```

## 🔧 Development

For the full development workflow, coding standards, and build task details, see `docs/development.md`.

### Key Features Implementation

#### Boot Sequence
The site features an authentic BIOS-style boot sequence in `src/js/script.js`:
- Displays system information and copyright
- Shows quantum battery status and neural memory alignment
- Includes philosophical text about niniOS
- Transitions to login screen

#### Audio System
- Background ambient audio with loop functionality
- Media session integration for system controls
- Audio player with play/pause/stop controls
- iOS compatibility considerations

#### Responsive Design
- Mobile-first approach with SCSS mixins
- CRT effect toggle for retro aesthetic
- Flexible layout that adapts to screen sizes

## 🎨 Customization

### Styling
- Modify `src/scss/_variables.scss` for color schemes and typography
- Update `src/scss/_main.scss` for layout changes
- Add new SCSS files to `src/scss/` and import in `_main.scss`

### Content
- Edit `src/index.html` for main content
- Update boot sequence text in `src/js/script.js` (lines 40-50)
- Modify audio files in `src/sound/` directory

### Features
- Toggle CRT effect by modifying the `crtEffect` variable in `script.js`
- Adjust ambient sound settings in the `ambientSound` variable
- Customize share functionality in the `sharePopups` object

## 🐛 Troubleshooting

See `docs/troubleshooting.md` for common issues, compatibility notes, and fixes.

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Original inspiration: [kanye2049.com](https://kanye2049.com/)
- CRT Effect: [hut8](https://github.com/hut8)
- Funny Dancing Lizard: [ka92](https://twitter.com/ka92)
- Built with love by Aaron Woods

## 🤝 Contributing

See `CONTRIBUTING.md` for guidelines, commit conventions, and the development workflow.

---

**Note**: This is a fan-made tribute project and is not affiliated with Kanye West or the original kanye2049.com website.
