# Contributing

We welcome contributions! Please follow these guidelines to ensure a smooth workflow.

## Development Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/USERNAME/REPO.git
    cd REPO
    ```

2.  **Set up a virtual environment** (recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install ruff black pre-commit
    ```

4.  **Install pre-commit hooks**:
    ```bash
    pre-commit install
    ```

## Code Standards

We use the following tools to maintain code quality:

*   **Ruff**: For linting and import sorting.
*   **Black**: For code formatting.

The configuration is in `pyproject.toml`.

To run checks manually:
```bash
ruff check .
black --check .
```

To automatically fix issues:
```bash
ruff check . --fix
black .
```

## Running Tests

Run the built-in tests:

```bash
python bookmarks.py test
```

## Pull Request Process

1.  Create a new branch for your feature or bugfix.
2.  Make your changes.
3.  Ensure all tests pass and pre-commit hooks succeed.
4.  Submit a Pull Request.
5.  CI will automatically run checks and tests.
