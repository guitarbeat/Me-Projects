# Contributing to SwipeInbox

We welcome contributions to SwipeInbox! Please follow these guidelines to maintain code quality.

## Code Standards

We use [ESLint](https://eslint.org/) with [Airbnb](https://github.com/airbnb/javascript) configuration and [Prettier](https://prettier.io/) for formatting.

### Prerequisites

- Node.js (v20+)
- npm
- [pre-commit](https://pre-commit.com/) (Python tool)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install pre-commit hooks:
   ```bash
   pre-commit install
   ```

### Development Workflow

1. Create a branch for your feature or fix.
2. Make your changes.
3. Verify your changes:
   ```bash
   npm run lint
   npm run format:check
   npm run check
   ```

### Pull Requests

- Use clear and descriptive titles.
- Explain the purpose of your changes.
- Ensure all CI checks pass.
