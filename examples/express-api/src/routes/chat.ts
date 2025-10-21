import { Router } from 'express'
import { generate } from '@uni-ai/sdk'
import type { Message } from '@uni-ai/sdk'

const router = Router()

/**
 * POST /api/chat
 * Chat with AI - supports conversation history
 *
 * Body:
 * {
 *   "messages": [{ "role": "user", "content": "Hello!" }],
 *   "model": "gpt-4",
 *   "security": "strict",
 *   "temperature": 0.7,
 *   "maxTokens": 1000
 * }
 */
router.post('/', async (req, res, next) => {
  try {
    const { messages, model = 'gpt-4', security = 'strict', temperature, maxTokens } = req.body

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'messages array is required',
      })
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'messages array cannot be empty',
      })
    }

    // Generate response
    const result = await generate({
      model,
      messages: messages as Message[],
      security: security as 'strict' | 'moderate' | 'permissive',
      temperature,
      maxTokens,
    })

    // Return response
    res.json({
      message: {
        role: 'assistant',
        content: result.text,
      },
      usage: result.usage,
      finishReason: result.finishReason,
      model,
    })
  } catch (error) {
    next(error)
  }
})

export default router
