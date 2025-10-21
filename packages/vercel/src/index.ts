/**
 * Vercel adapters for Uni AI SDK
 * Provides helpers for Vercel Edge Runtime and API Routes
 */

export { createEdgeHandler, type EdgeHandlerOptions } from './edge'
export { createApiHandler, type ApiHandlerOptions } from './api'
export { streamResponse } from './stream'
