import type { SecurityConfig } from '../types/index.js'

/**
 * Simple in-memory rate limiter
 * For production, use Redis or similar
 */

interface RateLimitEntry {
  requests: number[]
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Check rate limits
 */
export async function checkRateLimit(
  config: NonNullable<SecurityConfig['rateLimiting']>
): Promise<void> {
  const userId = config.userId || 'anonymous'
  const now = Date.now()

  // Get or create entry
  let entry = rateLimitStore.get(userId)
  if (!entry) {
    entry = { requests: [] }
    rateLimitStore.set(userId, entry)
  }

  // Remove old requests
  const oneMinuteAgo = now - 60 * 1000
  const oneHourAgo = now - 60 * 60 * 1000
  entry.requests = entry.requests.filter(time => time > oneHourAgo)

  // Check minute limit
  if (config.maxRequestsPerMinute) {
    const recentRequests = entry.requests.filter(time => time > oneMinuteAgo)
    if (recentRequests.length >= config.maxRequestsPerMinute) {
      const oldestRequest = entry.requests[0] ?? now
      const resetIn = Math.ceil((oldestRequest + 60 * 1000 - now) / 1000)
      throw new RateLimitError(
        'Rate limit exceeded (per minute)',
        {
          limit: config.maxRequestsPerMinute,
          current: recentRequests.length,
          resetIn,
        }
      )
    }
  }

  // Check hour limit
  if (config.maxRequestsPerHour) {
    if (entry.requests.length >= config.maxRequestsPerHour) {
      const oldestRequest = entry.requests[0] ?? now
      const resetIn = Math.ceil((oldestRequest + 60 * 60 * 1000 - now) / 1000)
      throw new RateLimitError(
        'Rate limit exceeded (per hour)',
        {
          limit: config.maxRequestsPerHour,
          current: entry.requests.length,
          resetIn,
        }
      )
    }
  }

  // Add current request
  entry.requests.push(now)

  // Cleanup old entries periodically
  if (Math.random() < 0.01) {
    cleanupRateLimitStore()
  }
}

/**
 * Cleanup old entries from rate limit store
 */
function cleanupRateLimitStore(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000

  for (const [userId, entry] of rateLimitStore.entries()) {
    entry.requests = entry.requests.filter(time => time > oneHourAgo)
    if (entry.requests.length === 0) {
      rateLimitStore.delete(userId)
    }
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly details: {
      limit: number
      current: number
      resetIn: number
    }
  ) {
    super(message)
    this.name = 'RateLimitError'
  }

  get userMessage(): string {
    return `You're sending requests too quickly. Please wait ${this.details.resetIn} seconds.`
  }
}
