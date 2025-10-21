import { ai, generate, type GenerateOptions } from '@uni-ai/sdk'

export interface EdgeHandlerOptions {
  /**
   * Security preset to use
   * @default 'strict'
   */
  security?: 'strict' | 'moderate' | 'permissive' | GenerateOptions['security']

  /**
   * Extract user ID from request for rate limiting
   */
  getUserId?: (request: Request) => string

  /**
   * Custom error handler
   */
  onError?: (error: Error, request: Request) => Response | Promise<Response>
}

/**
 * Creates a Vercel Edge Runtime handler for AI requests
 *
 * @example
 * ```ts
 * // app/api/chat/route.ts
 * import { createEdgeHandler } from '@uni-ai/vercel'
 *
 * export const runtime = 'edge'
 * export const POST = createEdgeHandler({
 *   security: 'strict'
 * })
 * ```
 */
export function createEdgeHandler(options: EdgeHandlerOptions = {}) {
  const {
    security = 'strict',
    getUserId = (request) => request.headers.get('x-forwarded-for') || 'anonymous',
    onError,
  } = options

  return async (request: Request): Promise<Response> => {
    try {
      // Only handle POST requests
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
      }

      // Parse request body
      const body = await request.json() as {
        model?: string
        prompt?: string
        messages?: any[]
        stream?: boolean
      }
      const { model, prompt, messages, stream = false } = body

      if (!model) {
        return new Response(
          JSON.stringify({ error: 'Model is required' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      // Handle streaming responses
      if (stream) {
        let streamIterator: AsyncIterable<string>

        if (prompt) {
          streamIterator = ai.stream(model, prompt, { security: typeof security === 'string' ? security : undefined })
        } else {
          const result = await generate({
            model,
            messages,
            stream: true,
            security,
          })
          if (!result.textStream) {
            throw new Error('Streaming not supported by provider')
          }
          streamIterator = result.textStream
        }

        const encoder = new TextEncoder()
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of streamIterator) {
                const data = `data: ${JSON.stringify({ chunk })}\n\n`
                controller.enqueue(encoder.encode(data))
              }
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch (error) {
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

      // Handle non-streaming responses
      const result = prompt
        ? await ai(model, prompt, { security: typeof security === 'string' ? security : undefined })
        : await generate({
            model,
            messages,
            security,
          })

      return new Response(
        JSON.stringify({ text: result }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (error) {
      // Custom error handler
      if (onError) {
        return onError(error as Error, request)
      }

      // Default error response
      console.error('Edge function error:', error)
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
  }
}
