import type { LanguageModelProvider } from '../types/index.js'
import { createOpenAI } from './openai.js'
import { createAnthropic } from './anthropic.js'
import { GeminiProvider } from './gemini.js'
import { OllamaProvider } from './ollama.js'

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

  // Anthropic models
  const anthropic = createAnthropic()
  providers.set('claude-3-5-sonnet-20241022', anthropic)
  providers.set('claude-3-5-sonnet', anthropic) // Alias
  providers.set('claude-3-opus-20240229', anthropic)
  providers.set('claude-3-opus', anthropic) // Alias
  providers.set('claude-3-sonnet-20240229', anthropic)
  providers.set('claude-3-haiku-20240307', anthropic)

  // Google Gemini models
  const gemini = new GeminiProvider()
  providers.set('gemini-2.0-flash', gemini)
  providers.set('gemini-1.5-pro', gemini)
  providers.set('gemini-1.5-flash', gemini)
  providers.set('gemini-pro', gemini) // Alias for latest

  // Ollama models (local)
  const ollama = new OllamaProvider()
  providers.set('llama3.2', ollama)
  providers.set('llama3.1', ollama)
  providers.set('llama2', ollama)
  providers.set('mistral', ollama)
  providers.set('mixtral', ollama)
  providers.set('codellama', ollama)
  providers.set('phi', ollama)
  providers.set('qwen', ollama)
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
