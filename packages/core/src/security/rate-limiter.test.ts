/**
 * Tests for rate limiter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from './rate-limiter.js'

describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should allow requests within limits', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxRequestsPerHour: 100,
    })

    // Should allow first request
    expect(() => limiter.checkLimit('user1')).not.toThrow()

    // Should allow subsequent requests
    expect(() => limiter.checkLimit('user1')).not.toThrow()
    expect(() => limiter.checkLimit('user1')).not.toThrow()
  })

  it('should enforce per-minute rate limit', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 2,
      maxRequestsPerHour: 100,
    })

    limiter.checkLimit('user1')
    limiter.checkLimit('user1')

    // Third request should fail
    expect(() => limiter.checkLimit('user1')).toThrow(
      'Rate limit exceeded: 2 requests per minute'
    )
  })

  it('should reset per-minute limit after 60 seconds', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 2,
      maxRequestsPerHour: 100,
    })

    limiter.checkLimit('user1')
    limiter.checkLimit('user1')

    // Should fail immediately
    expect(() => limiter.checkLimit('user1')).toThrow()

    // Advance time by 60 seconds
    vi.advanceTimersByTime(60 * 1000)

    // Should allow requests again
    expect(() => limiter.checkLimit('user1')).not.toThrow()
  })

  it('should enforce per-hour rate limit', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 100,
      maxRequestsPerHour: 3,
    })

    limiter.checkLimit('user1')
    limiter.checkLimit('user1')
    limiter.checkLimit('user1')

    // Fourth request should fail
    expect(() => limiter.checkLimit('user1')).toThrow(
      'Rate limit exceeded: 3 requests per hour'
    )
  })

  it('should reset per-hour limit after 3600 seconds', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 100,
      maxRequestsPerHour: 3,
    })

    limiter.checkLimit('user1')
    limiter.checkLimit('user1')
    limiter.checkLimit('user1')

    // Should fail immediately
    expect(() => limiter.checkLimit('user1')).toThrow()

    // Advance time by 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000)

    // Should allow requests again
    expect(() => limiter.checkLimit('user1')).not.toThrow()
  })

  it('should track limits per user separately', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 2,
      maxRequestsPerHour: 100,
    })

    limiter.checkLimit('user1')
    limiter.checkLimit('user1')

    // user1 should be blocked
    expect(() => limiter.checkLimit('user1')).toThrow()

    // user2 should still be allowed
    expect(() => limiter.checkLimit('user2')).not.toThrow()
    expect(() => limiter.checkLimit('user2')).not.toThrow()

    // user2 should now be blocked
    expect(() => limiter.checkLimit('user2')).toThrow()
  })

  it('should handle unlimited rate limits', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: Infinity,
      maxRequestsPerHour: Infinity,
    })

    // Should allow many requests
    for (let i = 0; i < 1000; i++) {
      expect(() => limiter.checkLimit('user1')).not.toThrow()
    }
  })

  it('should clean up old entries', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 10,
      maxRequestsPerHour: 100,
    })

    limiter.checkLimit('user1')

    // Advance time by 2 hours
    vi.advanceTimersByTime(2 * 60 * 60 * 1000)

    limiter.checkLimit('user1')

    // Old entries should be cleaned up (internal check)
    // If not cleaned, memory would grow unbounded
    expect(() => limiter.checkLimit('user1')).not.toThrow()
  })

  it('should handle zero user ID', () => {
    const limiter = new RateLimiter({
      maxRequestsPerMinute: 2,
      maxRequestsPerHour: 10,
    })

    expect(() => limiter.checkLimit('')).not.toThrow()
  })
})
