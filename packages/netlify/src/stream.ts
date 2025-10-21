/**
 * Creates a streaming Response for Netlify Edge Functions
 *
 * @param iterator - Async iterator that yields text chunks
 * @returns Response with Server-Sent Events stream
 *
 * @example
 * ```ts
 * import { ai } from '@uni-ai/sdk'
 * import { streamResponse } from '@uni-ai/netlify'
 *
 * export default async (request: Request) => {
 *   const stream = ai.stream('gpt-4', 'Tell me a story')
 *   return streamResponse(stream)
 * }
 * ```
 */
export function streamResponse(iterator: AsyncIterable<string>): Response {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of iterator) {
          const data = `data: ${JSON.stringify({ chunk })}\n\n`
          controller.enqueue(encoder.encode(data))
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        controller.error(error)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
