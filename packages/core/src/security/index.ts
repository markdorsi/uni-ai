import type { GenerateOptions, SecurityConfig, SecurityPreset } from '../types/index.js'
import { securityPresets } from './presets.js'
import { validateInput } from './validation.js'
import { checkRateLimit } from './rate-limit.js'
import { detectPII } from './pii.js'
import { executeSecurityPlugins, getPlugins } from '../plugins/index.js'

/**
 * Apply security middleware to generation options
 * Integrates both built-in security checks and registered plugins
 */
export async function applySecurityMiddleware(
  options: GenerateOptions
): Promise<GenerateOptions> {
  // Get security config
  const securityConfig = getSecurityConfig(options.security)

  // Check if any plugins are registered
  const hasPlugins = getPlugins().length > 0

  if (hasPlugins) {
    // Use plugin system (runs built-in checks + plugins)
    const { options: modifiedOptions } = await executeSecurityPlugins(options, {
      security: securityConfig,
    })
    return modifiedOptions
  }

  // Fallback: Run built-in checks only (for backward compatibility)
  let currentOptions = options

  // Apply built-in security checks
  if (securityConfig.inputValidation) {
    validateInput(currentOptions, securityConfig.inputValidation)
  }

  if (securityConfig.rateLimiting) {
    await checkRateLimit(securityConfig.rateLimiting)
  }

  if (securityConfig.piiDetection?.enabled) {
    const prompt = getPromptText(currentOptions)
    const piiResult = detectPII(prompt)

    if (piiResult.detected) {
      if (securityConfig.piiDetection.redact) {
        // Redact PII from prompt
        currentOptions = {
          ...currentOptions,
          prompt: piiResult.redacted,
        }
      } else {
        throw new SecurityError(
          'PII detected in prompt',
          { patterns: piiResult.patterns }
        )
      }
    }
  }

  // TODO: Add moderation check
  // if (securityConfig.moderation?.enabled) {
  //   await checkModeration(currentOptions, securityConfig.moderation)
  // }

  return currentOptions
}

/**
 * Convert security preset to full config
 */
function getSecurityConfig(
  security?: SecurityPreset | SecurityConfig
): SecurityConfig {
  if (!security) {
    return securityPresets.moderate
  }

  if (typeof security === 'string') {
    return securityPresets[security]
  }

  // Merge with preset if specified
  if (security.preset) {
    return {
      ...securityPresets[security.preset],
      ...security,
    }
  }

  return security
}

/**
 * Extract prompt text from options
 */
function getPromptText(options: GenerateOptions): string {
  if (options.prompt) {
    return options.prompt
  }

  if (options.messages) {
    return options.messages
      .map(m => typeof m.content === 'string' ? m.content : '')
      .join('\n')
  }

  return ''
}

/**
 * Security error
 */
export class SecurityError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

// Re-exports
export { securityPresets } from './presets.js'
export { validateInput } from './validation.js'
export { checkRateLimit } from './rate-limit.js'
export { detectPII } from './pii.js'
