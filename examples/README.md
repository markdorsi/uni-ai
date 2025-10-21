# Uni AI SDK Examples

Practical examples demonstrating how to use Uni AI SDK in real-world applications.

## Prerequisites

```bash
# Install dependencies from root
npm install

# Build the SDK
npm run build

# Set your OpenAI API key
export OPENAI_API_KEY=sk-...
```

## Running Examples

All examples use `tsx` for TypeScript execution:

```bash
# Run any example
npx tsx examples/[category]/[file].ts
```

---

## Examples Overview

### 🎯 Basic Usage

**File**: `packages/core/examples/basic.ts`

The simplest way to get started. Shows:
- Simple text generation
- Streaming responses
- Security presets
- Temperature control

```bash
npx tsx packages/core/examples/basic.ts
```

**Code**:
```typescript
import { ai } from '@uni-ai/sdk'

// Simple generation
const text = await ai('gpt-4', 'Explain quantum computing')

// Streaming
for await (const chunk of ai.stream('gpt-4', 'Write a haiku')) {
  process.stdout.write(chunk)
}

// With options
const creative = await ai('gpt-4', 'Write a story', {
  temperature: 0.9,
  security: 'strict'
})
```

---

### 💬 Chatbot

**File**: `examples/chatbot/simple-cli.ts`

Interactive CLI chatbot demonstrating:
- Multi-turn conversations
- Conversation history management
- Streaming to terminal
- User input handling

```bash
npx tsx examples/chatbot/simple-cli.ts
```

**Features**:
- Maintains conversation context
- Streams AI responses in real-time
- Type "exit" to quit

**Code Snippet**:
```typescript
const history: Message[] = []

history.push({ role: 'user', content: userInput })

for await (const chunk of ai.stream('gpt-4', history)) {
  process.stdout.write(chunk)
}
```

---

### 🌊 Server-Sent Events (SSE) Streaming

**File**: `examples/streaming/sse-server.ts`

Full HTTP server example with web UI showing:
- SSE streaming to browsers
- CORS configuration
- Real-time text streaming
- Built-in HTML client

```bash
npx tsx examples/streaming/sse-server.ts
# Open http://localhost:3000
```

**Features**:
- Works with any HTTP client
- Browser-compatible SSE
- Simple HTML demo interface
- Platform-agnostic (works on Node, Netlify, Vercel, etc.)

**Client Code**:
```javascript
const eventSource = new EventSource('/stream?prompt=Hello')

eventSource.onmessage = (event) => {
  if (event.data === '[DONE]') {
    eventSource.close()
    return
  }
  output.textContent += event.data
}
```

---

### 🔄 Multi-Turn Conversations

**File**: `examples/conversations/multi-turn.ts`

Advanced conversation patterns:
- Context retention across messages
- System prompts
- Conversation branching
- Context window management

```bash
npx tsx examples/conversations/multi-turn.ts
```

**Demonstrates**:
- **Basic conversation**: AI remembers previous messages
- **System prompts**: Setting AI personality/behavior
- **Context management**: Trimming messages for long conversations
- **Branching**: Creating multiple conversation paths from same base

**Code Snippet**:
```typescript
const messages: Message[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'My name is Alice.' },
]

let result = await generate({ model: 'gpt-4', messages })

messages.push({ role: 'assistant', content: result.text })
messages.push({ role: 'user', content: 'What is my name?' })

result = await generate({ model: 'gpt-4', messages })
// AI will remember: "Your name is Alice"
```

---

## API Quick Reference

### Simple API

```typescript
import { ai } from '@uni-ai/sdk'

// Basic
const text = await ai('gpt-4', 'Your prompt')

// Streaming
for await (const chunk of ai.stream('gpt-4', 'Your prompt')) {
  console.log(chunk)
}

// With options
const text = await ai('gpt-4', 'Your prompt', {
  temperature: 0.7,        // 0.0 to 2.0
  maxTokens: 500,          // Response length
  security: 'strict'       // 'strict' | 'moderate' | 'permissive'
})
```

### Advanced API

```typescript
import { generate } from '@uni-ai/sdk'
import type { Message } from '@uni-ai/sdk'

const messages: Message[] = [
  { role: 'system', content: 'System prompt' },
  { role: 'user', content: 'User message' },
  { role: 'assistant', content: 'AI response' },
  { role: 'user', content: 'Follow-up' }
]

const result = await generate({
  model: 'gpt-4',
  messages,
  temperature: 0.7,
  maxTokens: 1000,
  security: 'moderate',
  // More options available...
})

console.log(result.text)
console.log(result.usage) // Token usage stats
```

---

## Security Presets

All examples use security by default:

- **`strict`**: Maximum security
  - 10 requests/min, 100/hour
  - PII detection enabled
  - Content moderation
  - Prompt injection protection

- **`moderate`** (default): Balanced
  - 30 requests/min, 500/hour
  - PII warnings
  - Basic moderation

- **`permissive`**: Minimal restrictions
  - 100 requests/min, 2000/hour
  - No PII detection
  - No moderation

```typescript
// Override security preset
await ai('gpt-4', prompt, { security: 'strict' })
```

---

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
ANTHROPIC_API_KEY=sk-ant-...  # For Claude (coming in Week 2)
```

---

## Platform Deployment Examples

### Netlify Edge Function

```typescript
// netlify/edge-functions/chat.ts
import { ai } from '@uni-ai/sdk'

export default async (request: Request) => {
  const { prompt } = await request.json()
  const text = await ai('gpt-4', prompt)
  return new Response(JSON.stringify({ text }))
}
```

### Vercel Serverless Function

```typescript
// api/chat.ts
import { ai } from '@uni-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async (req: VercelRequest, res: VercelResponse) => {
  const { prompt } = req.body
  const text = await ai('gpt-4', prompt)
  res.json({ text })
}
```

### Express.js API

```typescript
import express from 'express'
import { ai } from '@uni-ai/sdk'

const app = express()
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  const text = await ai('gpt-4', req.body.prompt)
  res.json({ text })
})

app.listen(3000)
```

---

## Common Patterns

### Error Handling

```typescript
try {
  const text = await ai('gpt-4', prompt)
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Handle rate limiting
  } else if (error.message.includes('PII detected')) {
    // Handle PII violation
  } else {
    // Handle other errors
  }
}
```

### Streaming with Timeout

```typescript
const timeout = setTimeout(() => {
  throw new Error('Streaming timeout')
}, 30000)

for await (const chunk of ai.stream('gpt-4', prompt)) {
  clearTimeout(timeout)
  process.stdout.write(chunk)
  timeout.refresh()
}

clearTimeout(timeout)
```

### Conversation Trimming

```typescript
const MAX_MESSAGES = 20

function trimConversation(messages: Message[]): Message[] {
  if (messages.length <= MAX_MESSAGES) return messages

  // Keep system message + recent messages
  const systemMessages = messages.filter(m => m.role === 'system')
  const recentMessages = messages.slice(-MAX_MESSAGES)

  return [...systemMessages, ...recentMessages]
}
```

---

## Coming Soon

- ⚛️ React hooks example (`useChat`, `useCompletion`)
- 🔧 Tool calling / function calling
- 🎨 Image generation
- 🗣️ Speech-to-text
- 📊 Token counting and cost estimation
- 🌐 Multi-provider example (OpenAI + Claude + Gemini)

---

## Need Help?

- **Documentation**: [README.md](../README.md)
- **Issues**: [GitHub Issues](https://github.com/markdorsi/uni-ai/issues)
- **Contributing**: [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**Uni AI SDK**: Secure. Portable. Open.
