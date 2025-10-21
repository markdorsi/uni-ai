# Quick Start

Build your first AI-powered application with Uni AI SDK in under 5 minutes.

## Simple Text Generation

The simplest way to use Uni AI is with the `ai()` function:

```typescript
import { ai } from '@uni-ai/sdk'

// Basic usage
const response = await ai('gpt-4', 'What is the meaning of life?')
console.log(response)
```

## With Security

Add security in production:

```typescript
import { ai } from '@uni-ai/sdk'

const userInput = "What's my social security number: 123-45-6789?"

const response = await ai('gpt-4', userInput, {
  security: 'strict'
})

// PII is automatically redacted!
console.log(response)
```

## Streaming Responses

Get real-time responses as they're generated:

```typescript
import { ai } from '@uni-ai/sdk'

console.log('AI: ')
for await (const chunk of ai.stream('gpt-4', 'Tell me a short story')) {
  process.stdout.write(chunk)
}
console.log('\n')
```

## Chat Conversations

Build conversational interfaces:

```typescript
import { generate, type Message } from '@uni-ai/sdk'

const messages: Message[] = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Hello! What can you help me with?' }
]

const result = await generate({
  model: 'gpt-4',
  messages,
  security: 'strict'
})

// Add assistant response to history
messages.push({
  role: 'assistant',
  content: result.text
})

// Continue conversation
messages.push({
  role: 'user',
  content: 'Tell me about AI safety'
})

const nextResult = await generate({
  model: 'gpt-4',
  messages,
  security: 'strict'
})

console.log(nextResult.text)
```

## Building a Web API

Create an API endpoint with security built-in:

::: code-group

```typescript [Vercel Edge]
import { createEdgeHandler } from '@uni-ai/vercel'

export const runtime = 'edge'

export const POST = createEdgeHandler({
  security: 'strict'
})
```

```typescript [Netlify Edge]
import { createEdgeHandler } from '@uni-ai/netlify'

export default createEdgeHandler({
  security: 'strict'
})

export const config = { path: '/api/chat' }
```

```typescript [Express]
import express from 'express'
import { generate } from '@uni-ai/sdk'

const app = express()
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model } = req.body

    const result = await generate({
      model: model || 'gpt-4',
      messages,
      security: 'strict'
    })

    res.json({
      message: {
        role: 'assistant',
        content: result.text
      },
      usage: result.usage
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000)
```

:::

## React Hook

Use Uni AI in React applications:

```tsx
import { useChat } from '@uni-ai/react'

function ChatComponent() {
  const { messages, input, setInput, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    initialMessages: [
      { role: 'system', content: 'You are a helpful assistant.' }
    ]
  })

  return (
    <div>
      <div className="messages">
        {messages
          .filter(m => m.role !== 'system')
          .map((message, i) => (
            <div key={i} className={message.role}>
              {message.content}
            </div>
          ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  )
}
```

## Advanced Configuration

Customize generation parameters:

```typescript
import { generate } from '@uni-ai/sdk'

const result = await generate({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Write a poem about TypeScript' }
  ],

  // Generation parameters
  temperature: 0.9,      // Higher = more creative
  maxTokens: 500,        // Limit response length
  topP: 0.95,           // Nucleus sampling
  presencePenalty: 0.6,  // Encourage new topics
  frequencyPenalty: 0.5, // Reduce repetition

  // Security
  security: 'strict',

  // Streaming callback
  onChunk: (chunk) => {
    process.stdout.write(chunk)
  }
})

console.log('\n\nFull response:', result.text)
console.log('Tokens used:', result.usage)
```

## Error Handling

Handle errors gracefully:

```typescript
import { ai } from '@uni-ai/sdk'

try {
  const response = await ai('gpt-4', userInput, {
    security: 'strict'
  })
  console.log(response)
} catch (error) {
  if (error.message.includes('PII detected')) {
    console.error('Input contains sensitive information')
  } else if (error.message.includes('Rate limit')) {
    console.error('Too many requests, please wait')
  } else if (error.message.includes('API key')) {
    console.error('Invalid or missing API key')
  } else {
    console.error('An error occurred:', error.message)
  }
}
```

## Multiple Providers

Switch between providers easily:

```typescript
import { ai } from '@uni-ai/sdk'

const prompt = 'Explain quantum entanglement'

// Try multiple providers
const providers = [
  'gpt-4',
  'claude-3-5-sonnet',
  'gemini-2.0-flash',
  'llama3.2'
]

for (const model of providers) {
  console.log(`\n--- ${model} ---`)
  const response = await ai(model, prompt)
  console.log(response)
}
```

## Environment-Specific Configuration

Use different settings per environment:

```typescript
import { ai } from '@uni-ai/sdk'

const securityLevel = process.env.NODE_ENV === 'production'
  ? 'strict'
  : 'permissive'

const response = await ai('gpt-4', userInput, {
  security: securityLevel
})
```

## Complete Example

Here's a complete example combining everything:

```typescript
import { generate, type Message } from '@uni-ai/sdk'

class AIChat {
  private messages: Message[] = []

  constructor(systemPrompt: string) {
    this.messages.push({
      role: 'system',
      content: systemPrompt
    })
  }

  async send(userMessage: string): Promise<string> {
    // Add user message
    this.messages.push({
      role: 'user',
      content: userMessage
    })

    try {
      // Generate response
      const result = await generate({
        model: 'gpt-4',
        messages: this.messages,
        temperature: 0.7,
        security: 'strict'
      })

      // Add assistant response
      this.messages.push({
        role: 'assistant',
        content: result.text
      })

      return result.text
    } catch (error) {
      console.error('Error:', error.message)
      throw error
    }
  }

  getHistory(): Message[] {
    return this.messages
  }

  clear(): void {
    const systemMessage = this.messages[0]
    this.messages = [systemMessage]
  }
}

// Usage
const chat = new AIChat('You are a helpful coding assistant.')

const response1 = await chat.send('How do I use async/await?')
console.log(response1)

const response2 = await chat.send('Can you show me an example?')
console.log(response2)

console.log('\nConversation history:', chat.getHistory())
```

## Next Steps

- [Security Guide](/guide/security) - Learn about security features
- [AI Providers](/guide/providers) - Explore supported providers
- [Streaming](/guide/streaming) - Master streaming responses
- [Platform Guides](/guide/platforms/vercel) - Deploy to production
- [Examples](/examples/) - See full applications
- [API Reference](/api/core) - Complete API docs
