/**
 * Tests for ai() function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ai } from './ai.js'
import { createMockResponse, createMockOpenAIResponse, mockFetch } from './test/mocks.js'

describe('ai()', () => {
  let unmockFetch: () => void

  beforeEach(() => {
    // Mock fetch for all tests
    unmockFetch = mockFetch(
      createMockResponse(createMockOpenAIResponse('This is a test response'))
    )
  })

  afterEach(() => {
    unmockFetch()
    vi.clearAllMocks()
  })

  it('should generate text from a simple prompt', async () => {
    const result = await ai('gpt-4', 'Hello, world!')

    expect(result).toBe('This is a test response')
    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('should accept array of messages', async () => {
    const messages = [
      { role: 'user' as const, content: 'Hello!' },
      { role: 'assistant' as const, content: 'Hi there!' },
      { role: 'user' as const, content: 'How are you?' },
    ]

    const result = await ai('gpt-4', messages)

    expect(result).toBe('This is a test response')
    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('should pass temperature option', async () => {
    await ai('gpt-4', 'Test', { temperature: 0.9 })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.temperature).toBe(0.9)
  })

  it('should pass maxTokens option', async () => {
    await ai('gpt-4', 'Test', { maxTokens: 100 })

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.max_tokens).toBe(100)
  })

  it('should use moderate security by default', async () => {
    await ai('gpt-4', 'Test')

    // Just verify it doesn't throw - security is tested separately
    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('should allow custom security preset', async () => {
    await ai('gpt-4', 'Test', { security: 'strict' })

    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('should throw error for unsupported model', async () => {
    await expect(ai('unsupported-model', 'Test')).rejects.toThrow(
      'No provider registered for model: unsupported-model'
    )
  })

  it('should handle API errors', async () => {
    unmockFetch()
    unmockFetch = mockFetch(
      new Response(JSON.stringify({ error: { message: 'API Error' } }), {
        status: 500,
      })
    )

    await expect(ai('gpt-4', 'Test')).rejects.toThrow()
  })
})

describe('ai.stream()', () => {
  it('should stream text chunks', async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const chunks = ['Hello', ' ', 'world', '!']
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
    for await (const chunk of ai.stream('gpt-4', 'Test')) {
      chunks.push(chunk)
    }

    expect(chunks).toEqual(['Hello', ' ', 'world', '!'])

    unmockFetch()
  })

  it('should pass options to streaming', async () => {
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
    for await (const chunk of ai.stream('gpt-4', 'Test', { temperature: 0.8 })) {
      chunks.push(chunk)
    }

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    const body = JSON.parse(fetchCall[1]?.body as string)

    expect(body.temperature).toBe(0.8)
    expect(body.stream).toBe(true)

    unmockFetch()
  })
})
