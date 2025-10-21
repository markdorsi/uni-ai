import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ai, generate, type GenerateOptions } from '@uni-ai/sdk'

export interface ApiHandlerOptions {
  /**
   * Security preset to use
   * @default 'strict'
   */
  security?: 'strict' | 'moderate' | 'permissive' | GenerateOptions['security']

  /**
   * Extract user ID from request for rate limiting
   */
  getUserId?: (req: VercelRequest) => string

  /**
   * Custom error handler
   */
  onError?: (error: Error, req: VercelRequest, res: VercelResponse) => void
}

/**
 * Creates a Vercel API Route handler for AI requests
 *
 * @example
 * ```ts
 * // pages/api/chat.ts
 * import { createApiHandler } from '@uni-ai/vercel'
 *
 * export default createApiHandler({
 *   security: 'strict'
 * })
 * ```
 */
export function createApiHandler(options: ApiHandlerOptions = {}) {
  const {
    security = 'strict',
    getUserId = (req) => (req.headers['x-forwarded-for'] as string) || 'anonymous',
    onError,
  } = options

  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Only handle POST requests
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
      }

      // Parse request body
      const { model, prompt, messages } = req.body

      if (!model) {
        return res.status(400).json({ error: 'Model is required' })
      }

      // Generate AI response
      const result = prompt
        ? await ai(model, prompt, { security: typeof security === 'string' ? security : undefined })
        : await generate({
            model,
            messages,
            security,
          })

      return res.status(200).json({ text: result })
    } catch (error) {
      // Custom error handler
      if (onError) {
        return onError(error as Error, req, res)
      }

      // Default error response
      console.error('API route error:', error)
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}
