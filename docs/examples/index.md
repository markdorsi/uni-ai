# Examples

Explore production-ready examples showcasing Uni AI SDK in real applications.

## Live Examples

All examples support **6 AI models** across **4 providers**:
- OpenAI (GPT-4, GPT-3.5 Turbo)
- Anthropic (Claude 3.5 Sonnet)
- Google (Gemini 2.0 Flash, Gemini Pro)
- Ollama (Llama 3.2 - local)

## Next.js Chat Application

<div class="example-card">

### 💬 Modern Chat Interface

A production-ready chat application built with Next.js 14 App Router.

**Features:**
- ✅ Multiple AI models with live switching
- ✅ Beautiful gradient UI with animations
- ✅ Server-side security with @uni-ai/vercel adapter
- ✅ Edge Runtime for optimal performance
- ✅ Real-time chat with loading states
- ✅ TypeScript + CSS Modules

**Tech Stack:**
- Next.js 14 (App Router)
- @uni-ai/sdk + @uni-ai/vercel
- TypeScript
- Edge Runtime

**Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markdorsi/uni-ai/tree/main/examples/nextjs-chat)

[View Source](https://github.com/markdorsi/uni-ai/tree/main/examples/nextjs-chat) | [Documentation](/examples/nextjs-chat)

</div>

---

## Netlify Edge Chat

<div class="example-card">

### ⚡ Serverless Edge Application

A globally-distributed chat app running on Netlify's edge network.

**Features:**
- ✅ Runs on 100+ global edge locations
- ✅ <50ms latency worldwide
- ✅ Zero backend setup (serverless)
- ✅ Pure HTML/CSS/JavaScript frontend
- ✅ @uni-ai/netlify adapter for edge functions
- ✅ One-click deployment

**Tech Stack:**
- Netlify Edge Functions (Deno)
- @uni-ai/sdk + @uni-ai/netlify
- Vanilla JavaScript
- Static HTML/CSS

**Deploy:**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/markdorsi/uni-ai&base=examples/netlify-chat)

[View Source](https://github.com/markdorsi/uni-ai/tree/main/examples/netlify-chat) | [Documentation](/examples/netlify-chat)

</div>

---

## Express REST API

<div class="example-card">

### 🔌 Production API Server

A RESTful API built with Express.js and TypeScript.

**Features:**
- ✅ RESTful endpoints (chat & completion)
- ✅ Security middleware (Helmet, CORS)
- ✅ TypeScript with strict mode
- ✅ Health check endpoint
- ✅ Hot reload development
- ✅ Deploy to Railway, Render, or Fly.io

**Tech Stack:**
- Express.js 4
- @uni-ai/sdk
- TypeScript
- Node.js 18+

**Deploy:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/uni-ai-express-api)

[View Source](https://github.com/markdorsi/uni-ai/tree/main/examples/express-api) | [Documentation](/examples/express-api)

</div>

---

## Quick Deployment

All examples include three deployment methods:

### 1. One-Click Deploy (~3 minutes)

Click the deploy button above each example. No CLI required!

### 2. CLI Deploy (~5 minutes)

Use our deployment scripts:

```bash
# Next.js to Vercel
cd examples/nextjs-chat
./deploy.sh

# Netlify Edge to Netlify
cd examples/netlify-chat
./deploy.sh

# Express to Railway
cd examples/express-api
./deploy.sh
```

### 3. Manual Deploy (~10-15 minutes)

Follow our comprehensive [Live Deployment Guide](https://github.com/markdorsi/uni-ai/blob/main/LIVE_DEPLOYMENT.md).

---

## Code Highlights

### Simplified with Platform Adapters

**Before** (104 lines of boilerplate):

```typescript
// Manual request handling, validation, error handling...
export default async (request: Request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405
    })
  }

  try {
    const { messages, model } = await request.json()

    // Validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400
      })
    }

    // AI generation
    const result = await generate({ model, messages, security: 'strict' })

    // Response formatting
    return new Response(JSON.stringify({
      message: { role: 'assistant', content: result.text },
      usage: result.usage
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    // Error handling...
  }
}
```

**After** (15 lines with adapter):

```typescript
import { createEdgeHandler } from '@uni-ai/netlify'

// That's it! The adapter handles everything:
// - Request validation
// - Body parsing
// - AI generation with security
// - Error handling
// - Response formatting
export default createEdgeHandler({
  security: 'strict'
})

export const config = { path: '/api/chat' }
```

**Result:** 89% code reduction!

---

## Learning Paths

### 🎯 I want to...

**Build a chat application**
→ Start with [Next.js Chat](/examples/nextjs-chat)

**Deploy globally with edge functions**
→ Start with [Netlify Edge Chat](/examples/netlify-chat)

**Create an API backend**
→ Start with [Express API](/examples/express-api)

**Learn security features**
→ Read the [Security Guide](/guide/security)

**Switch AI providers**
→ Read the [Providers Guide](/guide/providers)

---

## Example Features Comparison

| Feature | Next.js | Netlify Edge | Express API |
|---------|---------|--------------|-------------|
| **Platform** | Vercel | Netlify | Railway/Render |
| **Runtime** | Edge | Edge (Deno) | Node.js |
| **Frontend** | React | Vanilla JS | None (API only) |
| **Adapter** | @uni-ai/vercel | @uni-ai/netlify | Core SDK |
| **Bundle** | Optimized | Minimal | N/A |
| **Best For** | Full-stack apps | Global edge | Backends |

---

## Additional Resources

- 📚 [Getting Started Guide](/guide/getting-started)
- 🔐 [Security Guide](/guide/security)
- 📖 [API Reference](/api/core)
- 🚀 [Deployment Guide](https://github.com/markdorsi/uni-ai/blob/main/LIVE_DEPLOYMENT.md)
- 💬 [GitHub Discussions](https://github.com/markdorsi/uni-ai/discussions)

<style>
.example-card {
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 2rem 0;
}

.example-card h3 {
  margin-top: 0;
}
</style>
