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
 * Anthropic provider implementation
 * Uses the Messages API: https://docs.anthropic.com/claude/reference/messages_post
 */
export function createAnthropic(options?: ProviderOptions): LanguageModelProvider {
  const apiKey = options?.apiKey || process.env.ANTHROPIC_API_KEY
  const baseURL = options?.baseURL || 'https://api.anthropic.com/v1'

  if (!apiKey) {
    throw new Error(
      'Anthropic API key not found. Set ANTHROPIC_API_KEY environment variable or pass apiKey option.'
    )
  }

  return {
    id: 'anthropic',
    name: 'Anthropic',

    async generateText(opts: GenerateOptions): Promise<GenerateResult> {
      // Anthropic requires system messages to be sent separately
      const { system, messages } = extractSystemMessage(opts.messages || [])

      const response = await fetch(`${baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: opts.model,
          messages: convertMessages(messages),
          system,
          max_tokens: opts.maxTokens || 4096,
          temperature: opts.temperature,
          top_p: opts.topP,
          stop_sequences: opts.stopSequences,
        }),
      })

      if (!response.ok) {
        const error = (await response.json()) as {
          error?: { type?: string; message?: string }
        }
        throw new AnthropicError(
          error.error?.message || 'Anthropic API request failed',
          error
        )
      }

      const data = (await response.json()) as {
        id: string
        type: string
        role: string
        content: Array<{
          type: string
          text?: string
        }>
        model: string
        stop_reason: string | null
        usage: {
          input_tokens: number
          output_tokens: number
        }
      }

      // Extract text from content blocks
      const text = data.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('')

      return {
        text,
        usage: {
          inputTokens: data.usage.input_tokens,
          outputTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        finishReason: mapStopReason(data.stop_reason),
      }
    },

    async *streamText(opts: GenerateOptions): AsyncIterable<StreamChunk> {
      const { system, messages } = extractSystemMessage(opts.messages || [])

      const response = await fetch(`${baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: opts.model,
          messages: convertMessages(messages),
          system,
          max_tokens: opts.maxTokens || 4096,
          temperature: opts.temperature,
          top_p: opts.topP,
          stop_sequences: opts.stopSequences,
          stream: true,
        }),
      })

      if (!response.ok) {
        const error = (await response.json()) as {
          error?: { type?: string; message?: string }
        }
        throw new AnthropicError(
          error.error?.message || 'Anthropic API request failed',
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
            if (!line.trim() || !line.startsWith('data: ')) continue
            if (line === 'data: [DONE]') continue

            try {
              const data = JSON.parse(line.slice(6))

              // Handle different event types
              if (data.type === 'content_block_delta') {
                if (data.delta?.type === 'text_delta' && data.delta?.text) {
                  yield {
                    type: 'text-delta',
                    textDelta: data.delta.text,
                  }
                }
              } else if (data.type === 'message_delta') {
                if (data.usage) {
                  usage.outputTokens = data.usage.output_tokens || 0
                  usage.totalTokens = usage.inputTokens + usage.outputTokens
                }
                if (data.delta?.stop_reason) {
                  yield {
                    type: 'finish',
                    usage,
                    finishReason: mapStopReason(data.delta.stop_reason),
                  }
                }
              } else if (data.type === 'message_start') {
                if (data.message?.usage) {
                  usage.inputTokens = data.message.usage.input_tokens || 0
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
 * Extract system message from messages array
 * Anthropic requires system to be a separate parameter
 */
function extractSystemMessage(messages: Message[]): {
  system?: string
  messages: Message[]
} {
  const systemMessages = messages.filter((m) => m.role === 'system')
  const otherMessages = messages.filter((m) => m.role !== 'system')

  const system = systemMessages.map((m) => m.content).join('\n') || undefined

  return {
    system,
    messages: otherMessages,
  }
}

/**
 * Convert messages to Anthropic format
 */
function convertMessages(messages: Message[]): Array<{
  role: 'user' | 'assistant'
  content: string
}> {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
  }))
}

/**
 * Map Anthropic stop reasons to our standard finish reasons
 */
function mapStopReason(reason: string | null): 'stop' | 'length' | 'content-filter' | 'tool-calls' {
  switch (reason) {
    case 'end_turn':
      return 'stop'
    case 'max_tokens':
      return 'length'
    case 'stop_sequence':
      return 'stop'
    case 'tool_use':
      return 'tool-calls'
    default:
      return 'stop' // Default to stop for unknown reasons
  }
}

/**
 * Anthropic API error
 */
export class AnthropicError extends Error {
  constructor(
    message: string,
    public readonly response?: unknown
  ) {
    super(message)
    this.name = 'AnthropicError'
  }
}
