/**
 * Mock utilities for testing
 */

/**
 * Mock fetch response
 */
export function createMockResponse(data: any, options?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
}

/**
 * Mock streaming response (SSE format)
 */
export function createMockStreamResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const data = `data: ${JSON.stringify({ choices: [{ delta: { content: chunk } }] })}\n\n`
        controller.enqueue(encoder.encode(data))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
    },
  })
}

/**
 * Mock OpenAI chat completion response
 */
export function createMockOpenAIResponse(content: string) {
  return {
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-4',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 20,
      total_tokens: 30,
    },
  }
}

/**
 * Mock fetch globally
 */
export function mockFetch(response: Response | ((url: string, init?: RequestInit) => Response)) {
  const originalFetch = global.fetch

  if (typeof response === 'function') {
    global.fetch = vi.fn(response as any)
  } else {
    global.fetch = vi.fn(() => Promise.resolve(response))
  }

  return () => {
    global.fetch = originalFetch
  }
}
