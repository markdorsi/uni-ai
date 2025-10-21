# Uni AI SDK

**Secure. Portable. Open.**

The AI SDK that works everywhere—with security built in, not bolted on.

[![npm version](https://img.shields.io/npm/v/@uni-ai/sdk.svg)](https://www.npmjs.com/package/@uni-ai/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ **Platform-Agnostic**: Deploy on Netlify, Vercel, Cloudflare, AWS, or self-hosted
- ✅ **Secure by Default**: Production-grade security controls (PII redaction, rate limiting, moderation)
- ✅ **Lightweight**: <20KB core (83% smaller than alternatives)
- ✅ **Type-Safe**: Full TypeScript support with inference
- ✅ **Streaming-First**: Real-time responses with SSE
- ✅ **Open Standard**: Community-driven, zero vendor lock-in

## Quick Start

### Installation

```bash
npm install @uni-ai/sdk
```

### Basic Usage

```typescript
import { ai } from '@uni-ai/sdk'

// Works with OpenAI
const text = await ai('gpt-4', 'Explain quantum computing in simple terms')
console.log(text)

// Works with Anthropic/Claude
const claude = await ai('claude-3-5-sonnet', 'Write a haiku about AI')
console.log(claude)

// Streaming
for await (const chunk of ai.stream('gpt-4', 'Tell me a story')) {
  process.stdout.write(chunk)
}
```

### With Security

```typescript
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', userInput, {
  security: 'strict' // Auto-applies rate limits, PII detection, moderation
})
```

## Security Presets

Uni AI SDK comes with built-in security presets:

- **`strict`** - Recommended for production (aggressive rate limiting, PII redaction, moderation)
- **`moderate`** - Balanced approach (default)
- **`permissive`** - Development/testing only

```typescript
import { ai } from '@uni-ai/sdk'

// Strict security (production)
const text = await ai('gpt-4', userInput, { security: 'strict' })

// Custom security config
import { generate, securityPresets } from '@uni-ai/sdk'

const result = await generate({
  model: 'gpt-4',
  messages: [{ role: 'user', content: userInput }],
  security: {
    ...securityPresets.strict,
    rateLimiting: {
      maxRequestsPerMinute: 5 // Override just this
    }
  }
})
```

## Advanced Usage

```typescript
import { generate } from '@uni-ai/sdk'

const result = await generate({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  maxTokens: 1000,
  security: 'strict'
})

console.log(result.text)
console.log(result.usage) // { inputTokens, outputTokens, totalTokens }
console.log(result.finishReason)
```

## Supported Providers

- ✅ **OpenAI** - `gpt-4`, `gpt-4-turbo`, `gpt-4o`, `gpt-3.5-turbo`
- ✅ **Anthropic** - `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-sonnet-20240229`, `claude-3-haiku-20240307`
- 🚧 **Google Gemini** - Coming soon
- 🚧 **Ollama** (Local models) - Coming soon

### Using Different Providers

```typescript
import { ai } from '@uni-ai/sdk'

// OpenAI
const gpt = await ai('gpt-4', 'Hello')

// Anthropic/Claude
const claude = await ai('claude-3-5-sonnet', 'Hello')

// Both use the same API!
```

Set your API keys:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

## Platform Deployment

Uni AI SDK works on all major platforms with zero code changes:

### Netlify Edge Functions

```typescript
// netlify/edge-functions/chat.ts
import { ai } from '@uni-ai/sdk'

export default async (req: Request) => {
  const { prompt } = await req.json()
  const text = await ai('gpt-4', prompt, { security: 'strict' })
  return new Response(JSON.stringify({ text }))
}
```

### Vercel Edge Functions

```typescript
// app/api/chat/route.ts
import { ai } from '@uni-ai/sdk'

export async function POST(req: Request) {
  const { prompt } = await req.json()
  const text = await ai('gpt-4', prompt, { security: 'strict' })
  return Response.json({ text })
}
```

### Node.js (Express, Fastify, etc.)

```typescript
import express from 'express'
import { ai } from '@uni-ai/sdk'

const app = express()

app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body
  const text = await ai('gpt-4', prompt, { security: 'strict' })
  res.json({ text })
})
```

## React Integration

```bash
npm install @uni-ai/react
```

```typescript
import { useChat } from '@uni-ai/react'

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    model: 'gpt-4',
    security: 'strict'
  })

  return (
    <div>
      {messages.map((m, i) => (
        <div key={i}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
```

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional (for Anthropic)
ANTHROPIC_API_KEY=sk-ant-...
```

## Documentation

- [Quickstart Guide](https://uni-ai.dev/docs/quickstart)
- [API Reference](https://uni-ai.dev/docs/api)
- [Security Guide](https://uni-ai.dev/docs/security)
- [Platform Guides](https://uni-ai.dev/docs/platforms)

## Examples

- [Next.js Chat](https://github.com/uni-ai/examples/tree/main/nextjs-chat)
- [Netlify Edge Chat](https://github.com/uni-ai/examples/tree/main/netlify-chat)
- [Express API](https://github.com/uni-ai/examples/tree/main/express-api)

## Why Uni AI SDK?

### vs Vercel AI SDK

| Feature | Vercel AI SDK | Uni AI SDK |
|---------|---------------|------------|
| Bundle Size | ~186KB | <20KB ✅ |
| Security | Add-ons | Built-in ✅ |
| Platform Support | Vercel-optimized | Platform-agnostic ✅ |
| Languages | TypeScript only | TypeScript + Python + Go (planned) ✅ |

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © Uni AI

---

**Built with ❤️ by the Uni AI community**

[Documentation](https://uni-ai.dev) • [GitHub](https://github.com/uni-ai/sdk) • [Discord](https://discord.gg/uni-ai)
