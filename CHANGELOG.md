# Changelog

All notable changes to the Uni AI SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- NPM publishing workflow
- Google Gemini provider
- Ollama provider (local models)
- Streaming support in React hooks
- Documentation website (VitePress)

---

## [0.1.0-alpha] - 2025-10-20

### Added

#### Core SDK (@uni-ai/sdk)
- **Simple API**: `ai()` function for one-line AI calls
- **Advanced API**: `generate()` function with full control
- **Streaming**: `ai.stream()` for real-time responses
- **OpenAI Provider**: Support for GPT-4, GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo
- **Anthropic Provider**: Support for Claude 3.5 Sonnet, Opus, Sonnet, Haiku
- **Provider Registry**: Automatic provider selection based on model name
- **Security System**: Three presets (strict, moderate, permissive)
  - Rate limiting (in-memory, per-user)
  - PII detection (SSN, email, phone, credit card, IP)
  - Input validation (length, sanitization)
  - Prompt injection protection (pattern blocking)
- **TypeScript**: Full type safety with strict mode
- **ESM-only**: Modern, tree-shakeable module format
- **Bundle**: 11KB gzipped (83% smaller than alternatives)

#### React Package (@uni-ai/react)
- **useChat Hook**: Conversational chat interfaces with message history
- **useCompletion Hook**: Simple text completion
- **TypeScript Support**: Full type inference
- **Loading States**: Built-in loading and error handling
- **Programmatic Control**: append, reload, stop methods
- **Security Integration**: Security preset support
- **SSR Compatible**: Client-side only hooks
- **Bundle**: 1.9KB gzipped

#### Testing Infrastructure
- **Vitest**: Testing framework with UI and coverage
- **63 Tests**: Comprehensive test suite
- **78.8% Coverage**: Exceeds 70% target
- **Test Utilities**: Mocking helpers and fixtures
- **CI Integration**: Automated testing on every commit

#### CI/CD
- **GitHub Actions**: Automated workflows for quality assurance
  - Test job: Runs full test suite with coverage
  - Type check job: Validates TypeScript across packages
  - Build job: Verifies build artifacts
  - Bundle size job: Enforces size limits (20KB core, 5KB React)
- **Codecov Integration**: Coverage reporting ready
- **Automated Checks**: Run on every push and pull request

#### Example Applications
- **Next.js Chat App**: Modern Next.js 14 with App Router
  - Server-side API routes
  - Beautiful gradient UI
  - Multiple AI models
  - TypeScript + CSS Modules
  - Vercel deployment ready
- **Express REST API**: Production-ready backend
  - RESTful endpoints (/api/chat, /api/completion)
  - Security middleware (Helmet, CORS)
  - Error handling
  - Health checks
  - Hot reload development
  - Multiple deployment options (Railway, Render, Fly.io, Docker)
- **Netlify Edge Chat**: Serverless edge application
  - Edge Functions (Deno runtime)
  - Static frontend (HTML/CSS/JS)
  - Global deployment (100+ locations)
  - <50ms latency worldwide
  - One-click deployment

#### Documentation
- **README.md**: Comprehensive project overview
- **GETTING_STARTED.md**: Quick start guide
- **CONTRIBUTING.md**: Contribution guidelines
- **CI_CD.md**: CI/CD documentation
- **STATUS.md**: Project status and roadmap
- **Example READMEs**: Detailed guides for each example (550+ lines each)
- **JSDoc**: Inline code documentation

### Changed
- N/A (initial release)

### Deprecated
- N/A (initial release)

### Removed
- N/A (initial release)

### Fixed
- TypeScript declaration generation in build process
- React event handler types with DOM lib support
- Missing `vi` import in test utilities
- Provider registry initialization issues

### Security
- Built-in PII detection for sensitive data
- Rate limiting to prevent abuse
- Input validation and sanitization
- Prompt injection protection
- Secure defaults (strict preset)

---

## Version History

### v0.1.0-alpha (2025-10-20) - Initial Alpha Release
First public release of Uni AI SDK with:
- Core SDK with OpenAI and Anthropic providers
- React hooks package
- 78.8% test coverage
- Complete CI/CD pipeline
- 3 production-ready examples
- Comprehensive documentation

**Metrics:**
- Bundle Size: 11KB core + 1.9KB React (vs 186KB alternatives)
- Test Coverage: 78.8%
- Tests: 63 passing
- Models: 10+ supported
- Examples: 3 complete
- Documentation: 2000+ lines

**Known Limitations:**
- In-memory rate limiting (not distributed)
- No streaming support in React hooks yet
- Build requires dummy API keys (provider registry initialization)

---

## Breaking Changes

### v0.1.0-alpha
- N/A (initial release)

---

## Migration Guides

### From Vercel AI SDK

We'll add a comprehensive migration guide in a future release. Key differences:

**Vercel AI SDK:**
```typescript
import { OpenAI } from 'ai'
const response = await openai.chat.completions.create(...)
```

**Uni AI SDK:**
```typescript
import { ai } from '@uni-ai/sdk'
const text = await ai('gpt-4', 'Your prompt', { security: 'strict' })
```

Benefits:
- ✅ 83% smaller bundle
- ✅ Security built-in
- ✅ Platform-agnostic
- ✅ Simpler API

---

## Roadmap

See [STATUS.md](STATUS.md) for detailed roadmap.

**Next Release (v0.2.0):**
- NPM publishing workflow
- Performance benchmarks
- Additional providers (Google Gemini, Ollama)
- Documentation website
- Migration guide from Vercel AI SDK

**Future:**
- Platform adapters (@uni-ai/vercel, @uni-ai/netlify)
- CLI tool (create-uni-ai-app)
- Vue hooks package
- Streaming support in React
- Advanced security features (Redis rate limiting, NLP-based PII)
- OpenTelemetry integration

---

## Support

- **Issues**: [GitHub Issues](https://github.com/uni-ai/sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/uni-ai/sdk/discussions)
- **Documentation**: [Getting Started](GETTING_STARTED.md)
- **Examples**: [Examples Directory](examples/)

---

**Note**: This is an alpha release. APIs may change before v1.0.0. Please report any issues!
