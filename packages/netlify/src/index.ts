/**
 * Netlify adapters for Uni AI SDK
 * Provides helpers for Netlify Edge Functions and Serverless Functions
 */

export { createEdgeHandler, type EdgeHandlerOptions } from './edge'
export { createServerlessHandler, type ServerlessHandlerOptions } from './serverless'
export { streamResponse } from './stream'
