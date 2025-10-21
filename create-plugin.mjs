#!/usr/bin/env node
/**
 * Plugin Template Generator
 *
 * Creates a new Uni AI security plugin from template in seconds.
 *
 * Usage:
 *   npx create-uni-ai-plugin my-plugin
 *   npm create uni-ai-plugin my-plugin
 */

import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Get plugin name from command line
const pluginName = process.argv[2]

if (!pluginName) {
  console.error('❌ Please provide a plugin name')
  console.log('Usage: npx create-uni-ai-plugin my-plugin')
  process.exit(1)
}

const pluginDir = path.join(process.cwd(), pluginName)

// Check if directory exists
if (existsSync(pluginDir)) {
  console.error(`❌ Directory '${pluginName}' already exists`)
  process.exit(1)
}

console.log(`\n🚀 Creating Uni AI plugin: ${pluginName}\n`)

// Create directory
await mkdir(pluginDir, { recursive: true })
await mkdir(path.join(pluginDir, 'src'), { recursive: true })
await mkdir(path.join(pluginDir, 'test'), { recursive: true })

// Templates
const packageJson = {
  name: `@yourcompany/uni-ai-plugin-${pluginName}`,
  version: '1.0.0',
  description: `Uni AI security plugin for ${pluginName}`,
  main: './dist/index.js',
  types: './dist/index.d.ts',
  type: 'module',
  scripts: {
    build: 'tsc',
    test: 'vitest',
    'test:ci': 'vitest run',
    dev: 'tsc --watch',
  },
  keywords: ['uni-ai', 'uni-ai-plugin', 'security', pluginName],
  peerDependencies: {
    '@uni-ai/sdk': '^0.1.0',
  },
  devDependencies: {
    '@uni-ai/sdk': '^0.1.0',
    typescript: '^5.0.0',
    vitest: '^1.0.0',
  },
}

const tsconfig = {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'bundler',
    declaration: true,
    outDir: './dist',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist', 'test'],
}

const pluginTemplate = `/**
 * ${pluginName} Security Plugin
 *
 * TODO: Add description of what this plugin does
 *
 * @example
 * \`\`\`typescript
 * import { registerPlugin } from '@uni-ai/sdk'
 * import { ${toCamelCase(pluginName)}Plugin } from '@yourcompany/uni-ai-plugin-${pluginName}'
 *
 * await registerPlugin(${toCamelCase(pluginName)}Plugin, {
 *   config: {
 *     apiKey: process.env.API_KEY
 *   }
 * })
 * \`\`\`
 */

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

/**
 * Plugin configuration
 */
export interface ${toPascalCase(pluginName)}Config {
  /** API key for ${pluginName} service */
  apiKey: string

  /** API endpoint (optional) */
  endpoint?: string

  /** Enable debug logging */
  debug?: boolean

  // TODO: Add your configuration options here
}

/**
 * Create ${pluginName} plugin
 */
export function create${toPascalCase(pluginName)}Plugin(
  config: ${toPascalCase(pluginName)}Config
): SecurityPlugin {
  const endpoint = config.endpoint || 'https://api.${pluginName}.com'

  return {
    metadata: {
      name: '${pluginName}',
      version: '1.0.0',
      description: '${pluginName} security plugin',
      author: 'Your Company',
    },

    config: {
      enabled: true,
      priority: PluginPriority.NORMAL,
      ...config,
    },

    // Optional: Initialize plugin
    async initialize() {
      if (config.debug) {
        console.log('[${pluginName}] Plugin initialized')
      }

      // TODO: Add initialization logic (connect to service, validate config, etc.)
    },

    // Optional: Cleanup plugin
    async cleanup() {
      if (config.debug) {
        console.log('[${pluginName}] Plugin cleaned up')
      }

      // TODO: Add cleanup logic (close connections, save state, etc.)
    },

    hooks: {
      // ========================================
      // Hook 1: Before Validation
      // ========================================
      // Use for: Transform input, check permissions, extract metadata
      async beforeValidation(context: PluginContext) {
        if (config.debug) {
          console.log('[${pluginName}] beforeValidation hook')
        }

        // TODO: Add your logic here
        // Example: Check user permissions
        // const response = await fetch(\`\${endpoint}/check-permission\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     userId: context.userId,
        //     model: context.options.model,
        //   }),
        // })
        //
        // const { allowed } = await response.json()
        // if (!allowed) {
        //   throw new Error('Permission denied')
        // }

        return context.options
      },

      // ========================================
      // Hook 2: Validation
      // ========================================
      // Use for: Custom validation rules, business logic
      async validation(context: PluginContext): Promise<ValidationResult> {
        if (config.debug) {
          console.log('[${pluginName}] validation hook')
        }

        // TODO: Add your validation logic
        // Example: Call validation API
        // const response = await fetch(\`\${endpoint}/validate\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     prompt: context.options.prompt,
        //   }),
        // })
        //
        // const { valid, error } = await response.json()
        //
        // if (!valid) {
        //   return { valid: false, error }
        // }

        return { valid: true }
      },

      // ========================================
      // Hook 3: Rate Limiting
      // ========================================
      // Use for: Throttling, quota management
      async rateLimit(context: PluginContext): Promise<RateLimitResult> {
        if (config.debug) {
          console.log('[${pluginName}] rateLimit hook')
        }

        // TODO: Add your rate limiting logic
        // Example: Check rate limit
        // const userId = context.userId || 'anonymous'
        // const response = await fetch(\`\${endpoint}/check-rate-limit\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ userId }),
        // })
        //
        // const { allowed, remaining, resetIn } = await response.json()
        //
        // if (!allowed) {
        //   return {
        //     allowed: false,
        //     remaining,
        //     resetIn,
        //     error: 'Rate limit exceeded',
        //   }
        // }

        return { allowed: true }
      },

      // ========================================
      // Hook 4: PII Detection
      // ========================================
      // Use for: Detect and redact sensitive data
      async piiDetection(
        text: string,
        context: PluginContext
      ): Promise<PIIDetectionResult> {
        if (config.debug) {
          console.log('[${pluginName}] piiDetection hook')
        }

        // TODO: Add your PII detection logic
        // Example: Call PII detection API
        // const response = await fetch(\`\${endpoint}/detect-pii\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ text }),
        // })
        //
        // const { entities } = await response.json()
        //
        // if (entities.length > 0) {
        //   let redacted = text
        //   const patterns: string[] = []
        //
        //   for (const entity of entities) {
        //     redacted = redacted.replace(entity.value, \`[\${entity.type}-REDACTED]\`)
        //     patterns.push(entity.type)
        //   }
        //
        //   return {
        //     detected: true,
        //     patterns: [...new Set(patterns)],
        //     redacted,
        //     entities,
        //   }
        // }

        return {
          detected: false,
          patterns: [],
          redacted: text,
        }
      },

      // ========================================
      // Hook 5: Moderation
      // ========================================
      // Use for: Content safety, compliance checks
      async moderation(
        text: string,
        context: PluginContext
      ): Promise<ModerationResult> {
        if (config.debug) {
          console.log('[${pluginName}] moderation hook')
        }

        // TODO: Add your moderation logic
        // Example: Call moderation API
        // const response = await fetch(\`\${endpoint}/moderate\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ text }),
        // })
        //
        // const { safe, categories, scores } = await response.json()
        //
        // if (!safe) {
        //   return {
        //     safe: false,
        //     categories,
        //     scores,
        //     action: 'block',
        //     reason: \`Content flagged: \${categories.join(', ')}\`,
        //   }
        // }

        return {
          safe: true,
          categories: [],
          action: 'allow',
        }
      },

      // ========================================
      // Hook 6: After Security
      // ========================================
      // Use for: Logging, analytics, audit trails
      async afterSecurity(
        context: PluginContext,
        results: SecurityCheckResults
      ): Promise<void> {
        if (config.debug) {
          console.log('[${pluginName}] afterSecurity hook')
        }

        // TODO: Add your logging logic
        // Example: Send audit log
        // await fetch(\`\${endpoint}/audit\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     timestamp: new Date().toISOString(),
        //     userId: context.userId,
        //     model: context.options.model,
        //     executionTime: results.executionTime,
        //     status: 'passed',
        //   }),
        // })
      },

      // ========================================
      // Hook 7: Error Handling
      // ========================================
      // Use for: Alert, log, attempt recovery
      async onSecurityError(
        error: Error,
        context: PluginContext
      ): Promise<void> {
        if (config.debug) {
          console.error('[${pluginName}] Security error:', error.message)
        }

        // TODO: Add your error handling logic
        // Example: Send alert
        // await fetch(\`\${endpoint}/alert\`, {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': \`Bearer \${config.apiKey}\`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     error: error.message,
        //     userId: context.userId,
        //     model: context.options.model,
        //   }),
        // })
      },
    },
  }
}

/**
 * Default export for convenience
 */
export const ${toCamelCase(pluginName)}Plugin = create${toPascalCase(pluginName)}Plugin({
  apiKey: process.env.${toConstantCase(pluginName)}_API_KEY || '',
})
`

const testTemplate = `import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { registerPlugin, clearPlugins, ai } from '@uni-ai/sdk'
import { create${toPascalCase(pluginName)}Plugin } from '../src/index.js'

describe('${toPascalCase(pluginName)} Plugin', () => {
  const plugin = create${toPascalCase(pluginName)}Plugin({
    apiKey: 'test-api-key',
    endpoint: 'http://localhost:3000',
    debug: true,
  })

  beforeEach(async () => {
    await registerPlugin(plugin)
  })

  afterEach(async () => {
    await clearPlugins()
  })

  it('should have correct metadata', () => {
    expect(plugin.metadata.name).toBe('${pluginName}')
    expect(plugin.metadata.version).toBeDefined()
  })

  it('should validate input', async () => {
    const context = {
      options: { model: 'gpt-4', prompt: 'test' },
      security: {},
      metadata: {},
      startTime: Date.now(),
    }

    const result = await plugin.hooks.validation!(context)

    expect(result).toBeDefined()
    expect(result.valid).toBe(true)
  })

  // TODO: Add more tests
  // it('should detect PII', async () => { ... })
  // it('should check rate limits', async () => { ... })
  // it('should moderate content', async () => { ... })
})
`

const readme = `# ${pluginName} Plugin for Uni AI

Security plugin for integrating ${pluginName} with Uni AI SDK.

## Installation

\`\`\`bash
npm install @yourcompany/uni-ai-plugin-${pluginName}
\`\`\`

## Usage

\`\`\`typescript
import { registerPlugin, ai } from '@uni-ai/sdk'
import { create${toPascalCase(pluginName)}Plugin } from '@yourcompany/uni-ai-plugin-${pluginName}'

// Register plugin
await registerPlugin(create${toPascalCase(pluginName)}Plugin({
  apiKey: process.env.${toConstantCase(pluginName)}_API_KEY,
}))

// Use SDK normally - plugin runs automatically
const response = await ai('gpt-4', 'Your prompt here')
\`\`\`

## Configuration

| Option | Type | Description |
|--------|------|-------------|
| \`apiKey\` | string | API key for ${pluginName} service (required) |
| \`endpoint\` | string | API endpoint (optional) |
| \`debug\` | boolean | Enable debug logging (optional) |

## Development

\`\`\`bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Watch mode
npm run dev
\`\`\`

## License

MIT
`

const gitignore = `node_modules
dist
.env
*.log
.DS_Store
`

// Write files
console.log('📝 Creating files...')

await writeFile(
  path.join(pluginDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
)
console.log('   ✓ package.json')

await writeFile(
  path.join(pluginDir, 'tsconfig.json'),
  JSON.stringify(tsconfig, null, 2)
)
console.log('   ✓ tsconfig.json')

await writeFile(path.join(pluginDir, 'src', 'index.ts'), pluginTemplate)
console.log('   ✓ src/index.ts')

await writeFile(path.join(pluginDir, 'test', 'index.test.ts'), testTemplate)
console.log('   ✓ test/index.test.ts')

await writeFile(path.join(pluginDir, 'README.md'), readme)
console.log('   ✓ README.md')

await writeFile(path.join(pluginDir, '.gitignore'), gitignore)
console.log('   ✓ .gitignore')

// Success message
console.log(`\n✅ Plugin created successfully!\n`)
console.log('Next steps:')
console.log(`   cd ${pluginName}`)
console.log(`   npm install`)
console.log(`   npm run dev\n`)
console.log('Documentation:')
console.log('   https://github.com/markdorsi/uni-ai/blob/main/PLUGIN_DEVELOPMENT.md\n')

// Helper functions
function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

function toPascalCase(str) {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

function toConstantCase(str) {
  return str.replace(/-/g, '_').toUpperCase()
}
