# How Security Plugins Work - Developer Guide

Complete guide showing exactly how developers use security plugins in their applications.

## Table of Contents

1. [Quick Example](#quick-example)
2. [Step-by-Step Walkthrough](#step-by-step-walkthrough)
3. [What Happens Behind the Scenes](#what-happens-behind-the-scenes)
4. [Real-World Examples](#real-world-examples)
5. [Common Scenarios](#common-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Quick Example

### Before (No Security)

```typescript
import { ai } from '@uni-ai/sdk'

// Directly call LLM - no security checks
const response = await ai('gpt-4', 'Analyze this patient data: ...')
console.log(response)
```

**Problems:**
- ❌ No PII detection
- ❌ No compliance checks
- ❌ No access control
- ❌ No audit trail
- ❌ Sensitive data could leak

### After (With Security Plugin)

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { daxaPlugin } from '@daxa/uni-ai-plugin'

// Register security plugin once at startup
await registerPlugin(daxaPlugin, {
  config: {
    apiKey: process.env.DAXA_API_KEY,
    policies: ['HIPAA', 'GDPR']
  }
})

// Same code - but now secured automatically
const response = await ai('gpt-4', 'Analyze this patient data: ...')
console.log(response)
```

**What changed:**
- ✅ PII automatically detected and redacted
- ✅ HIPAA/GDPR policies enforced
- ✅ Access control checked
- ✅ Complete audit trail logged
- ✅ Compliance guaranteed

**Developer experience:**
- 3 lines added (import + register)
- Zero code changes to AI calls
- Automatic security on every request

---

## Step-by-Step Walkthrough

### Step 1: Install Plugin

```bash
npm install @uni-ai/sdk @daxa/uni-ai-plugin
```

### Step 2: Import and Configure

```typescript
// app.ts - Your application entry point

import { ai, registerPlugin } from '@uni-ai/sdk'
import { daxaPlugin } from '@daxa/uni-ai-plugin'

// Register plugin (do this once at startup)
await registerPlugin(daxaPlugin, {
  config: {
    apiKey: process.env.DAXA_API_KEY,
    enforcementMode: 'block',  // or 'warn' or 'audit'
    policies: ['HIPAA', 'GDPR']
  }
})

console.log('✅ Security plugin registered')
```

### Step 3: Use AI Normally

```typescript
// anywhere in your app - works automatically

async function getDiagnosis(patientData: string) {
  // This looks like a regular AI call, but...
  const diagnosis = await ai('gpt-4', `
    Patient data: ${patientData}
    Provide diagnosis and treatment plan.
  `)

  return diagnosis
}

// Use it
const result = await getDiagnosis('45yo male, chest pain, diabetes')
console.log(result)
```

### Step 4: That's It!

No other code changes needed. Every `ai()` call now:
1. Checks access permissions
2. Detects and redacts PII
3. Enforces HIPAA/GDPR policies
4. Logs audit trail
5. Only reaches LLM if all checks pass

---

## What Happens Behind the Scenes

### Visual Flow

```
Developer Code:
  const response = await ai('gpt-4', 'Patient data: SSN 123-45-6789')

                    ↓

Uni AI SDK:
  "I see a registered plugin (Daxa), let me run it..."

                    ↓

Plugin Pipeline:
  1. beforeValidation
     → Daxa: Check user has access to this model
     ✓ Access granted

  2. validation
     → Daxa: Validate against business rules
     ✓ Valid

  3. rateLimit
     → Daxa: Check user quota
     ✓ Within quota (95 requests remaining)

  4. piiDetection
     → Daxa: Scan for PII
     ⚠ Found: SSN
     → Redact: "Patient data: [SSN-REDACTED]"

  5. moderation
     → Daxa: Check HIPAA/GDPR compliance
     ✓ Compliant

  6. afterSecurity
     → Daxa: Log audit trail
     ✓ Logged to compliance system

                    ↓

Modified Request:
  "Patient data: [SSN-REDACTED]"
     ↓
  OpenAI API
     ↓
  Response (without PII)

                    ↓

Return to Developer:
  const response = "Based on the symptoms..."
```

### Code Execution Flow

```typescript
// Developer writes:
const response = await ai('gpt-4', userInput)

// SDK executes internally:
async function ai(model: string, prompt: string, options?: Options) {
  // 1. Create request options
  const requestOptions = {
    model,
    prompt,
    ...options
  }

  // 2. Check if plugins registered
  const plugins = getPlugins()

  if (plugins.length > 0) {
    // 3. Run security pipeline
    const { options: securedOptions } = await executeSecurityPlugins(requestOptions)

    // 4. Send to LLM (only if all plugins approved)
    return generateFromLLM(securedOptions)
  } else {
    // No plugins - send directly (not recommended for production)
    return generateFromLLM(requestOptions)
  }
}
```

---

## Real-World Examples

### Example 1: Healthcare App with HIPAA Compliance

**Scenario**: Medical diagnosis assistant

```typescript
// server.ts
import express from 'express'
import { ai, registerPlugin } from '@uni-ai/sdk'
import { daxaPlugin } from '@daxa/uni-ai-plugin'

const app = express()

// Setup security at startup
await registerPlugin(daxaPlugin, {
  config: {
    apiKey: process.env.DAXA_API_KEY,
    policies: ['HIPAA'],
    enforcementMode: 'block'
  }
})

// Your endpoint
app.post('/api/diagnose', async (req, res) => {
  try {
    const { patientData } = req.body

    // Call AI - Daxa automatically:
    // ✓ Checks doctor has access
    // ✓ Redacts SSN, DOB, etc.
    // ✓ Enforces HIPAA policies
    // ✓ Logs to audit trail
    const diagnosis = await ai('gpt-4', `
      Patient: ${patientData.age}yo ${patientData.gender}
      Symptoms: ${patientData.symptoms}
      History: ${patientData.medicalHistory}

      Provide diagnosis and treatment recommendations.
    `)

    res.json({ diagnosis })

  } catch (error) {
    // Plugin can throw errors for violations
    if (error.name === 'PluginModerationError') {
      res.status(403).json({
        error: 'HIPAA violation detected',
        message: error.message
      })
    } else {
      res.status(500).json({ error: 'Internal error' })
    }
  }
})

app.listen(3000)
```

**What developer gets:**
- Zero security code written
- HIPAA compliance guaranteed
- Automatic audit trail
- PII never reaches LLM

### Example 2: Financial Services with Multi-Regulation

**Scenario**: Investment advisor chatbot

```typescript
// app.ts
import { ai, registerPlugin } from '@uni-ai/sdk'
import { securitiPlugin } from '@securiti/uni-ai-plugin'

// Multi-regulation compliance
await registerPlugin(securitiPlugin, {
  config: {
    apiKey: process.env.SECURITI_API_KEY,
    tenantId: process.env.SECURITI_TENANT_ID,
    regulations: ['PCI-DSS', 'GDPR', 'CCPA', 'SOX']
  }
})

async function getInvestmentAdvice(userId: string, query: string) {
  // Securiti automatically:
  // ✓ Checks 50+ regulations
  // ✓ Redacts credit card numbers
  // ✓ Enforces data residency rules
  // ✓ Logs for SOX compliance
  const advice = await ai('gpt-4', query, {
    security: 'strict',
    metadata: { userId }
  })

  return advice
}

// Use it
const advice = await getInvestmentAdvice(
  'user-123',
  'Should I invest in crypto?'
)
```

### Example 3: Using Multiple Plugins Together

**Scenario**: Enterprise AI with layered security

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

// Layer 1: Access control (runs first)
import { daxaPlugin } from '@daxa/uni-ai-plugin'
await registerPlugin(daxaPlugin, {
  priority: PluginPriority.CRITICAL,
  config: {
    apiKey: process.env.DAXA_API_KEY,
    policies: ['ACCESS_CONTROL']
  }
})

// Layer 2: Compliance (runs second)
import { securitiPlugin } from '@securiti/uni-ai-plugin'
await registerPlugin(securitiPlugin, {
  priority: PluginPriority.HIGH,
  config: {
    apiKey: process.env.SECURITI_API_KEY,
    regulations: ['GDPR', 'HIPAA']
  }
})

// Layer 3: Content moderation (runs third)
import { openaiModerationPlugin } from '@openai/uni-ai-plugin-moderation'
await registerPlugin(openaiModerationPlugin, {
  priority: PluginPriority.NORMAL,
  config: {
    apiKey: process.env.OPENAI_API_KEY
  }
})

// Layer 4: Audit logging (runs last)
import { auditLoggerPlugin } from '@mycompany/audit-logger'
await registerPlugin(auditLoggerPlugin, {
  priority: PluginPriority.LOW,
  config: {
    endpoint: 'https://logs.mycompany.com'
  }
})

// Now every AI call goes through all 4 layers
const response = await ai('gpt-4', userQuery)

// Execution order:
// 1. Daxa checks access → pass
// 2. Securiti checks compliance → pass
// 3. OpenAI checks content safety → pass
// 4. Audit logger records event → logged
// → Request reaches LLM
```

### Example 4: Environment-Specific Configuration

**Scenario**: Different security for dev/staging/prod

```typescript
// config/security.ts
import { registerPlugin } from '@uni-ai/sdk'
import { daxaPlugin } from '@daxa/uni-ai-plugin'
import { auditLoggerPlugin } from './audit-logger'

export async function setupSecurity() {
  const env = process.env.NODE_ENV

  if (env === 'production') {
    // Production: Strict security
    await registerPlugin(daxaPlugin, {
      config: {
        apiKey: process.env.DAXA_API_KEY,
        enforcementMode: 'block',
        policies: ['HIPAA', 'GDPR', 'PCI-DSS']
      }
    })

    await registerPlugin(auditLoggerPlugin, {
      config: {
        destination: 'file',
        filePath: '/var/log/ai-audit.log',
        includePrompts: true  // Log everything for compliance
      }
    })

  } else if (env === 'staging') {
    // Staging: Warn mode
    await registerPlugin(daxaPlugin, {
      config: {
        apiKey: process.env.DAXA_API_KEY,
        enforcementMode: 'warn',  // Log but don't block
        policies: ['HIPAA', 'GDPR']
      }
    })

  } else {
    // Development: Audit only
    await registerPlugin(auditLoggerPlugin, {
      config: {
        destination: 'console',
        includePrompts: false
      }
    })
  }
}

// app.ts
await setupSecurity()
const response = await ai('gpt-4', prompt)
```

---

## Common Scenarios

### Scenario 1: "I want to add PII detection"

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { createPresidioPlugin } from '@microsoft/uni-ai-plugin-presidio'

// Add PII detection
await registerPlugin(createPresidioPlugin({
  apiKey: process.env.PRESIDIO_API_KEY,
  entities: ['EMAIL', 'PHONE_NUMBER', 'SSN', 'CREDIT_CARD']
}))

// Now all prompts are scanned for PII
const response = await ai('gpt-4', userInput)
// PII is automatically redacted before reaching LLM
```

### Scenario 2: "I need to rate limit users"

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { createRedisRateLimitPlugin } from '@upstash/uni-ai-plugin-redis'
import Redis from 'ioredis'

// Setup rate limiting
const redis = new Redis(process.env.REDIS_URL)

await registerPlugin(createRedisRateLimitPlugin(redis, {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100
}))

// Now users are rate limited
try {
  const response = await ai('gpt-4', prompt, {
    metadata: { userId: 'user-123' }
  })
} catch (error) {
  if (error.name === 'PluginRateLimitError') {
    console.log('Rate limit exceeded. Try again in', error.resetIn, 'ms')
  }
}
```

### Scenario 3: "I need content moderation"

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { openaiModerationPlugin } from '@openai/uni-ai-plugin-moderation'

// Add content moderation
await registerPlugin(openaiModerationPlugin, {
  config: {
    apiKey: process.env.OPENAI_API_KEY,
    blockCategories: ['hate', 'violence', 'sexual/minors']
  }
})

// Toxic content is automatically blocked
try {
  const response = await ai('gpt-4', userInput)
} catch (error) {
  if (error.name === 'PluginModerationError') {
    console.log('Content flagged:', error.categories)
  }
}
```

### Scenario 4: "I need audit logging"

```typescript
import { ai, registerPlugin } from '@uni-ai/sdk'
import { createAuditLoggerPlugin } from './plugins/audit-logger'

// Add audit logging
await registerPlugin(createAuditLoggerPlugin({
  destination: 'file',
  filePath: './audit.log',
  includePrompts: true,  // For compliance
  format: 'json'
}))

// Every request is now logged
const response = await ai('gpt-4', prompt)

// audit.log:
// {"timestamp":"2025-10-21T...","userId":"...","model":"gpt-4","status":"passed"}
```

### Scenario 5: "I want to disable plugins temporarily"

```typescript
import { ai, disablePlugin, enablePlugin } from '@uni-ai/sdk'

// Disable specific plugin
disablePlugin('daxa')

// This request bypasses Daxa
const response = await ai('gpt-4', prompt)

// Re-enable
enablePlugin('daxa')

// This request goes through Daxa again
const response2 = await ai('gpt-4', prompt)
```

---

## Developer Experience Features

### 1. Zero Code Changes to AI Calls

```typescript
// Before plugins
const response = await ai('gpt-4', prompt)

// After plugins (same code!)
const response = await ai('gpt-4', prompt)
```

### 2. TypeScript Autocomplete

```typescript
await registerPlugin(myPlugin, {
  config: {
    // IDE autocompletes all config options
    apiKey: string
    endpoint?: string
    timeout?: number
  }
})
```

### 3. Detailed Error Messages

```typescript
try {
  const response = await ai('gpt-4', prompt)
} catch (error) {
  // Structured errors from plugins
  if (error.name === 'PluginRateLimitError') {
    console.log('Rate limit:', error.remaining, 'remaining')
    console.log('Resets in:', error.resetIn, 'ms')
  } else if (error.name === 'PluginValidationError') {
    console.log('Validation failed:', error.message)
  } else if (error.name === 'PluginModerationError') {
    console.log('Flagged for:', error.categories)
  }
}
```

### 4. Debug Mode

```typescript
import { registerPlugin } from '@uni-ai/sdk'

await registerPlugin(myPlugin, {
  config: {
    debug: true  // Enable debug logging
  }
})

// Logs:
// [my-plugin] beforeValidation hook
// [my-plugin] validation hook
// [my-plugin] piiDetection hook: found 2 entities
// [my-plugin] afterSecurity hook: logged to audit
```

### 5. Testing Support

```typescript
import { clearPlugins } from '@uni-ai/sdk'

describe('My App', () => {
  beforeEach(async () => {
    // Register plugins for tests
    await registerPlugin(testPlugin)
  })

  afterEach(async () => {
    // Clean up after each test
    await clearPlugins()
  })

  it('should work with security', async () => {
    const result = await ai('gpt-4', 'test')
    expect(result).toBeDefined()
  })
})
```

---

## Common Patterns

### Pattern 1: Centralized Security Setup

```typescript
// lib/security.ts
import { registerPlugin } from '@uni-ai/sdk'
import { daxaPlugin } from '@daxa/uni-ai-plugin'
import { auditLoggerPlugin } from './audit-logger'

export async function initializeSecurity() {
  // All security setup in one place
  await registerPlugin(daxaPlugin, {
    config: {
      apiKey: process.env.DAXA_API_KEY,
      policies: ['HIPAA', 'GDPR']
    }
  })

  await registerPlugin(auditLoggerPlugin, {
    config: {
      destination: 'file',
      filePath: './audit.log'
    }
  })

  console.log('✅ Security initialized')
}

// app.ts
import { initializeSecurity } from './lib/security'

await initializeSecurity()
// Now use AI anywhere in your app
```

### Pattern 2: Per-Request Context

```typescript
import { ai } from '@uni-ai/sdk'

// Pass user context to plugins
async function generateResponse(userId: string, query: string) {
  const response = await ai('gpt-4', query, {
    metadata: { userId },  // Plugins can access this
    security: 'strict'
  })

  return response
}

// Plugins receive userId in context
// hooks: {
//   rateLimit(context) {
//     const userId = context.userId  // From metadata
//     // Check rate limit for this user
//   }
// }
```

### Pattern 3: Conditional Plugin Loading

```typescript
import { registerPlugin } from '@uni-ai/sdk'

// Load plugins based on feature flags
if (process.env.ENABLE_PII_DETECTION === 'true') {
  await registerPlugin(piiDetectionPlugin)
}

if (process.env.ENABLE_CONTENT_MODERATION === 'true') {
  await registerPlugin(moderationPlugin)
}

// Always enable audit logging in production
if (process.env.NODE_ENV === 'production') {
  await registerPlugin(auditLoggerPlugin)
}
```

---

## Troubleshooting

### Issue 1: "Plugin not running"

**Check:**
```typescript
import { getPlugins } from '@uni-ai/sdk'

// See all registered plugins
const plugins = getPlugins()
console.log('Registered:', plugins.map(p => p.plugin.metadata.name))

// Output: ['daxa', 'audit-logger']
```

### Issue 2: "API key not found"

**Solution:**
```typescript
// Make sure environment variables are loaded
import 'dotenv/config'

await registerPlugin(daxaPlugin, {
  config: {
    apiKey: process.env.DAXA_API_KEY || (() => {
      throw new Error('DAXA_API_KEY not set')
    })()
  }
})
```

### Issue 3: "Too slow"

**Check plugin performance:**
```typescript
hooks: {
  async afterSecurity(context, results) {
    console.log('Security checks took:', results.executionTime, 'ms')

    // If slow, check which plugin
    for (const check of results.validation) {
      console.log('Validation:', check.metadata?.executionTime)
    }
  }
}
```

### Issue 4: "Plugins conflicting"

**Adjust priorities:**
```typescript
import { PluginPriority } from '@uni-ai/sdk'

// Run access control first
await registerPlugin(accessControlPlugin, {
  priority: PluginPriority.CRITICAL  // 100
})

// Then compliance
await registerPlugin(compliancePlugin, {
  priority: PluginPriority.HIGH  // 75
})

// Then logging last
await registerPlugin(loggingPlugin, {
  priority: PluginPriority.LOW  // 25
})
```

---

## Summary

### How Developers Use Plugins

**1. Install:**
```bash
npm install @company/uni-ai-plugin-name
```

**2. Register once at startup:**
```typescript
await registerPlugin(plugin, { config: { apiKey: '...' } })
```

**3. Use AI normally:**
```typescript
const response = await ai('gpt-4', prompt)
```

**4. Security happens automatically:**
- Every request goes through plugins
- Plugins check, modify, or reject
- Only approved requests reach LLM
- Audit trail logged automatically

### Benefits

**For Developers:**
- ✅ Zero security code to write
- ✅ No code changes to AI calls
- ✅ Add security in 3 lines
- ✅ Swap plugins without code changes
- ✅ Stack multiple security layers

**For Applications:**
- ✅ Enterprise-grade security
- ✅ Compliance guaranteed (HIPAA, GDPR, etc.)
- ✅ Audit trails automatic
- ✅ PII never leaks
- ✅ Content moderation built-in

### The Magic

**You write:**
```typescript
const response = await ai('gpt-4', userInput)
```

**The SDK executes:**
1. Check plugins registered → Yes
2. Run beforeValidation → Pass
3. Run validation → Pass
4. Run rateLimit → Pass (95 remaining)
5. Run piiDetection → Redacted SSN
6. Run moderation → Pass
7. Run afterSecurity → Logged
8. Send to LLM (with redacted prompt)
9. Return response

**You receive:**
```typescript
const response = "Based on the information provided..."
```

Zero security code. Complete protection. That's how plugins work.
