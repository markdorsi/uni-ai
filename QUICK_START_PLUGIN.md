# Plugin Integration - 5 Minute Quick Start

This guide shows how to integrate a third-party security service with Uni AI SDK in **5 minutes or less**.

## How It Works

### The Plugin System (Visual)

```
┌─────────────────────────────────────────────────────────┐
│  Your Application                                       │
│  const response = await ai('gpt-4', userInput)         │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  Uni AI SDK                                             │
│  • Receives request                                     │
│  • Runs registered plugins (in priority order)          │
│  • Each plugin can inspect/modify/reject request        │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Plugin 1   │ │  Plugin 2   │ │  Plugin 3   │
│  Daxa.ai    │ │  Securiti   │ │  Your       │
│  HIPAA      │ │  Multi-reg  │ │  Custom     │
└─────────────┘ └─────────────┘ └─────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│  LLM Provider (OpenAI, Anthropic, etc.)                │
│  • Request only reaches LLM if all plugins approve      │
└─────────────────────────────────────────────────────────┘
```

### Execution Flow

```typescript
// 1. User makes request
const response = await ai('gpt-4', 'Sensitive data: SSN 123-45-6789')

// 2. SDK runs plugins in order:
//    beforeValidation → validation → rateLimit →
//    piiDetection → moderation → afterSecurity

// 3. Each plugin can:
//    ✓ Inspect the request
//    ✓ Modify the request (e.g., redact PII)
//    ✓ Throw error to block request
//    ✓ Attach metadata for next plugin

// 4. If all plugins pass, request goes to LLM
// 5. Response returns to user
```

## 5-Minute Integration

### Scenario: Integrate Daxa.ai for HIPAA Compliance

**Goal**: Add HIPAA compliance to your AI app in 5 minutes.

#### Minute 1-2: Install and Import

```bash
# Install Uni AI SDK
npm install @uni-ai/sdk

# Install Daxa plugin (hypothetical - you'd build this)
npm install @uni-ai/plugin-daxa
# OR use the template we provide
```

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { createDaxaPlugin } from '@uni-ai/plugin-daxa'
```

#### Minute 3-4: Configure Plugin

```typescript
// Register Daxa plugin with your API key
await registerPlugin(createDaxaPlugin({
  apiKey: process.env.DAXA_API_KEY,  // Get from Daxa.ai dashboard
  enforcementMode: 'block',           // or 'warn' or 'audit'
  policies: ['HIPAA'],                // Which policies to enforce
}))
```

#### Minute 5: Use It

```typescript
// That's it! Now all your AI calls are HIPAA-compliant
const diagnosis = await ai('gpt-4', `
  Patient: 45yo male
  Symptoms: chest pain
  Medical history: diabetes
  Recommend next steps.
`)

// Daxa automatically:
// ✓ Checks access permissions
// ✓ Classifies data (PHI detection)
// ✓ Enforces HIPAA policies
// ✓ Redacts sensitive data
// ✓ Logs audit trail
// ✓ Ensures data never leaves your cloud
```

**Total Time**: 5 minutes
**Lines of Code**: 3 (import, register, use)

---

## Building a Plugin (10 Minutes)

### Scenario: Build Custom Security Plugin from Scratch

Let's build a real plugin that calls your company's internal security API.

#### Step 1: Create Plugin File (2 min)

```typescript
// my-security-plugin.ts

import type { SecurityPlugin, PluginContext } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

export function createMySecurityPlugin(config: {
  apiKey: string
  endpoint: string
}): SecurityPlugin {
  return {
    // Metadata (required)
    metadata: {
      name: 'my-security',
      version: '1.0.0',
      description: 'My company security checks',
    },

    // Configuration (optional)
    config: {
      enabled: true,
      priority: PluginPriority.HIGH,
    },

    // Hooks (at least one required)
    hooks: {
      // Add your security logic here
    },
  }
}
```

#### Step 2: Add Your Security Logic (5 min)

```typescript
hooks: {
  // Example: Check if user has permission
  async beforeValidation(context) {
    const response = await fetch(`${config.endpoint}/check-permission`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: context.userId,
        model: context.options.model,
      }),
    })

    const { allowed, reason } = await response.json()

    if (!allowed) {
      throw new Error(`Permission denied: ${reason}`)
    }

    return context.options
  },

  // Example: Detect PII using your API
  async piiDetection(text, context) {
    const response = await fetch(`${config.endpoint}/scan-pii`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })

    const { entities } = await response.json()

    // Redact detected PII
    let redacted = text
    const patterns: string[] = []

    for (const entity of entities) {
      redacted = redacted.replace(entity.value, `[${entity.type}-REDACTED]`)
      patterns.push(entity.type)
    }

    return {
      detected: entities.length > 0,
      patterns: [...new Set(patterns)],
      redacted,
      entities,
    }
  },

  // Example: Log all requests
  async afterSecurity(context, results) {
    await fetch(`${config.endpoint}/audit-log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userId: context.userId,
        model: context.options.model,
        executionTime: results.executionTime,
      }),
    })
  },
}
```

#### Step 3: Use It (1 min)

```typescript
import { registerPlugin, ai } from '@uni-ai/sdk'
import { createMySecurityPlugin } from './my-security-plugin'

// Register your plugin
await registerPlugin(createMySecurityPlugin({
  apiKey: process.env.MY_SECURITY_API_KEY,
  endpoint: 'https://api.mysecurity.com',
}))

// Use normally - your security checks run automatically
const response = await ai('gpt-4', 'Sensitive query')
```

#### Step 4: Publish to npm (2 min - optional)

```bash
# Add to package.json
{
  "name": "@yourcompany/uni-ai-plugin-security",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "keywords": ["uni-ai", "uni-ai-plugin", "security"],
  "peerDependencies": {
    "@uni-ai/sdk": "^0.1.0"
  }
}

# Build and publish
npm run build
npm publish --access public
```

**Total Time**: 10 minutes
**Result**: Production-ready security plugin

---

## How Plugins Work (Deep Dive)

### The 7 Hook Points

Every AI request goes through 7 plugin points. Each hook can inspect, modify, or reject the request.

```typescript
interface SecurityPlugin {
  metadata: PluginMetadata
  config?: PluginConfig
  hooks: {
    // 1. BEFORE VALIDATION
    beforeValidation?: (context: PluginContext) => Promise<GenerateOptions>
    // Use: Transform input, check permissions, extract metadata

    // 2. VALIDATION
    validation?: (context: PluginContext) => Promise<ValidationResult>
    // Use: Custom validation rules, business logic

    // 3. RATE LIMITING
    rateLimit?: (context: PluginContext) => Promise<RateLimitResult>
    // Use: Throttling, quota management

    // 4. PII DETECTION
    piiDetection?: (text: string, context: PluginContext) => Promise<PIIDetectionResult>
    // Use: Detect and redact sensitive data

    // 5. MODERATION
    moderation?: (text: string, context: PluginContext) => Promise<ModerationResult>
    // Use: Content safety, compliance checks

    // 6. AFTER SECURITY
    afterSecurity?: (context: PluginContext, results: SecurityCheckResults) => Promise<void>
    // Use: Logging, analytics, audit trails

    // 7. ERROR HANDLING
    onSecurityError?: (error: Error, context: PluginContext) => Promise<void | GenerateOptions>
    // Use: Alert, log, attempt recovery
  }
}
```

### Hook Execution Order

```
User Request
     ↓
┌────────────────────────────────────────┐
│ 1. beforeValidation                    │
│    - All plugins run (priority order)  │
│    - Can modify context.options        │
│    - Can attach metadata                │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ 2. validation                          │
│    - All plugins run                   │
│    - Return { valid: true/false }      │
│    - If any fails, request blocked     │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ 3. rateLimit                           │
│    - All plugins run                   │
│    - Return { allowed: true/false }    │
│    - If any fails, request blocked     │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ 4. piiDetection                        │
│    - All plugins run                   │
│    - Can redact text                   │
│    - Modified text used for next steps │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ 5. moderation                          │
│    - All plugins run                   │
│    - Return { safe: true/false }       │
│    - If unsafe, request blocked        │
└────────────────────────────────────────┘
     ↓
┌────────────────────────────────────────┐
│ 6. afterSecurity                       │
│    - All plugins run                   │
│    - For logging/analytics only        │
│    - Cannot block request              │
└────────────────────────────────────────┘
     ↓
LLM Generation
     ↓
Response

(If any step fails, jump to onSecurityError)
```

### Plugin Context

Every hook receives a `PluginContext` object:

```typescript
interface PluginContext {
  // Current request being processed
  options: GenerateOptions  // { model, prompt, messages, etc. }

  // Security configuration
  security: SecurityConfig

  // Shared metadata (plugins can write here)
  metadata: Record<string, unknown>

  // When request started
  startTime: number

  // User making request (if available)
  userId?: string
}
```

### Plugin Priority

Plugins run in priority order (highest first):

```typescript
enum PluginPriority {
  CRITICAL = 100,  // Critical security checks
  HIGH = 75,       // Important checks
  NORMAL = 50,     // Standard checks (default)
  LOW = 25,        // Optional enhancements
  MINIMAL = 10,    // Nice-to-have
}

// Example: Security runs before logging
await registerPlugin(securityPlugin, { priority: PluginPriority.CRITICAL })
await registerPlugin(loggingPlugin, { priority: PluginPriority.LOW })
```

---

## Complete Examples

### Example 1: Simple Logging Plugin (30 seconds)

```typescript
import { SecurityPlugin } from '@uni-ai/sdk'

export const loggingPlugin: SecurityPlugin = {
  metadata: { name: 'logger', version: '1.0.0' },
  hooks: {
    afterSecurity(context, results) {
      console.log('AI request:', {
        model: context.options.model,
        user: context.userId,
        time: results.executionTime + 'ms'
      })
    }
  }
}

// Use it
await registerPlugin(loggingPlugin)
```

### Example 2: Block Specific Words (1 minute)

```typescript
import { SecurityPlugin } from '@uni-ai/sdk'

export const wordFilterPlugin: SecurityPlugin = {
  metadata: { name: 'word-filter', version: '1.0.0' },
  hooks: {
    validation(context) {
      const prompt = context.options.prompt || ''
      const blockedWords = ['password', 'secret', 'api-key']

      for (const word of blockedWords) {
        if (prompt.toLowerCase().includes(word)) {
          return {
            valid: false,
            error: `Blocked word detected: ${word}`
          }
        }
      }

      return { valid: true }
    }
  }
}
```

### Example 3: Redis Rate Limit (5 minutes)

```typescript
import { SecurityPlugin } from '@uni-ai/sdk'
import Redis from 'ioredis'

export function createRedisRateLimitPlugin(
  redis: Redis,
  maxRequests: number = 10
): SecurityPlugin {
  return {
    metadata: { name: 'redis-rate-limit', version: '1.0.0' },
    hooks: {
      async rateLimit(context) {
        const userId = context.userId || 'anonymous'
        const key = `ratelimit:${userId}:${Math.floor(Date.now() / 60000)}`

        const count = await redis.incr(key)
        await redis.expire(key, 60)

        if (count > maxRequests) {
          return {
            allowed: false,
            remaining: 0,
            resetIn: 60000 - (Date.now() % 60000),
            error: 'Rate limit exceeded'
          }
        }

        return {
          allowed: true,
          remaining: maxRequests - count
        }
      }
    }
  }
}
```

### Example 4: OpenAI Moderation (3 minutes)

```typescript
import { SecurityPlugin } from '@uni-ai/sdk'

export function createModerationPlugin(apiKey: string): SecurityPlugin {
  return {
    metadata: { name: 'openai-moderation', version: '1.0.0' },
    hooks: {
      async moderation(text) {
        const response = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ input: text })
        })

        const { results } = await response.json()
        const result = results[0]

        if (result.flagged) {
          const categories = Object.keys(result.categories)
            .filter(k => result.categories[k])

          return {
            safe: false,
            categories,
            action: 'block',
            reason: `Content flagged: ${categories.join(', ')}`
          }
        }

        return { safe: true, categories: [], action: 'allow' }
      }
    }
  }
}
```

---

## TypeScript Support

Full TypeScript autocomplete and type safety:

```typescript
import type {
  SecurityPlugin,
  PluginContext,
  ValidationResult,
  RateLimitResult,
  PIIDetectionResult,
  ModerationResult,
} from '@uni-ai/sdk'

// Your IDE will autocomplete everything:
const myPlugin: SecurityPlugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
    // IDE suggests: description, author, homepage, requiredVersion
  },
  hooks: {
    // IDE suggests all 7 hooks
    async validation(context) {
      // IDE knows context type
      context.options.  // autocompletes: model, prompt, messages, etc.

      // IDE knows return type
      return {
        valid: true,
        // autocompletes: error, metadata
      }
    }
  }
}
```

---

## Testing Plugins

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { myPlugin } from './my-plugin'

describe('My Plugin', () => {
  it('should validate input', async () => {
    const context = {
      options: { model: 'gpt-4', prompt: 'test' },
      security: {},
      metadata: {},
      startTime: Date.now()
    }

    const result = await myPlugin.hooks.validation!(context)

    expect(result.valid).toBe(true)
  })

  it('should block invalid input', async () => {
    const context = {
      options: { model: 'gpt-4', prompt: 'password: secret' },
      security: {},
      metadata: {},
      startTime: Date.now()
    }

    const result = await myPlugin.hooks.validation!(context)

    expect(result.valid).toBe(false)
    expect(result.error).toContain('Blocked word')
  })
})
```

### Integration Test

```typescript
import { registerPlugin, clearPlugins, ai } from '@uni-ai/sdk'
import { myPlugin } from './my-plugin'

describe('Plugin Integration', () => {
  beforeEach(async () => {
    await registerPlugin(myPlugin)
  })

  afterEach(async () => {
    await clearPlugins()
  })

  it('should integrate with SDK', async () => {
    const result = await ai('gpt-4', 'test prompt')
    expect(result).toBeDefined()
  })
})
```

---

## Debugging

### Enable Debug Logging

```typescript
import { registerPlugin, enablePlugin, disablePlugin } from '@uni-ai/sdk'

// Register plugin
await registerPlugin(myPlugin, {
  config: { debug: true }  // Enable debug mode
})

// Disable temporarily
disablePlugin('my-plugin')

// Re-enable
enablePlugin('my-plugin')
```

### Inspect Plugin Execution

```typescript
import { ai, getPlugins } from '@uni-ai/sdk'

// See all registered plugins
const plugins = getPlugins()
console.log('Registered plugins:', plugins.map(p => p.plugin.metadata.name))

// Test specific hook
const context = { /* ... */ }
const result = await myPlugin.hooks.validation(context)
console.log('Validation result:', result)
```

---

## Summary

**Integration Time:**
- Using existing plugin: **5 minutes**
- Building new plugin: **10 minutes**
- Publishing plugin: **12 minutes**

**What You Get:**
✓ Type-safe plugin API
✓ 7 extensibility points
✓ Priority management
✓ Error recovery
✓ Full async/await support
✓ Complete TypeScript autocomplete

**Next Steps:**
1. Choose a hook (validation, piiDetection, etc.)
2. Call your API in the hook
3. Return the expected result type
4. Register and use

That's it! You're now securing AI with enterprise-grade governance in minutes, not months.
