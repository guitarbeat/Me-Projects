# FlowMail

![CI](https://github.com/your-username/flowmail/actions/workflows/ci.yml/badge.svg)

FlowMail is an email management application featuring a swipe-based interface for inbox triage and integrated journal reflection.

## Development

### Prerequisites

- Node.js (v20+)
- npm

### Installation

```bash
npm install
```

### Running

```bash
npm run dev
```

### Code Standards

This project uses ESLint (Airbnb rules) and Prettier.

- **Lint**: `npm run lint`
- **Fix Lint**: `npm run lint:fix`
- **Format**: `npm run format`
- **Check Format**: `npm run format:check`
- **Type Check**: `npm run check`

## Pre-commit Hooks

We use `pre-commit` to ensure code quality.

1. Install `pre-commit` (e.g., `pip install pre-commit` or `brew install pre-commit`).
2. Run `pre-commit install`.
