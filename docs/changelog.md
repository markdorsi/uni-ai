# Changelog

All notable changes to Uni AI SDK are documented here.

## [Unreleased]

### Week 9 - Documentation Site
- 📚 VitePress documentation site
- Complete API reference
- Interactive examples showcase
- Comprehensive guides

### Week 8 - Deployment Tooling
- 🚀 Automated deployment scripts (Vercel, Netlify, Railway)
- 📖 900+ line LIVE_DEPLOYMENT.md guide
- ✅ One-click deploy buttons for all examples
- 📝 Updated all READMEs with deployment sections

### Week 7 - Example Updates
- ♻️ Simplified examples using platform adapters (89% & 71% code reduction)
- ➕ Added Gemini and Ollama to example UIs
- 📦 Updated dependencies (@uni-ai/vercel, @uni-ai/netlify)

### Week 6 - Additional Providers
- ✨ Google Gemini provider (4 models)
- 🦙 Ollama provider for local models (8 models)
- 🌐 Total: 4 providers, 23+ models

### Week 5 - Platform Adapters
- 📦 @uni-ai/vercel package (4.60 KB)
- 📦 @uni-ai/netlify package (5.02 KB)
- 🚀 One-click deployment infrastructure
- 📖 DEPLOYMENT.md guide (470+ lines)

### Week 4 - CLI & Publishing
- 🛠️ create-uni-ai-app CLI tool
- 📦 NPM publishing workflow
- 🎯 Interactive project scaffolding

### Week 3 - CI/CD & Examples
- ✅ GitHub Actions CI/CD
- 💬 Next.js chat example
- ⚡ Netlify Edge chat example
- 🔌 Express API example

### Week 2 - Testing & React
- 🧪 Vitest testing infrastructure (78.8% coverage)
- ⚛️ @uni-ai/react package
- 🎭 Anthropic provider

### Week 1 - Core SDK
- ✨ Initial release
- 🤖 OpenAI provider
- 🔒 Security system (strict/moderate/permissive)
- 📦 11KB bundle size

## [0.1.0-alpha] - 2025-10-20

Initial alpha release.

### Added

- **Core SDK** (@uni-ai/sdk)
  - `ai()` function for simple text generation
  - `ai.stream()` for streaming responses
  - `generate()` for advanced control
  - OpenAI provider support
  - Anthropic provider support
  - Security presets (strict, moderate, permissive)
  - PII detection and redaction
  - Rate limiting (per-user)
  - Input validation
  - Prompt injection protection
  - TypeScript with full type inference
  - 11KB bundle size

- **React Package** (@uni-ai/react)
  - `useChat()` hook for conversational interfaces
  - `useCompletion()` hook for text completion
  - Loading and error states
  - Programmatic control
  - 1.9KB bundle size

- **Testing**
  - Vitest setup with 78.8% coverage
  - 63 passing tests
  - CI/CD with GitHub Actions

- **Examples**
  - Next.js 14 chat application
  - Netlify Edge chat application
  - Express.js REST API

- **Documentation**
  - Comprehensive README
  - GETTING_STARTED guide
  - Example READMEs
  - Inline JSDoc

### Security

- Built-in PII detection
- Rate limiting to prevent abuse
- Input validation and sanitization
- Prompt injection protection
- Secure defaults (strict preset)

## Version History

### v0.1.0-alpha (2025-10-20)
First public alpha release with core functionality, security, and examples.

## Breaking Changes

### v0.1.0-alpha
None (initial release)

## Migration Guides

### From Vercel AI SDK

Coming soon. Key differences:

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

## Support

- **Issues**: [GitHub Issues](https://github.com/markdorsi/uni-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/markdorsi/uni-ai/discussions)
- **Documentation**: [Getting Started](/guide/getting-started)

---

**Note**: This is an alpha release. APIs may change before v1.0.0.
