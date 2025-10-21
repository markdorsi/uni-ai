/**
 * Input validator for testing
 */

interface ValidationConfig {
  maxPromptLength: number
  maxMessagesLength: number
  sanitizeInputs: boolean
  blockedPatterns: RegExp[]
}

export function validateInput(prompt: string, config: ValidationConfig): void {
  // Check prompt length
  if (config.maxPromptLength && prompt.length > config.maxPromptLength) {
    throw new Error(
      `Prompt exceeds maximum length of ${config.maxPromptLength} characters`
    )
  }

  // Check for blocked patterns
  if (config.blockedPatterns) {
    for (const pattern of config.blockedPatterns) {
      if (pattern.test(prompt)) {
        throw new Error('Input contains blocked pattern')
      }
    }
  }
}
