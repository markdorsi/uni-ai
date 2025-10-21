# @uni-ai/react

React hooks and components for Uni AI SDK.

**Secure. Portable. Open.**

## Installation

```bash
npm install @uni-ai/react @uni-ai/sdk
```

## Quick Start

### useChat() - Conversational Chat

```tsx
import { useChat } from '@uni-ai/react'

function ChatComponent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    model: 'gpt-4',
    security: 'strict'
  })

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.role}:</strong> {m.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
```

### useCompletion() - Text Completion

```tsx
import { useCompletion } from '@uni-ai/react'

function CompletionComponent() {
  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useCompletion({
    model: 'gpt-4'
  })

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Enter a prompt..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Generate
        </button>
      </form>

      {completion && (
        <div>
          <h3>Result:</h3>
          <p>{completion}</p>
        </div>
      )}
    </div>
  )
}
```

## API Reference

### useChat(options)

Hook for managing conversational chat interfaces.

#### Options

- `model` (string, required) - The model to use (e.g., 'gpt-4', 'claude-3-5-sonnet')
- `initialMessages` (Message[]) - Initial conversation messages
- `security` ('strict' | 'moderate' | 'permissive') - Security preset
- `onResponse` ((message: Message) => void) - Callback when response received
- `onError` ((error: Error) => void) - Callback when error occurs
- `onFinish` ((message: Message) => void) - Callback when generation finishes

#### Returns

- `messages` (Message[]) - Current conversation messages
- `input` (string) - Current input value
- `setInput` ((input: string) => void) - Set input value
- `handleInputChange` ((e: ChangeEvent) => void) - Handle input changes
- `handleSubmit` ((e: FormEvent) => void) - Handle form submission
- `append` ((message: Message) => Promise<void>) - Add message programmatically
- `reload` (() => Promise<void>) - Regenerate last response
- `stop` (() => void) - Stop current generation
- `isLoading` (boolean) - Whether currently generating
- `error` (Error | null) - Current error if any

### useCompletion(options)

Hook for text completion interfaces.

#### Options

- `model` (string, required) - The model to use
- `initialCompletion` (string) - Initial completion text
- `initialInput` (string) - Initial input value
- `security` ('strict' | 'moderate' | 'permissive') - Security preset
- `onResponse` ((completion: string) => void) - Callback when response received
- `onError` ((error: Error) => void) - Callback when error occurs
- `onFinish` ((completion: string) => void) - Callback when generation finishes

#### Returns

- `completion` (string) - Current completion text
- `input` (string) - Current input value
- `setInput` ((input: string) => void) - Set input value
- `handleInputChange` ((e: ChangeEvent) => void) - Handle input changes
- `handleSubmit` ((e: FormEvent) => void) - Handle form submission
- `complete` ((prompt: string) => Promise<void>) - Generate completion
- `stop` (() => void) - Stop current generation
- `isLoading` (boolean) - Whether currently generating
- `error` (Error | null) - Current error if any

## Examples

### Chat with Initial Messages

```tsx
const { messages, input, handleInputChange, handleSubmit } = useChat({
  model: 'gpt-4',
  initialMessages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello!' },
    { role: 'assistant', content: 'Hi! How can I help you today?' }
  ]
})
```

### Programmatic Message Sending

```tsx
const { append, messages } = useChat({ model: 'gpt-4' })

// Send a message programmatically
await append({
  role: 'user',
  content: 'What is the weather like?'
})
```

### Error Handling

```tsx
const { error, isLoading } = useChat({
  model: 'gpt-4',
  onError: (error) => {
    console.error('Chat error:', error)
    // Show toast notification, etc.
  }
})

return (
  <div>
    {error && <div className="error">{error.message}</div>}
    {/* ... rest of UI */}
  </div>
)
```

### Completion with Callbacks

```tsx
const { completion } = useCompletion({
  model: 'gpt-4',
  onFinish: (text) => {
    console.log('Generation complete:', text.length, 'characters')
    // Save to database, update analytics, etc.
  }
})
```

### Using Different Providers

```tsx
// OpenAI
const gptChat = useChat({ model: 'gpt-4' })

// Anthropic/Claude
const claudeChat = useChat({ model: 'claude-3-5-sonnet' })

// Both work the same way!
```

## TypeScript

Full TypeScript support with exported types:

```tsx
import {
  useChat,
  useCompletion,
  type UseChatOptions,
  type UseChatReturn,
  type UseCompletionOptions,
  type UseCompletionReturn,
  type Message,
  type MessageRole
} from '@uni-ai/react'
```

## Security

All hooks inherit security features from `@uni-ai/sdk`:

- Rate limiting
- PII detection
- Input validation
- Prompt injection protection

Set security level via the `security` option:

```tsx
const { messages, input, handleSubmit } = useChat({
  model: 'gpt-4',
  security: 'strict' // Recommended for production
})
```

## SSR / Next.js Compatibility

These hooks are client-side only. Use them in client components:

```tsx
'use client'

import { useChat } from '@uni-ai/react'

export function ChatComponent() {
  const chat = useChat({ model: 'gpt-4' })
  // ...
}
```

## Environment Variables

Set your API keys:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

## License

MIT

---

**Part of the Uni AI SDK**: Secure. Portable. Open.
