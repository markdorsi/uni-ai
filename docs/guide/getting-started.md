# Getting Started

Get up and running with Uni AI SDK in minutes.

## Installation

::: code-group

```bash [npm]
npm install @uni-ai/sdk
```

```bash [pnpm]
pnpm add @uni-ai/sdk
```

```bash [yarn]
yarn add @uni-ai/sdk
```

```bash [bun]
bun add @uni-ai/sdk
```

:::

## Quick Setup

### 1. Get API Keys

You'll need at least one AI provider API key:

- **OpenAI** - [Get API key](https://platform.openai.com/api-keys)
- **Anthropic** - [Get API key](https://console.anthropic.com/)
- **Google Gemini** - [Get API key](https://aistudio.google.com/app/apikey)
- **Ollama** - [Install locally](https://ollama.ai/) (no API key needed)

### 2. Set Environment Variables

Create a `.env` file in your project root:

```bash
# Required (choose at least one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Optional
OLLAMA_BASE_URL=http://localhost:11434
```

::: warning
Never commit your `.env` file to version control! Add it to `.gitignore`.
:::

### 3. Your First AI Call

Create a new file (`index.ts` or `index.js`):

```typescript
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Explain quantum computing in simple terms')
console.log(text)
```

Run it:

```bash
node index.js
```

That's it! You just made your first AI call with Uni AI SDK. 🎉

## Next Steps

### Add Security

Enable built-in security features:

```typescript
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', userInput, {
  security: 'strict' // Enables PII detection, rate limiting, validation
})
```

See [Security Guide](/guide/security) for details.

### Try Streaming

Get real-time responses:

```typescript
import { ai } from '@uni-ai/sdk'

for await (const chunk of ai.stream('gpt-4', 'Tell me a story')) {
  process.stdout.write(chunk)
}
```

See [Streaming Guide](/guide/streaming) for details.

### Switch Providers

Try different AI providers without changing your code:

```typescript
import { ai } from '@uni-ai/sdk'

// OpenAI
const gpt = await ai('gpt-4', 'Hello')

// Anthropic
const claude = await ai('claude-3-5-sonnet', 'Hello')

// Google
const gemini = await ai('gemini-2.0-flash', 'Hello')

// Ollama (local)
const llama = await ai('llama3.2', 'Hello')
```

See [AI Providers Guide](/guide/providers) for details.

## Installation Options

### Using a Starter Template

The fastest way to get started is with our CLI tool:

```bash
npx create-uni-ai-app my-app
```

This creates a new project with:
- ✅ Uni AI SDK pre-installed
- ✅ Example code
- ✅ Environment setup
- ✅ TypeScript configuration
- ✅ Ready to deploy

Choose from templates:
- **Next.js Chat** - Modern chat application
- **Netlify Edge** - Serverless edge chat
- **Express API** - RESTful backend

### Platform-Specific Adapters

For platform-optimized deployments, install the relevant adapter:

::: code-group

```bash [Vercel]
npm install @uni-ai/sdk @uni-ai/vercel
```

```bash [Netlify]
npm install @uni-ai/sdk @uni-ai/netlify
```

```bash [React]
npm install @uni-ai/sdk @uni-ai/react
```

:::

See [Platform Guides](/guide/platforms/vercel) for integration instructions.

## TypeScript Setup

Uni AI SDK is written in TypeScript and provides full type definitions out of the box.

### tsconfig.json

Ensure you have these settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Type Imports

Import types for better IDE support:

```typescript
import { ai, type Message, type GenerateOptions } from '@uni-ai/sdk'

const messages: Message[] = [
  { role: 'user', content: 'Hello' }
]

const options: GenerateOptions = {
  model: 'gpt-4',
  messages,
  temperature: 0.7
}
```

## Verify Installation

Run this test to verify everything is working:

```typescript
import { ai } from '@uni-ai/sdk'

async function test() {
  try {
    const result = await ai('gpt-4', 'Say "Hello from Uni AI!"')
    console.log('✅ Success:', result)
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

test()
```

Expected output:
```
✅ Success: Hello from Uni AI!
```

## Troubleshooting

### "API key not found" Error

Make sure:
1. ✅ `.env` file exists in project root
2. ✅ API key is set correctly (no quotes in `.env`)
3. ✅ Environment variables are loaded (use `dotenv` if needed)
4. ✅ API key is valid and has credits

```typescript
// Load .env file in Node.js
import 'dotenv/config'
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Hello')
```

### Module Not Found Error

Ensure `type: "module"` is in your `package.json`:

```json
{
  "type": "module"
}
```

Or use `.mjs` file extension: `index.mjs`

### TypeScript Errors

Install type definitions:

```bash
npm install -D @types/node
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

### Rate Limit Errors

If you see "Rate limit exceeded":

1. This is Uni AI's built-in protection (working as intended!)
2. Wait 60 seconds and try again
3. Or use a more permissive security preset:

```typescript
const text = await ai('gpt-4', prompt, {
  security: 'moderate' // or 'permissive'
})
```

## What's Next?

Now that you're set up, explore these guides:

- [Quick Start](/guide/quick-start) - Build a chat application
- [Security](/guide/security) - Learn about security features
- [AI Providers](/guide/providers) - Explore supported providers
- [Examples](/examples/) - See production-ready code
- [API Reference](/api/core) - Complete API documentation

## Need Help?

- 📖 [API Reference](/api/core)
- 💬 [GitHub Discussions](https://github.com/markdorsi/uni-ai/discussions)
- 🐛 [Report an Issue](https://github.com/markdorsi/uni-ai/issues)
- 📧 [Contact Support](mailto:support@uni-ai.dev)
