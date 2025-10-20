/**
 * Provider exports
 */
export { createOpenAI } from './openai.js'
export { getProvider, registerProvider } from './registry.js'

/**
 * Provider factory shortcuts
 */
export const openai = createOpenAI
// export const anthropic = createAnthropic // TODO: Implement
