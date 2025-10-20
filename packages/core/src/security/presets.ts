import type { SecurityConfig } from '../types/index.js'

/**
 * Security presets for common use cases
 */
export const securityPresets: Record<'strict' | 'moderate' | 'permissive', SecurityConfig> = {
  /**
   * Strict security - Recommended for production
   * - Aggressive rate limiting
   * - Input validation and sanitization
   * - PII detection and redaction
   * - Content moderation enabled
   */
  strict: {
    inputValidation: {
      maxPromptLength: 10000,
      maxMessagesLength: 50,
      sanitizeInputs: true,
      blockedPatterns: [
        /ignore\s+previous\s+instructions/i,
        /ignore\s+all\s+previous/i,
        /disregard\s+previous/i,
        /system\s*:\s*you\s+are/i,
      ],
    },
    rateLimiting: {
      maxRequestsPerMinute: 10,
      maxRequestsPerHour: 100,
    },
    piiDetection: {
      enabled: true,
      redact: true,
    },
    moderation: {
      enabled: true,
      provider: 'openai',
      threshold: 'medium',
      onViolation: 'block',
    },
  },

  /**
   * Moderate security - Balanced approach (default)
   * - Reasonable rate limiting
   * - Basic input validation
   * - PII warnings
   * - Content moderation warnings
   */
  moderate: {
    inputValidation: {
      maxPromptLength: 50000,
      maxMessagesLength: 100,
      sanitizeInputs: true,
    },
    rateLimiting: {
      maxRequestsPerMinute: 30,
      maxRequestsPerHour: 500,
    },
    piiDetection: {
      enabled: true,
      redact: false,
    },
    moderation: {
      enabled: true,
      provider: 'openai',
      threshold: 'medium',
      onViolation: 'warn',
    },
  },

  /**
   * Permissive security - Development/testing only
   * - Minimal rate limiting
   * - Basic validation only
   * - No PII detection
   * - No moderation
   */
  permissive: {
    inputValidation: {
      maxPromptLength: 100000,
      maxMessagesLength: 200,
      sanitizeInputs: false,
    },
    rateLimiting: {
      maxRequestsPerMinute: 100,
      maxRequestsPerHour: 1000,
    },
    piiDetection: {
      enabled: false,
    },
    moderation: {
      enabled: false,
    },
  },
}
