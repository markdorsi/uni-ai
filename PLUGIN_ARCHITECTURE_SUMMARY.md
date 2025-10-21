# Security Plugin Architecture - Summary

## Overview

I've implemented a comprehensive plugin architecture for Uni AI SDK that enables fast and easy integration of third-party security services.

## What Was Built

### 1. Plugin System Core (3 files)

**`packages/core/src/plugins/types.ts`** - Type definitions
- `SecurityPlugin` interface
- 7 hook types with full TypeScript support
- Result types for each hook
- Custom error classes
- Priority system (CRITICAL → MINIMAL)

**`packages/core/src/plugins/registry.ts`** - Plugin management
- Global plugin registry
- Registration/unregister/enable/disable
- Priority-based execution
- Error handling with recovery
- Plugin lifecycle (initialize/cleanup)

**`packages/core/src/plugins/index.ts`** - Public API
- Exports all plugin types and functions
- Clean, simple interface

### 2. Integration with Existing Code

**`packages/core/src/security/index.ts`** - Updated security middleware
- Automatically uses plugins when registered
- Falls back to built-in checks when no plugins
- Maintains 100% backward compatibility

**`packages/core/src/index.ts`** - Main SDK exports
- Exports plugin API alongside existing API
- Zero breaking changes

### 3. Example Plugins (3 production-ready plugins)

**Redis Rate Limit** (`examples/plugins/redis-rate-limit.ts`)
- Distributed rate limiting for multi-server deployments
- Per-minute, per-hour, per-day limits
- Uses Redis for atomic operations
- Fail-open behavior (allows requests if Redis down)

**OpenAI Moderation** (`examples/plugins/openai-moderation.ts`)
- Content moderation via OpenAI's API
- Detects 11 categories of harmful content
- Three presets: strict, default, permissive
- Configurable threshold and blocking policies

**Audit Logger** (`examples/plugins/audit-logger.ts`)
- Comprehensive security event logging
- Multiple destinations: console, file, or custom
- Privacy-aware (excludes prompts by default)
- Compliance-ready with full audit trail

### 4. Documentation (3 comprehensive guides)

**`packages/core/SECURITY_PLUGINS.md`** (650+ lines)
- Complete architecture overview
- All 7 plugin points explained
- Execution flow diagram
- Configuration examples
- Security considerations

**`packages/core/PLUGIN_DEVELOPMENT.md`** (550+ lines)
- Step-by-step development guide
- Hook reference with examples
- Best practices
- Testing guide
- Publishing guide

**`examples/plugins/README.md`** (250+ lines)
- Usage examples for all 3 plugins
- Multiple plugin usage
- Complete working examples
- Publishing instructions

## The 7 Plugin Points

| Hook | When | Purpose | Example Use Cases |
|------|------|---------|------------------|
| `beforeValidation` | Before any checks | Transform/inspect input | Normalization, language detection |
| `validation` | After preprocessing | Custom validation | Prompt injection detection, business rules |
| `rateLimit` | After validation | Rate limiting | Redis, database quotas, API gateways |
| `piiDetection` | After rate limiting | Advanced PII detection | ML-based (Presidio, AWS Comprehend) |
| `moderation` | After PII | Content safety | OpenAI Moderation, Perspective API |
| `afterSecurity` | After all checks pass | Logging/analytics | Audit logs, metrics, compliance |
| `onSecurityError` | On any failure | Error handling | Alerting, recovery, logging |

## Usage Example

```typescript
import { registerPlugin, ai } from '@uni-ai/sdk'
import { createRedisRateLimitPlugin } from './plugins/redis-rate-limit'
import { strictModerationPlugin } from './plugins/openai-moderation'
import { fileAuditLoggerPlugin } from './plugins/audit-logger'

// Register plugins (once at startup)
await registerPlugin(createRedisRateLimitPlugin())
await registerPlugin(strictModerationPlugin)
await registerPlugin(fileAuditLoggerPlugin)

// Use SDK normally - plugins run automatically
try {
  const text = await ai('gpt-4', userInput, { security: 'strict' })
  console.log(text)
} catch (error) {
  if (error.name === 'PluginRateLimitError') {
    console.log('Rate limit exceeded')
  } else if (error.name === 'PluginModerationError') {
    console.log('Content flagged by moderation')
  }
}
```

## Key Features

### 1. **Priority System**
Plugins execute in priority order (CRITICAL → HIGH → NORMAL → LOW → MINIMAL)

### 2. **Async/Await**
All hooks support async operations - call external APIs, databases, etc.

### 3. **Error Recovery**
Plugins can attempt recovery via `onSecurityError` hook

### 4. **Context Sharing**
Plugins can attach metadata for downstream plugins

### 5. **Configuration Layers**
- Plugin-level (defaults)
- Preset-level (strict/moderate/permissive)
- Request-level (per-request overrides)

### 6. **Fail-Open/Fail-Closed**
Plugins control behavior on errors (allow vs block)

### 7. **Zero Config Defaults**
Works without any plugins - built-in checks still run

## Integration Points Enumerated

### Input Stage
- **beforeValidation**: Transform input, extract metadata
- **validation**: Validate input, check business rules

### Rate Limiting Stage
- **rateLimit**: Check quotas, throttle requests

### Content Analysis Stage
- **piiDetection**: Detect and redact sensitive data
- **moderation**: Check for harmful content

### Post-Processing Stage
- **afterSecurity**: Log events, record metrics
- **onSecurityError**: Handle failures, attempt recovery

## Fast & Easy Third-Party Integration

### For NPM Security Example

```typescript
import { SecurityPlugin } from '@uni-ai/sdk'
import { execSync } from 'child_process'

export const npmAuditPlugin: SecurityPlugin = {
  metadata: {
    name: 'npm-audit',
    version: '1.0.0',
  },

  hooks: {
    async beforeValidation(context) {
      // Check if prompt mentions npm packages
      const packagePattern = /npm\s+install\s+([a-z0-9-]+)/gi
      const matches = context.options.prompt?.match(packagePattern)

      if (matches) {
        for (const match of matches) {
          const pkg = match.split(' ').pop()

          // Run npm audit
          const audit = execSync(`npm audit ${pkg}`, { encoding: 'utf-8' })
          const vulnerabilities = parseAuditOutput(audit)

          if (vulnerabilities.critical > 0) {
            throw new Error(
              `Package ${pkg} has critical vulnerabilities`
            )
          }
        }
      }

      return context.options
    },
  },
}
```

### For AWS Comprehend PII Detection

```typescript
import { SecurityPlugin } from '@uni-ai/sdk'
import { ComprehendClient, DetectPiiEntitiesCommand } from '@aws-sdk/client-comprehend'

export const awsComprehendPlugin: SecurityPlugin = {
  metadata: {
    name: 'aws-comprehend-pii',
    version: '1.0.0',
  },

  hooks: {
    async piiDetection(text, context) {
      const client = new ComprehendClient({ region: 'us-east-1' })

      const command = new DetectPiiEntitiesCommand({
        Text: text,
        LanguageCode: 'en',
      })

      const response = await client.send(command)

      // Redact detected entities
      let redacted = text
      const patterns: string[] = []

      for (const entity of response.Entities || []) {
        if (entity.Score && entity.Score > 0.8) {
          redacted = redacted.replace(
            text.substring(entity.BeginOffset!, entity.EndOffset!),
            `[${entity.Type}-REDACTED]`
          )
          patterns.push(entity.Type!)
        }
      }

      return {
        detected: patterns.length > 0,
        patterns: [...new Set(patterns)],
        redacted,
      }
    },
  },
}
```

## Benefits

1. **Extensibility**: Easy to add new security checks without modifying core
2. **Community**: Third parties can publish security plugins to npm
3. **Flexibility**: Mix and match plugins based on needs
4. **Performance**: Only run plugins you need
5. **Maintainability**: Security logic isolated in plugins
6. **Testing**: Plugins can be tested independently
7. **Compliance**: Audit logger enables compliance requirements

## Next Steps

### For Users
1. Try the example plugins
2. Register plugins for your use case
3. Configure security presets

### For Plugin Developers
1. Read `PLUGIN_DEVELOPMENT.md`
2. Use example plugins as templates
3. Publish to npm with `uni-ai-plugin` tag

### For the SDK
1. Build plugin registry/marketplace
2. Add more example plugins
3. Create GitHub Actions for CI

## Files Changed

- **New Plugin System**: 3 core files (types, registry, index)
- **Integration**: 2 files updated (security middleware, main exports)
- **Example Plugins**: 3 production-ready plugins
- **Documentation**: 4 comprehensive guides
- **Total**: 11 files, 3000+ lines of code

All changes are backward compatible. The SDK works exactly the same without plugins.

## Status

✅ All TypeScript types compile
✅ Build succeeds
✅ Tests pass
✅ Documentation complete
✅ Examples working
✅ Committed to git
