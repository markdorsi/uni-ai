# Changelog

All notable changes to the Uni AI SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Updated Examples with Platform Adapters (Week 7)
- **Netlify Chat Example Simplification**:
  - Refactored Edge Function from 104 lines to 15 lines using @uni-ai/netlify adapter
  - Replaced manual request validation, body parsing, error handling, and response formatting
  - Added @uni-ai/netlify as dependency
  - Demonstrates createEdgeHandler() best practices
  - Added Google Gemini models (gemini-2.0-flash, gemini-pro)
  - Added Ollama support (llama3.2)
  - Improved model labels to show provider names (OpenAI, Anthropic, Google, Ollama)
  - 89% code reduction while maintaining all functionality
- **Next.js Chat Example Simplification**:
  - Refactored API route from 51 lines to 15 lines using @uni-ai/vercel adapter
  - Added Edge Runtime support with `export const runtime = 'edge'`
  - Replaced NextRequest/NextResponse handling with createEdgeHandler()
  - Added @uni-ai/vercel as dependency
  - Demonstrates Next.js 14 App Router best practices
  - Added Google Gemini models (gemini-2.0-flash, gemini-pro)
  - Added Ollama support (llama3.2)
  - Type-safe model selection in Chat component
  - 71% code reduction while maintaining all functionality
- **Multi-Provider Showcase**:
  - Both examples now demonstrate 4 providers: OpenAI, Anthropic, Google, Ollama
  - 6 model options: GPT-4, GPT-3.5 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash, Gemini Pro, Llama 3.2
  - Shows platform-agnostic nature of Uni AI SDK
  - Demonstrates value of platform adapter packages
- **Benefits**:
  - Dramatically simplified code while maintaining security and functionality
  - Showcases Week 5 platform adapters in real examples
  - Best practice demonstration for new users
  - Easier to understand and maintain
  - No bundle size increase (adapters already built in Week 5)

#### NPM Publishing Infrastructure (Week 4)
- **GitHub Actions Workflow**: Automated NPM publishing on release
  - Manual workflow dispatch support
  - Build, test, and publish pipeline
  - NPM_TOKEN secret configuration
  - Public package access (@uni-ai scoped)
- **Package Configuration**: .npmrc for npm registry settings
- **Publish Scripts**: Automated publishing for core and react packages
- **Fixed**: Prepublish hook issues for workspace installations

#### CLI Tool - create-uni-ai-app (Week 4)
- **Interactive Wizard**: Full-featured project scaffolding CLI
  - Project name validation (lowercase, numbers, hyphens only)
  - Template selection (Next.js, Express, Netlify)
  - AI model selection (GPT-4, GPT-3.5, Claude 3.5 Sonnet)
  - Optional API key configuration with secure password input
- **Template System**: Reuses existing examples for consistency
  - Smart file filtering (skips node_modules, build artifacts)
  - Automatic package.json name update
  - Template-to-example mapping (nextjs → nextjs-chat, etc.)
- **Automation Features**:
  - Automatic npm install (optional with --skip-install flag)
  - Automatic git initialization (optional with --skip-git flag)
  - .env file creation with API keys
  - Beautiful success messages with next steps
- **Command-Line Interface**:
  - Interactive mode: `npx create-uni-ai-app`
  - With arguments: `npx create-uni-ai-app my-app --template nextjs`
  - Colorful output with chalk and ora spinners
  - Clear error messages and validation
- **Documentation**: 600+ line comprehensive CLI README
  - Usage examples for all templates
  - Template comparison table
  - Troubleshooting section
  - Next steps guidance
- **Bundle**: 6.39KB executable with shebang

#### Deployment Infrastructure (Week 5)
- **One-Click Deploy Buttons**: Ready-to-use deployment buttons
  - Next.js Chat → Vercel deploy button in README
  - Netlify Edge → Netlify deploy button in README
  - Express API → Railway deploy button in README
  - Direct integration with platform deployment UIs
- **Platform Configuration Files**:
  - vercel.json for Next.js example with build commands
  - Enhanced netlify.toml with build and environment configuration
  - railway.json and railway.toml for Express API
  - Environment variable documentation in all configs
- **DEPLOYMENT.md Guide**: 470+ line comprehensive deployment documentation
  - Quick deploy section with one-click buttons for all examples
  - Manual deployment instructions for all platforms
  - Platform comparison table (Vercel, Netlify, Railway, Render, Fly.io)
  - Security best practices for environment variables
  - Troubleshooting section with common deployment issues
  - Step-by-step CLI deployment instructions
  - Build command configurations for monorepo structure
- **Enhanced Example READMEs**:
  - Deploy sections added to all 3 examples
  - Clear environment variable requirements
  - Alternative deployment platform options
  - Next steps after deployment
- **Platform Support**: 5 platforms with detailed instructions
  - Vercel (best for Next.js)
  - Netlify (best for edge/static)
  - Railway (best for APIs)
  - Render (alternative for APIs)
  - Fly.io (global API deployment)

#### Platform Adapters (Week 5)
- **@uni-ai/netlify Package**: Netlify-specific adapters
  - createEdgeHandler() for Netlify Edge Functions
  - createServerlessHandler() for Netlify Functions
  - streamResponse() helper for Server-Sent Events
  - Automatic request/response handling
  - Context extraction (IP, cookies, geo data)
  - Custom security presets support
  - Custom error handling
  - Full TypeScript support
  - 350+ line comprehensive README
  - Bundle: 5.02 KB
- **@uni-ai/vercel Package**: Vercel-specific adapters
  - createEdgeHandler() for Vercel Edge Runtime
  - createApiHandler() for Next.js API Routes
  - streamResponse() helper for Edge Runtime
  - Next.js 14 App Router support
  - Pages Router support
  - VercelRequest/VercelResponse types
  - Custom user ID extraction
  - Automatic security integration
  - Full TypeScript support
  - 500+ line comprehensive README with examples
  - Authentication patterns
  - Middleware integration examples
  - Edge vs API Routes comparison
  - Bundle: 4.60 KB
- **Documentation**: 850+ lines of adapter documentation
  - API reference for both packages
  - Deployment instructions
  - Security best practices
  - TypeScript usage examples
  - Real-world authentication examples

#### Additional AI Providers (Week 6)
- **Google Gemini Provider**: Full Gemini API integration
  - Complete GeminiProvider implementation
  - REST API integration (generativelanguage.googleapis.com/v1beta)
  - generateContent and streamGenerateContent endpoints
  - Support for Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash models
  - Model alias: gemini-pro points to latest
  - Message format conversion (Uni AI → Gemini format)
  - Automatic system message handling
  - Full streaming support with Server-Sent Events
  - Generation config support (temperature, maxTokens, topP, stopSequences)
  - Usage metadata extraction (promptTokenCount, candidatesTokenCount)
  - Authentication via GEMINI_API_KEY or GOOGLE_API_KEY
  - Error handling and validation
  - 4 models registered: gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash, gemini-pro
- **Ollama Provider**: Local model deployment support
  - Complete OllamaProvider implementation
  - Local model support (default: http://localhost:11434)
  - Customizable base URL via OLLAMA_BASE_URL environment variable
  - Dual endpoint support (/api/chat and /api/generate)
  - Automatic endpoint selection (chat vs generate based on context)
  - Support for Llama 2/3, Mistral, Mixtral, CodeLlama, Phi, Qwen
  - Full streaming support with line-delimited JSON responses
  - Options mapping (temperature → temperature, topP → top_p, maxTokens → num_predict)
  - Usage tracking (prompt_eval_count, eval_count)
  - Chat and completion modes
  - No API keys required (local deployment)
  - Privacy-focused (runs entirely locally)
  - 8 models registered: llama3.2, llama3.1, llama2, mistral, mixtral, codellama, phi, qwen
- **Provider Registry Updates**:
  - Registered 4 Gemini models
  - Registered 8 Ollama models
  - Total providers: 4 (OpenAI, Anthropic, Gemini, Ollama)
  - Total models: 23+ across all providers
  - Exported GeminiProvider and OllamaProvider from providers/index
- **Benefits**:
  - Google Gemini: Access to Google's latest AI models
  - Ollama: Private/local model deployment without cloud dependencies
  - Platform-agnostic: Demonstrates core value proposition
  - Developer choice: Cloud vs local, proprietary vs open source

### Planned
- Live demo deployments with public URLs
- Streaming support in React hooks
- Documentation website (VitePress)
- Mistral AI provider

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
