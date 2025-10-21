# @uni-ai/vercel

Vercel adapters for Uni AI SDK - simplified AI integration for Vercel Edge Runtime and API Routes.

## Installation

```bash
npm install @uni-ai/sdk @uni-ai/vercel
```

## Features

- ✅ **Edge Runtime Support** - Optimized for Vercel Edge Functions
- ✅ **API Routes Support** - Works with Next.js Pages Router
- ✅ **Automatic Security** - Built-in rate limiting and PII detection
- ✅ **TypeScript** - Full type safety
- ✅ **Streaming Support** - Server-Sent Events for real-time responses
- ✅ **Next.js 14 App Router** - First-class support

## Quick Start

### Edge Runtime (App Router)

```typescript
// app/api/chat/route.ts
import { createEdgeHandler } from '@uni-ai/vercel'

export const runtime = 'edge'

export const POST = createEdgeHandler({
  security: 'strict'
})
```

That's it! The handler automatically:
- Accepts POST requests with `{ model, prompt }` or `{ model, messages }`
- Applies strict security (rate limiting, PII detection)
- Handles streaming responses
- Returns formatted JSON responses

### API Routes (Pages Router)

```typescript
// pages/api/chat.ts
import { createApiHandler } from '@uni-ai/vercel'

export default createApiHandler({
  security: 'moderate'
})
```

## API Reference

### `createEdgeHandler(options?)`

Creates a Vercel Edge Runtime handler for Next.js App Router.

**Options:**

```typescript
interface EdgeHandlerOptions {
  security?: 'strict' | 'moderate' | 'permissive' | SecurityConfig
  getUserId?: (request: Request) => string
  onError?: (error: Error, request: Request) => Response | Promise<Response>
}
```

**Example with custom options:**

```typescript
// app/api/chat/route.ts
import { createEdgeHandler } from '@uni-ai/vercel'

export const runtime = 'edge'

export const POST = createEdgeHandler({
  security: 'strict',
  getUserId: (request) => {
    // Extract user ID from authorization header
    const auth = request.headers.get('authorization')
    return extractUserId(auth) || 'anonymous'
  },
  onError: async (error, request) => {
    // Custom error logging
    console.error('AI request failed:', {
      error: error.message,
      url: request.url,
      method: request.method
    })

    return new Response(
      JSON.stringify({ error: 'AI service unavailable' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})
```

### `createApiHandler(options?)`

Creates a Vercel API Route handler for Next.js Pages Router.

**Options:**

```typescript
interface ApiHandlerOptions {
  security?: 'strict' | 'moderate' | 'permissive' | SecurityConfig
  getUserId?: (req: VercelRequest) => string
  onError?: (error: Error, req: VercelRequest, res: VercelResponse) => void
}
```

**Example:**

```typescript
// pages/api/completion.ts
import { createApiHandler } from '@uni-ai/vercel'

export default createApiHandler({
  security: {
    rateLimiting: {
      enabled: true,
      maxRequestsPerMinute: 15
    },
    piiDetection: {
      enabled: true,
      redact: true
    }
  },
  getUserId: (req) => {
    return req.headers['x-user-id'] as string || 'anonymous'
  }
})
```

### `streamResponse(iterator)`

Creates a streaming Response with Server-Sent Events.

**Parameters:**
- `iterator`: `AsyncIterable<string>` - Stream of text chunks

**Returns:** `Response` - Streaming response with proper headers

**Example:**

```typescript
// app/api/stream/route.ts
import { ai } from '@uni-ai/sdk'
import { streamResponse } from '@uni-ai/vercel'

export const runtime = 'edge'

export async function POST(request: Request) {
  const { prompt } = await request.json()

  const stream = ai.stream('gpt-4', prompt, {
    security: 'strict'
  })

  return streamResponse(stream)
}
```

## Request Format

Send POST requests with either:

**Simple prompt:**
```json
{
  "model": "gpt-4",
  "prompt": "Explain quantum computing",
  "stream": false
}
```

**Chat messages:**
```json
{
  "model": "claude-3-5-sonnet",
  "messages": [
    { "role": "user", "content": "What is AI?" }
  ],
  "stream": false
}
```

**Streaming:**
```json
{
  "model": "gpt-4",
  "prompt": "Tell me a story",
  "stream": true
}
```

## Response Format

**Non-streaming:**
```json
{
  "text": "Quantum computing is..."
}
```

**Streaming (Server-Sent Events):**
```
data: {"chunk":"Quantum"}

data: {"chunk":" computing"}

data: {"chunk":" is..."}

data: [DONE]
```

## Examples

### Next.js 14 App Router with Streaming

```typescript
// app/api/chat/route.ts
import { createEdgeHandler } from '@uni-ai/vercel'

export const runtime = 'edge'

export const POST = createEdgeHandler({
  security: 'strict'
})
```

```typescript
// app/components/Chat.tsx
'use client'

import { useState } from 'react'

export function Chat() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4',
        prompt: input,
        stream: false
      })
    })

    const data = await response.json()
    setMessages([...messages, data.text])
    setInput('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask anything..."
      />
      <button type="submit">Send</button>
    </form>
  )
}
```

### Pages Router with Custom Security

```typescript
// pages/api/chat.ts
import { createApiHandler } from '@uni-ai/vercel'
import { securityPresets } from '@uni-ai/sdk'

export default createApiHandler({
  security: {
    ...securityPresets.strict,
    rateLimiting: {
      ...securityPresets.strict.rateLimiting,
      maxRequestsPerMinute: 30 // Custom rate limit
    }
  }
})
```

### With Authentication

```typescript
// app/api/chat/route.ts
import { createEdgeHandler } from '@uni-ai/vercel'
import { verifyAuth } from '@/lib/auth'

export const runtime = 'edge'

const handler = createEdgeHandler({
  getUserId: (request) => {
    const auth = request.headers.get('authorization')
    if (!auth?.startsWith('Bearer ')) {
      throw new Error('Unauthorized')
    }
    return verifyAuth(auth.substring(7))
  }
})

export async function POST(request: Request) {
  try {
    return await handler(request)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return new Response('Unauthorized', { status: 401 })
    }
    throw error
  }
}
```

### Middleware Integration

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Add rate limiting, auth, etc.
  const userId = request.headers.get('x-user-id')

  if (!userId && request.nextUrl.pathname.startsWith('/api/chat')) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

## Environment Variables

Add your API keys to Vercel environment variables:

```bash
# Vercel CLI
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY

# Or in Vercel Dashboard
# Project Settings → Environment Variables
```

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### One-Click Deploy

Use the deploy button in your repository README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo)
```

## Edge Runtime vs API Routes

| Feature | Edge Runtime | API Routes |
|---------|-------------|------------|
| **Latency** | Lower (global edge) | Higher (regional) |
| **Cold Starts** | Minimal | Medium |
| **Runtime** | Limited Node.js APIs | Full Node.js |
| **Streaming** | ✅ Native | ⚠️ Limited |
| **Best For** | Real-time chat | Complex logic |
| **Next.js** | App Router | Pages Router |

**Recommendation:** Use Edge Runtime for most AI applications.

## Security Best Practices

1. **Always use security presets** in production
2. **Set appropriate rate limits** for your use case
3. **Enable PII detection** to protect user data
4. **Use environment variables** for API keys
5. **Implement authentication** for user-facing APIs
6. **Monitor usage** with Vercel Analytics

## TypeScript

Full TypeScript support with type inference:

```typescript
import { createEdgeHandler, type EdgeHandlerOptions } from '@uni-ai/vercel'

const options: EdgeHandlerOptions = {
  security: 'strict',
  getUserId: (request: Request): string => {
    return request.headers.get('x-user-id') || 'anonymous'
  }
}

export const runtime = 'edge'
export const POST = createEdgeHandler(options)
```

## Troubleshooting

### "Edge Runtime not supported"

Make sure you're using Next.js 13+ and have `export const runtime = 'edge'` in your route file.

### "Streaming not working"

Edge Runtime is required for streaming. API Routes have limited streaming support.

### "Rate limit errors"

Adjust the rate limit in your security configuration or implement user-based rate limiting.

## License

MIT

---

**Built with Uni AI SDK** - Secure. Portable. Open.
