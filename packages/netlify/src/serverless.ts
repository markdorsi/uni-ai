import { ai, generate, type GenerateOptions } from '@uni-ai/sdk'

export interface ServerlessHandlerOptions {
  /**
   * Security preset to use
   * @default 'strict'
   */
  security?: 'strict' | 'moderate' | 'permissive' | GenerateOptions['security']

  /**
   * Extract user ID from event for rate limiting
   */
  getUserId?: (event: any) => string

  /**
   * Custom error handler
   */
  onError?: (error: Error, event: any) => any
}

/**
 * Creates a Netlify Serverless Function handler for AI requests
 *
 * @example
 * ```ts
 * import { createServerlessHandler } from '@uni-ai/netlify'
 *
 * export const handler = createServerlessHandler({
 *   security: 'strict'
 * })
 * ```
 */
export function createServerlessHandler(options: ServerlessHandlerOptions = {}) {
  const {
    security = 'strict',
    getUserId = (event) => event.headers['x-forwarded-for'] || 'anonymous',
    onError,
  } = options

  return async (event: any) => {
    try {
      // Only handle POST requests
      if (event.httpMethod !== 'POST') {
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        }
      }

      // Parse request body
      const body = JSON.parse(event.body || '{}')
      const { model, prompt, messages } = body

      if (!model) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Model is required' }),
          headers: { 'Content-Type': 'application/json' },
        }
      }

      // Generate AI response
      const result = prompt
        ? await ai(model, prompt, { security: typeof security === 'string' ? security : undefined })
        : await generate({
            model,
            messages,
            security,
          })

      return {
        statusCode: 200,
        body: JSON.stringify({ text: result }),
        headers: { 'Content-Type': 'application/json' },
      }
    } catch (error) {
      // Custom error handler
      if (onError) {
        return onError(error as Error, event)
      }

      // Default error response
      console.error('Serverless function error:', error)
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error instanceof Error ? error.message : 'Internal server error'
        }),
        headers: { 'Content-Type': 'application/json' },
      }
    }
  }
}
