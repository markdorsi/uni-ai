import { generate } from '@uni-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

// Prevent static optimization
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { messages, model, security } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    if (!model) {
      return NextResponse.json(
        { error: 'Model is required' },
        { status: 400 }
      )
    }

    // Generate response using Uni AI SDK
    const result = await generate({
      model,
      messages,
      security: security || 'strict',
    })

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: result.text,
      },
      usage: result.usage,
      finishReason: result.finishReason,
    })
  } catch (error) {
    console.error('Chat API error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    )
  }
}
