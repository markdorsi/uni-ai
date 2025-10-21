import { Router } from 'express'
import { ai } from '@uni-ai/sdk'

const router = Router()

/**
 * POST /api/completion
 * Simple text completion
 *
 * Body:
 * {
 *   "prompt": "Write a haiku about coding",
 *   "model": "gpt-4",
 *   "security": "strict",
 *   "temperature": 0.7,
 *   "maxTokens": 500
 * }
 */
router.post('/', async (req, res, next) => {
  try {
    const { prompt, model = 'gpt-4', security = 'strict', temperature, maxTokens } = req.body

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'prompt (string) is required',
      })
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'prompt cannot be empty',
      })
    }

    // Generate completion
    const result = await ai(model, prompt, {
      security: security as 'strict' | 'moderate' | 'permissive',
      temperature,
      maxTokens,
    })

    // Return response
    res.json({
      completion: result,
      model,
      prompt,
    })
  } catch (error) {
    next(error)
  }
})

export default router
