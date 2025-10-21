/**
 * Tests for Anthropic provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAnthropic } from './anthropic.js'
import { mockFetch, createMockResponse } from '../test/mocks.js'

/**
 * Mock Anthropic API response
 */
function createMockAnthropicResponse(content: string) {
  return {
    id: 'msg_test123',
    type: 'message',
    role: 'assistant',
    content: [
      {
        type: 'text',
        text: content,
      },
    ],
    model: 'claude-3-5-sonnet-20241022',
    stop_reason: 'end_turn',
    usage: {
      input_tokens: 10,
      output_tokens: 20,
    },
  }
}

describe('createAnthropic()', () => {
  let unmockFetch: () => void

  beforeEach(() => {
    unmockFetch = mockFetch(
      createMockResponse(createMockAnthropicResponse('Test response'))
    )
  })

  afterEach(() => {
    unmockFetch()
    vi.clearAllMocks()
  })

  it('should create Anthropic provider', () => {
    const provider = createAnthropic({ apiKey: 'sk-ant-test' })

    expect(provider.id).toBe('anthropic')
    expect(provider.name).toBe('Anthropic')
    expect(provider.generateText).toBeDefined()
    expect(provider.streamText).toBeDefined()
  })

  it('should throw error if API key not provided', () => {
    // Clear environment variable temporarily
    const originalKey = process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_API_KEY

    expect(() => createAnthropic()).toThrow(
      'Anthropic API key not found. Set ANTHROPIC_API_KEY environment variable'
    )

    // Restore
    process.env.ANTHROPIC_API_KEY = originalKey
  })

  it('should use API key from options', async () => {
    const provider = createAnthropic({ apiKey: 'sk-ant-custom' })

    await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const headers = fetchCall[1]?.headers as Record<string, string>

    expect(headers['x-api-key']).toBe('sk-ant-custom')
  })

  it('should use API key from environment', async () => {
    const provider = createAnthropic()

    await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const headers = fetchCall[1]?.headers as Record<string, string>

    expect(headers['x-api-key']).toBeDefined()
  })

  it('should use custom base URL', async () => {
    const provider = createAnthropic({
      apiKey: 'sk-ant-test',
      baseURL: 'https://custom.anthropic.com/v1',
    })

    await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const url = fetchCall[0]

    expect(url).toBe('https://custom.anthropic.com/v1/messages')
  })
})

describe('generateText()', () => {
  let provider: ReturnType<typeof createAnthropic>
  let unmockFetch: () => void

  beforeEach(() => {
    unmockFetch = mockFetch(
      createMockResponse(createMockAnthropicResponse('Generated text'))
    )
    provider = createAnthropic({ apiKey: 'sk-ant-test' })
  })

  afterEach(() => {
    unmockFetch()
    vi.clearAllMocks()
  })

  it('should generate text', async () => {
    const result = await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    expect(result.text).toBe('Generated text')
    expect(result.usage).toBeDefined()
    expect(result.usage?.totalTokens).toBe(30)
  })

  it('should send correct request body', async () => {
    await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.7,
      maxTokens: 100,
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.model).toBe('claude-3-5-sonnet-20241022')
    expect(body.messages).toEqual([
      { role: 'user', content: 'Hello' },
    ])
    expect(body.temperature).toBe(0.7)
    expect(body.max_tokens).toBe(100)
  })

  it('should extract system messages separately', async () => {
    await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
      ],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.system).toBe('You are helpful')
    expect(body.messages).toEqual([
      { role: 'user', content: 'Hello' },
    ])
  })

  it('should handle multiple system messages', async () => {
    await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'system', content: 'Be concise' },
        { role: 'user', content: 'Hello' },
      ],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.system).toBe('You are helpful\nBe concise')
  })

  it('should handle API errors', async () => {
    unmockFetch()
    unmockFetch = mockFetch(
      new Response(
        JSON.stringify({ error: { type: 'invalid_request_error', message: 'API Error' } }),
        { status: 400 }
      )
    )

    await expect(
      provider.generateText({
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: 'Hello' }],
      })
    ).rejects.toThrow('API Error')
  })

  it('should handle multiple content blocks', async () => {
    unmockFetch()
    unmockFetch = mockFetch(
      createMockResponse({
        ...createMockAnthropicResponse(''),
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'text', text: 'world' },
        ],
      })
    )

    const result = await provider.generateText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    expect(result.text).toBe('Hello world')
  })
})

describe('streamText()', () => {
  let provider: ReturnType<typeof createAnthropic>

  beforeEach(() => {
    provider = createAnthropic({ apiKey: 'sk-ant-test' })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should stream text chunks', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = ['Hello', ' ', 'world']
        for (const chunk of chunks) {
          const data = `data: ${JSON.stringify({
            type: 'content_block_delta',
            delta: { type: 'text_delta', text: chunk },
          })}\n\n`
          controller.enqueue(encoder.encode(data))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    const unmockFetch = mockFetch(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    )

    const chunks: string[] = []
    for await (const chunk of provider.streamText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      if (chunk.type === 'text-delta') {
        chunks.push(chunk.textDelta)
      }
    }

    expect(chunks).toEqual(['Hello', ' ', 'world'])

    unmockFetch()
  })

  it('should send stream=true in request', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    const unmockFetch = mockFetch(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    )

    const chunks: string[] = []
    for await (const chunk of provider.streamText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      if (chunk.type === 'text-delta') {
        chunks.push(chunk.textDelta)
      }
    }

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.stream).toBe(true)

    unmockFetch()
  })

  it('should handle usage updates', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Message start with input tokens
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'message_start',
          message: { usage: { input_tokens: 10 } },
        })}\n\n`))

        // Text delta
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'test' },
        })}\n\n`))

        // Message delta with output tokens
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'message_delta',
          usage: { output_tokens: 20 },
          delta: { stop_reason: 'end_turn' },
        })}\n\n`))

        controller.close()
      },
    })

    const unmockFetch = mockFetch(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    )

    let finalUsage
    for await (const chunk of provider.streamText({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      if (chunk.type === 'finish') {
        finalUsage = chunk.usage
      }
    }

    expect(finalUsage).toEqual({
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
    })

    unmockFetch()
  })
})
