# Contributing to Markdown Annotation Kit

Thank you for your interest in contributing to Markdown Annotation Kit! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct that all contributors are expected to follow. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/markdown-annotation-kit.git
   cd markdown-annotation-kit
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
pnpm dev
```

This starts the development server at `http://localhost:3000`.

### Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Code Quality

Before submitting a PR, ensure:

1. **Type checking passes:**
   ```bash
   pnpm typecheck
   ```

2. **Linting passes:**
   ```bash
   pnpm lint
   ```

3. **Code is formatted:**
   ```bash
   pnpm format
   ```

4. **All tests pass:**
   ```bash
   pnpm test
   ```

You can run all checks at once:
```bash
pnpm validate
```

## Making Changes

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for custom annotation colors
fix: resolve duplicate text annotation bug
docs: update API documentation
```

### Pull Request Process

1. **Update documentation** if you're adding features or changing APIs
2. **Add tests** for new features or bug fixes
3. **Ensure all tests pass** and code quality checks pass
4. **Update CHANGELOG.md** with your changes
5. **Create a pull request** with a clear description

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows the project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] CHANGELOG.md updated
```

## Project Structure

```
markdown-annotation-kit/
├── src/
│   ├── __tests__/          # Test files
│   ├── utils/              # Utility functions
│   ├── MarkdownAnnotator.tsx  # Main component
│   ├── styles.css          # Styles
│   └── index.ts            # Entry point
├── dev/                    # Development examples
├── dist/                   # Build output (gitignored)
└── docs/                   # Documentation
```

## Testing Guidelines

- Write tests for new features
- Write tests for bug fixes
- Aim for high test coverage
- Use descriptive test names
- Test edge cases

## Documentation

- Update README.md for user-facing changes
- Update API.md for API changes
- Add JSDoc comments for new functions/components
- Include examples in documentation

## Questions?

If you have questions, please:
- Open an issue for discussion
- Check existing issues and PRs
- Review the documentation

Thank you for contributing! 🎉

