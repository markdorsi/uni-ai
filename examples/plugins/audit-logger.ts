/**
 * Audit Logger Plugin
 *
 * Logs all security events for compliance and debugging.
 * Supports custom log destinations (file, database, cloud logging).
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@uni-ai/sdk'
 * import { createAuditLoggerPlugin } from './plugins/audit-logger'
 *
 * await registerPlugin(createAuditLoggerPlugin({
 *   destination: 'file',
 *   filePath: './audit.log',
 *   includePrompts: false // Don't log sensitive prompts
 * }))
 * ```
 */

import type {
  SecurityPlugin,
  PluginContext,
  SecurityCheckResults,
} from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'
import { writeFile, appendFile } from 'fs/promises'
import { existsSync } from 'fs'

/**
 * Audit event types
 */
type AuditEventType =
  | 'security_check_passed'
  | 'security_check_failed'
  | 'validation_failed'
  | 'rate_limit_exceeded'
  | 'pii_detected'
  | 'moderation_flagged'
  | 'plugin_error'

/**
 * Audit log entry
 */
interface AuditLogEntry {
  /** Event timestamp */
  timestamp: string

  /** Event type */
  event: AuditEventType

  /** User ID (if available) */
  userId?: string

  /** Model used */
  model?: string

  /** Prompt (if includePrompts is true) */
  prompt?: string

  /** Error message (for failures) */
  error?: string

  /** Security check results */
  results?: Partial<SecurityCheckResults>

  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Log destination handler
 */
type LogDestination = (entry: AuditLogEntry) => Promise<void> | void

/**
 * Plugin configuration
 */
interface AuditLoggerConfig {
  /** Log destination (default: 'console') */
  destination?: 'console' | 'file' | 'custom'

  /** File path (for file destination) */
  filePath?: string

  /** Custom log handler */
  customHandler?: LogDestination

  /** Whether to include prompts in logs (default: false for privacy) */
  includePrompts?: boolean

  /** Whether to include full results (default: true) */
  includeResults?: boolean

  /** Log format (default: 'json') */
  format?: 'json' | 'text'

  /** Only log specific event types */
  events?: AuditEventType[]
}

/**
 * Create Audit Logger plugin
 */
export function createAuditLoggerPlugin(
  config?: AuditLoggerConfig
): SecurityPlugin {
  const cfg: Required<AuditLoggerConfig> = {
    destination: config?.destination || 'console',
    filePath: config?.filePath || './audit.log',
    customHandler:
      config?.customHandler || (async () => {
        /* noop */
      }),
    includePrompts: config?.includePrompts || false,
    includeResults: config?.includeResults || true,
    format: config?.format || 'json',
    events: config?.events || [
      'security_check_passed',
      'security_check_failed',
      'validation_failed',
      'rate_limit_exceeded',
      'pii_detected',
      'moderation_flagged',
      'plugin_error',
    ],
  }

  /**
   * Write log entry to destination
   */
  async function writeLog(entry: AuditLogEntry): Promise<void> {
    // Filter by event type
    if (!cfg.events.includes(entry.event)) {
      return
    }

    // Format entry
    const formatted =
      cfg.format === 'json'
        ? JSON.stringify(entry)
        : formatTextLog(entry)

    // Write to destination
    switch (cfg.destination) {
      case 'console':
        console.log(formatted)
        break

      case 'file':
        try {
          // Append to file
          if (existsSync(cfg.filePath)) {
            await appendFile(cfg.filePath, formatted + '\n', 'utf-8')
          } else {
            await writeFile(cfg.filePath, formatted + '\n', 'utf-8')
          }
        } catch (error) {
          console.error('Failed to write audit log:', error)
        }
        break

      case 'custom':
        await cfg.customHandler(entry)
        break
    }
  }

  /**
   * Format log entry as text
   */
  function formatTextLog(entry: AuditLogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      entry.event.toUpperCase(),
      entry.userId ? `user=${entry.userId}` : null,
      entry.model ? `model=${entry.model}` : null,
      entry.error ? `error="${entry.error}"` : null,
    ].filter(Boolean)

    return parts.join(' ')
  }

  /**
   * Create log entry from context
   */
  function createLogEntry(
    event: AuditEventType,
    context: PluginContext,
    error?: Error,
    results?: SecurityCheckResults
  ): AuditLogEntry {
    return {
      timestamp: new Date().toISOString(),
      event,
      userId: context.userId,
      model: context.options.model,
      prompt: cfg.includePrompts
        ? context.options.prompt ||
          context.options.messages
            ?.map((m) => m.content)
            .join('\n')
            .substring(0, 200)
        : undefined,
      error: error?.message,
      results: cfg.includeResults ? results : undefined,
      metadata: context.metadata,
    }
  }

  return {
    metadata: {
      name: 'audit-logger',
      version: '1.0.0',
      description: 'Security audit logging',
      author: 'Uni AI',
    },

    config: {
      enabled: true,
      priority: PluginPriority.LOW, // Run after other plugins
      ...config,
    },

    initialize() {
      // Create log file if using file destination
      if (cfg.destination === 'file' && !existsSync(cfg.filePath)) {
        writeFile(cfg.filePath, '', 'utf-8').catch((error) => {
          console.error('Failed to create audit log file:', error)
        })
      }
    },

    hooks: {
      // Log successful security checks
      async afterSecurity(
        context: PluginContext,
        results: SecurityCheckResults
      ): Promise<void> {
        const entry = createLogEntry(
          'security_check_passed',
          context,
          undefined,
          results
        )
        await writeLog(entry)
      },

      // Log security errors
      async onSecurityError(
        error: Error,
        context: PluginContext
      ): Promise<void> {
        // Determine specific error type
        let eventType: AuditEventType = 'security_check_failed'

        if (error.name === 'PluginValidationError') {
          eventType = 'validation_failed'
        } else if (error.name === 'PluginRateLimitError') {
          eventType = 'rate_limit_exceeded'
        } else if (error.name === 'PluginModerationError') {
          eventType = 'moderation_flagged'
        } else if (error.message.includes('PII')) {
          eventType = 'pii_detected'
        } else if (error.name === 'PluginError') {
          eventType = 'plugin_error'
        }

        const entry = createLogEntry(eventType, context, error)
        await writeLog(entry)
      },
    },
  }
}

/**
 * Default export with console logging
 */
export const auditLoggerPlugin = createAuditLoggerPlugin()

/**
 * File-based audit logger
 */
export const fileAuditLoggerPlugin = createAuditLoggerPlugin({
  destination: 'file',
  filePath: './audit.log',
  includePrompts: false,
  format: 'json',
})

/**
 * Compliance-focused logger (logs everything)
 */
export const complianceLoggerPlugin = createAuditLoggerPlugin({
  destination: 'file',
  filePath: './compliance.log',
  includePrompts: true,
  includeResults: true,
  format: 'json',
})
