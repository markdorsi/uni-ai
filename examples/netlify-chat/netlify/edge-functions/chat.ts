import { generate } from '@uni-ai/sdk'
import type { Context } from '@netlify/edge-functions'

export default async (request: Request, context: Context) => {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Parse request body
    const { messages, model = 'gpt-4', security = 'strict' } = await request.json()

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Request',
          message: 'messages array is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    if (messages.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'Invalid Request',
          message: 'messages array cannot be empty',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Generate response using Uni AI SDK
    const result = await generate({
      model,
      messages,
      security: security as 'strict' | 'moderate' | 'permissive',
    })

    // Return response
    return new Response(
      JSON.stringify({
        message: {
          role: 'assistant',
          content: result.text,
        },
        usage: result.usage,
        finishReason: result.finishReason,
        model,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
      }
    )
  } catch (error) {
    console.error('Chat error:', error)

    // Handle specific errors
    const errorMessage = error instanceof Error ? error.message : 'An error occurred'

    let status = 500
    let errorType = 'Internal Server Error'

    if (errorMessage.includes('API key not found')) {
      status = 500
      errorType = 'Configuration Error'
    } else if (errorMessage.includes('Rate limit')) {
      status = 429
      errorType = 'Rate Limit Exceeded'
    } else if (errorMessage.includes('PII detected')) {
      status = 400
      errorType = 'Invalid Input'
    }

    return new Response(
      JSON.stringify({
        error: errorType,
        message: errorMessage,
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export const config = { path: '/api/chat' }
