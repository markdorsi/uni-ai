import type { LanguageModelProvider, GenerateOptions, GenerateResult, Message, StreamChunk } from '../types'

/**
 * Ollama provider implementation
 * Supports local models like Llama 2, Llama 3, Mistral, etc.
 */
export class OllamaProvider implements LanguageModelProvider {
  id = 'ollama'
  name = 'Ollama'
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:11434') {
    // Allow custom base URL for remote Ollama instances
    this.baseUrl = process.env.OLLAMA_BASE_URL || baseUrl
  }

  async generateText(options: GenerateOptions): Promise<GenerateResult> {
    const { model, messages = [], prompt } = options

    // Use chat endpoint if messages are provided, otherwise use generate
    const useChat = messages.length > 0 && !prompt

    const requestBody = useChat
      ? this.buildChatRequest(options)
      : this.buildGenerateRequest(options)

    const endpoint = useChat ? '/api/chat' : '/api/generate'

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...requestBody,
        stream: false, // Disable streaming for blocking mode
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama API error: ${error}`)
    }

    const data = await response.json() as any

    // Extract text from response
    const text = useChat ? data.message?.content || '' : data.response || ''
    const usage = this.extractUsage(data)

    return {
      text,
      usage,
      finishReason: 'stop',
    }
  }

  async *streamText(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const { model, messages = [], prompt } = options

    // Use chat endpoint if messages are provided, otherwise use generate
    const useChat = messages.length > 0 && !prompt

    const requestBody = useChat
      ? this.buildChatRequest(options)
      : this.buildGenerateRequest(options)

    const endpoint = useChat ? '/api/chat' : '/api/generate'

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...requestBody,
        stream: true, // Enable streaming
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Ollama API error: ${error}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.trim()) continue

          try {
            const parsed = JSON.parse(line)

            // Extract text delta
            const textDelta = useChat ? parsed.message?.content || '' : parsed.response || ''

            if (textDelta) {
              yield {
                type: 'text-delta',
                textDelta,
              }
            }

            // Check if done
            if (parsed.done) {
              return
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Build request for /api/chat endpoint
   */
  private buildChatRequest(options: GenerateOptions): any {
    const { model, messages = [] } = options

    // Convert messages to Ollama format
    const ollamaMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
      content: msg.content,
    }))

    return {
      model,
      messages: ollamaMessages,
      options: this.buildOptions(options),
    }
  }

  /**
   * Build request for /api/generate endpoint
   */
  private buildGenerateRequest(options: GenerateOptions): any {
    const { model, prompt = '' } = options

    return {
      model,
      prompt,
      options: this.buildOptions(options),
    }
  }

  /**
   * Build options object from GenerateOptions
   */
  private buildOptions(options: GenerateOptions): any {
    const opts: any = {}

    if (options.temperature !== undefined) {
      opts.temperature = options.temperature
    }

    if (options.topP !== undefined) {
      opts.top_p = options.topP
    }

    if (options.maxTokens !== undefined) {
      opts.num_predict = options.maxTokens
    }

    if (options.stopSequences !== undefined) {
      opts.stop = options.stopSequences
    }

    return Object.keys(opts).length > 0 ? opts : undefined
  }

  /**
   * Extract usage information from response
   */
  private extractUsage(data: any): any {
    if (!data.prompt_eval_count && !data.eval_count) {
      return undefined
    }

    return {
      inputTokens: data.prompt_eval_count || 0,
      outputTokens: data.eval_count || 0,
      totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
    }
  }
}
