# Contributing to Flo and Tell 🌸

Thank you for your interest in contributing to Flo and Tell! This guide will help you get started with the development workflow.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy environment file: `cp .env.local.example .env.local`
4. Add your Supabase credentials to `.env.local` (see [ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md))
5. Start development server: `npm run dev`

## 🔧 Development Workflow

### 1. Code Quality

Before submitting any changes:

```bash
# Run linting
npm run lint

# Check formatting
npm run check-format

# Run type check
npm run type-check

# Run tests
npm test

# Build the project
npm run build
```

All code must pass these checks before being merged.

### 2. Branching Strategy

- `main` - Production branch
- `feature/your-feature-name` - Feature branches
- `fix/issue-description` - Bug fix branches

### 3. Commit Messages

Use conventional commit format:

```
type(scope): description

feat(calendar): add symptom tracking functionality
fix(auth): resolve silent auth errors
docs(api): update database schema documentation
```

### 4. Pull Request Process

1. Create a new branch from `main`
2. Make your changes
3. Add/update tests as needed
4. Update documentation if required
5. Ensure all checks pass
6. Submit a pull request with a clear description

## 📁 Project Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts (auth, theme)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions and helpers
├── pages/              # Route components
└── test/               # Test utilities and setup

docs/                   # Documentation
config/                 # Configuration files
public/                 # Static assets
supabase/              # Database schema and migrations
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run check-format` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run test suite
- `npm run preview` - Preview production build

## 🧪 Testing

### Writing Tests

- Place test files next to the components they test
- Use `.test.tsx` or `.test.ts` extensions
- Import from `@/test/test-utils` for React testing
- Mock external dependencies appropriately

### Test Utilities

We provide test utilities in `src/test/test-utils.tsx` that include:

- AuthProvider wrapper
- QueryClient setup
- Common testing library exports

Example:

```tsx
import { render, screen } from '@/test/test-utils';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## 📋 Development Priorities

Current focus areas (see [todo.md](todo.md) for details):

### High Priority

1. ✅ Linting and code quality (completed)
2. ✅ Test infrastructure (completed)
3. Feature development for v1.1.0 roadmap
4. Documentation improvements

### Medium Priority

1. Performance optimizations
2. Enhanced accessibility
3. Additional test coverage

## 🎯 Roadmap Features

See [README.md](README.md#roadmap) for detailed feature roadmap including:

- **v1.1.0**: Enhanced User Experience (symptom tracking, insights)
- **v1.2.0-v1.3.0**: Smart Features & Personalization
- **v2.0.0**: Community & Advanced Features

## 🐛 Bug Reports

When reporting bugs, please include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment details
- Screenshots if applicable

## 💡 Feature Requests

Feature requests should align with our roadmap and user needs. Please:

- Check existing issues first
- Provide clear use cases
- Consider implementation complexity
- Think about user privacy (this is health data!)

## 📄 Code Style

- Use TypeScript for type safety
- Follow existing ESLint and Prettier configuration
- Use meaningful component and variable names
- Add JSDoc comments for complex functions
- Maintain consistent file naming

### Component Guidelines

- Use functional components with hooks
- Keep components focused and reusable
- Use proper TypeScript interfaces
- Handle loading and error states
- Follow accessibility best practices

## 🔒 Security & Privacy

This app handles sensitive health data. Please:

- Never log personal health information
- Use proper authentication checks
- Validate all user inputs
- Follow OWASP security guidelines
- Respect user privacy preferences

## 🌟 Community

- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and best practices
- Focus on user needs and experiences

## 📞 Getting Help

- Check the [docs/](docs/) directory
- Review existing issues and PRs
- Ask questions in issue discussions
- Reference the [DEBUG_SYSTEM.md](docs/DEBUG_SYSTEM.md) for debugging

---

**Thank you for contributing to Flo and Tell!** 🌸

Your contributions help make period tracking more accessible, private, and empowering for everyone.
