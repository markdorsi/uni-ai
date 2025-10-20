# Getting Started with Uni AI SDK

Congratulations! You've successfully set up the Uni AI SDK foundation. Here's what we've built and what's next.

## What We've Built

### ✅ Completed

1. **Monorepo Structure**
   - Turborepo configuration
   - TypeScript setup
   - Package workspace structure

2. **Core SDK Package** (`@uni-ai/sdk`)
   - Simple `ai()` function for quick usage
   - Advanced `generate()` API for full control
   - Streaming support with `ai.stream()`
   - Full TypeScript types

3. **OpenAI Provider**
   - Text generation (blocking and streaming)
   - Model support: GPT-4, GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo
   - Environment variable auto-detection

4. **Security System**
   - Three security presets: `strict`, `moderate`, `permissive`
   - Rate limiting (in-memory)
   - Input validation
   - PII detection and redaction
   - Sanitization

5. **Documentation**
   - Comprehensive README
   - Code examples
   - API documentation in code

## Project Structure

```
uni-ai/
├── packages/
│   └── core/                 # @uni-ai/sdk
│       ├── src/
│       │   ├── index.ts      # Main exports
│       │   ├── ai.ts         # Simple API
│       │   ├── generate.ts   # Advanced API
│       │   ├── types/        # TypeScript types
│       │   ├── security/     # Security middleware
│       │   └── providers/    # Provider implementations
│       ├── examples/
│       │   └── basic.ts      # Example usage
│       └── package.json
├── package.json
├── turbo.json
└── README.md
```

## Testing the SDK

### 1. Set Environment Variable

```bash
export OPENAI_API_KEY=sk-your-key-here
```

### 2. Test Basic Usage

Create a test file:

```typescript
// test.ts
import { ai } from './packages/core/src/index.js'

const text = await ai('gpt-4', 'Say hello in French')
console.log(text)
```

Run it:
```bash
tsx test.ts
```

### 3. Test Streaming

```typescript
// stream-test.ts
import { ai } from './packages/core/src/index.js'

for await (const chunk of ai.stream('gpt-4', 'Count from 1 to 5')) {
  process.stdout.write(chunk)
}
```

### 4. Test Security

```typescript
// security-test.ts
import { ai } from './packages/core/src/index.js'

// This should apply rate limiting
const text = await ai('gpt-4', 'Hello', { security: 'strict' })
console.log(text)
```

## Next Steps

### Immediate (This Week)

1. **Fix TypeScript Declarations**
   - Enable `dts: true` in tsup.config.ts
   - Fix tsconfig to properly include all files

2. **Add Tests**
   ```bash
   cd packages/core
   npm run test
   ```

3. **Test with Real API**
   - Run the examples
   - Verify streaming works
   - Test security presets

### Short Term (Next 2 Weeks)

4. **Anthropic Provider**
   - Implement `createAnthropic()` in providers/anthropic.ts
   - Add Claude models to registry

5. **React Package**
   - Create `packages/react/`
   - Implement `useChat()` hook
   - Build `<Chat>` component

6. **Platform Adapters**
   - Create `packages/netlify/`
   - Create `packages/vercel/`
   - Test on both platforms

### Medium Term (Next Month)

7. **Examples**
   - Next.js chat app
   - Netlify Edge chat app
   - Express API server

8. **Documentation Site**
   - Set up VitePress
   - Write guides
   - API reference

9. **CLI Tool**
   - `npx uni-ai init`
   - Templates

## Development Commands

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Build core package only
cd packages/core && npm run build

# Watch mode
cd packages/core && npm run dev

# Run tests (when added)
npm run test

# Lint
npm run lint
```

## Common Issues & Solutions

### Issue: "OpenAI API key not found"

**Solution**: Set the environment variable:
```bash
export OPENAI_API_KEY=sk-...
```

### Issue: Build fails with DTS errors

**Status**: Known issue - temporarily disabled DTS generation
**Fix**: Working on tsconfig improvements

### Issue: "Cannot find module" errors

**Solution**: Make sure to build first:
```bash
cd packages/core && npm run build
```

## Architecture Decisions

### Why ESM Only?
- Modern standard
- Better tree-shaking
- Native browser support
- Smaller bundles

### Why Monorepo?
- Share code between packages
- Consistent versioning
- Easier testing
- Better DX

### Why Zod?
- Runtime validation
- Type inference
- Schema sharing
- Tool definition types

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Questions?

- GitHub Issues: [github.com/uni-ai/sdk/issues](https://github.com/uni-ai/sdk/issues)
- Discord: [discord.gg/uni-ai](https://discord.gg/uni-ai)
- Email: hello@uni-ai.dev

---

**Happy building! 🚀**
