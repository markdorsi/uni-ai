/**
 * Security Plugin System
 *
 * Extensible plugin architecture for third-party security integrations.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@uni-ai/sdk/plugins'
 * import { redisRateLimitPlugin } from '@uni-ai/plugin-redis-rate-limit'
 *
 * // Register a plugin
 * await registerPlugin(redisRateLimitPlugin, {
 *   config: {
 *     host: 'localhost',
 *     port: 6379
 *   }
 * })
 *
 * // Use normally - plugins run automatically
 * const text = await ai('gpt-4', 'Hello', { security: 'strict' })
 * ```
 */

// Export types
export type {
  SecurityPlugin,
  RegisteredPlugin,
  RegisterPluginOptions,
  PluginMetadata,
  PluginConfig,
  PluginHooks,
  PluginContext,
  PluginHookName,
  ValidationResult,
  RateLimitResult,
  PIIDetectionResult,
  ModerationResult,
  SecurityCheckResults,
  HookContext,
  HookResult,
} from './types.js'

export {
  PluginPriority,
  PluginError,
  PluginInitializationError,
  PluginValidationError,
  PluginRateLimitError,
  PluginModerationError,
} from './types.js'

// Export registry functions
export {
  registerPlugin,
  unregisterPlugin,
  enablePlugin,
  disablePlugin,
  getPlugin,
  getPlugins,
  clearPlugins,
  executeSecurityPlugins,
} from './registry.js'
