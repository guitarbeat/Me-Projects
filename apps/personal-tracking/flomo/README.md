# Flo and Tell 🌸

![CI](https://github.com/floandtell/cycle-buddy-calendar/actions/workflows/ci.yml/badge.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

**Version**: 1.0.0  
**Status**: Active Development | Major Refactoring in Progress  
**Last Updated**: 2025-10-06

A beautiful, privacy-focused period tracking calendar application built with modern web technologies.

## Features

- **Flo Tracking**: Track your cycle with an intuitive calendar interface
- **User Profiles**: Customizable user profiles with cat avatars
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Cat Avatars**: All users get adorable cat avatars by default! 🐱

### Cat Avatar System

- **Default Avatars**: New users automatically receive a random cat avatar from Unsplash
- **Retroactive Assignment**: Existing users without avatars have been assigned cat avatars
- **Customizable**: Users can choose from different cat avatars or upload their own images
- **Fallback System**: Reliable fallback cat images from Unsplash ensure avatars always display

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS with custom gradients and animations

## Roadmap 🗺️

### 🚀 Next Release (v1.1.0)

**Enhanced User Experience**

- [ ] **Symptom Tracking**: Add mood, energy, and physical symptom logging
- [ ] **Period Insights**: Show cycle length trends and pattern analysis
- [ ] **Reminder System**: Customizable notifications for upcoming periods
- [ ] **Export Data**: Download cycle data as PDF or CSV reports
- [ ] **Accessibility Improvements**: Enhanced keyboard navigation and screen reader support

### 🎯 Short Term (v1.2.0 - v1.3.0)

**Smart Features & Personalization**

- [ ] **Smart Predictions**: AI-powered cycle predictions based on lifestyle factors
- [ ] **Custom Themes**: User-created color themes and personalization options
- [ ] **Period Journal**: Daily notes and reflection entries
- [ ] **Cycle Statistics**: Detailed analytics dashboard with charts and trends
- [ ] **Multi-language Support**: Localization for Spanish, French, German, and more
- [ ] **Medication Tracking**: Log birth control and other period-related medications
- [ ] **Sharing Features**: Share cycle information with healthcare providers or partners

### 🔮 Medium Term (v2.0.0)

**Community & Advanced Features**

- [ ] **Community Forums**: Anonymous discussion spaces for period-related topics
- [ ] **Educational Content**: Integrated articles about menstrual health
- [ ] **Healthcare Integration**: Connect with gynecologists and health apps
- [ ] **Advanced Analytics**: Machine learning insights for health patterns
- [ ] **Fertility Tracking**: Ovulation predictions and fertility windows
- [ ] **Backup & Sync**: Cloud synchronization across multiple devices
- [ ] **API Integration**: Connect with fitness trackers and health apps

### 🌟 Long Term Vision (v3.0.0+)

**Revolutionary Health Platform**

- [ ] **Telemedicine Integration**: Virtual consultations with healthcare providers
- [ ] **Wearable Device Support**: Sync with smartwatches and fitness bands
- [ ] **Advanced AI Health Assistant**: Personalized health recommendations
- [ ] **Research Partnerships**: Contribute anonymized data to menstrual health research
- [ ] **Global Health Insights**: Population-level cycle data and research
- [ ] **Voice Assistant Integration**: Hands-free period tracking and queries
- [ ] **AR/VR Educational Experiences**: Immersive menstrual health education

### 🛠️ Technical Roadmap

#### Performance & Infrastructure

- [ ] **Progressive Web App**: Offline functionality and app-like experience
- [ ] **Performance Optimization**: Lazy loading, code splitting, and caching
- [ ] **Real-time Sync**: Live updates across devices
- [ ] **Enhanced Security**: End-to-end encryption for sensitive health data
- [ ] **Scalability**: Microservices architecture for global deployment

#### Developer Experience

- [ ] **Public API**: Allow third-party integrations and plugins
- [ ] **Plugin System**: Community-contributed features and extensions
- [ ] **Open Source Components**: Release reusable UI components
- [ ] **Developer Documentation**: Comprehensive API and integration guides

### 💡 Feature Requests from Community

#### Most Requested

1. **Period Sharing with Partners** - Share cycle info with trusted contacts
2. **Custom Cycle Length Settings** - Support for irregular cycles
3. **Pain Level Tracking** - Visual pain scales and trend analysis
4. **Water Intake Reminders** - Hydration tracking during menstruation
5. **Sleep Pattern Integration** - Connect period tracking with sleep data

#### Innovation Ideas

- **Period Prediction Accuracy Challenges** - Gamified prediction improvements
- **Anonymous Data Sharing** - Contribute to menstrual health research
- **Cultural Period Practices** - Educational content about global practices
- **Sustainability Tracker** - Track eco-friendly period product usage
- **Period Emergency Network** - Community support for period product access

## Quick Start

### Prerequisites

- Node.js 18+ or npm/pnpm
- Supabase account (for backend)

### Installation

1. **Clone the repository**

   ```bash
   git clone <YOUR_GIT_URL>
   cd cycle-buddy-calendar
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SMITHERY_KEY=your_smithery_key  # Required for MCP scripts
   ```

   ⚠️ **Important**: Use your project's API URL (`https://<project-ref>.supabase.co`), NOT the dashboard URL!

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Authentication

The app uses anonymous sessions with username-based authentication (no passwords required). Simply enter a username to sign in or create an account.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run check-format` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Calendar.tsx    # Main calendar component
│   ├── ProfileEditor.tsx # User profile management
│   └── ...
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
│   └── imageUtils.ts   # Image processing and cat avatar utilities
└── pages/              # Page components
```

## Database Schema

The application uses Supabase with the following main tables:

- `profiles` - User profiles with avatar URLs
- `flo_entries` - Flo tracking entries
- `user_roles` - User role management
- Anonymous sessions (no passwords) with `profiles` and `user_roles` for user data and roles

## Contributing

We welcome contributions! Here's how you can help:

1. **Feature Requests**: Submit ideas through GitHub Issues
2. **Bug Reports**: Report bugs with detailed reproduction steps
3. **Code Contributions**: Fork the repository and submit pull requests
4. **Documentation**: Help improve our docs and guides
5. **Testing**: Help test new features and report feedback

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

## Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repository
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions for automatic deployment

## Community

- **Discord**: Join our community discussions
- **GitHub Discussions**: Feature requests and general discussions
- **Twitter**: Follow @floandtell for updates
- **Blog**: Read about menstrual health and app updates

## Support

- **Documentation**: Check our comprehensive guides
- **FAQ**: Common questions and answers
- **Email Support**: hello@floandtell.com
- **GitHub Issues**: Technical support and bug reports

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Contributors**: Thanks to all who have contributed to this project
- **Community**: Grateful for user feedback and feature suggestions
- **Healthcare Professionals**: Thanks to medical advisors who helped shape our features
- **Open Source**: Built on amazing open-source technologies

---

**Join us in revolutionizing period tracking and menstrual health! 🌸**
