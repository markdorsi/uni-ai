# What is Uni AI?

Uni AI SDK is a **platform-agnostic AI SDK** that works everywhere—with **security built in, not bolted on**.

## The Problem

Building AI applications today means dealing with:

- 🔒 **Security afterthoughts** - Adding security features manually after development
- 🏢 **Vendor lock-in** - Code tied to specific platforms or providers
- 📦 **Bloated bundles** - Large SDKs that slow down your application
- 🔧 **Complex setup** - Hours spent configuring security, rate limiting, and validation
- 🔄 **Provider switching** - Rewriting code to switch between AI providers

## The Solution

Uni AI SDK solves these problems with:

### 🔒 Security by Default

Security isn't an add-on—it's built into every request:

```typescript
import { ai } from '@uni-ai/sdk'

// Security is automatic with 'strict' preset
const text = await ai('gpt-4', userInput, {
  security: 'strict'
})
```

**Included out of the box:**
- ✅ PII detection and redaction
- ✅ Rate limiting (per-user, configurable)
- ✅ Input validation and sanitization
- ✅ Prompt injection protection
- ✅ Content moderation

### 🌐 True Platform Agnosticism

Write once, deploy anywhere:

```typescript
// Same code works on:
// ✅ Vercel Edge Functions
// ✅ Netlify Edge Functions
// ✅ Cloudflare Workers
// ✅ AWS Lambda
// ✅ Node.js servers
// ✅ Any JavaScript runtime
```

Platform-specific optimizations available with adapters:

```typescript
import { createEdgeHandler } from '@uni-ai/vercel'

export const POST = createEdgeHandler({
  security: 'strict'
})
```

### 📦 Lightweight & Fast

**11KB core bundle** vs 186KB for alternatives (83% smaller):

- ⚡ Faster page loads
- 🚀 Quicker builds
- 💾 Less bandwidth
- 📱 Better mobile experience

### 🎯 Multi-Provider Support

Switch between AI providers without changing your code:

```typescript
// OpenAI
const gpt = await ai('gpt-4', prompt)

// Anthropic
const claude = await ai('claude-3-5-sonnet', prompt)

// Google Gemini
const gemini = await ai('gemini-2.0-flash', prompt)

// Ollama (local)
const llama = await ai('llama3.2', prompt)
```

**Supported Providers:**
- ✅ OpenAI (GPT-4, GPT-3.5 Turbo)
- ✅ Anthropic (Claude 3.5, Opus, Sonnet, Haiku)
- ✅ Google Gemini (2.0 Flash, 1.5 Pro, 1.5 Flash)
- ✅ Ollama (Llama, Mistral, Mixtral, and more)

### 🛠️ Developer Experience

Simple API that's easy to learn:

```typescript
import { ai } from '@uni-ai/sdk'

// Simple usage
const text = await ai('gpt-4', 'Hello!')

// Streaming
for await (const chunk of ai.stream('gpt-4', 'Tell me a story')) {
  process.stdout.write(chunk)
}

// Advanced usage
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
```

## Core Principles

### 1. Security First

Security features are **enabled by default** with sensible presets:

- **Strict** - Production (aggressive protection)
- **Moderate** - Development (balanced)
- **Permissive** - Testing (minimal restrictions)

### 2. Platform Agnostic

No vendor lock-in. Deploy on any platform that runs JavaScript:

- Edge runtimes (Vercel, Netlify, Cloudflare)
- Serverless functions (AWS Lambda, Google Cloud Functions)
- Traditional servers (Node.js, Bun, Deno)

### 3. Type Safety

Full TypeScript support with complete type inference:

```typescript
import { generate, type Message } from '@uni-ai/sdk'

const messages: Message[] = [
  { role: 'user', content: 'Hello' } // ✅ Type-safe
]

const result = await generate({
  model: 'gpt-4',
  messages,
  temperature: 0.7 // ✅ Autocomplete available
})

console.log(result.text) // ✅ Type: string
console.log(result.usage) // ✅ Type: { inputTokens, outputTokens, totalTokens }
```

### 4. Performance

Optimized for speed:

- Small bundle size (11KB core)
- Tree-shakeable exports
- Streaming support
- Edge runtime compatible

### 5. Open Standard

Community-driven, MIT licensed:

- No proprietary formats
- Extensible architecture
- Custom provider support
- Open source

## When to Use Uni AI SDK

**✅ Perfect for:**
- Production applications requiring security
- Multi-cloud deployments
- Projects that may switch AI providers
- Applications with strict bundle size requirements
- Teams that value type safety
- Projects deployed on multiple platforms

**❌ Maybe not ideal for:**
- Prototypes where security isn't important (yet)
- Platform-specific features not available in Uni AI
- Projects already heavily integrated with another SDK

## Comparison

| Feature | Vercel AI SDK | Uni AI SDK |
|---------|--------------|------------|
| **Bundle Size** | ~186KB | **11KB** ✨ |
| **Security** | Manual add-ons | **Built-in** 🔒 |
| **Platform Support** | Vercel-optimized | **Truly agnostic** 🌐 |
| **PII Detection** | ❌ | **✅ Automatic** |
| **Rate Limiting** | ❌ | **✅ Built-in** |
| **Input Validation** | ❌ | **✅ Automatic** |
| **Provider Switching** | ❌ Rebuild required | **✅ Config change** |
| **Type Safety** | ✅ | **✅** |
| **Streaming** | ✅ | **✅** |
| **Learning Curve** | Medium | **Low** 📈 |

## Next Steps

Ready to get started?

- [Getting Started Guide](/guide/getting-started) - Install and configure Uni AI
- [Quick Start](/guide/quick-start) - Build your first AI application
- [Examples](/examples/) - Explore production-ready examples
- [API Reference](/api/core) - Complete API documentation
