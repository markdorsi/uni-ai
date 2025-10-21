/**
 * Tests for PII detection
 */

import { describe, it, expect } from 'vitest'
import { detectPII } from './pii.js'

describe('detectPII()', () => {
  it('should detect SSN', () => {
    const result = detectPII('My SSN is 123-45-6789')

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('SSN')
    expect(result.redacted).toBe('My SSN is [SSN-REDACTED]')
  })

  it('should detect email addresses', () => {
    const result = detectPII('Contact me at john.doe@example.com')

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('Email')
    expect(result.redacted).toBe('Contact me at [EMAIL-REDACTED]')
  })

  it('should detect phone numbers', () => {
    const result = detectPII('Call me at 555-123-4567')

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('Phone')
    expect(result.redacted).toBe('Call me at [PHONE-REDACTED]')
  })

  it('should detect credit card numbers', () => {
    const result = detectPII('Card: 4532-1234-5678-9012')

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('CreditCard')
    expect(result.redacted).toBe('Card: [CARD-REDACTED]')
  })

  it('should detect IP addresses', () => {
    const result = detectPII('Server IP: 192.168.1.1')

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('IPAddress')
    expect(result.redacted).toBe('Server IP: [IP-REDACTED]')
  })

  it('should detect multiple PII types', () => {
    const result = detectPII('Email: john@example.com, Phone: 555-123-4567')

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('Email')
    expect(result.patterns).toContain('Phone')
    expect(result.redacted).toBe('Email: [EMAIL-REDACTED], Phone: [PHONE-REDACTED]')
  })

  it('should not detect PII in clean text', () => {
    const result = detectPII('This is a normal message with no sensitive data')

    expect(result.detected).toBe(false)
    expect(result.patterns).toEqual([])
    expect(result.redacted).toBe('This is a normal message with no sensitive data')
  })

  it('should handle empty string', () => {
    const result = detectPII('')

    expect(result.detected).toBe(false)
    expect(result.patterns).toEqual([])
    expect(result.redacted).toBe('')
  })
})
