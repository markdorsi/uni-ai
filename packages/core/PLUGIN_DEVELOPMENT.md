# Plugin Development Guide

Complete guide to creating security plugins for Uni AI SDK.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Plugin Structure](#plugin-structure)
3. [Hook Reference](#hook-reference)
4. [Best Practices](#best-practices)
5. [Testing](#testing)
6. [Publishing](#publishing)

## Quick Start

### Minimal Plugin

```typescript
import type { SecurityPlugin } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

export const myPlugin: SecurityPlugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
  },

  hooks: {
    async beforeValidation(context) {
      console.log('Request from:', context.userId)
      return context.options
    },
  },
}
```

### Registration

```typescript
import { registerPlugin } from '@uni-ai/sdk'
import { myPlugin } from './my-plugin'

await registerPlugin(myPlugin)
```

## Plugin Structure

### Complete Plugin Interface

```typescript
import type {
  SecurityPlugin,
  PluginContext,
  ValidationResult,
  RateLimitResult,
  PIIDetectionResult,
  ModerationResult,
  SecurityCheckResults,
} from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

export const completePlugin: SecurityPlugin = {
  // Required: Plugin metadata
  metadata: {
    name: 'my-plugin',           // Unique plugin name
    version: '1.0.0',             // Semantic version
    description: 'Description',   // Short description
    author: 'Your Name',          // Author name
    homepage: 'https://...',      // Plugin homepage
    requiredVersion: '^0.1.0',    // Required SDK version
  },

  // Optional: Default configuration
  config: {
    enabled: true,
    priority: PluginPriority.NORMAL,
    // ... custom config fields
  },

  // Optional: Initialization
  async initialize() {
    // Setup: connect to services, load data, etc.
    console.log('Plugin initialized')
  },

  // Optional: Cleanup
  async cleanup() {
    // Teardown: close connections, save state, etc.
    console.log('Plugin cleaned up')
  },

  // Required: At least one hook
  hooks: {
    // See Hook Reference below
  },
}
```

## Hook Reference

### 1. beforeValidation

**Purpose:** Transform or inspect input before any security checks.

**Signature:**
```typescript
async beforeValidation(context: PluginContext): Promise<GenerateOptions>
```

**Example:**
```typescript
hooks: {
  async beforeValidation(context) {
    // Add metadata
    context.metadata.language = detectLanguage(context.options.prompt)

    // Transform input
    const normalized = normalizeText(context.options.prompt)

    return {
      ...context.options,
      prompt: normalized,
    }
  },
}
```

**Use Cases:**
- Input normalization
- Language detection
- Metadata extraction
- Pre-processing

### 2. validation

**Purpose:** Custom input validation rules.

**Signature:**
```typescript
async validation(context: PluginContext): Promise<ValidationResult>
```

**Example:**
```typescript
hooks: {
  async validation(context) {
    const prompt = context.options.prompt || ''

    // Check for SQL injection patterns
    if (/(\bDROP\b|\bDELETE\b|\bINSERT\b)/i.test(prompt)) {
      return {
        valid: false,
        error: 'Potential SQL injection detected',
      }
    }

    return { valid: true }
  },
}
```

**Use Cases:**
- Domain-specific validation
- Advanced prompt injection detection
- Business rule enforcement
- Compliance checks

### 3. rateLimit

**Purpose:** Custom rate limiting backends.

**Signature:**
```typescript
async rateLimit(context: PluginContext): Promise<RateLimitResult>
```

**Example:**
```typescript
hooks: {
  async rateLimit(context) {
    const userId = context.userId || 'anonymous'

    // Check quota in database
    const quota = await db.getUserQuota(userId)

    if (quota.used >= quota.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: quota.resetTime - Date.now(),
        error: 'Quota exceeded',
      }
    }

    // Increment usage
    await db.incrementQuota(userId)

    return {
      allowed: true,
      remaining: quota.limit - quota.used - 1,
    }
  },
}
```

**Use Cases:**
- Distributed rate limiting (Redis)
- Database-backed quotas
- Tiered pricing limits
- API gateway integration

### 4. piiDetection

**Purpose:** Advanced PII detection beyond regex.

**Signature:**
```typescript
async piiDetection(
  text: string,
  context: PluginContext
): Promise<PIIDetectionResult>
```

**Example:**
```typescript
hooks: {
  async piiDetection(text, context) {
    // Call ML-based PII detection service
    const response = await fetch('https://pii-api.example.com/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    const { entities } = await response.json()

    if (entities.length === 0) {
      return {
        detected: false,
        patterns: [],
        redacted: text,
      }
    }

    // Redact detected entities
    let redacted = text
    const patterns: string[] = []

    for (const entity of entities) {
      redacted = redacted.replace(entity.text, `[${entity.type}-REDACTED]`)
      patterns.push(entity.type)
    }

    return {
      detected: true,
      patterns: [...new Set(patterns)],
      redacted,
      entities,
    }
  },
}
```

**Use Cases:**
- ML-based PII detection (Presidio, AWS Comprehend)
- Context-aware entity recognition
- Multi-language PII detection
- Custom entity types

### 5. moderation

**Purpose:** Content safety and moderation.

**Signature:**
```typescript
async moderation(
  text: string,
  context: PluginContext
): Promise<ModerationResult>
```

**Example:**
```typescript
hooks: {
  async moderation(text, context) {
    // Call moderation API
    const response = await fetch('https://moderation-api.example.com/check', {
      method: 'POST',
      body: JSON.stringify({ text }),
    })

    const { safe, categories, scores } = await response.json()

    return {
      safe,
      categories,
      scores,
      action: safe ? 'allow' : 'block',
      reason: safe ? undefined : `Flagged for: ${categories.join(', ')}`,
    }
  },
}
```

**Use Cases:**
- OpenAI Moderation API
- Perspective API (toxicity)
- Custom content policies
- Brand safety checks

### 6. afterSecurity

**Purpose:** Logging, analytics, auditing after all checks pass.

**Signature:**
```typescript
async afterSecurity(
  context: PluginContext,
  results: SecurityCheckResults
): Promise<void>
```

**Example:**
```typescript
hooks: {
  async afterSecurity(context, results) {
    // Log security event
    await analytics.track('security_check_passed', {
      userId: context.userId,
      model: context.options.model,
      executionTime: results.executionTime,
      modified: results.modified,
    })

    // Update metrics
    metrics.increment('security.checks.passed')
  },
}
```

**Use Cases:**
- Audit logging
- Analytics/telemetry
- Compliance recording
- Performance monitoring

### 7. onSecurityError

**Purpose:** Handle security check failures.

**Signature:**
```typescript
async onSecurityError(
  error: Error,
  context: PluginContext
): Promise<void | GenerateOptions>
```

**Example:**
```typescript
hooks: {
  async onSecurityError(error, context) {
    // Log error
    logger.error('Security check failed', {
      error: error.message,
      userId: context.userId,
      model: context.options.model,
    })

    // Alert if critical
    if (error.name === 'PluginModerationError') {
      await alerting.send({
        severity: 'high',
        message: `Moderation failed: ${error.message}`,
      })
    }

    // Optional: Attempt recovery
    // Return modified options to continue
    // return { ...context.options, prompt: sanitize(context.options.prompt) }
  },
}
```

**Use Cases:**
- Error logging
- Alerting
- Graceful degradation
- Error recovery

## Best Practices

### 1. Error Handling

Always handle errors gracefully:

```typescript
hooks: {
  async rateLimit(context) {
    try {
      // Check rate limit
      const result = await checkRateLimit(context.userId)
      return result
    } catch (error) {
      console.error('Rate limit check failed:', error)

      // Fail open (allow request) on errors
      return { allowed: true }

      // Or fail closed (block request)
      // return { allowed: false, error: 'Rate limit service unavailable' }
    }
  },
}
```

### 2. Async Operations

All hooks support async operations:

```typescript
hooks: {
  async piiDetection(text, context) {
    // Multiple async operations
    const [result1, result2] = await Promise.all([
      detectPII(text),
      detectEntities(text),
    ])

    return mergePIIResults(result1, result2)
  },
}
```

### 3. Configuration

Make plugins configurable:

```typescript
export function createMyPlugin(config?: MyPluginConfig): SecurityPlugin {
  const cfg = {
    enabled: true,
    threshold: 0.5,
    ...config,
  }

  return {
    metadata: {
      name: 'my-plugin',
      version: '1.0.0',
    },

    config: cfg,

    hooks: {
      async validation(context) {
        // Use configuration
        if (getScore(context) > cfg.threshold) {
          return { valid: false, error: 'Score too high' }
        }
        return { valid: true }
      },
    },
  }
}
```

### 4. TypeScript

Use strict typing:

```typescript
import type {
  SecurityPlugin,
  PluginContext,
  ValidationResult,
} from '@uni-ai/sdk'

interface MyPluginConfig {
  threshold: number
  enabled: boolean
}

export function createMyPlugin(
  config?: Partial<MyPluginConfig>
): SecurityPlugin {
  // Implementation
}
```

### 5. Testing

Write comprehensive tests:

```typescript
import { describe, it, expect } from 'vitest'
import { myPlugin } from './my-plugin'

describe('My Plugin', () => {
  it('should validate input', async () => {
    const context = {
      options: { model: 'gpt-4', prompt: 'test' },
      security: {},
      metadata: {},
      startTime: Date.now(),
    }

    const result = await myPlugin.hooks.validation!(context)

    expect(result.valid).toBe(true)
  })
})
```

### 6. Documentation

Document your plugin:

```typescript
/**
 * My Plugin
 *
 * This plugin does X, Y, and Z.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@uni-ai/sdk'
 * import { myPlugin } from './my-plugin'
 *
 * await registerPlugin(myPlugin, {
 *   config: { threshold: 0.8 }
 * })
 * ```
 */
export const myPlugin: SecurityPlugin = {
  // ...
}
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { registerPlugin, clearPlugins, ai } from '@uni-ai/sdk'
import { myPlugin } from './my-plugin'

describe('My Plugin', () => {
  beforeEach(async () => {
    await registerPlugin(myPlugin)
  })

  afterEach(async () => {
    await clearPlugins()
  })

  it('should block invalid input', async () => {
    await expect(
      ai('gpt-4', 'invalid input', { security: 'strict' })
    ).rejects.toThrow('Validation failed')
  })

  it('should allow valid input', async () => {
    const result = await ai('gpt-4', 'valid input', { security: 'strict' })
    expect(result).toBeDefined()
  })
})
```

### Integration Tests

```typescript
import { registerPlugin, ai } from '@uni-ai/sdk'
import { myPlugin } from './my-plugin'
import { auditLoggerPlugin } from './audit-logger'

describe('Plugin Integration', () => {
  it('should work with multiple plugins', async () => {
    await registerPlugin(myPlugin)
    await registerPlugin(auditLoggerPlugin)

    const result = await ai('gpt-4', 'test')
    expect(result).toBeDefined()
  })
})
```

## Publishing

### 1. Prepare Package

Create `package.json`:

```json
{
  "name": "@yourname/uni-ai-plugin-myname",
  "version": "1.0.0",
  "description": "My Uni AI security plugin",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "keywords": [
    "uni-ai",
    "uni-ai-plugin",
    "security",
    "ai"
  ],
  "peerDependencies": {
    "@uni-ai/sdk": "^0.1.0"
  },
  "devDependencies": {
    "@uni-ai/sdk": "^0.1.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 2. Build

```bash
npm run build
```

### 3. Test Locally

```bash
npm link

cd /path/to/test-project
npm link @yourname/uni-ai-plugin-myname
```

### 4. Publish

```bash
npm publish --access public
```

### 5. Promote

- Add to [Plugin Registry](https://github.com/uni-ai/plugins)
- Tag with `uni-ai-plugin` on GitHub
- Share in discussions

## Examples

See [examples/plugins/](../../examples/plugins/) for complete examples:
- Redis Rate Limit
- OpenAI Moderation
- Audit Logger

## Support

- Documentation: https://docs.uni-ai.dev/plugins
- API Reference: [SECURITY_PLUGINS.md](./SECURITY_PLUGINS.md)
- Examples: [examples/plugins/](../../examples/plugins/)
- Issues: https://github.com/markdorsi/uni-ai/issues
