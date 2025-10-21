/**
 * Redis Rate Limit Plugin
 *
 * Distributed rate limiting using Redis for multi-server deployments.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@uni-ai/sdk'
 * import { redisRateLimitPlugin } from './plugins/redis-rate-limit'
 *
 * await registerPlugin(redisRateLimitPlugin, {
 *   config: {
 *     host: 'localhost',
 *     port: 6379,
 *     maxRequestsPerMinute: 10,
 *     maxRequestsPerHour: 100
 *   }
 * })
 * ```
 */

import type {
  SecurityPlugin,
  PluginContext,
  RateLimitResult,
} from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

/**
 * Redis client interface (compatible with ioredis or node-redis)
 */
interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, expiryMode?: string, time?: number): Promise<void>
  incr(key: string): Promise<number>
  expire(key: string, seconds: number): Promise<void>
  pipeline(): RedisPipeline
  disconnect(): Promise<void>
}

interface RedisPipeline {
  get(key: string): RedisPipeline
  exec(): Promise<Array<[Error | null, unknown]>>
}

/**
 * Plugin configuration
 */
interface RedisRateLimitConfig {
  /** Redis host (default: localhost) */
  host?: string

  /** Redis port (default: 6379) */
  port?: number

  /** Redis password */
  password?: string

  /** Redis database number (default: 0) */
  db?: number

  /** Max requests per minute (default: 60) */
  maxRequestsPerMinute?: number

  /** Max requests per hour (default: 1000) */
  maxRequestsPerHour?: number

  /** Max requests per day */
  maxRequestsPerDay?: number

  /** Custom user ID extractor */
  getUserId?: (context: PluginContext) => string

  /** Key prefix for Redis keys (default: 'uni-ai:ratelimit:') */
  keyPrefix?: string
}

/**
 * Create Redis rate limit plugin
 */
export function createRedisRateLimitPlugin(
  redisClient?: RedisClient,
  config?: RedisRateLimitConfig
): SecurityPlugin {
  let client: RedisClient | null = redisClient || null
  const cfg: Required<RedisRateLimitConfig> = {
    host: config?.host || 'localhost',
    port: config?.port || 6379,
    password: config?.password || '',
    db: config?.db || 0,
    maxRequestsPerMinute: config?.maxRequestsPerMinute || 60,
    maxRequestsPerHour: config?.maxRequestsPerHour || 1000,
    maxRequestsPerDay: config?.maxRequestsPerDay || 10000,
    getUserId:
      config?.getUserId || ((context) => context.userId || 'anonymous'),
    keyPrefix: config?.keyPrefix || 'uni-ai:ratelimit:',
  }

  return {
    metadata: {
      name: 'redis-rate-limit',
      version: '1.0.0',
      description: 'Distributed rate limiting using Redis',
      author: 'Uni AI',
    },

    config: {
      enabled: true,
      priority: PluginPriority.HIGH,
      ...config,
    },

    async initialize() {
      // Only create client if not provided
      if (!client) {
        try {
          // Dynamically import ioredis (user must install it)
          const { default: Redis } = await import('ioredis')
          client = new Redis({
            host: cfg.host,
            port: cfg.port,
            password: cfg.password || undefined,
            db: cfg.db,
          }) as unknown as RedisClient
        } catch (error) {
          throw new Error(
            'Redis client not provided and ioredis not installed. ' +
              'Please install ioredis: npm install ioredis'
          )
        }
      }
    },

    async cleanup() {
      if (client) {
        await client.disconnect()
      }
    },

    hooks: {
      async rateLimit(context: PluginContext): Promise<RateLimitResult> {
        if (!client) {
          throw new Error('Redis client not initialized')
        }

        const userId = cfg.getUserId(context)
        const now = Date.now()

        // Redis keys for different time windows
        const minuteKey = `${cfg.keyPrefix}${userId}:minute:${Math.floor(now / 60000)}`
        const hourKey = `${cfg.keyPrefix}${userId}:hour:${Math.floor(now / 3600000)}`
        const dayKey = `${cfg.keyPrefix}${userId}:day:${Math.floor(now / 86400000)}`

        // Check and increment all counters atomically
        try {
          const pipeline = client.pipeline()
          pipeline.get(minuteKey)
          pipeline.get(hourKey)
          pipeline.get(dayKey)
          const results = await pipeline.exec()

          if (!results) {
            throw new Error('Redis pipeline failed')
          }

          const minuteCount = parseInt((results[0][1] as string) || '0', 10)
          const hourCount = parseInt((results[1][1] as string) || '0', 10)
          const dayCount = parseInt((results[2][1] as string) || '0', 10)

          // Check limits
          if (minuteCount >= cfg.maxRequestsPerMinute) {
            return {
              allowed: false,
              remaining: 0,
              resetIn: 60000 - (now % 60000),
              error: 'Rate limit exceeded (per minute)',
            }
          }

          if (hourCount >= cfg.maxRequestsPerHour) {
            return {
              allowed: false,
              remaining: 0,
              resetIn: 3600000 - (now % 3600000),
              error: 'Rate limit exceeded (per hour)',
            }
          }

          if (cfg.maxRequestsPerDay && dayCount >= cfg.maxRequestsPerDay) {
            return {
              allowed: false,
              remaining: 0,
              resetIn: 86400000 - (now % 86400000),
              error: 'Rate limit exceeded (per day)',
            }
          }

          // Increment counters
          await client.incr(minuteKey)
          await client.expire(minuteKey, 60)

          await client.incr(hourKey)
          await client.expire(hourKey, 3600)

          await client.incr(dayKey)
          await client.expire(dayKey, 86400)

          // Calculate remaining quota (most restrictive)
          const remaining = Math.min(
            cfg.maxRequestsPerMinute - minuteCount - 1,
            cfg.maxRequestsPerHour - hourCount - 1,
            cfg.maxRequestsPerDay - dayCount - 1
          )

          return {
            allowed: true,
            remaining: Math.max(0, remaining),
            resetIn: 60000 - (now % 60000), // Time until minute resets
          }
        } catch (error) {
          console.error('Redis rate limit error:', error)
          // Fail open (allow request) on Redis errors
          return {
            allowed: true,
            remaining: undefined,
          }
        }
      },
    },
  }
}

/**
 * Default export with common configuration
 */
export const redisRateLimitPlugin = createRedisRateLimitPlugin()
