/**
 * Security Plugin Registry
 *
 * Manages registration, configuration, and execution of security plugins.
 */

import {
  PluginPriority,
  PluginError,
  PluginInitializationError,
  PluginValidationError,
  PluginRateLimitError,
  PluginModerationError,
} from './types.js'
import type {
  SecurityPlugin,
  RegisteredPlugin,
  RegisterPluginOptions,
  PluginConfig,
  PluginHookName,
  PluginContext,
  SecurityCheckResults,
  ValidationResult,
  RateLimitResult,
  PIIDetectionResult,
  ModerationResult,
} from './types.js'
import type { GenerateOptions, SecurityConfig } from '../types/index.js'

/**
 * Global plugin registry
 */
class PluginRegistry {
  private plugins: Map<string, RegisteredPlugin> = new Map()
  private initialized = false

  /**
   * Register a security plugin
   */
  async register(
    plugin: SecurityPlugin,
    options?: RegisterPluginOptions
  ): Promise<void> {
    const { metadata } = plugin

    // Check if already registered
    if (this.plugins.has(metadata.name)) {
      throw new PluginError(
        `Plugin '${metadata.name}' is already registered`,
        metadata.name
      )
    }

    // Validate plugin
    this.validatePlugin(plugin)

    // Merge configuration
    const config: PluginConfig = {
      enabled: options?.enabled ?? true,
      priority: options?.priority ?? PluginPriority.NORMAL,
      ...plugin.config,
      ...options?.config,
    }

    // Create registry entry
    const registered: RegisteredPlugin = {
      plugin,
      config,
      enabled: config.enabled ?? true,
      priority: (config.priority as number) ?? PluginPriority.NORMAL,
    }

    // Initialize plugin
    if (plugin.initialize) {
      try {
        await plugin.initialize()
      } catch (error) {
        throw new PluginInitializationError(
          metadata.name,
          error instanceof Error ? error : undefined
        )
      }
    }

    // Add to registry
    this.plugins.set(metadata.name, registered)
  }

  /**
   * Unregister a plugin
   */
  async unregister(name: string): Promise<void> {
    const registered = this.plugins.get(name)
    if (!registered) {
      return
    }

    // Cleanup plugin
    if (registered.plugin.cleanup) {
      try {
        await registered.plugin.cleanup()
      } catch (error) {
        console.warn(`Plugin cleanup failed for '${name}':`, error)
      }
    }

    this.plugins.delete(name)
  }

  /**
   * Enable a registered plugin
   */
  enable(name: string): void {
    const registered = this.plugins.get(name)
    if (registered) {
      registered.enabled = true
    }
  }

  /**
   * Disable a registered plugin
   */
  disable(name: string): void {
    const registered = this.plugins.get(name)
    if (registered) {
      registered.enabled = false
    }
  }

  /**
   * Get a registered plugin
   */
  get(name: string): RegisteredPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all registered plugins
   */
  getAll(): RegisteredPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Get enabled plugins for a specific hook, sorted by priority
   */
  getForHook(hookName: PluginHookName): RegisteredPlugin[] {
    return this.getAll()
      .filter((p) => p.enabled && p.plugin.hooks[hookName])
      .sort((a, b) => b.priority - a.priority) // Higher priority first
  }

  /**
   * Execute a plugin hook
   */
  async executeHook<T extends PluginHookName>(
    hookName: T,
    context: PluginContext,
    ...args: unknown[]
  ): Promise<unknown[]> {
    const plugins = this.getForHook(hookName)
    const results: unknown[] = []

    for (const registered of plugins) {
      const hook = registered.plugin.hooks[hookName]
      if (!hook) continue

      try {
        // @ts-expect-error - Dynamic hook invocation
        const result = await hook(context, ...args)
        results.push(result)
      } catch (error) {
        // Re-throw plugin-specific errors
        if (error instanceof PluginError) {
          throw error
        }

        // Wrap other errors
        throw new PluginError(
          error instanceof Error ? error.message : String(error),
          registered.plugin.metadata.name,
          hookName
        )
      }
    }

    return results
  }

  /**
   * Clear all plugins
   */
  async clear(): Promise<void> {
    const names = Array.from(this.plugins.keys())
    for (const name of names) {
      await this.unregister(name)
    }
  }

  /**
   * Validate plugin structure
   */
  private validatePlugin(plugin: SecurityPlugin): void {
    if (!plugin.metadata?.name) {
      throw new Error('Plugin must have a name')
    }

    if (!plugin.metadata?.version) {
      throw new Error('Plugin must have a version')
    }

    if (!plugin.hooks || Object.keys(plugin.hooks).length === 0) {
      throw new Error('Plugin must implement at least one hook')
    }
  }
}

/**
 * Global registry instance
 */
const registry = new PluginRegistry()

/**
 * Register a security plugin
 */
export async function registerPlugin(
  plugin: SecurityPlugin,
  options?: RegisterPluginOptions
): Promise<void> {
  return registry.register(plugin, options)
}

/**
 * Unregister a plugin
 */
export async function unregisterPlugin(name: string): Promise<void> {
  return registry.unregister(name)
}

/**
 * Enable a plugin
 */
export function enablePlugin(name: string): void {
  registry.enable(name)
}

/**
 * Disable a plugin
 */
export function disablePlugin(name: string): void {
  registry.disable(name)
}

/**
 * Get a registered plugin
 */
export function getPlugin(name: string): RegisteredPlugin | undefined {
  return registry.get(name)
}

/**
 * Get all registered plugins
 */
export function getPlugins(): RegisteredPlugin[] {
  return registry.getAll()
}

/**
 * Clear all plugins
 */
export async function clearPlugins(): Promise<void> {
  return registry.clear()
}

/**
 * Execute plugin pipeline for security checks
 */
export async function executeSecurityPlugins(
  options: GenerateOptions,
  context: Partial<PluginContext> = {}
): Promise<{
  options: GenerateOptions
  results: SecurityCheckResults
}> {
  const startTime = Date.now()
  let currentOptions = options
  let modified = false

  const pluginContext: PluginContext = {
    options: currentOptions,
    security: (typeof options.security === 'object' && !Array.isArray(options.security)
      ? options.security
      : {}) as SecurityConfig,
    metadata: {},
    startTime,
    userId: context.userId,
    ...context,
  }

  const results: SecurityCheckResults = {
    validation: [],
    rateLimit: [],
    piiDetection: [],
    moderation: [],
    executionTime: 0,
    modified: false,
  }

  try {
    // 1. beforeValidation hook
    const beforeResults = await registry.executeHook(
      'beforeValidation',
      pluginContext
    )
    for (const result of beforeResults) {
      if (result && typeof result === 'object') {
        currentOptions = result as GenerateOptions
        modified = true
        pluginContext.options = currentOptions
      }
    }

    // 2. validation hook
    const validationResults = (await registry.executeHook(
      'validation',
      pluginContext
    )) as ValidationResult[]
    results.validation = validationResults.filter(Boolean)

    // Check if any validation failed
    for (const result of results.validation) {
      if (!result.valid) {
        throw new PluginValidationError(
          'validation',
          result.error || 'Validation failed'
        )
      }
    }

    // 3. rateLimit hook
    const rateLimitResults = (await registry.executeHook(
      'rateLimit',
      pluginContext
    )) as RateLimitResult[]
    results.rateLimit = rateLimitResults.filter(Boolean)

    // Check if rate limited
    for (const result of results.rateLimit) {
      if (!result.allowed) {
        throw new PluginRateLimitError(
          'rateLimit',
          result.error || 'Rate limit exceeded',
          result.remaining,
          result.resetIn
        )
      }
    }

    // 4. piiDetection hook
    const promptText = getPromptText(currentOptions)
    if (promptText) {
      const piiResults = (await registry.executeHook(
        'piiDetection',
        pluginContext,
        promptText
      )) as PIIDetectionResult[]
      results.piiDetection = piiResults.filter(Boolean)

      // Apply PII redaction if detected
      for (const result of results.piiDetection) {
        if (result.detected && result.redacted !== promptText) {
          currentOptions = setPromptText(currentOptions, result.redacted)
          modified = true
          pluginContext.options = currentOptions
        }
      }
    }

    // 5. moderation hook
    if (promptText) {
      const moderationResults = (await registry.executeHook(
        'moderation',
        pluginContext,
        promptText
      )) as ModerationResult[]
      results.moderation = moderationResults.filter(Boolean)

      // Check if content should be blocked
      for (const result of results.moderation) {
        if (!result.safe && result.action === 'block') {
          throw new PluginModerationError(
            'moderation',
            result.reason || 'Content moderation failed',
            result.categories
          )
        }
      }
    }

    // 6. afterSecurity hook
    results.executionTime = Date.now() - startTime
    results.modified = modified
    await registry.executeHook('afterSecurity', pluginContext, results)

    return { options: currentOptions, results }
  } catch (error) {
    // Call error handlers
    const errorResults = await registry.executeHook(
      'onSecurityError',
      pluginContext,
      error
    )

    // Check if any error handler provided recovery
    for (const result of errorResults) {
      if (result && typeof result === 'object') {
        currentOptions = result as GenerateOptions
        modified = true
        break // Use first recovery option
      }
    }

    // Re-throw error if no recovery
    if (!modified) {
      throw error
    }

    // Return recovered options
    results.executionTime = Date.now() - startTime
    results.modified = modified
    return { options: currentOptions, results }
  }
}

/**
 * Helper to extract prompt text from options
 */
function getPromptText(options: GenerateOptions): string {
  if (options.prompt) {
    return options.prompt
  }
  if (options.messages) {
    return options.messages
      .map((m) => (typeof m.content === 'string' ? m.content : ''))
      .join('\n')
  }
  return ''
}

/**
 * Helper to set prompt text in options
 */
function setPromptText(
  options: GenerateOptions,
  text: string
): GenerateOptions {
  if (options.prompt) {
    return { ...options, prompt: text }
  }
  if (options.messages && options.messages.length > 0) {
    const lastMessage = options.messages[options.messages.length - 1]
    if (lastMessage) {
      return {
        ...options,
        messages: [
          ...options.messages.slice(0, -1),
          { ...lastMessage, content: text },
        ],
      }
    }
  }
  return options
}

export { registry }
