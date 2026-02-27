# 🎭 Tampana - Emotional Wellness Tracker

[![CI](https://github.com/guitarbeat/tampana/workflows/CI/badge.svg)](https://github.com/guitarbeat/tampana/actions)
[![Code Style: Airbnb](https://img.shields.io/badge/code%20style-airbnb-brightgreen.svg)](https://github.com/airbnb/javascript)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

**URL**: https://lovable.dev/projects/81a4c73d-f2af-4903-9cef-d9af92288d2c

Tampana is a modern, intuitive emotion tracking application that helps you monitor, analyze, and understand your emotional patterns over time. Built with React and TypeScript, it features a beautiful calendar interface for logging emotions and provides powerful integrations with N8N for automated wellness workflows.

## ✨ Features

### Core Functionality
- **📅 Interactive Calendar**: Beautiful calendar interface powered by Vue Cal for emotion logging
- **😊 Emotion Tracking**: Rich emoji-based emotion selection and logging
- **🌙 Dark Mode**: Elegant dark/light theme toggle for comfortable use
- **📊 Data Export**: Export your emotional data in JSON and CSV formats
- **🔄 N8N Integration**: Connect with N8N workflows for automated wellness insights

### Advanced Features
- **🎨 Customizable Interface**: Adjustable calendar views (day, week, month)
- **⚡ Real-time Updates**: Instant calendar updates and visual feedback
- **📱 Responsive Design**: Works seamlessly across desktop and mobile devices
- **🔒 Privacy-focused**: All data stored locally on your device
- **🧠 Pattern Recognition**: Integration with N8N for emotional pattern analysis

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher) - see `.nvmrc` for the exact version
- npm (v7 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/guitarbeat/tampana.git
   cd tampana
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to start using Tampana!

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Testing & Quality
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔗 N8N Integration

Tampana features powerful integration with N8N for automated emotional wellness workflows.

### Setup N8N Integration

1. **Configure N8N Settings** in the app:
   - Navigate to Settings (⚙️ icon)
   - Enable N8N integration
   - Set your N8N instance base URL (e.g., `https://n8n.alw.lol`)
   - Configure webhook paths and authentication

2. **Available Webhooks:**
   - Event changes: `/webhook/tampana/event-change`
   - Data exports: `/webhook/tampana/export`
   - Summary reports: `/webhook/tampana/summary`

3. **Example Workflows:**
   - Automated mood pattern analysis
   - Daily/weekly emotional summaries
   - Wellness recommendations based on trends
   - Integration with other health apps

### N8N Features
- Real-time event synchronization
- Automated pattern detection
- Custom workflow triggers
- Comprehensive data export formats

## 📂 Project Structure

The project follows a clean, organized structure with configuration and documentation consolidated into dedicated directories:

```
root/
├── config/              # All configuration files
│   ├── eslint.config.js     # ESLint configuration
│   ├── jest.config.cjs      # Jest test configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── tailwind.config.ts   # Tailwind CSS configuration
│   ├── tsconfig.*.json      # TypeScript configurations
│   ├── vite.config.ts       # Vite build configuration
│   └── components.json      # shadcn/ui components config
├── docs/                # All documentation
│   ├── CHANGELOG.md         # Version history
│   ├── CONTRIBUTING.md      # Contribution guidelines
│   ├── DEPLOYMENT.md        # Deployment instructions
│   ├── SECURITY.md          # Security policies
│   ├── SUPPORT.md           # Support information
│   └── archive/             # Historical documentation
│       └── migration/       # Migration artifacts
├── src/                 # Source code
│   ├── components/          # React components
│   │   ├── ui/                  # shadcn/ui base components (STANDARD)
│   │   ├── common/              # Common utilities and wrappers
│   │   ├── emotion/             # Emotion tracking components
│   │   ├── n8n/                 # N8N integration components
│   │   ├── features/            # Feature-specific components
│   │   ├── Calendar/            # Calendar components
│   │   └── layout/              # Layout components
│   │   └── README.md            # Component documentation
│   ├── contexts/            # React contexts
│   ├── services/           # Business logic and API services
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── styles/            # Global styles and themes
├── public/              # Static assets
└── scripts/             # Build and utility scripts

Configuration files in the root (eslint.config.js, vite.config.ts, etc.) are lightweight wrappers that reference the actual configurations in the /config directory.

For detailed component documentation and usage guidelines, see [src/components/README.md](src/components/README.md).
```

## 🎨 Themes

Tampana supports both light and dark themes:
- Toggle between themes using the sun/moon icon
- Theme preference is automatically saved
- Elegant design optimized for extended use

## 📊 Data Management

### Local Storage
- All emotional data is stored locally in your browser
- No data is sent to external servers without your explicit consent
- Export capabilities for backup and analysis

### Export Formats
- **JSON**: Complete data export for N8N workflows
- **CSV**: Spreadsheet-compatible format for analysis
- **Summary Reports**: Formatted wellness summaries

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:
- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## 📋 Roadmap

See our [todo.md](todo.md) for current development priorities and planned features.

### Upcoming Features
- Enhanced emotion categories and intensity levels
- Advanced analytics dashboard
- Cloud storage integration options
- Mobile app development
- Advanced N8N workflow templates

## 🔒 Privacy & Security

- **Local-first**: All data stored locally on your device
- **No tracking**: No analytics or tracking without consent
- **Secure**: Regular security updates and vulnerability monitoring
- **Transparent**: Open source for community review

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🆘 Support

- **Documentation**: Check the [Contributing Guide](docs/CONTRIBUTING.md)
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Join our community discussions for questions and feedback

## ⭐ Acknowledgments

- Vue Cal for the beautiful calendar component
- React and TypeScript communities
- N8N for workflow automation capabilities
- All contributors and users of Tampana

---

Made with ❤️ for emotional wellness and self-awareness.
