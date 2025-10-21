/**
 * Security Plugin System - Type Definitions
 *
 * This module defines the interfaces and types for the Uni AI security plugin system.
 * Plugins can extend security functionality at multiple points in the request lifecycle.
 */

import type { GenerateOptions, SecurityConfig } from '../types/index.js'

/**
 * Plugin priority levels (higher = runs first)
 */
export enum PluginPriority {
  CRITICAL = 100, // Critical security checks
  HIGH = 75, // Important checks
  NORMAL = 50, // Standard checks (default)
  LOW = 25, // Optional enhancements
  MINIMAL = 10, // Nice-to-have features
}

/**
 * Plugin metadata
 */
export interface PluginMetadata {
  /** Unique plugin name (e.g., 'redis-rate-limit') */
  name: string

  /** Semantic version (e.g., '1.0.0') */
  version: string

  /** Plugin description */
  description?: string

  /** Plugin author */
  author?: string

  /** Plugin homepage URL */
  homepage?: string

  /** Required Uni AI SDK version (semver range) */
  requiredVersion?: string
}

/**
 * Result from validation plugin
 */
export interface ValidationResult {
  /** Whether input passed validation */
  valid: boolean

  /** Error message if validation failed */
  error?: string

  /** Additional validation metadata */
  metadata?: Record<string, unknown>
}

/**
 * Result from rate limiting plugin
 */
export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean

  /** Remaining quota (if applicable) */
  remaining?: number

  /** Time until quota resets (milliseconds) */
  resetIn?: number

  /** Error message if rate limited */
  error?: string
}

/**
 * PII detection result
 */
export interface PIIDetectionResult {
  /** Whether PII was detected */
  detected: boolean

  /** Types of PII found (e.g., ['email', 'ssn']) */
  patterns: string[]

  /** Text with PII redacted */
  redacted: string

  /** Detected entities with locations */
  entities?: Array<{
    type: string
    text: string
    start: number
    end: number
    confidence?: number
  }>
}

/**
 * Content moderation result
 */
export interface ModerationResult {
  /** Whether content is safe */
  safe: boolean

  /** Flagged categories (e.g., ['violence', 'hate']) */
  categories: string[]

  /** Confidence scores per category */
  scores?: Record<string, number>

  /** Action to take (e.g., 'block', 'warn', 'allow') */
  action?: 'block' | 'warn' | 'allow'

  /** Explanation of moderation decision */
  reason?: string
}

/**
 * Security check results (passed to afterSecurity hook)
 */
export interface SecurityCheckResults {
  /** Validation results from all plugins */
  validation: ValidationResult[]

  /** Rate limit results from all plugins */
  rateLimit: RateLimitResult[]

  /** PII detection results from all plugins */
  piiDetection: PIIDetectionResult[]

  /** Moderation results from all plugins */
  moderation: ModerationResult[]

  /** Total execution time (milliseconds) */
  executionTime: number

  /** Whether any checks modified the input */
  modified: boolean
}

/**
 * Plugin configuration
 */
export interface PluginConfig {
  /** Whether this plugin is enabled */
  enabled?: boolean

  /** Plugin priority (higher = runs first) */
  priority?: PluginPriority | number

  /** Plugin-specific configuration */
  [key: string]: unknown
}

/**
 * Plugin context (passed to all hooks)
 */
export interface PluginContext {
  /** Current options being processed */
  options: GenerateOptions

  /** Security configuration */
  security: SecurityConfig

  /** Metadata attached by previous plugins */
  metadata: Record<string, unknown>

  /** Timestamp when request started */
  startTime: number

  /** User ID (if available) */
  userId?: string
}

/**
 * Plugin hook functions
 */
export interface PluginHooks {
  /**
   * Called before any security checks
   * Can transform input or attach metadata
   */
  beforeValidation?: (
    context: PluginContext
  ) => Promise<GenerateOptions> | GenerateOptions

  /**
   * Custom input validation
   * Can throw error to reject input
   */
  validation?: (
    context: PluginContext
  ) => Promise<ValidationResult> | ValidationResult

  /**
   * Custom rate limiting
   * Can throw error to reject request
   */
  rateLimit?: (
    context: PluginContext
  ) => Promise<RateLimitResult> | RateLimitResult

  /**
   * Custom PII detection
   * Returns detected PII and redacted text
   */
  piiDetection?: (
    text: string,
    context: PluginContext
  ) => Promise<PIIDetectionResult> | PIIDetectionResult

  /**
   * Content moderation
   * Returns safety assessment
   */
  moderation?: (
    text: string,
    context: PluginContext
  ) => Promise<ModerationResult> | ModerationResult

  /**
   * Called after all security checks pass
   * For logging, analytics, etc.
   */
  afterSecurity?: (
    context: PluginContext,
    results: SecurityCheckResults
  ) => Promise<void> | void

  /**
   * Called when any security check fails
   * Can log error or attempt recovery
   */
  onSecurityError?: (
    error: Error,
    context: PluginContext
  ) => Promise<void | GenerateOptions> | void | GenerateOptions
}

/**
 * Security Plugin interface
 */
export interface SecurityPlugin {
  /** Plugin metadata */
  metadata: PluginMetadata

  /** Plugin configuration (defaults) */
  config?: PluginConfig

  /** Plugin lifecycle hooks */
  hooks: PluginHooks

  /**
   * Initialize plugin (called once on registration)
   * Use for setup tasks like connecting to external services
   */
  initialize?: () => Promise<void> | void

  /**
   * Cleanup plugin (called on unregister or shutdown)
   * Use for cleanup tasks like closing connections
   */
  cleanup?: () => Promise<void> | void
}

/**
 * Plugin registry entry
 */
export interface RegisteredPlugin {
  /** The plugin instance */
  plugin: SecurityPlugin

  /** Merged configuration (defaults + overrides) */
  config: PluginConfig

  /** Whether plugin is currently enabled */
  enabled: boolean

  /** Effective priority */
  priority: number
}

/**
 * Plugin registration options
 */
export interface RegisterPluginOptions {
  /** Plugin configuration overrides */
  config?: PluginConfig

  /** Whether to enable immediately (default: true) */
  enabled?: boolean

  /** Plugin priority override */
  priority?: PluginPriority | number
}

/**
 * Plugin error types
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public pluginName: string,
    public hookName?: string
  ) {
    super(message)
    this.name = 'PluginError'
  }
}

export class PluginInitializationError extends PluginError {
  constructor(pluginName: string, cause?: Error) {
    super(
      `Failed to initialize plugin: ${cause?.message || 'Unknown error'}`,
      pluginName
    )
    this.name = 'PluginInitializationError'
    this.cause = cause
  }
}

export class PluginValidationError extends PluginError {
  constructor(pluginName: string, message: string) {
    super(message, pluginName, 'validation')
    this.name = 'PluginValidationError'
  }
}

export class PluginRateLimitError extends PluginError {
  constructor(
    pluginName: string,
    message: string,
    public remaining?: number,
    public resetIn?: number
  ) {
    super(message, pluginName, 'rateLimit')
    this.name = 'PluginRateLimitError'
  }
}

export class PluginModerationError extends PluginError {
  constructor(
    pluginName: string,
    message: string,
    public categories?: string[]
  ) {
    super(message, pluginName, 'moderation')
    this.name = 'PluginModerationError'
  }
}

/**
 * Helper type for plugin hook names
 */
export type PluginHookName = keyof PluginHooks

/**
 * Helper type for extracting context from hook
 */
export type HookContext<T extends PluginHookName> = Parameters<
  NonNullable<PluginHooks[T]>
>[0]

/**
 * Helper type for extracting result from hook
 */
export type HookResult<T extends PluginHookName> = ReturnType<
  NonNullable<PluginHooks[T]>
>
