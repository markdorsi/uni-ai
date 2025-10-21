---
layout: home

hero:
  name: Uni AI SDK
  text: Secure. Portable. Open.
  tagline: The AI SDK that works everywhere—with security built in, not bolted on.
  image:
    src: /logo-large.svg
    alt: Uni AI SDK
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/markdorsi/uni-ai
    - theme: alt
      text: Examples
      link: /examples/

features:
  - icon: 🚀
    title: Platform-Agnostic
    details: Deploy on Vercel, Netlify, Cloudflare, AWS, or self-hosted. One SDK, any platform.

  - icon: 🔒
    title: Secure by Default
    details: Production-grade security with PII detection, rate limiting, and input validation built-in.

  - icon: 📦
    title: Lightweight
    details: Only 11KB core bundle—83% smaller than alternatives. Fast downloads, faster builds.

  - icon: 🎯
    title: Type-Safe
    details: Full TypeScript support with complete type inference. Catch errors before runtime.

  - icon: ⚡
    title: Streaming-First
    details: Real-time responses with Server-Sent Events. Smooth user experience out of the box.

  - icon: 🌐
    title: Multi-Provider
    details: OpenAI, Anthropic, Google Gemini, Ollama. Switch providers without changing code.

  - icon: 🛠️
    title: Developer-Friendly
    details: Simple API, comprehensive docs, and helpful error messages. Get productive quickly.

  - icon: 📊
    title: Production-Ready
    details: Battle-tested security, 78% test coverage, and deployed in production apps.

  - icon: 🔓
    title: Open Standard
    details: Community-driven, zero vendor lock-in. Your code, your choice, your control.
---

## Quick Start

Install the SDK:

```bash
npm install @uni-ai/sdk
```

Use it in your code:

```typescript
import { ai } from '@uni-ai/sdk'

// Simple text generation
const text = await ai('gpt-4', 'Explain quantum computing')
console.log(text)

// With security built-in
const secure = await ai('gpt-4', userInput, {
  security: 'strict'
})
```

## Supported Providers

- ✅ **OpenAI** - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- ✅ **Anthropic** - Claude 3.5 Sonnet, Opus, Haiku
- ✅ **Google Gemini** - Gemini 2.0 Flash, 1.5 Pro, 1.5 Flash
- ✅ **Ollama** - Llama 3.2, Mistral, Mixtral, and more (local)

## Why Uni AI SDK?

| Feature | Other SDKs | Uni AI SDK |
|---------|-----------|------------|
| **Bundle Size** | ~186KB | **11KB** ✨ |
| **Security** | Manual setup | **Built-in** 🔒 |
| **Platforms** | Vendor-specific | **Any platform** 🌐 |
| **PII Detection** | ❌ | **✅ Automatic** |
| **Rate Limiting** | ❌ | **✅ Built-in** |
| **Learning Curve** | Steep | **Gentle** 📈 |

## What's Next?

<div class="next-steps">
  <a href="/guide/getting-started" class="next-step">
    <h3>📚 Read the Guide</h3>
    <p>Learn the fundamentals and core concepts</p>
  </a>

  <a href="/examples/" class="next-step">
    <h3>💻 Try Examples</h3>
    <p>Explore production-ready code examples</p>
  </a>

  <a href="/api/core" class="next-step">
    <h3>📖 API Reference</h3>
    <p>Dive into the complete API documentation</p>
  </a>
</div>

<style>
.next-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.next-step {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.next-step:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.next-step h3 {
  margin: 0 0 0.5rem 0;
  color: var(--vp-c-brand);
}

.next-step p {
  margin: 0;
  color: var(--vp-c-text-2);
}
</style>
