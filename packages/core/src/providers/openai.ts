import type {
  LanguageModelProvider,
  GenerateOptions,
  GenerateResult,
  StreamChunk,
  ProviderOptions,
  Message,
  TokenUsage,
} from '../types/index.js'

/**
 * OpenAI provider implementation
 */
export function createOpenAI(options?: ProviderOptions): LanguageModelProvider {
  const apiKey = options?.apiKey || process.env.OPENAI_API_KEY
  const baseURL = options?.baseURL || 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error(
      'OpenAI API key not found. Set OPENAI_API_KEY environment variable or pass apiKey option.'
    )
  }

  return {
    id: 'openai',
    name: 'OpenAI',

    async generateText(opts: GenerateOptions): Promise<GenerateResult> {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: opts.model,
          messages: convertMessages(opts.messages || []),
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
          top_p: opts.topP,
          frequency_penalty: opts.frequencyPenalty,
          presence_penalty: opts.presencePenalty,
          stop: opts.stopSequences,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new OpenAIError(
          error.error?.message || 'OpenAI API request failed',
          error
        )
      }

      const data = await response.json()
      const choice = data.choices[0]

      return {
        text: choice.message.content,
        usage: {
          inputTokens: data.usage.prompt_tokens,
          outputTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        finishReason: mapFinishReason(choice.finish_reason),
      }
    },

    async *streamText(opts: GenerateOptions): AsyncIterable<StreamChunk> {
      const response = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: opts.model,
          messages: convertMessages(opts.messages || []),
          temperature: opts.temperature,
          max_tokens: opts.maxTokens,
          top_p: opts.topP,
          stream: true,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new OpenAIError(
          error.error?.message || 'OpenAI API request failed',
          error
        )
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('Response body is not readable')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let usage: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.trim() || line.trim() === 'data: [DONE]') continue
            if (!line.startsWith('data: ')) continue

            try {
              const data = JSON.parse(line.slice(6))
              const choice = data.choices[0]

              if (choice.delta?.content) {
                yield {
                  type: 'text-delta',
                  textDelta: choice.delta.content,
                }
              }

              if (choice.finish_reason) {
                // OpenAI doesn't provide usage in streaming mode
                // We'll estimate or leave as 0
                yield {
                  type: 'finish',
                  usage,
                  finishReason: mapFinishReason(choice.finish_reason),
                }
              }
            } catch (err) {
              // Skip invalid JSON
              console.warn('Failed to parse SSE line:', line, err)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  }
}

/**
 * Convert our message format to OpenAI format
 */
function convertMessages(messages: Message[]): unknown[] {
  return messages.map(msg => ({
    role: msg.role,
    content: typeof msg.content === 'string' ? msg.content : msg.content.map(part => {
      if (part.type === 'text') {
        return { type: 'text', text: part.text }
      }
      if (part.type === 'image') {
        return {
          type: 'image_url',
          image_url: { url: part.image.toString() }
        }
      }
      return part
    }),
    ...(msg.name && { name: msg.name }),
  }))
}

/**
 * Map OpenAI finish reason to our format
 */
function mapFinishReason(reason: string): GenerateResult['finishReason'] {
  switch (reason) {
    case 'stop':
      return 'stop'
    case 'length':
      return 'length'
    case 'content_filter':
      return 'content-filter'
    case 'tool_calls':
      return 'tool-calls'
    default:
      return 'stop'
  }
}

/**
 * OpenAI-specific error
 */
export class OpenAIError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'OpenAIError'
  }
}
