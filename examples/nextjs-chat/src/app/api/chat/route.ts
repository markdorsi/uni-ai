import { createEdgeHandler } from '@uni-ai/vercel'

// Use Edge Runtime for optimal performance
export const runtime = 'edge'

// That's it! The adapter handles everything:
// - Request validation
// - Body parsing
// - AI generation with security
// - Error handling
// - Response formatting
export const POST = createEdgeHandler({
  security: 'strict'
})
