/**
 * Rate limiter class wrapper for testing
 */

interface RateLimitEntry {
  requests: number[]
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>()

  constructor(
    private config: {
      maxRequestsPerMinute: number
      maxRequestsPerHour: number
    }
  ) {}

  checkLimit(userId: string): void {
    const now = Date.now()

    // Get or create entry
    let entry = this.store.get(userId)
    if (!entry) {
      entry = { requests: [] }
      this.store.set(userId, entry)
    }

    // Remove old requests
    const oneMinuteAgo = now - 60 * 1000
    const oneHourAgo = now - 60 * 60 * 1000
    entry.requests = entry.requests.filter((time) => time > oneHourAgo)

    // Check minute limit
    if (this.config.maxRequestsPerMinute < Infinity) {
      const recentRequests = entry.requests.filter((time) => time > oneMinuteAgo)
      if (recentRequests.length >= this.config.maxRequestsPerMinute) {
        throw new Error(
          `Rate limit exceeded: ${this.config.maxRequestsPerMinute} requests per minute`
        )
      }
    }

    // Check hour limit
    if (this.config.maxRequestsPerHour < Infinity) {
      if (entry.requests.length >= this.config.maxRequestsPerHour) {
        throw new Error(
          `Rate limit exceeded: ${this.config.maxRequestsPerHour} requests per hour`
        )
      }
    }

    // Add current request
    entry.requests.push(now)

    // Cleanup old entries periodically
    if (Math.random() < 0.1) {
      this.cleanup()
    }
  }

  private cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000

    for (const [userId, entry] of this.store.entries()) {
      entry.requests = entry.requests.filter((time) => time > oneHourAgo)
      if (entry.requests.length === 0) {
        this.store.delete(userId)
      }
    }
  }
}
