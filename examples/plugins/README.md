# Example Security Plugins

This directory contains example security plugins for Uni AI SDK.

## Available Plugins

### 1. Redis Rate Limit (`redis-rate-limit.ts`)

Distributed rate limiting using Redis for multi-server deployments.

**Features:**
- Per-minute, per-hour, and per-day limits
- Atomic operations via Redis pipelines
- Automatic expiration
- Fail-open behavior (allows requests if Redis is down)

**Usage:**

```typescript
import { registerPlugin } from '@uni-ai/sdk'
import { createRedisRateLimitPlugin } from './plugins/redis-rate-limit'

// Option 1: Use default (auto-connects to localhost)
await registerPlugin(createRedisRateLimitPlugin())

// Option 2: Provide existing Redis client
import Redis from 'ioredis'
const redis = new Redis({ host: 'redis.example.com' })
await registerPlugin(createRedisRateLimitPlugin(redis))

// Option 3: Custom configuration
await registerPlugin(createRedisRateLimitPlugin(undefined, {
  host: 'localhost',
  port: 6379,
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  maxRequestsPerDay: 1000
}))
```

**Requirements:**
- `ioredis` package (install: `npm install ioredis`)

### 2. OpenAI Moderation (`openai-moderation.ts`)

Content moderation using OpenAI's Moderation API.

**Features:**
- Detects 11 categories of harmful content
- Configurable blocking policies
- Confidence threshold tuning
- Multiple presets (strict/permissive)

**Usage:**

```typescript
import { registerPlugin } from '@uni-ai/sdk'
import {
  openaiModerationPlugin,
  strictModerationPlugin,
  permissiveModerationPlugin
} from './plugins/openai-moderation'

// Option 1: Default (uses OPENAI_API_KEY env var)
await registerPlugin(openaiModerationPlugin)

// Option 2: Strict moderation
await registerPlugin(strictModerationPlugin)

// Option 3: Custom configuration
await registerPlugin(createOpenAIModerationPlugin({
  apiKey: 'sk-...',
  blockCategories: ['hate', 'violence'],
  threshold: 0.5,
  action: 'block'
}))
```

**Detected Categories:**
- `hate` / `hate/threatening`
- `harassment` / `harassment/threatening`
- `self-harm` / `self-harm/intent` / `self-harm/instructions`
- `sexual` / `sexual/minors`
- `violence` / `violence/graphic`

### 3. Audit Logger (`audit-logger.ts`)

Comprehensive security event logging.

**Features:**
- Multiple destinations (console, file, custom)
- Event filtering
- Privacy-aware (can exclude prompts)
- JSON or text format
- Compliance-ready

**Usage:**

```typescript
import { registerPlugin } from '@uni-ai/sdk'
import {
  auditLoggerPlugin,
  fileAuditLoggerPlugin,
  complianceLoggerPlugin
} from './plugins/audit-logger'

// Option 1: Console logging
await registerPlugin(auditLoggerPlugin)

// Option 2: File logging
await registerPlugin(fileAuditLoggerPlugin)

// Option 3: Compliance logging (includes prompts)
await registerPlugin(complianceLoggerPlugin)

// Option 4: Custom destination
await registerPlugin(createAuditLoggerPlugin({
  destination: 'custom',
  customHandler: async (entry) => {
    // Send to your logging service
    await fetch('https://logs.example.com', {
      method: 'POST',
      body: JSON.stringify(entry)
    })
  }
}))
```

**Logged Events:**
- `security_check_passed` - All checks passed
- `security_check_failed` - Any check failed
- `validation_failed` - Input validation failed
- `rate_limit_exceeded` - Rate limit hit
- `pii_detected` - PII found in prompt
- `moderation_flagged` - Content flagged by moderation
- `plugin_error` - Plugin execution error

## Using Multiple Plugins

You can register multiple plugins - they'll run in priority order:

```typescript
import { registerPlugin } from '@uni-ai/sdk'
import { createRedisRateLimitPlugin } from './plugins/redis-rate-limit'
import { strictModerationPlugin } from './plugins/openai-moderation'
import { fileAuditLoggerPlugin } from './plugins/audit-logger'

// Register all plugins
await registerPlugin(createRedisRateLimitPlugin()) // Priority: HIGH
await registerPlugin(strictModerationPlugin)       // Priority: NORMAL
await registerPlugin(fileAuditLoggerPlugin)        // Priority: LOW

// Now use SDK normally - plugins run automatically
const text = await ai('gpt-4', userInput, { security: 'strict' })
```

## Complete Example

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { createRedisRateLimitPlugin } from './plugins/redis-rate-limit'
import { strictModerationPlugin } from './plugins/openai-moderation'
import { fileAuditLoggerPlugin } from './plugins/audit-logger'
import Redis from 'ioredis'

// Setup
const redis = new Redis()

await registerPlugin(createRedisRateLimitPlugin(redis, {
  maxRequestsPerMinute: 5,
  maxRequestsPerHour: 50
}))

await registerPlugin(strictModerationPlugin)
await registerPlugin(fileAuditLoggerPlugin)

// Use
try {
  const response = await ai('gpt-4', 'Tell me about TypeScript', {
    security: 'strict'
  })
  console.log(response)
} catch (error) {
  if (error.name === 'PluginRateLimitError') {
    console.log('Rate limit exceeded. Try again later.')
  } else if (error.name === 'PluginModerationError') {
    console.log('Content flagged by moderation.')
  } else {
    console.error('Error:', error)
  }
}
```

## Creating Your Own Plugin

See the [Plugin Development Guide](../../packages/core/SECURITY_PLUGINS.md) for details.

**Minimal example:**

```typescript
import type { SecurityPlugin } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

export const myPlugin: SecurityPlugin = {
  metadata: {
    name: 'my-plugin',
    version: '1.0.0',
    description: 'My custom security plugin'
  },

  config: {
    enabled: true,
    priority: PluginPriority.NORMAL
  },

  hooks: {
    async beforeValidation(context) {
      console.log('Processing:', context.options.model)
      return context.options
    },

    async validation(context) {
      // Custom validation logic
      if (context.options.prompt?.includes('forbidden')) {
        return {
          valid: false,
          error: 'Forbidden word detected'
        }
      }
      return { valid: true }
    }
  }
}
```

## Testing Plugins

```bash
# Install dependencies
npm install

# Run tests
npm test

# Test specific plugin
node -e "import('./redis-rate-limit.js').then(m => console.log(m))"
```

## Publishing Plugins

To publish your plugin to npm:

1. Create a separate package:
```bash
mkdir my-uni-ai-plugin
cd my-uni-ai-plugin
npm init -y
```

2. Add metadata to package.json:
```json
{
  "name": "@yourname/uni-ai-plugin-myname",
  "version": "1.0.0",
  "keywords": ["uni-ai", "uni-ai-plugin", "security"],
  "peerDependencies": {
    "@uni-ai/sdk": "^0.1.0"
  }
}
```

3. Publish:
```bash
npm publish --access public
```

## Community Plugins

Find more plugins at:
- npm: Search for `uni-ai-plugin`
- GitHub: https://github.com/topics/uni-ai-plugin

## Support

- Documentation: https://docs.uni-ai.dev/plugins
- Issues: https://github.com/markdorsi/uni-ai/issues
- Discussions: https://github.com/markdorsi/uni-ai/discussions
