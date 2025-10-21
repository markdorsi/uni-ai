import type { LanguageModelProvider, GenerateOptions, GenerateResult, Message, StreamChunk } from '../types'

/**
 * Google Gemini provider implementation
 * Supports Gemini Pro, Gemini Pro Vision, and Gemini 2.0 Flash
 */
export class GeminiProvider implements LanguageModelProvider {
  id = 'gemini'
  name = 'Google Gemini'
  private apiKey: string
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta'

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY environment variable is required')
    }
  }

  async generateText(options: GenerateOptions): Promise<GenerateResult> {
    const { model, messages = [], prompt } = options

    // Convert messages to Gemini format
    const contents = this.convertMessages(messages, prompt)

    const requestBody = {
      contents,
      generationConfig: this.buildGenerationConfig(options),
    }

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()

    // Extract text from response
    const text = this.extractText(data)
    const usage = this.extractUsage(data)

    return {
      text,
      usage,
      finishReason: 'stop',
    }
  }

  async *streamText(options: GenerateOptions): AsyncIterable<StreamChunk> {
    const { model, messages = [], prompt } = options

    // Convert messages to Gemini format
    const contents = this.convertMessages(messages, prompt)

    const requestBody = {
      contents,
      generationConfig: this.buildGenerationConfig(options),
    }

    const response = await fetch(
      `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error: ${error}`)
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
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const text = this.extractText(parsed)
              if (text) {
                yield {
                  type: 'text-delta',
                  textDelta: text,
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Convert Uni AI messages to Gemini format
   */
  private convertMessages(messages: Message[], prompt?: string): any[] {
    const contents: any[] = []

    // Add prompt as a user message if provided
    if (prompt) {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      })
      return contents
    }

    // Convert message history
    for (const message of messages) {
      const role = message.role === 'assistant' ? 'model' : 'user'

      // Skip system messages (Gemini uses systemInstruction separately)
      if (message.role === 'system') {
        continue
      }

      contents.push({
        role,
        parts: [{ text: message.content }],
      })
    }

    return contents
  }

  /**
   * Build generation config from options
   */
  private buildGenerationConfig(options: GenerateOptions): any {
    const config: any = {}

    if (options.temperature !== undefined) {
      config.temperature = options.temperature
    }

    if (options.maxTokens !== undefined) {
      config.maxOutputTokens = options.maxTokens
    }

    if (options.topP !== undefined) {
      config.topP = options.topP
    }

    if (options.stopSequences !== undefined) {
      config.stopSequences = options.stopSequences
    }

    return Object.keys(config).length > 0 ? config : undefined
  }

  /**
   * Extract text from Gemini response
   */
  private extractText(data: any): string {
    try {
      const candidate = data.candidates?.[0]
      const content = candidate?.content
      const parts = content?.parts || []

      return parts
        .map((part: any) => part.text || '')
        .join('')
    } catch {
      return ''
    }
  }

  /**
   * Extract usage information from response
   */
  private extractUsage(data: any): any {
    const metadata = data.usageMetadata
    if (!metadata) return undefined

    return {
      inputTokens: metadata.promptTokenCount || 0,
      outputTokens: metadata.candidatesTokenCount || 0,
      totalTokens: metadata.totalTokenCount || 0,
    }
  }
}
