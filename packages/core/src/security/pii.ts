/**
 * PII (Personally Identifiable Information) detection
 * Basic regex-based detection for common PII patterns
 */

interface PIIPattern {
  name: string
  pattern: RegExp
  replacement: string
}

const PII_PATTERNS: PIIPattern[] = [
  {
    name: 'SSN',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN-REDACTED]',
  },
  {
    name: 'Email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL-REDACTED]',
  },
  {
    name: 'Phone',
    pattern: /\b(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
    replacement: '[PHONE-REDACTED]',
  },
  {
    name: 'CreditCard',
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: '[CARD-REDACTED]',
  },
  {
    name: 'IPAddress',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[IP-REDACTED]',
  },
]

export interface PIIDetectionResult {
  detected: boolean
  patterns: string[]
  redacted: string
}

/**
 * Detect PII in text
 */
export function detectPII(text: string): PIIDetectionResult {
  const detectedPatterns: string[] = []
  let redactedText = text

  for (const { name, pattern, replacement } of PII_PATTERNS) {
    if (pattern.test(text)) {
      detectedPatterns.push(name)
      redactedText = redactedText.replace(pattern, replacement)
    }
  }

  return {
    detected: detectedPatterns.length > 0,
    patterns: detectedPatterns,
    redacted: redactedText,
  }
}
