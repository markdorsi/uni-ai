import { createEdgeHandler } from '@uni-ai/netlify'

// That's it! The adapter handles everything:
// - POST request validation
// - Request body parsing
// - Message validation
// - AI generation with security
// - Error handling
// - Response formatting
export default createEdgeHandler({
  security: 'strict'
})

export const config = { path: '/api/chat' }
