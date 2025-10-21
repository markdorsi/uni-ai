import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err)

  // Handle different error types
  if (err.message.includes('API key not found')) {
    return res.status(500).json({
      error: 'Configuration Error',
      message: 'API key not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.',
    })
  }

  if (err.message.includes('Rate limit')) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: err.message,
    })
  }

  if (err.message.includes('PII detected')) {
    return res.status(400).json({
      error: 'Invalid Input',
      message: 'Input contains personally identifiable information (PII)',
    })
  }

  if (err.message.includes('validation')) {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    })
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
  })
}
