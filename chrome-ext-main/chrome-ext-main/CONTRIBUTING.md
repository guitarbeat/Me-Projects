# Contributing to Chrome Bookmarks MCP

We welcome contributions! Please follow these guidelines to ensure a smooth process.

## Code Standards

This project adheres to strict coding standards to maintain quality and consistency.

### Javascript

*   **Linter**: ESLint with Airbnb Base configuration.
*   **Formatter**: Prettier.
*   **Style Guide**:
    *   Use `const` over `let`. Avoid `var`.
    *   Use async/await for asynchronous operations.
    *   Use meaningful variable names.
    *   Add comments for complex logic.

## Development Setup

1.  Navigate to the project directory:
    ```bash
    cd chrome-bookmarks-mcp
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

## Running Checks

Before submitting a Pull Request, run the following checks locally:

*   **Linting**:
    ```bash
    npm run lint
    ```
*   **Formatting**:
    ```bash
    npm run format
    ```

## Pull Request Process

1.  Fork the repository and create your branch from `main`.
2.  Make sure your code lints and formats correctly.
3.  Submit a Pull Request.
4.  CI will run automatically. If it passes, your PR will be reviewed.

## Issues

Please report bugs and feature requests in the Issues tab.
