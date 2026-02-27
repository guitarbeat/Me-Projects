# Financial Dashboard

A modern, responsive financial dashboard built with React, TypeScript, and Supabase for tracking income, expenses, and cash flow visualization.

## Features

- 📊 **Interactive Charts**: Waterfall and Sankey diagrams for cash flow visualization
- 💰 **Transaction Management**: Add, edit, and delete financial transactions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌙 **Dark Mode**: Toggle between light and dark themes
- 🔄 **Real-time Data**: Live updates with Supabase backend
- 📈 **Multiple Charts**: Organize transactions into different chart views

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Charts**: D3.js, Recharts
- **Backend**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/e6194abd-bed5-4a4d-b035-2f1cdac28818) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── integrations/  # External service integrations
├── lib/           # Utility functions and configurations
├── pages/         # Page components
├── test/          # Test setup and utilities
└── utils/         # Helper functions
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details
