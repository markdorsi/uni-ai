# Contributing to Uni AI SDK

Thank you for your interest in contributing to Uni AI SDK! 🎉

**Tagline**: Secure. Portable. Open.

We welcome contributions from everyone. This document will help you get started.

---

## Code of Conduct

Be respectful, professional, and inclusive. We're building an open standard together.

---

## Ways to Contribute

### 🐛 Report Bugs

Found a bug? [Open an issue](https://github.com/markdorsi/uni-ai/issues/new?template=bug_report.md)

### 💡 Suggest Features

Have an idea? [Request a feature](https://github.com/markdorsi/uni-ai/issues/new?template=feature_request.md)

### 📝 Improve Documentation

- Fix typos
- Add examples
- Clarify explanations
- Write guides

### 🔧 Write Code

- Fix bugs
- Add features
- Improve performance
- Add tests

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git

### Getting Started

```bash
# Clone the repo
git clone https://github.com/markdorsi/uni-ai.git
cd uni-ai

# Install dependencies
npm install

# Build packages
npm run build

# Run tests (when available)
npm run test

# Dev mode (watch)
cd packages/core && npm run dev
```

---

## Project Structure

```
uni-ai/
├── packages/
│   ├── core/           # @uni-ai/sdk
│   ├── react/          # @uni-ai/react (planned)
│   ├── netlify/        # @uni-ai/netlify (planned)
│   └── vercel/         # @uni-ai/vercel (planned)
├── examples/           # Example applications
├── docs/               # Documentation site
└── .github/            # GitHub config
```

---

## Coding Guidelines

### TypeScript

- Use TypeScript strict mode
- Export types for all public APIs
- Document with JSDoc comments

```typescript
/**
 * Generate AI text responses
 *
 * @example
 * ```ts
 * const text = await ai('gpt-4', 'Hello!')
 * ```
 */
export async function ai(model: string, prompt: string): Promise<string>
```

### Code Style

- Use ESM (not CommonJS)
- Prefer `const` over `let`
- Use async/await (not callbacks)
- Keep functions small (<50 lines)
- Write self-documenting code

### Security

- **Never log API keys or secrets**
- Validate all user inputs
- Use security presets by default
- Document security implications

### Testing

- Write tests for all new features
- Test error cases, not just happy paths
- Use mocks for external APIs
- Keep tests fast (<100ms each)

---

## Pull Request Process

### 1. Fork & Branch

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/uni-ai.git
cd uni-ai

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Update docs
- Test locally

```bash
npm run build
npm run test
npm run lint
```

### 3. Commit

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(core): add streaming support for tools"
git commit -m "fix(security): patch PII detection regex"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(providers): add OpenAI provider tests"
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `chore`: Maintenance

### 4. Push & PR

```bash
git push origin feature/your-feature-name
```

Then open a PR on GitHub with:
- Clear description of changes
- Link to related issue (if any)
- Screenshots/examples (if applicable)

---

## Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test packages/core/src/ai.test.ts

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

---

## Documentation

### Code Documentation

Use JSDoc for all public APIs:

```typescript
/**
 * Simple AI function - the 5-second quickstart
 *
 * @param model - Model identifier (e.g., 'gpt-4', 'claude-3-5-sonnet')
 * @param prompt - User prompt or array of messages
 * @param options - Optional generation parameters
 * @returns The generated text
 *
 * @example
 * ```ts
 * const text = await ai('gpt-4', 'Explain quantum computing')
 * console.log(text)
 * ```
 */
```

### README Documentation

- Keep examples simple
- Show common use cases
- Link to full docs

---

## Adding a New Provider

Example: Adding Google Gemini support

1. Create `packages/core/src/providers/gemini.ts`
2. Implement `LanguageModelProvider` interface
3. Add to `packages/core/src/providers/registry.ts`
4. Write tests in `packages/core/src/providers/gemini.test.ts`
5. Update documentation
6. Add example usage

Template:

```typescript
import type { LanguageModelProvider } from '../types/index.js'

export function createGemini(options?: ProviderOptions): LanguageModelProvider {
  return {
    id: 'gemini',
    name: 'Google Gemini',

    async generateText(opts) {
      // Implementation
    },

    async *streamText(opts) {
      // Implementation
    }
  }
}
```

---

## Release Process

(For maintainers)

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Publish to npm
6. Create GitHub release

```bash
npm run version-packages
npm run release
```

---

## Questions?

- **Issues**: [GitHub Issues](https://github.com/markdorsi/uni-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/markdorsi/uni-ai/discussions)
- **Email**: hello@uni-ai.dev
- **Discord**: discord.gg/uni-ai (coming soon)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to the future of AI development! 🚀**
