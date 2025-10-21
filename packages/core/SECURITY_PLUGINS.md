# Security Plugin Architecture

This document describes the plugin architecture for extending Uni AI's security system with third-party services.

## Plugin Points

The security system provides **7 key plugin points** where third-party services can integrate:

### 1. **Pre-Validation Hook** (`beforeValidation`)
- **When**: Before any security checks run
- **Purpose**: Transform or inspect input before validation
- **Use Cases**:
  - Input normalization
  - Language detection
  - Custom preprocessing
- **Input**: `GenerateOptions`
- **Output**: `GenerateOptions` (modified or original)

### 2. **Input Validation** (`validation`)
- **When**: After pre-validation, before rate limiting
- **Purpose**: Custom validation rules beyond length/pattern checks
- **Use Cases**:
  - Advanced prompt injection detection
  - Domain-specific validation
  - Business rule enforcement
- **Input**: `GenerateOptions`, `ValidationConfig`
- **Output**: `ValidationResult` (pass/fail + optional error)

### 3. **Rate Limiting** (`rateLimit`)
- **When**: After validation, before PII detection
- **Purpose**: Custom rate limiting backends
- **Use Cases**:
  - Redis-based distributed rate limiting
  - Database-backed quota systems
  - API gateway integration
- **Input**: `userId`, `RateLimitConfig`
- **Output**: `RateLimitResult` (allow/deny + remaining quota)

### 4. **PII Detection** (`piiDetection`)
- **When**: After rate limiting, before content moderation
- **Purpose**: Advanced PII detection beyond regex patterns
- **Use Cases**:
  - ML-based PII detection (Presidio, AWS Comprehend)
  - Context-aware entity recognition
  - Multi-language PII detection
- **Input**: `string` (text to analyze)
- **Output**: `PIIDetectionResult` (detected entities + redacted text)

### 5. **Content Moderation** (`moderation`)
- **When**: After PII detection, before output
- **Purpose**: Check for harmful/inappropriate content
- **Use Cases**:
  - OpenAI Moderation API
  - Perspective API (toxicity)
  - Custom content policies
- **Input**: `string` (text to moderate)
- **Output**: `ModerationResult` (safe/unsafe + categories)

### 6. **Post-Security Hook** (`afterSecurity`)
- **When**: After all security checks pass
- **Purpose**: Logging, analytics, auditing
- **Use Cases**:
  - Security event logging
  - Compliance auditing
  - Analytics/telemetry
- **Input**: `GenerateOptions`, `SecurityCheckResults`
- **Output**: `void` (side effects only)

### 7. **Error Handling** (`onSecurityError`)
- **When**: When any security check fails
- **Purpose**: Custom error handling and recovery
- **Use Cases**:
  - Error logging/alerting
  - Graceful degradation
  - Custom error responses
- **Input**: `Error`, `GenerateOptions`
- **Output**: `void` or `GenerateOptions` (for recovery)

## Plugin Execution Flow

```
┌─────────────────────────────────────────────────┐
│ User Request                                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ 1. beforeValidation  │ ◄─── Pre-Validation Plugins
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ 2. validation        │ ◄─── Validation Plugins
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ 3. rateLimit         │ ◄─── Rate Limiting Plugins
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ 4. piiDetection      │ ◄─── PII Detection Plugins
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ 5. moderation        │ ◄─── Moderation Plugins
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ 6. afterSecurity     │ ◄─── Post-Security Plugins
        └──────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Generate Response    │
        └──────────────────────┘

        If any check fails:
                   │
                   ▼
        ┌──────────────────────┐
        │ 7. onSecurityError   │ ◄─── Error Handler Plugins
        └──────────────────────┘
```

## Plugin Priority System

Plugins can specify priority to control execution order:

- **Priority 100**: Critical security checks (run first)
- **Priority 50**: Standard checks (default)
- **Priority 10**: Optional enhancements (run last)

Within the same priority level, plugins execute in registration order.

## Plugin Configuration

Each plugin can accept configuration at three levels:

1. **Plugin-level**: Default configuration when registered
2. **Preset-level**: Override in security presets (strict/moderate/permissive)
3. **Request-level**: Override per-request in `GenerateOptions`

Example:

```typescript
// 1. Plugin-level (default)
registerPlugin(redisRateLimitPlugin, {
  host: 'localhost',
  port: 6379,
  maxRequests: 100
})

// 2. Preset-level
const strictPreset = {
  plugins: {
    redisRateLimit: {
      maxRequests: 10  // Stricter for this preset
    }
  }
}

// 3. Request-level
const result = await generate({
  model: 'gpt-4',
  prompt: 'Hello',
  security: {
    ...strictPreset,
    plugins: {
      redisRateLimit: {
        maxRequests: 5  // Even stricter for this request
      }
    }
  }
})
```

## Plugin Capabilities

### Async/Await Support
All plugin hooks support async operations:

```typescript
async piiDetection(text: string): Promise<PIIDetectionResult> {
  const result = await fetch('https://api.pii-service.com/detect', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
  return result.json()
}
```

### Early Exit
Plugins can throw errors to stop the security pipeline:

```typescript
async validation(options: GenerateOptions): Promise<ValidationResult> {
  if (containsMaliciousCode(options.prompt)) {
    throw new SecurityError('Malicious code detected')
  }
  return { valid: true }
}
```

### Context Sharing
Plugins can attach metadata for downstream plugins:

```typescript
async beforeValidation(options: GenerateOptions): Promise<GenerateOptions> {
  return {
    ...options,
    _metadata: {
      language: detectLanguage(options.prompt),
      sentiment: analyzeSentiment(options.prompt)
    }
  }
}
```

## Built-in Plugins

Uni AI includes these built-in plugins:

### Core Plugins (Always Active)
- **Input Validator**: Length and pattern checks
- **In-Memory Rate Limiter**: Basic per-user throttling
- **Regex PII Detector**: Pattern-based PII detection

### Optional Plugins (Opt-in)
- **Redis Rate Limiter**: Distributed rate limiting
- **OpenAI Moderation**: Content safety checks
- **Presidio PII**: ML-based PII detection
- **AWS Comprehend**: Entity detection
- **Audit Logger**: Security event logging

## Example: Third-Party Integration

### NPM Security Audit Plugin

```typescript
import { SecurityPlugin } from '@uni-ai/sdk/plugins'
import { execSync } from 'child_process'

export const npmAuditPlugin: SecurityPlugin = {
  name: 'npm-audit',
  version: '1.0.0',
  hooks: {
    beforeValidation: async (options) => {
      // Check if prompt contains npm package names
      const packagePattern = /npm\s+install\s+([a-z0-9-]+)/gi
      const matches = options.prompt.match(packagePattern)

      if (matches) {
        for (const match of matches) {
          const pkg = match.split(' ').pop()

          // Run npm audit on the package
          try {
            const audit = execSync(`npm audit ${pkg}`, { encoding: 'utf-8' })

            // Parse audit results
            const vulnerabilities = parseAuditOutput(audit)

            if (vulnerabilities.critical > 0) {
              throw new SecurityError(
                `Package ${pkg} has ${vulnerabilities.critical} critical vulnerabilities`
              )
            }

            // Attach audit info to metadata
            options._metadata = {
              ...options._metadata,
              npmAudit: {
                package: pkg,
                vulnerabilities
              }
            }
          } catch (error) {
            console.warn(`NPM audit failed for ${pkg}:`, error)
          }
        }
      }

      return options
    }
  }
}
```

### Usage

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { npmAuditPlugin } from '@uni-ai/plugin-npm-audit'

// Register the plugin
registerPlugin(npmAuditPlugin)

// Now all requests will check for vulnerable packages
const response = await ai('gpt-4', 'Should I npm install event-stream?', {
  security: 'strict'
})
// Throws SecurityError: "Package event-stream has 1 critical vulnerabilities"
```

## Plugin Development Guide

See [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md) for:
- Creating custom plugins
- Testing plugins
- Publishing plugins
- Best practices

## Plugin Registry

Community plugins are available at:
- **npm**: Search for packages tagged `uni-ai-plugin`
- **GitHub**: https://github.com/uni-ai/plugins
- **Documentation**: https://docs.uni-ai.dev/plugins

## Security Considerations

When using third-party plugins:

1. **Trust**: Only use plugins from verified sources
2. **API Keys**: Plugins may require external API keys
3. **Performance**: External API calls add latency
4. **Privacy**: Plugins may send data to third-party services
5. **Fallback**: Configure fallback behavior if plugin fails

## Next Steps

- Review [Plugin API Reference](./PLUGIN_API.md)
- See [Example Plugins](../examples/plugins/)
- Read [Plugin Best Practices](./PLUGIN_BEST_PRACTICES.md)
