# @uni-ai/netlify

Netlify adapters for Uni AI SDK - simplified AI integration for Netlify Edge Functions and Serverless Functions.

## Installation

```bash
npm install @uni-ai/sdk @uni-ai/netlify
```

## Features

- ✅ **Edge Function Helpers** - Simplified Edge Functions with built-in streaming
- ✅ **Serverless Function Helpers** - Easy serverless function creation
- ✅ **Automatic Security** - Built-in rate limiting and PII detection
- ✅ **TypeScript** - Full type safety
- ✅ **Streaming Support** - Server-Sent Events for real-time responses
- ✅ **Context Extraction** - Automatic user ID and IP extraction

## Quick Start

### Edge Functions

```typescript
// netlify/edge-functions/chat.ts
import { createEdgeHandler } from '@uni-ai/netlify'

export default createEdgeHandler({
  security: 'strict'
})

export const config = { path: '/api/chat' }
```

That's it! The handler automatically:
- Accepts POST requests with `{ model, prompt }` or `{ model, messages }`
- Applies strict security (rate limiting, PII detection)
- Handles streaming responses
- Returns formatted JSON responses

### Serverless Functions

```typescript
// netlify/functions/completion.ts
import { createServerlessHandler } from '@uni-ai/netlify'

export const handler = createServerlessHandler({
  security: 'moderate'
})
```

## API Reference

### `createEdgeHandler(options?)`

Creates a Netlify Edge Function handler.

**Options:**

```typescript
interface EdgeHandlerOptions {
  security?: 'strict' | 'moderate' | 'permissive' | SecurityConfig
  getUserId?: (request: Request, context: Context) => string
  onError?: (error: Error, request: Request, context: Context) => Response | Promise<Response>
}
```

**Example with custom options:**

```typescript
import { createEdgeHandler } from '@uni-ai/netlify'

export default createEdgeHandler({
  security: 'strict',
  getUserId: (request, context) => {
    // Extract user ID from JWT or session
    return context.cookies.get('user_id') || context.ip
  },
  onError: async (error, request, context) => {
    // Custom error logging
    console.error('AI request failed:', {
      error: error.message,
      ip: context.ip,
      path: new URL(request.url).pathname
    })

    return new Response(
      JSON.stringify({ error: 'AI service unavailable' }),
      { status: 503 }
    )
  }
})
```

### `createServerlessHandler(options?)`

Creates a Netlify Serverless Function handler.

**Options:**

```typescript
interface ServerlessHandlerOptions {
  security?: 'strict' | 'moderate' | 'permissive' | SecurityConfig
  getUserId?: (event: any) => string
  onError?: (error: Error, event: any) => any
}
```

**Example:**

```typescript
import { createServerlessHandler } from '@uni-ai/netlify'

export const handler = createServerlessHandler({
  security: {
    rateLimiting: {
      enabled: true,
      maxRequestsPerMinute: 10
    },
    piiDetection: {
      enabled: true,
      redact: true
    }
  },
  getUserId: (event) => {
    return event.headers['x-user-id'] || event.headers['x-forwarded-for']
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
import { ai } from '@uni-ai/sdk'
import { streamResponse } from '@uni-ai/netlify'
import type { Context } from '@netlify/edge-functions'

export default async (request: Request, context: Context) => {
  const { prompt } = await request.json()

  const stream = ai.stream('gpt-4', prompt, {
    security: 'strict',
    userId: context.ip
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

### Custom Security Configuration

```typescript
import { createEdgeHandler } from '@uni-ai/netlify'
import { securityPresets } from '@uni-ai/sdk'

export default createEdgeHandler({
  security: {
    ...securityPresets.strict,
    rateLimiting: {
      ...securityPresets.strict.rateLimiting,
      maxRequestsPerMinute: 20 // Custom rate limit
    }
  }
})
```

### With Authentication

```typescript
import { createEdgeHandler } from '@uni-ai/netlify'

const handler = createEdgeHandler({
  getUserId: (request, context) => {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('Unauthorized')
    }

    // Verify JWT and extract user ID
    const token = authHeader.substring(7)
    const userId = verifyToken(token)

    return userId
  }
})

export default async (request: Request, context: Context) => {
  try {
    return await handler(request, context)
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return new Response('Unauthorized', { status: 401 })
    }
    throw error
  }
}
```

### Environment Variables

Add your API keys to Netlify environment variables:

```bash
# Netlify CLI
netlify env:set OPENAI_API_KEY sk-...
netlify env:set ANTHROPIC_API_KEY sk-ant-...

# Or in Netlify UI
# Site Settings → Environment Variables
```

## Deployment

### netlify.toml

```toml
[build]
  publish = "public"

[[edge_functions]]
  path = "/api/chat"
  function = "chat"

[context.production.environment]
  # Set these in Netlify UI
  # OPENAI_API_KEY
  # ANTHROPIC_API_KEY
```

### Deploy

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Security Best Practices

1. **Always use security presets** in production
2. **Set rate limits** appropriate for your use case
3. **Enable PII detection** to protect user data
4. **Use environment variables** for API keys
5. **Implement authentication** for user-facing APIs
6. **Monitor usage** and set billing alerts

## TypeScript

Full TypeScript support with type inference:

```typescript
import { createEdgeHandler, type EdgeHandlerOptions } from '@uni-ai/netlify'
import type { Context } from '@netlify/edge-functions'

const options: EdgeHandlerOptions = {
  security: 'strict',
  getUserId: (request: Request, context: Context): string => {
    return context.ip
  }
}

export default createEdgeHandler(options)
```

## License

MIT

---

**Built with Uni AI SDK** - Secure. Portable. Open.
