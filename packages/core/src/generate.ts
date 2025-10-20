import type {
  GenerateOptions,
  GenerateResult,
  LanguageModelProvider,
  StreamChunk,
} from './types/index.js'
import { applySecurityMiddleware } from './security/index.js'
import { getProvider } from './providers/registry.js'

/**
 * Advanced generation API with full control
 *
 * @example
 * ```ts
 * import { generate } from '@uni-ai/sdk'
 *
 * const result = await generate({
 *   model: 'gpt-4',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   temperature: 0.7,
 *   maxTokens: 1000,
 *   security: 'strict'
 * })
 *
 * console.log(result.text)
 * console.log(result.usage)
 * ```
 */
export async function generate(
  options: GenerateOptions
): Promise<GenerateResult & { textStream?: AsyncIterable<string> }> {
  // Apply security middleware
  const secureOptions = await applySecurityMiddleware(options)

  // Get provider for this model
  const provider = getProvider(secureOptions.model)

  // Handle streaming
  if (secureOptions.stream) {
    return streamGenerate(provider, secureOptions)
  }

  // Handle blocking generation
  return provider.generateText(secureOptions)
}

/**
 * Internal: Handle streaming generation
 */
async function streamGenerate(
  provider: LanguageModelProvider,
  options: GenerateOptions
): Promise<GenerateResult & { textStream: AsyncIterable<string> }> {
  let fullText = ''
  let usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }
  let finishReason: GenerateResult['finishReason'] = 'stop'

  const textStream = async function* () {
    const stream = provider.streamText(options)

    for await (const chunk of stream) {
      switch (chunk.type) {
        case 'text-delta':
          fullText += chunk.textDelta
          yield chunk.textDelta
          break

        case 'finish':
          usage = chunk.usage
          finishReason = chunk.finishReason
          break

        case 'error':
          throw chunk.error
      }
    }
  }()

  return {
    text: fullText,
    usage,
    finishReason,
    textStream,
  }
}

/**
 * Re-export stream function from ai module
 */
export { stream } from './ai.js'
