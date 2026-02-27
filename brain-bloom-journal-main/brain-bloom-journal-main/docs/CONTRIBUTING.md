# Contributing to Tampana

Thank you for your interest in contributing to Tampana! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v9 or higher)
- Git

### Development Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/tampana.git
   cd tampana
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Run tests to ensure everything is working:**
   ```bash
   pnpm test
   ```

### Pre-commit Hooks

This project uses [pre-commit](https://pre-commit.com/) to ensure code quality.

1. **Install pre-commit:**
   ```bash
   pip install pre-commit
   ```

2. **Install the git hook scripts:**
   ```bash
   pre-commit install
   ```

Now `pre-commit` will run automatically on `git commit`.

## 📝 Code Style Guidelines

We follow strict code standards enforced by ESLint (Airbnb-style rules) and Prettier.

### Linting & Formatting

- **Linting**: Run `pnpm lint` to check for issues.
- **Formatting**: Run `pnpm format` to format code or `pnpm format:check` to check without modifying files.

### TypeScript

- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for object shapes
- Prefer `const` over `let` when variables won't be reassigned

### React Components

- Use functional components with hooks
- Prefer named exports over default exports
- Use proper prop types and interfaces
- Implement error boundaries where appropriate
- Follow the single responsibility principle

### Styling

- Use styled-components for component-specific styles
- Follow BEM-like naming conventions for CSS classes
- Use CSS variables for theme values
- Ensure responsive design principles

### File Organization

```
src/
├── components/          # React components
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.test.tsx
│   │   └── index.ts
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global styles and themes
└── assets/             # Static assets
```

## 🧪 Testing

### Writing Tests

- Write tests for all new components and functions
- Use React Testing Library for component tests
- Follow the testing pyramid (unit > integration > e2e)
- Aim for good test coverage

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage

# Run specific test file
pnpm test -- ComponentName.test.tsx
```

## 🔧 Development Workflow

### Creating a Feature

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code following the style guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request:**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill out the PR template
   - Request review from maintainers

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(calendar): add emotion tagging to events
fix(emoji-grid): resolve drag and drop issues
docs(readme): update installation instructions
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment information:**
   - Operating system
   - Node.js version
   - Browser (if applicable)

2. **Steps to reproduce:**
   - Clear, step-by-step instructions
   - Expected vs actual behavior

3. **Additional context:**
   - Screenshots or videos if helpful
   - Console errors
   - Network tab information

## 💡 Feature Requests

When suggesting features:

1. **Describe the problem** you're trying to solve
2. **Explain your proposed solution**
3. **Consider alternatives** you've explored
4. **Provide examples** of similar features in other apps

## 📋 Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code follows style guidelines
- [ ] Tests pass and new tests are added
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Code is properly formatted
- [ ] Commit messages follow conventional format
- [ ] PR description is clear and complete

## 🤝 Code Review Process

1. **Automated checks** must pass (CI/CD)
2. **At least one maintainer** must approve
3. **All conversations** must be resolved
4. **Tests must pass** in all environments

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Styled Components Documentation](https://styled-components.com/docs)
- [Vue Cal Documentation](https://antoniandre.github.io/vue-cal/)

## 🆘 Getting Help

If you need help:

1. Check existing issues and discussions
2. Search the documentation
3. Ask in the project discussions
4. Create a new issue with the "question" label

Thank you for contributing to Tampana! 🎉