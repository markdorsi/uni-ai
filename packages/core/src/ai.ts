import type { Message, GenerateOptions, SecurityPreset } from './types/index.js'
import { generate } from './generate.js'

/**
 * Simple AI function - the 5-second quickstart
 *
 * @example
 * Basic usage:
 * ```ts
 * const text = await ai('gpt-4', 'Explain quantum computing')
 * console.log(text)
 * ```
 *
 * @example
 * With options:
 * ```ts
 * const text = await ai('gpt-4', 'Write a haiku', {
 *   security: 'strict',
 *   temperature: 0.8
 * })
 * ```
 *
 * @param model - Model identifier (e.g., 'gpt-4', 'claude-3-5-sonnet')
 * @param prompt - User prompt or array of messages
 * @param options - Optional generation parameters
 * @returns The generated text
 */
export async function ai(
  model: string,
  prompt: string | Message[],
  options?: {
    security?: SecurityPreset
    temperature?: number
    maxTokens?: number
    topP?: number
  }
): Promise<string> {
  const messages = typeof prompt === 'string'
    ? [{ role: 'user' as const, content: prompt }]
    : prompt

  const result = await generate({
    model,
    messages,
    security: options?.security || 'moderate',
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
    topP: options?.topP,
  })

  return result.text
}

/**
 * Streaming version of ai()
 *
 * @example
 * ```ts
 * for await (const chunk of ai.stream('gpt-4', 'Write a story')) {
 *   process.stdout.write(chunk)
 * }
 * ```
 */
export async function* stream(
  model: string,
  prompt: string | Message[],
  options?: Parameters<typeof ai>[2]
): AsyncGenerator<string, void, undefined> {
  const messages = typeof prompt === 'string'
    ? [{ role: 'user' as const, content: prompt }]
    : prompt

  const result = await generate({
    model,
    messages,
    stream: true,
    security: options?.security || 'moderate',
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
    topP: options?.topP,
  })

  if (!result.textStream) {
    throw new Error('Streaming not supported')
  }

  for await (const chunk of result.textStream) {
    yield chunk
  }
}

// Attach stream method to ai function
ai.stream = stream

/**
 * Advanced generation API
 * Re-export for convenience
 */
ai.generate = generate
