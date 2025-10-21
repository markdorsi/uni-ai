# Contributing

Thank you for your interest in contributing to Uni AI SDK! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/markdorsi/uni-ai/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (Node version, platform, etc.)
   - Code samples if applicable

### Suggesting Features

1. Check [Discussions](https://github.com/markdorsi/uni-ai/discussions) for existing requests
2. Create a new discussion with:
   - Clear use case
   - Why this feature is needed
   - Proposed API (if applicable)
   - Examples

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/uni-ai.git
cd uni-ai

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
uni-ai/
├── packages/
│   ├── core/       # @uni-ai/sdk
│   ├── react/      # @uni-ai/react
│   ├── vercel/     # @uni-ai/vercel
│   ├── netlify/    # @uni-ai/netlify
│   └── cli/        # create-uni-ai-app
├── examples/
│   ├── nextjs-chat/
│   ├── netlify-chat/
│   └── express-api/
├── docs/           # Documentation site
└── ...
```

## Coding Standards

- Use TypeScript
- Follow existing code style
- Add JSDoc comments
- Write tests for new code
- Keep bundle size small

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc for new APIs
- Update CHANGELOG.md
- Add examples if applicable

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
