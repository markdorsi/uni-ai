import type { GenerateOptions, SecurityConfig } from '../types/index.js'

/**
 * Validate input against security rules
 */
export function validateInput(
  options: GenerateOptions,
  config: NonNullable<SecurityConfig['inputValidation']>
): void {
  // Check prompt length
  if (options.prompt && config.maxPromptLength) {
    if (options.prompt.length > config.maxPromptLength) {
      throw new ValidationError(
        `Prompt exceeds maximum length of ${config.maxPromptLength} characters`,
        { length: options.prompt.length, max: config.maxPromptLength }
      )
    }
  }

  // Check messages length
  if (options.messages && config.maxMessagesLength) {
    if (options.messages.length > config.maxMessagesLength) {
      throw new ValidationError(
        `Messages array exceeds maximum length of ${config.maxMessagesLength}`,
        { length: options.messages.length, max: config.maxMessagesLength }
      )
    }
  }

  // Check for blocked patterns
  if (config.blockedPatterns) {
    const text = options.prompt || options.messages?.map(m =>
      typeof m.content === 'string' ? m.content : ''
    ).join('\n') || ''

    for (const pattern of config.blockedPatterns) {
      if (pattern.test(text)) {
        throw new ValidationError(
          'Input contains blocked pattern (potential prompt injection)',
          { pattern: pattern.source }
        )
      }
    }
  }

  // Sanitize inputs if enabled
  if (config.sanitizeInputs) {
    if (options.prompt) {
      options.prompt = sanitizeText(options.prompt)
    }
    if (options.messages) {
      options.messages = options.messages.map(m => ({
        ...m,
        content: typeof m.content === 'string' ? sanitizeText(m.content) : m.content,
      }))
    }
  }
}

/**
 * Basic text sanitization
 */
function sanitizeText(text: string): string {
  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Trim
    .trim()
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
