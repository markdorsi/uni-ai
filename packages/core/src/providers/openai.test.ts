/**
 * Tests for OpenAI provider
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createOpenAI } from './openai.js'
import { createMockResponse, createMockOpenAIResponse, mockFetch } from '../test/mocks.js'

describe('createOpenAI()', () => {
  let unmockFetch: () => void

  beforeEach(() => {
    unmockFetch = mockFetch(
      createMockResponse(createMockOpenAIResponse('Test response'))
    )
  })

  afterEach(() => {
    unmockFetch()
    vi.clearAllMocks()
  })

  it('should create OpenAI provider', () => {
    const provider = createOpenAI({ apiKey: 'sk-test' })

    expect(provider.id).toBe('openai')
    expect(provider.name).toBe('OpenAI')
    expect(provider.generateText).toBeDefined()
    expect(provider.streamText).toBeDefined()
  })

  it('should throw error if API key not provided', () => {
    // Clear environment variable temporarily
    const originalKey = process.env.OPENAI_API_KEY
    delete process.env.OPENAI_API_KEY

    expect(() => createOpenAI()).toThrow(
      'OpenAI API key not found. Set OPENAI_API_KEY environment variable'
    )

    // Restore
    process.env.OPENAI_API_KEY = originalKey
  })

  it('should use API key from options', async () => {
    const provider = createOpenAI({ apiKey: 'sk-custom' })

    await provider.generateText({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const headers = fetchCall[1]?.headers as Record<string, string>

    expect(headers.Authorization).toBe('Bearer sk-custom')
  })

  it('should use API key from environment', async () => {
    const provider = createOpenAI()

    await provider.generateText({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const headers = fetchCall[1]?.headers as Record<string, string>

    expect(headers.Authorization).toContain('Bearer ')
  })

  it('should use custom base URL', async () => {
    const provider = createOpenAI({
      apiKey: 'sk-test',
      baseURL: 'https://custom.openai.com/v1',
    })

    await provider.generateText({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const url = fetchCall[0]

    expect(url).toBe('https://custom.openai.com/v1/chat/completions')
  })
})

describe('generateText()', () => {
  let provider: ReturnType<typeof createOpenAI>
  let unmockFetch: () => void

  beforeEach(() => {
    unmockFetch = mockFetch(
      createMockResponse(createMockOpenAIResponse('Generated text'))
    )
    provider = createOpenAI({ apiKey: 'sk-test' })
  })

  afterEach(() => {
    unmockFetch()
    vi.clearAllMocks()
  })

  it('should generate text', async () => {
    const result = await provider.generateText({
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })

    expect(result.text).toBe('Generated text')
    expect(result.usage).toBeDefined()
    expect(result.usage?.totalTokens).toBe(30)
  })

  it('should send correct request body', async () => {
    await provider.generateText({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' },
      ],
      temperature: 0.7,
      maxTokens: 100,
    })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.model).toBe('gpt-4')
    expect(body.messages).toEqual([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hello' },
    ])
    expect(body.temperature).toBe(0.7)
    expect(body.max_tokens).toBe(100)
  })

  it('should handle API errors', async () => {
    unmockFetch()
    unmockFetch = mockFetch(
      new Response(JSON.stringify({ error: { message: 'API Error' } }), {
        status: 500,
      })
    )

    await expect(
      provider.generateText({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      })
    ).rejects.toThrow()
  })
})

describe('streamText()', () => {
  let provider: ReturnType<typeof createOpenAI>

  beforeEach(() => {
    provider = createOpenAI({ apiKey: 'sk-test' })
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
            choices: [{ delta: { content: chunk } }],
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
      model: 'gpt-4',
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
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      chunks.push(chunk.text)
    }

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.stream).toBe(true)

    unmockFetch()
  })
})
