# Contributing Plugins to Uni AI Ecosystem

Guide for third-party developers to create and publish Uni AI security plugins.

## Quick Start (10 Minutes)

```bash
# 1. Generate plugin (30 seconds)
npx create-uni-ai-plugin my-service

# 2. Implement (5 minutes)
cd my-service
# Edit src/index.ts - add your API calls

# 3. Test (2 minutes)
npm test

# 4. Publish (2 minutes)
npm publish --access public

# 5. Submit to registry (1 minute)
# Create PR or use API

# Done! Your plugin is now available to all Uni AI users
```

---

## Step-by-Step Guide

### Step 1: Generate Plugin Template

Use our generator to create a complete plugin structure:

```bash
npx create-uni-ai-plugin my-service

# Or with custom scope
npx create-uni-ai-plugin @mycompany/uni-ai-plugin-myservice
```

This creates:
```
my-service/
├── src/
│   └── index.ts          # Your plugin implementation
├── test/
│   └── index.test.ts     # Test suite
├── package.json          # NPM configuration
├── tsconfig.json         # TypeScript config
├── README.md             # Documentation
└── .gitignore
```

### Step 2: Understand Plugin Structure

Open `src/index.ts` - you'll see a fully functional plugin template:

```typescript
import type { SecurityPlugin, PluginContext } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

export interface MyServiceConfig {
  apiKey: string
  endpoint?: string
  // Add your config options
}

export function createMyServicePlugin(
  config: MyServiceConfig
): SecurityPlugin {
  return {
    // Plugin metadata
    metadata: {
      name: 'my-service',
      version: '1.0.0',
      description: 'My security service integration',
      author: 'Your Name',
      homepage: 'https://myservice.com/uni-ai-plugin'
    },

    // Plugin configuration
    config: {
      enabled: true,
      priority: PluginPriority.NORMAL,
      ...config
    },

    // Plugin hooks (choose which ones you need)
    hooks: {
      // TODO comments guide you
      async piiDetection(text, context) {
        // Example API call (commented out)
        // const response = await fetch(...)
        // return { detected, patterns, redacted }
      }
    }
  }
}
```

### Step 3: Implement Your Logic

Choose which hooks you need based on what your service does:

#### If Your Service Detects PII

Implement `piiDetection` hook:

```typescript
async piiDetection(text, context) {
  // Call your API
  const response = await fetch(`${endpoint}/detect-pii`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })

  const { entities } = await response.json()

  // Transform to plugin format
  let redacted = text
  const patterns: string[] = []

  for (const entity of entities) {
    redacted = redacted.replace(
      entity.value,
      `[${entity.type}-REDACTED]`
    )
    patterns.push(entity.type)
  }

  return {
    detected: entities.length > 0,
    patterns: [...new Set(patterns)],
    redacted,
    entities  // Optional: include detailed entities
  }
}
```

#### If Your Service Moderates Content

Implement `moderation` hook:

```typescript
async moderation(text, context) {
  const response = await fetch(`${endpoint}/moderate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  })

  const { safe, categories, scores } = await response.json()

  return {
    safe,
    categories,
    scores,
    action: safe ? 'allow' : 'block',
    reason: safe ? undefined : `Flagged: ${categories.join(', ')}`
  }
}
```

#### If Your Service Validates Inputs

Implement `validation` hook:

```typescript
async validation(context) {
  const response = await fetch(`${endpoint}/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: context.options.prompt,
      userId: context.userId
    })
  })

  const { valid, error } = await response.json()

  return {
    valid,
    error: valid ? undefined : error
  }
}
```

#### If Your Service Manages Rate Limits

Implement `rateLimit` hook:

```typescript
async rateLimit(context) {
  const userId = context.userId || 'anonymous'

  const response = await fetch(`${endpoint}/check-rate-limit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId })
  })

  const { allowed, remaining, resetIn } = await response.json()

  return {
    allowed,
    remaining,
    resetIn,
    error: allowed ? undefined : 'Rate limit exceeded'
  }
}
```

#### If Your Service Logs Events

Implement `afterSecurity` hook:

```typescript
async afterSecurity(context, results) {
  await fetch(`${endpoint}/log`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      userId: context.userId,
      model: context.options.model,
      executionTime: results.executionTime,
      status: 'passed'
    })
  })
}
```

### Step 4: Add Error Handling

Wrap API calls in try-catch:

```typescript
async piiDetection(text, context) {
  try {
    const response = await fetch(`${endpoint}/detect-pii`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(5000)  // 5 second timeout
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const { entities } = await response.json()

    // ... process entities

  } catch (error) {
    console.error('[my-service] PII detection failed:', error)

    // Decide: fail open (allow) or fail closed (block)
    // Fail open:
    return { detected: false, patterns: [], redacted: text }

    // Or fail closed:
    // throw error
  }
}
```

### Step 5: Test Your Plugin

Generated test suite is pre-configured:

```bash
npm test
```

Add custom tests in `test/index.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { registerPlugin, clearPlugins, ai } from '@uni-ai/sdk'
import { createMyServicePlugin } from '../src/index.js'

describe('My Service Plugin', () => {
  const plugin = createMyServicePlugin({
    apiKey: 'test-key',
    endpoint: 'http://localhost:3000'  // Mock server
  })

  beforeEach(async () => {
    await registerPlugin(plugin)
  })

  afterEach(async () => {
    await clearPlugins()
  })

  it('should detect PII', async () => {
    const context = {
      options: { model: 'gpt-4', prompt: 'SSN: 123-45-6789' },
      security: {},
      metadata: {},
      startTime: Date.now()
    }

    const result = await plugin.hooks.piiDetection!('SSN: 123-45-6789', context)

    expect(result.detected).toBe(true)
    expect(result.patterns).toContain('SSN')
    expect(result.redacted).toContain('[SSN-REDACTED]')
  })

  it('should not detect PII in clean text', async () => {
    const result = await plugin.hooks.piiDetection!('Hello world', context)

    expect(result.detected).toBe(false)
    expect(result.redacted).toBe('Hello world')
  })
})
```

### Step 6: Update Documentation

Edit `README.md` with your service details:

```markdown
# My Service Plugin for Uni AI

[Brief description of what your service does]

## Installation

\`\`\`bash
npm install @mycompany/uni-ai-plugin-myservice
\`\`\`

## Usage

\`\`\`typescript
import { registerPlugin, ai } from '@uni-ai/sdk'
import { myServicePlugin } from '@mycompany/uni-ai-plugin-myservice'

await registerPlugin(myServicePlugin, {
  config: {
    apiKey: process.env.MY_SERVICE_API_KEY
  }
})

const response = await ai('gpt-4', 'Your prompt here')
\`\`\`

## Configuration

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| \`apiKey\` | string | Yes | Your API key from myservice.com |
| \`endpoint\` | string | No | Custom API endpoint |
| \`timeout\` | number | No | Request timeout (default: 5000ms) |

## Features

- ✅ Real-time PII detection
- ✅ 50+ entity types supported
- ✅ Multi-language support
- ✅ Custom entity training

## Requirements

- Node.js 18+
- API key from [myservice.com](https://myservice.com)
- \`@uni-ai/sdk\` >= 0.1.0

## Support

- Documentation: https://docs.myservice.com/uni-ai
- Issues: https://github.com/mycompany/uni-ai-plugin/issues
- Email: support@mycompany.com
```

### Step 7: Configure package.json

Ensure proper fields for discoverability:

```json
{
  "name": "@mycompany/uni-ai-plugin-myservice",
  "version": "1.0.0",
  "description": "My service integration for Uni AI SDK",
  "keywords": [
    "uni-ai",
    "uni-ai-plugin",
    "security",
    "pii-detection",      // Your category
    "ai-governance"
  ],
  "author": {
    "name": "Your Company",
    "email": "support@mycompany.com",
    "url": "https://mycompany.com"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/mycompany/uni-ai-plugin"
  },
  "homepage": "https://mycompany.com/uni-ai-plugin",
  "bugs": "https://github.com/mycompany/uni-ai-plugin/issues",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "peerDependencies": {
    "@uni-ai/sdk": "^0.1.0"
  },
  "devDependencies": {
    "@uni-ai/sdk": "^0.1.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "uni-ai": {
    "category": "pii-detection",
    "hooks": ["piiDetection"],
    "verified": false
  }
}
```

### Step 8: Build

```bash
npm run build

# Check build output
ls dist/
# index.js
# index.d.ts
```

### Step 9: Test Locally

Test your plugin in a real project before publishing:

```bash
# In your plugin directory
npm link

# In a test project
npm link @mycompany/uni-ai-plugin-myservice

# Test it
node test-usage.js
```

### Step 10: Publish to npm

```bash
# Login to npm (first time only)
npm login

# Publish
npm publish --access public

# Success!
# ✅ @mycompany/uni-ai-plugin-myservice@1.0.0 published
```

### Step 11: Submit to Plugin Registry

#### Option A: API (Fastest)

```bash
curl -X POST https://registry.uni-ai.dev/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "@mycompany/uni-ai-plugin-myservice",
    "description": "My service integration for PII detection",
    "category": "pii-detection",
    "homepage": "https://mycompany.com/uni-ai-plugin",
    "repository": "https://github.com/mycompany/uni-ai-plugin"
  }'
```

#### Option B: GitHub PR

```bash
# Fork uni-ai/plugin-registry
git clone https://github.com/uni-ai/plugin-registry
cd plugin-registry

# Add your entry to plugins.json
cat >> plugins.json << EOF
{
  "name": "@mycompany/uni-ai-plugin-myservice",
  "description": "My service integration for PII detection",
  "category": "pii-detection",
  "homepage": "https://mycompany.com/uni-ai-plugin",
  "repository": "https://github.com/mycompany/uni-ai-plugin",
  "author": "Your Company",
  "verified": false
}
EOF

# Create PR
git add plugins.json
git commit -m "Add myservice plugin"
git push origin main
# Open PR on GitHub
```

---

## Best Practices

### Security

- ✅ Never hardcode API keys
- ✅ Use environment variables
- ✅ Validate all inputs
- ✅ Set request timeouts
- ✅ Handle errors gracefully
- ✅ Log security events
- ❌ Don't log sensitive data

### Performance

- ✅ Cache API responses when possible
- ✅ Use connection pooling
- ✅ Set reasonable timeouts (5s default)
- ✅ Fail fast on errors
- ❌ Don't block on slow operations

### Testing

- ✅ Test coverage > 80%
- ✅ Test all hooks you implement
- ✅ Test error scenarios
- ✅ Test with mock API
- ✅ Integration tests with real SDK

### Documentation

- ✅ Clear README with examples
- ✅ Document all configuration options
- ✅ Explain what your service does
- ✅ Include troubleshooting section
- ✅ Link to your service docs

### Maintenance

- ✅ Respond to issues within 7 days
- ✅ Keep dependencies updated
- ✅ Follow semantic versioning
- ✅ Maintain CHANGELOG.md
- ✅ Support latest @uni-ai/sdk version

---

## Common Patterns

### Pattern 1: API Client as Dependency

Instead of raw fetch calls, use your service's client library:

```typescript
import { MyServiceClient } from '@mycompany/client-sdk'

export function createMyServicePlugin(config: MyServiceConfig): SecurityPlugin {
  const client = new MyServiceClient({
    apiKey: config.apiKey,
    endpoint: config.endpoint
  })

  return {
    // ...
    hooks: {
      async piiDetection(text, context) {
        const result = await client.detectPII(text)
        return {
          detected: result.hasEntities,
          patterns: result.entities.map(e => e.type),
          redacted: result.redactedText
        }
      }
    }
  }
}
```

### Pattern 2: Configuration Validation

Validate config at initialization:

```typescript
export function createMyServicePlugin(config: MyServiceConfig): SecurityPlugin {
  // Validate config
  if (!config.apiKey) {
    throw new Error('API key is required for myservice plugin')
  }

  if (config.timeout && config.timeout < 1000) {
    throw new Error('Timeout must be at least 1000ms')
  }

  return {
    // ... plugin implementation
  }
}
```

### Pattern 3: Multiple Hooks

Implement multiple hooks if your service supports it:

```typescript
hooks: {
  // Check permissions before processing
  async beforeValidation(context) {
    const hasAccess = await client.checkAccess(context.userId)
    if (!hasAccess) {
      throw new Error('Access denied by myservice')
    }
    return context.options
  },

  // Detect PII
  async piiDetection(text, context) {
    const result = await client.detectPII(text)
    return { /* ... */ }
  },

  // Log audit trail
  async afterSecurity(context, results) {
    await client.logAudit({
      userId: context.userId,
      timestamp: new Date(),
      status: 'passed'
    })
  }
}
```

### Pattern 4: Graceful Degradation

Fail open on non-critical errors:

```typescript
async piiDetection(text, context) {
  try {
    const result = await client.detectPII(text)
    return { /* ... */ }
  } catch (error) {
    // Log error but don't block request
    console.error('[myservice] PII detection failed:', error)

    // Return safe default (no PII detected)
    return {
      detected: false,
      patterns: [],
      redacted: text
    }
  }
}
```

---

## Getting Help

### Documentation

- [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md)
- [Quick Start](./QUICK_START_PLUGIN.md)
- [How Integration Works](./HOW_INTEGRATION_WORKS.md)
- [Plugin Registry](./PLUGIN_REGISTRY.md)

### Community

- Discussions: https://github.com/uni-ai/community/discussions
- Discord: https://discord.gg/uni-ai
- Stack Overflow: Tag `uni-ai-plugin`

### Support

- Email: plugins@uni-ai.dev
- GitHub Issues: https://github.com/uni-ai/sdk/issues
- Twitter: @UniAISDK

---

## Checklist Before Publishing

- [ ] Plugin name follows convention: `@scope/uni-ai-plugin-name`
- [ ] All required hooks implemented
- [ ] Error handling added
- [ ] Tests written (coverage > 50%)
- [ ] Tests pass locally
- [ ] README updated with examples
- [ ] package.json has correct keywords
- [ ] License specified (MIT recommended)
- [ ] Build succeeds (`npm run build`)
- [ ] No sensitive data in code
- [ ] GitHub repository created
- [ ] Versioned correctly (start with 1.0.0)

---

## After Publishing

### Promote Your Plugin

- 📣 Announce on Twitter with #UniAI
- 📝 Write blog post explaining integration
- 💬 Share in Uni AI Discord
- 📊 Add to your company website
- 📧 Email existing customers

### Monitor Usage

- Check npm download stats
- Monitor GitHub issues
- Respond to user questions
- Collect feedback

### Maintain

- Fix bugs promptly
- Add requested features
- Keep dependencies updated
- Support new SDK versions
- Update documentation

---

## Examples in the Wild

### Study These Plugins

Look at source code of existing plugins for inspiration:

- `@daxa/uni-ai-plugin` - Enterprise compliance
- `@upstash/uni-ai-plugin-redis` - Rate limiting
- `@openai/uni-ai-plugin-moderation` - Content safety

---

## Thank You!

By contributing a plugin, you're helping build the Uni AI ecosystem. Your plugin makes it easier for developers to build secure, governed AI applications.

Questions? Email plugins@uni-ai.dev
