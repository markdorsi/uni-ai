# Core SDK API Reference

Complete API reference for `@uni-ai/sdk`.

## ai()

Simple function for one-line AI calls.

### Signature

```typescript
function ai(
  model: string,
  prompt: string,
  options?: AIOptions
): Promise<string>
```

### Parameters

- **model** (`string`) - AI model to use (e.g., `'gpt-4'`, `'claude-3-5-sonnet'`)
- **prompt** (`string`) - Text prompt to send to the AI
- **options** (`AIOptions`, optional) - Configuration options

### Returns

`Promise<string>` - The AI's text response

### Example

```typescript
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Explain quantum computing')
console.log(text)
```

With options:

```typescript
const text = await ai('gpt-4', userInput, {
  security: 'strict',
  temperature: 0.7,
  maxTokens: 1000
})
```

---

## ai.stream()

Stream AI responses in real-time.

### Signature

```typescript
function stream(
  model: string,
  prompt: string,
  options?: AIOptions
): AsyncIterable<string>
```

### Parameters

Same as `ai()`.

### Returns

`AsyncIterable<string>` - Async iterator of text chunks

### Example

```typescript
import { ai } from '@uni-ai/sdk'

for await (const chunk of ai.stream('gpt-4', 'Tell me a story')) {
  process.stdout.write(chunk)
}
```

---

## generate()

Advanced function with full control over AI generation.

### Signature

```typescript
function generate(
  options: GenerateOptions
): Promise<GenerateResult>
```

### Parameters

- **options** (`GenerateOptions`) - Generation configuration

#### GenerateOptions

```typescript
interface GenerateOptions {
  // Required
  model: string
  messages: Message[]

  // Optional generation parameters
  temperature?: number          // 0.0 - 2.0, default: 1.0
  maxTokens?: number           // Max tokens to generate
  topP?: number                // 0.0 - 1.0, nucleus sampling
  presencePenalty?: number     // -2.0 - 2.0
  frequencyPenalty?: number    // -2.0 - 2.0
  stopSequences?: string[]     // Stop generation at these strings

  // Security
  security?: 'strict' | 'moderate' | 'permissive' | SecurityConfig
  userId?: string              // For rate limiting

  // Streaming
  stream?: boolean
  onChunk?: (chunk: string) => void
}
```

### Returns

`Promise<GenerateResult>`

#### GenerateResult

```typescript
interface GenerateResult {
  text: string
  finishReason: 'stop' | 'length' | 'content_filter'
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  model: string
}
```

### Example

```typescript
import { generate } from '@uni-ai/sdk'

const result = await generate({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  maxTokens: 500,
  security: 'strict'
})

console.log(result.text)
console.log(result.usage)
```

With streaming:

```typescript
const result = await generate({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
  onChunk: (chunk) => {
    process.stdout.write(chunk)
  }
})

console.log('\n\nFull text:', result.text)
```

---

## Types

### Message

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}
```

**Example:**

```typescript
const messages: Message[] = [
  { role: 'system', content: 'You are a helpful assistant' },
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'What is TypeScript?' }
]
```

### SecurityConfig

```typescript
interface SecurityConfig {
  rateLimiting?: {
    maxRequestsPerMinute?: number
    maxRequestsPerHour?: number
  }
  piiDetection?: {
    enabled?: boolean
    action?: 'redact' | 'block' | 'warn'
    customPatterns?: RegExp[]
  }
  inputValidation?: {
    maxLength?: number
    sanitize?: boolean
    allowedChars?: string
    blockedPatterns?: RegExp[]
  }
  promptInjection?: {
    enabled?: boolean
    action?: 'block' | 'warn'
    customPatterns?: RegExp[]
  }
}
```

**Example:**

```typescript
const customSecurity: SecurityConfig = {
  rateLimiting: {
    maxRequestsPerMinute: 30,
    maxRequestsPerHour: 200
  },
  piiDetection: {
    enabled: true,
    action: 'redact'
  }
}

await generate({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
  security: customSecurity
})
```

---

## Security Presets

Pre-configured security settings.

### securityPresets.strict

```typescript
import { securityPresets } from '@uni-ai/sdk'

console.log(securityPresets.strict)
// {
//   rateLimiting: { maxRequestsPerMinute: 20, maxRequestsPerHour: 100 },
//   piiDetection: { enabled: true, action: 'redact' },
//   inputValidation: { maxLength: 4000, sanitize: true },
//   promptInjection: { enabled: true, action: 'block' }
// }
```

### securityPresets.moderate

```typescript
console.log(securityPresets.moderate)
// {
//   rateLimiting: { maxRequestsPerMinute: 60, maxRequestsPerHour: 500 },
//   piiDetection: { enabled: true, action: 'warn' },
//   inputValidation: { maxLength: 8000, sanitize: true },
//   promptInjection: { enabled: true, action: 'warn' }
// }
```

### securityPresets.permissive

```typescript
console.log(securityPresets.permissive)
// {
//   rateLimiting: { maxRequestsPerMinute: 120, maxRequestsPerHour: 1000 },
//   piiDetection: { enabled: false },
//   inputValidation: { maxLength: 16000, sanitize: false },
//   promptInjection: { enabled: false }
// }
```

**Usage:**

```typescript
import { generate, securityPresets } from '@uni-ai/sdk'

await generate({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello' }],
  security: {
    ...securityPresets.strict,
    rateLimiting: {
      maxRequestsPerMinute: 10  // Override just this
    }
  }
})
```

---

## Provider Registry

Manage AI providers.

### registerProvider()

Register a custom AI provider.

```typescript
function registerProvider(
  name: string,
  provider: Provider
): void
```

**Example:**

```typescript
import { registerProvider, type Provider } from '@uni-ai/sdk'

class MyCustomProvider implements Provider {
  async generate(options) {
    // Custom implementation
  }

  async stream(options) {
    // Custom implementation
  }
}

registerProvider('my-provider', new MyCustomProvider())

// Now you can use it
await ai('my-custom-model', 'Hello')
```

### registerModel()

Register a model alias.

```typescript
function registerModel(
  modelName: string,
  providerName: string
): void
```

**Example:**

```typescript
import { registerModel } from '@uni-ai/sdk'

registerModel('gpt4-latest', 'openai')

await ai('gpt4-latest', 'Hello')
```

---

## Error Handling

All functions may throw these errors:

### Common Errors

```typescript
try {
  await ai('gpt-4', userInput, { security: 'strict' })
} catch (error) {
  if (error.message.includes('API key not found')) {
    // Missing or invalid API key
  } else if (error.message.includes('PII detected')) {
    // Input contains sensitive information
  } else if (error.message.includes('Rate limit exceeded')) {
    // Too many requests
  } else if (error.message.includes('Prompt injection')) {
    // Malicious prompt detected
  } else if (error.message.includes('Input too long')) {
    // Input exceeds max length
  } else {
    // Other errors
  }
}
```

### Error Types

- **Authentication Errors** - Invalid or missing API keys
- **Security Errors** - PII detected, prompt injection, rate limits
- **Validation Errors** - Invalid input, too long, etc.
- **Provider Errors** - AI provider API errors
- **Network Errors** - Connection issues

---

## Environment Variables

### Required (choose at least one)

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
```

### Optional

```bash
# Ollama (local models)
OLLAMA_BASE_URL=http://localhost:11434

# Google (alternative to GEMINI_API_KEY)
GOOGLE_API_KEY=...
```

---

## Supported Models

### OpenAI

- `gpt-4`
- `gpt-4-turbo`
- `gpt-4o`
- `gpt-3.5-turbo`

### Anthropic

- `claude-3-5-sonnet`
- `claude-3-5-sonnet-20241022`
- `claude-3-opus`
- `claude-3-opus-20240229`
- `claude-3-sonnet-20240229`
- `claude-3-haiku-20240307`

### Google Gemini

- `gemini-2.0-flash`
- `gemini-1.5-pro`
- `gemini-1.5-flash`
- `gemini-pro`

### Ollama (Local)

- `llama3.2`
- `llama3.1`
- `llama2`
- `mistral`
- `mixtral`
- `codellama`
- `phi`
- `qwen`

---

## Next Steps

- [React Hooks API](/api/react) - React hooks reference
- [Vercel Adapter API](/api/vercel) - Vercel adapter reference
- [Netlify Adapter API](/api/netlify) - Netlify adapter reference
- [Type Definitions](/api/types/messages) - Complete type reference
