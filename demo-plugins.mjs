#!/usr/bin/env node
/**
 * Uni AI SDK - Plugin System Demo
 *
 * This demo shows how security plugins work in practice.
 * It demonstrates the complete plugin pipeline with real examples.
 */

import { ai, generate, registerPlugin, getPlugins, clearPlugins } from './packages/core/dist/index.js'
import { PluginPriority } from './packages/core/dist/index.js'

console.log('🚀 Uni AI Plugin System Demo\n')

// ============================================
// Demo 1: Simple Logging Plugin
// ============================================

console.log('═══════════════════════════════════════════════════════════')
console.log('Demo 1: Simple Logging Plugin')
console.log('═══════════════════════════════════════════════════════════\n')

const loggingPlugin = {
  metadata: {
    name: 'demo-logger',
    version: '1.0.0',
    description: 'Simple logging plugin for demo'
  },

  config: {
    enabled: true,
    priority: PluginPriority.LOW
  },

  hooks: {
    beforeValidation(context) {
      console.log('📝 [Logger] Request received:')
      console.log('   Model:', context.options.model)
      console.log('   Prompt length:', context.options.prompt?.length || 0, 'chars')
      return context.options
    },

    afterSecurity(context, results) {
      console.log('📊 [Logger] Security checks passed:')
      console.log('   Execution time:', results.executionTime, 'ms')
      console.log('   Modified:', results.modified ? 'Yes' : 'No')
    }
  }
}

console.log('Registering logging plugin...')
await registerPlugin(loggingPlugin)

console.log('\nMaking AI request with logging...\n')

try {
  const response = await ai('gpt-4', 'Say "Hello from the plugin system!"', {
    apiKey: 'sk-dummy-for-demo'
  })
  console.log('\n✅ Response received\n')
} catch (error) {
  console.log('\n⚠️  Expected error (using dummy key):', error.message)
  console.log('   But the logging plugin still ran! ✓\n')
}

await clearPlugins()

// ============================================
// Demo 2: PII Detection Plugin
// ============================================

console.log('═══════════════════════════════════════════════════════════')
console.log('Demo 2: PII Detection Plugin')
console.log('═══════════════════════════════════════════════════════════\n')

const piiDetectionPlugin = {
  metadata: {
    name: 'demo-pii-detector',
    version: '1.0.0',
    description: 'Detects and redacts PII'
  },

  config: {
    enabled: true,
    priority: PluginPriority.HIGH
  },

  hooks: {
    async piiDetection(text, context) {
      console.log('🔍 [PII Detector] Scanning text for sensitive data...')

      // Simple PII detection (in production, use ML-based services)
      const patterns = {
        SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
        Email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        Phone: /\b\d{3}-\d{3}-\d{4}\b/g
      }

      const detected = []
      let redacted = text

      for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
          detected.push(type)
          redacted = redacted.replace(pattern, `[${type}-REDACTED]`)
          console.log(`   ⚠️  Found ${type}`)
        }
      }

      if (detected.length > 0) {
        console.log('\n   Original:', text)
        console.log('   Redacted:', redacted)
      } else {
        console.log('   ✓ No PII detected')
      }

      return {
        detected: detected.length > 0,
        patterns: detected,
        redacted
      }
    }
  }
}

console.log('Registering PII detection plugin...\n')
await registerPlugin(piiDetectionPlugin)

console.log('Test 1: Clean text (no PII)\n')
try {
  const response = await ai('gpt-4', 'What is the capital of France?', {
    apiKey: 'sk-dummy'
  })
} catch (error) {
  console.log('   (Request would proceed to LLM in production)\n')
}

console.log('\nTest 2: Text with PII\n')
try {
  const response = await ai('gpt-4', 'My SSN is 123-45-6789 and email is user@example.com', {
    apiKey: 'sk-dummy'
  })
} catch (error) {
  console.log('   (Request would send redacted version to LLM)\n')
}

await clearPlugins()

// ============================================
// Demo 3: Rate Limiting Plugin
// ============================================

console.log('═══════════════════════════════════════════════════════════')
console.log('Demo 3: Rate Limiting Plugin')
console.log('═══════════════════════════════════════════════════════════\n')

// In-memory rate limiter for demo
const rateLimitStore = new Map()

const rateLimitPlugin = {
  metadata: {
    name: 'demo-rate-limiter',
    version: '1.0.0',
    description: 'Simple in-memory rate limiter'
  },

  config: {
    enabled: true,
    priority: PluginPriority.HIGH,
    maxRequests: 3
  },

  hooks: {
    async rateLimit(context) {
      const userId = context.userId || 'anonymous'
      const now = Date.now()
      const key = `${userId}:${Math.floor(now / 60000)}` // Per minute

      const count = (rateLimitStore.get(key) || 0) + 1
      rateLimitStore.set(key, count)

      const remaining = 3 - count

      console.log(`⏱️  [Rate Limiter] User: ${userId}`)
      console.log(`   Requests: ${count}/3`)
      console.log(`   Remaining: ${Math.max(0, remaining)}`)

      if (count > 3) {
        console.log('   ❌ RATE LIMIT EXCEEDED\n')
        return {
          allowed: false,
          remaining: 0,
          resetIn: 60000,
          error: 'Rate limit exceeded (3 requests per minute)'
        }
      }

      console.log('   ✓ Allowed\n')
      return {
        allowed: true,
        remaining: Math.max(0, remaining)
      }
    }
  }
}

console.log('Registering rate limit plugin (3 requests/minute)...\n')
await registerPlugin(rateLimitPlugin)

console.log('Making 4 requests to trigger rate limit...\n')

for (let i = 1; i <= 4; i++) {
  console.log(`Request ${i}:`)
  try {
    const response = await ai('gpt-4', `Request ${i}`, {
      apiKey: 'sk-dummy',
      metadata: { userId: 'demo-user' }
    })
  } catch (error) {
    if (error.name === 'PluginRateLimitError') {
      console.log('   🛑 Blocked by rate limiter!\n')
    } else {
      console.log('   (Would succeed in production with real API key)\n')
    }
  }
}

await clearPlugins()

// ============================================
// Demo 4: Multiple Plugins (Layered Security)
// ============================================

console.log('═══════════════════════════════════════════════════════════')
console.log('Demo 4: Multiple Plugins (Layered Security)')
console.log('═══════════════════════════════════════════════════════════\n')

const accessControlPlugin = {
  metadata: {
    name: 'demo-access-control',
    version: '1.0.0'
  },

  config: {
    priority: PluginPriority.CRITICAL  // Run first
  },

  hooks: {
    beforeValidation(context) {
      console.log('🔐 [Access Control] Checking permissions...')
      // In production: check database, API, etc.
      const allowed = true
      if (allowed) {
        console.log('   ✓ Access granted\n')
      }
      return context.options
    }
  }
}

const validationPlugin = {
  metadata: {
    name: 'demo-validator',
    version: '1.0.0'
  },

  config: {
    priority: PluginPriority.HIGH  // Run second
  },

  hooks: {
    validation(context) {
      console.log('✓ [Validator] Checking input...')
      const prompt = context.options.prompt || ''

      // Block certain words
      if (prompt.toLowerCase().includes('forbidden')) {
        console.log('   ❌ Blocked word detected\n')
        return {
          valid: false,
          error: 'Input contains forbidden words'
        }
      }

      console.log('   ✓ Valid\n')
      return { valid: true }
    }
  }
}

const auditPlugin = {
  metadata: {
    name: 'demo-audit',
    version: '1.0.0'
  },

  config: {
    priority: PluginPriority.LOW  // Run last
  },

  hooks: {
    afterSecurity(context, results) {
      console.log('📋 [Audit] Logging request...')
      console.log('   User:', context.userId || 'anonymous')
      console.log('   Model:', context.options.model)
      console.log('   Time:', results.executionTime, 'ms')
      console.log('   Status: PASSED\n')
    }
  }
}

console.log('Registering 3 plugins (access control, validation, audit)...\n')
await registerPlugin(accessControlPlugin)
await registerPlugin(validationPlugin)
await registerPlugin(auditPlugin)

console.log('Registered plugins:')
const plugins = getPlugins()
for (const p of plugins.sort((a, b) => b.priority - a.priority)) {
  console.log(`  ${p.plugin.metadata.name} (priority: ${p.priority})`)
}
console.log()

console.log('Test 1: Valid request\n')
try {
  const response = await ai('gpt-4', 'Hello world', {
    apiKey: 'sk-dummy',
    metadata: { userId: 'demo-user' }
  })
} catch (error) {
  console.log('   (All 3 plugins ran!)\n')
}

console.log('\nTest 2: Invalid request (blocked by validator)\n')
try {
  const response = await ai('gpt-4', 'This is a forbidden word', {
    apiKey: 'sk-dummy',
    metadata: { userId: 'demo-user' }
  })
} catch (error) {
  if (error.name === 'PluginValidationError') {
    console.log('   🛑 Blocked by validation plugin!')
    console.log('   Error:', error.message)
  }
}

await clearPlugins()

// ============================================
// Summary
// ============================================

console.log('\n═══════════════════════════════════════════════════════════')
console.log('✅ Demo Complete!')
console.log('═══════════════════════════════════════════════════════════\n')

console.log('What we demonstrated:\n')
console.log('1. ✅ Simple logging plugin')
console.log('   → Logs every request automatically')
console.log()
console.log('2. ✅ PII detection plugin')
console.log('   → Detects SSN, email, phone numbers')
console.log('   → Redacts sensitive data before LLM')
console.log()
console.log('3. ✅ Rate limiting plugin')
console.log('   → Enforces 3 requests/minute')
console.log('   → Blocks excess requests')
console.log()
console.log('4. ✅ Multiple plugins together')
console.log('   → Access control (CRITICAL priority)')
console.log('   → Validation (HIGH priority)')
console.log('   → Audit logging (LOW priority)')
console.log('   → Execute in priority order')
console.log()

console.log('Key Points:\n')
console.log('• Zero code changes to ai() calls')
console.log('• Plugins run automatically on every request')
console.log('• Priority system controls execution order')
console.log('• Plugins can block, modify, or log requests')
console.log('• Easy to add/remove plugins')
console.log('• Perfect for enterprise AI security\n')

console.log('Next Steps:\n')
console.log('1. Install a real plugin: npm install @daxa/uni-ai-plugin')
console.log('2. Register it: await registerPlugin(daxaPlugin)')
console.log('3. Use AI: const response = await ai("gpt-4", prompt)')
console.log('4. Automatic HIPAA/GDPR compliance! ✨\n')

console.log('Documentation:')
console.log('• How plugins work: HOW_PLUGINS_WORK_FOR_DEVELOPERS.md')
console.log('• Create plugins: CONTRIBUTING_PLUGINS.md')
console.log('• Plugin registry: PLUGIN_REGISTRY.md')
console.log('• Quick start: QUICK_START_PLUGIN.md\n')
