/**
 * Uni AI SDK
 * Secure. Portable. Open.
 *
 * @example
 * Simple usage:
 * ```ts
 * import { ai } from '@uni-ai/sdk'
 *
 * const text = await ai('gpt-4', 'Explain quantum computing')
 * console.log(text)
 * ```
 *
 * @example
 * Streaming:
 * ```ts
 * for await (const chunk of ai.stream('gpt-4', 'Write a story')) {
 *   process.stdout.write(chunk)
 * }
 * ```
 *
 * @example
 * Advanced:
 * ```ts
 * import { generate } from '@uni-ai/sdk'
 *
 * const result = await generate({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   temperature: 0.7,
 *   security: 'strict'
 * })
 * ```
 */

// Main API
export { ai } from './ai.js'
export { generate } from './generate.js'

// Security
export { securityPresets } from './security/presets.js'
export type { SecurityConfig, SecurityPreset } from './types/index.js'

// Providers
export { createOpenAI, createAnthropic } from './providers/index.js'
export { registerProvider } from './providers/registry.js'

// Types
export type {
  Message,
  MessageRole,
  GenerateOptions,
  GenerateResult,
  TokenUsage,
  Tool,
  ToolCall,
  ToolResult,
  StreamChunk,
  LanguageModelProvider,
} from './types/index.js'

// Errors
export { SecurityError } from './security/index.js'
export { ValidationError } from './security/validation.js'
export { RateLimitError } from './security/rate-limit.js'
export { OpenAIError } from './providers/openai.js'
export { AnthropicError } from './providers/anthropic.js'
