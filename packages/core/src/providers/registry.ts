import type { LanguageModelProvider } from '../types/index.js'
import { createOpenAI } from './openai.js'

/**
 * Provider registry
 */
const providers = new Map<string, LanguageModelProvider>()

/**
 * Register default providers
 */
function registerDefaultProviders() {
  // OpenAI models
  const openai = createOpenAI()
  providers.set('gpt-4', openai)
  providers.set('gpt-4-turbo', openai)
  providers.set('gpt-4o', openai)
  providers.set('gpt-3.5-turbo', openai)

  // TODO: Anthropic models
  // const anthropic = createAnthropic()
  // providers.set('claude-3-5-sonnet', anthropic)
  // providers.set('claude-3-opus', anthropic)
}

// Register on module load
registerDefaultProviders()

/**
 * Get provider for a model
 */
export function getProvider(model: string): LanguageModelProvider {
  const provider = providers.get(model)

  if (!provider) {
    throw new Error(
      `No provider registered for model: ${model}. ` +
      `Available models: ${Array.from(providers.keys()).join(', ')}`
    )
  }

  return provider
}

/**
 * Register a custom provider
 */
export function registerProvider(
  model: string,
  provider: LanguageModelProvider
): void {
  providers.set(model, provider)
}
