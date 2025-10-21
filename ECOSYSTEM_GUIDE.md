# Building the Plugin Ecosystem - Making It Extensible

This guide shows how we make it **easy for anyone** to create, publish, and discover Uni AI security plugins.

## The Extensibility Model

### What "Extensible" Means Here

**Extensible = Third parties can build integrations in minutes without:**
1. Forking the SDK
2. Understanding SDK internals
3. Maintaining compatibility
4. Coordinating with us

**They just:**
1. Use our plugin template
2. Call their API
3. Publish to npm
4. Users discover and install

---

## The Ecosystem Stack

```
┌─────────────────────────────────────────────────────────┐
│  Discovery Layer                                        │
│  • npm search (keyword: uni-ai-plugin)                 │
│  • Plugin registry at docs.uni-ai.dev/plugins         │
│  • GitHub topic: uni-ai-plugin                         │
│  • Community marketplace                               │
└───────────────────┬─────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────┐
│  Distribution Layer                                     │
│  • npm packages (@company/uni-ai-plugin-name)          │
│  • GitHub releases                                      │
│  • Version management (semver)                         │
└───────────────────┬─────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────┐
│  Development Layer                                      │
│  • Plugin template generator (create-plugin.mjs)       │
│  • Starter package (@uni-ai/plugin-template)           │
│  • TypeScript types from @uni-ai/sdk                   │
│  • Testing utilities                                    │
└───────────────────┬─────────────────────────────────────┘
                    │
┌─────────────────────────────────────────────────────────┐
│  Core Layer                                             │
│  • @uni-ai/sdk with plugin API                         │
│  • Plugin registry                                      │
│  • 7 extensibility hooks                               │
└─────────────────────────────────────────────────────────┘
```

---

## For Third-Party Developers: "In Minutes" Workflow

### Step 1: Generate Plugin (30 seconds)

```bash
# Option A: Use our generator (fastest)
npx create-uni-ai-plugin my-service

# Option B: Clone starter template
git clone https://github.com/uni-ai/plugin-template
cd plugin-template
npm install
```

**Generated structure:**
```
my-service/
├── src/
│   └── index.ts          # Plugin implementation (all 7 hooks)
├── test/
│   └── index.test.ts     # Test suite
├── package.json          # NPM config with proper keywords
├── tsconfig.json         # TypeScript config
├── README.md             # Usage documentation
└── .gitignore
```

### Step 2: Implement Your Logic (5 minutes)

```typescript
// src/index.ts (pre-generated with TODOs)

import { SecurityPlugin, PluginContext } from '@uni-ai/sdk'

export function createMyServicePlugin(config: {
  apiKey: string
  endpoint?: string
}): SecurityPlugin {
  const endpoint = config.endpoint || 'https://api.myservice.com'

  return {
    metadata: {
      name: 'my-service',
      version: '1.0.0',
      description: 'My security service integration',
      author: 'My Company',
      homepage: 'https://myservice.com/uni-ai-plugin'
    },

    hooks: {
      // TODO comments guide you:
      // "Add your PII detection API call here"
      async piiDetection(text, context) {
        // Replace TODO with your API call
        const response = await fetch(`${endpoint}/detect-pii`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text })
        })

        const { entities } = await response.json()

        // Transform to plugin format (template shows how)
        let redacted = text
        for (const entity of entities) {
          redacted = redacted.replace(
            entity.value,
            `[${entity.type}-REDACTED]`
          )
        }

        return {
          detected: entities.length > 0,
          patterns: entities.map(e => e.type),
          redacted,
          entities
        }
      }
    }
  }
}

// Auto-generated default export
export const myServicePlugin = createMyServicePlugin({
  apiKey: process.env.MY_SERVICE_API_KEY || ''
})
```

### Step 3: Test (2 minutes)

```bash
# Pre-configured test suite
npm test

# Tests pass → ready to publish
```

### Step 4: Publish to npm (2 minutes)

```bash
# Update package.json version
npm version 1.0.0

# Publish (keywords already set for discovery)
npm publish --access public

# ✅ Now anyone can: npm install @mycompany/uni-ai-plugin-myservice
```

### Step 5: Register in Plugin Registry (1 minute)

```bash
# Submit to official registry
curl -X POST https://registry.uni-ai.dev/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "@mycompany/uni-ai-plugin-myservice",
    "description": "My security service integration",
    "homepage": "https://myservice.com/uni-ai",
    "category": "pii-detection"
  }'

# Or create PR to plugin registry repo
```

**Total Time: 10 minutes**

---

## Discovery Mechanisms

### 1. npm Search

**Convention**: All plugins use keyword `uni-ai-plugin`

```bash
# Users can discover plugins
npm search uni-ai-plugin

# Results:
# @daxa/uni-ai-plugin          Daxa.ai HIPAA/GDPR compliance
# @securiti/uni-ai-plugin      Securiti multi-regulation compliance
# @mycompany/uni-ai-plugin-x   My security service
```

**package.json template includes:**
```json
{
  "keywords": [
    "uni-ai",
    "uni-ai-plugin",
    "security",
    "ai-governance"
  ]
}
```

### 2. Official Plugin Registry

**Website**: `https://docs.uni-ai.dev/plugins/registry`

**Features:**
- Searchable catalog
- Categories (PII Detection, Moderation, Rate Limiting, etc.)
- Ratings and downloads
- Documentation links
- Verified badges

**Example listing:**
```
┌─────────────────────────────────────────────────────┐
│ Daxa.ai Plugin                    ★★★★★ (45 reviews)│
│ @daxa/uni-ai-plugin                   12k downloads │
│                                                      │
│ TwinGuard architecture for HIPAA/GDPR compliance    │
│                                                      │
│ Categories: PII Detection, Compliance, Access Control│
│ Verified Publisher ✓                                │
│                                                      │
│ [Install] [Documentation] [GitHub]                  │
└─────────────────────────────────────────────────────┘
```

### 3. GitHub Topics

**Convention**: Tag repos with `uni-ai-plugin`

```bash
# Find plugins on GitHub
https://github.com/topics/uni-ai-plugin

# Example repos:
# daxa-ai/uni-ai-plugin
# securiti/uni-ai-plugin
# mycompany/uni-ai-plugin-myservice
```

### 4. In-SDK Discovery (Future)

```typescript
import { discoverPlugins } from '@uni-ai/sdk'

// Discover available plugins
const plugins = await discoverPlugins({
  category: 'pii-detection',
  verified: true
})

// [{ name: '@daxa/uni-ai-plugin', description: '...', downloads: 12000 }]
```

---

## Plugin Template Package

### Create Starter Template as npm Package

```bash
npm install -g create-uni-ai-plugin

# Or use npx
npx create-uni-ai-plugin my-service
```

**What it includes:**

**1. Full TypeScript Setup**
```json
{
  "name": "@mycompany/uni-ai-plugin-myservice",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "@uni-ai/sdk": "^0.1.0"
  },
  "keywords": ["uni-ai", "uni-ai-plugin"]
}
```

**2. Pre-wired Hooks**
```typescript
// All 7 hooks with:
// ✓ Type signatures
// ✓ Example API calls (commented)
// ✓ Error handling
// ✓ Debug logging
// ✓ Documentation comments
```

**3. Test Suite**
```typescript
// Pre-configured tests for:
// ✓ Plugin metadata
// ✓ Hook execution
// ✓ Error handling
// ✓ Integration with SDK
```

**4. Documentation Template**
```markdown
# My Service Plugin

## Installation
`npm install @mycompany/uni-ai-plugin-myservice`

## Usage
[Pre-filled with your plugin name]

## Configuration
[Table template]

## Development
[Build/test/publish commands]
```

---

## Categories and Classification

### Plugin Categories

To make plugins discoverable, we define standard categories:

**1. PII Detection & Data Classification**
- Detect sensitive data (SSN, credit cards, etc.)
- ML-based entity recognition
- Custom data types
- Examples: Daxa, Presidio, AWS Comprehend

**2. Content Moderation**
- Toxicity detection
- Hate speech detection
- NSFW content
- Examples: OpenAI Moderation, Perspective API

**3. Compliance & Governance**
- HIPAA, GDPR, CCPA enforcement
- Policy guardrails
- Regulatory compliance
- Examples: Securiti, IBM Guardium, Microsoft Purview

**4. Access Control & Authentication**
- User permissions
- Role-based access
- Identity verification
- Examples: Daxa TwinGuard, Okta, Auth0

**5. Rate Limiting & Quotas**
- Request throttling
- Usage quotas
- Cost management
- Examples: Redis, Upstash, custom

**6. Audit & Logging**
- Security event logging
- Compliance audit trails
- Analytics
- Examples: Datadog, Splunk, custom

**7. Risk Management**
- AI model risk scoring
- Prompt injection detection
- Jailbreak prevention
- Examples: IBM Guardium, Lakera Guard

### Classification in package.json

```json
{
  "keywords": [
    "uni-ai-plugin",
    "pii-detection",      // Primary category
    "compliance",         // Secondary category
    "hipaa",             // Specific tags
    "gdpr"
  ],
  "uni-ai": {
    "category": "pii-detection",
    "features": ["redaction", "classification", "entity-recognition"],
    "regulations": ["HIPAA", "GDPR", "CCPA"],
    "verified": true
  }
}
```

---

## Plugin Quality Standards

### Verification Badges

**Verified Plugin** - Meets quality standards:
- ✅ Full test coverage (>80%)
- ✅ TypeScript types included
- ✅ Documentation complete
- ✅ Security audit passed
- ✅ Regular maintenance

**Certified Plugin** - Official partnership:
- ✅ All verified requirements
- ✅ Direct support from vendor
- ✅ SLA guarantees
- ✅ Priority bug fixes

### Quality Checklist

For plugins to be listed in official registry:

```markdown
## Code Quality
- [ ] TypeScript with strict mode
- [ ] Test coverage > 80%
- [ ] No security vulnerabilities (npm audit)
- [ ] Follows plugin API conventions

## Documentation
- [ ] README with examples
- [ ] API reference
- [ ] Configuration options documented
- [ ] Error handling documented

## Security
- [ ] API keys never hardcoded
- [ ] Secure credential handling
- [ ] Input validation
- [ ] Rate limit handling

## Maintenance
- [ ] GitHub repo with issues enabled
- [ ] Semantic versioning
- [ ] Changelog maintained
- [ ] Responsive to issues (<7 days)
```

---

## Example: Third-Party Creates Plugin

### Scenario: "SecureAI Corp" wants to integrate their service

**Day 1: Development**

```bash
# 9:00 AM - Generate plugin
npx create-uni-ai-plugin secureai

# 9:01 AM - Review generated code
cd secureai
code .

# 9:05 AM - Add API integration
# Edit src/index.ts, replace TODOs with API calls

# 9:15 AM - Test locally
npm test
✅ All tests pass

# 9:20 AM - Publish to npm
npm publish --access public
✅ @secureai/uni-ai-plugin published

# 9:25 AM - Submit to registry
# Create PR to uni-ai/plugin-registry

# Total: 25 minutes
```

**Day 2: Users adopt**

```bash
# Any developer can now:
npm install @secureai/uni-ai-plugin

# And use immediately:
import { registerPlugin } from '@uni-ai/sdk'
import { secureAiPlugin } from '@secureai/uni-ai-plugin'

await registerPlugin(secureAiPlugin, {
  config: { apiKey: process.env.SECURE_AI_KEY }
})

const response = await ai('gpt-4', prompt)
# ✅ SecureAI policies enforced automatically
```

**Day 3: Discovery**

Users find it via:
1. npm search: `npm search uni-ai-plugin security`
2. Registry: Browse "Content Moderation" category
3. GitHub: Search topic `uni-ai-plugin`
4. Word of mouth: "Check out @secureai/uni-ai-plugin"

---

## Making It Zero-Friction

### For Plugin Developers

**What they DON'T need:**
- ❌ Fork the SDK
- ❌ Understand SDK internals
- ❌ Coordinate releases with us
- ❌ Maintain compatibility manually
- ❌ Write boilerplate

**What they DO need:**
- ✅ Know their own API
- ✅ Run one command: `npx create-uni-ai-plugin name`
- ✅ Fill in TODOs with their API calls
- ✅ Publish to npm

### For Plugin Users

**What they DON'T need:**
- ❌ Change existing code
- ❌ Switch SDKs
- ❌ Manage dependencies manually

**What they DO need:**
- ✅ Install plugin: `npm install plugin-name`
- ✅ Register once: `await registerPlugin(plugin)`
- ✅ Use SDK normally: `await ai('gpt-4', prompt)`

---

## Plugin Development Workflow

### Complete Example: Building a New Plugin

```bash
# 1. Generate (30 sec)
npx create-uni-ai-plugin my-compliance-checker

# 2. Review structure (1 min)
cd my-compliance-checker
ls -la
# src/index.ts         ← Your implementation
# test/index.test.ts   ← Pre-configured tests
# package.json         ← Ready to publish
# README.md            ← Documentation template

# 3. Implement (5 min)
code src/index.ts

# Template shows exactly where to add your code:
async validation(context) {
  // TODO: Add your validation logic here
  //
  // Example API call:
  // const response = await fetch(`${endpoint}/validate`, {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${apiKey}` },
  //   body: JSON.stringify({ prompt: context.options.prompt })
  // })
  //
  // const { valid, error } = await response.json()
  // return { valid, error }

  // YOUR CODE HERE:
  const response = await fetch(/* your API */)
  // ...
  return { valid: true }
}

# 4. Test (2 min)
npm test
# ✅ 8 tests pass

# 5. Publish (2 min)
npm version 1.0.0
npm publish --access public
# ✅ @mycompany/uni-ai-plugin-my-compliance-checker published

# 6. Submit to registry (1 min)
curl -X POST https://registry.uni-ai.dev/submit \
  -d '{"name": "@mycompany/uni-ai-plugin-my-compliance-checker"}'
# ✅ Submitted for review

# Total: 11 minutes
```

---

## Community Contributions

### How Third Parties Contribute

**1. Official Integrations (Vendors)**
- Daxa.ai publishes `@daxa/uni-ai-plugin`
- Securiti publishes `@securiti/uni-ai-plugin`
- They maintain and support their plugins

**2. Community Plugins (Open Source)**
- Developers publish plugins for popular services
- Example: `@community/uni-ai-plugin-huggingface-moderation`
- Listed in community section of registry

**3. Private Plugins (Enterprises)**
- Companies build internal plugins
- Published to private npm registry
- Not listed publicly

### Contribution Guidelines

**Plugin Registry Repo**: `uni-ai/plugin-registry`

**To add your plugin:**

```bash
# 1. Fork repo
git clone https://github.com/uni-ai/plugin-registry
cd plugin-registry

# 2. Add your plugin
cat >> plugins.json << EOF
{
  "name": "@mycompany/uni-ai-plugin-myservice",
  "description": "My security service integration",
  "category": "pii-detection",
  "homepage": "https://myservice.com/uni-ai",
  "repository": "https://github.com/mycompany/uni-ai-plugin",
  "author": "My Company",
  "verified": false
}
EOF

# 3. Create PR
git add plugins.json
git commit -m "Add myservice plugin"
git push origin main
# Create PR on GitHub

# 4. Review process (automated)
# ✓ Check npm package exists
# ✓ Check TypeScript types
# ✓ Check test coverage
# ✓ Check documentation
# → Auto-approve if passes, or request changes
```

---

## Reference Implementation

### Plugin Starter Template Repository

**Location**: `https://github.com/uni-ai/plugin-template`

**Structure:**
```
plugin-template/
├── src/
│   └── index.ts              # Complete plugin implementation
├── test/
│   └── index.test.ts         # Full test suite
├── examples/
│   ├── basic-usage.ts        # Simple example
│   └── advanced-usage.ts     # Advanced example
├── docs/
│   └── API.md                # API documentation
├── package.json              # With all proper fields
├── tsconfig.json
├── .github/
│   └── workflows/
│       ├── test.yml          # Auto-test on PR
│       └── publish.yml       # Auto-publish on release
└── README.md                 # Complete documentation
```

**Use it:**
```bash
# Clone and customize
git clone https://github.com/uni-ai/plugin-template my-plugin
cd my-plugin
npm install

# Customize
sed -i 's/plugin-template/my-plugin/g' package.json
# Edit src/index.ts

# Publish
npm publish --access public
```

---

## Making Discoverability Automatic

### Plugin CLI Tool (Future)

```bash
# Install CLI
npm install -g @uni-ai/cli

# Discover plugins
uni-ai plugins search "pii detection"
# Results:
# @daxa/uni-ai-plugin           HIPAA/GDPR compliance
# @aws/uni-ai-plugin-comprehend AWS Comprehend PII
# @microsoft/uni-ai-plugin-dlp  Microsoft Purview DLP

# Install plugin
uni-ai plugins install @daxa/uni-ai-plugin

# List installed
uni-ai plugins list
# @daxa/uni-ai-plugin@1.2.3

# Update all
uni-ai plugins update
```

### In-App Plugin Manager (Future)

```typescript
import { PluginManager } from '@uni-ai/sdk'

const manager = new PluginManager()

// Discover
const available = await manager.discover({ category: 'pii-detection' })
// [{ name: '@daxa/uni-ai-plugin', ... }]

// Install (downloads from npm)
await manager.install('@daxa/uni-ai-plugin')

// Auto-register
await manager.enable('@daxa/uni-ai-plugin', { apiKey: '...' })

// Now all ai() calls use it
const response = await ai('gpt-4', prompt)
```

---

## Summary: The Extensibility Strategy

### What Makes It Extensible

**1. Standard Plugin API**
- Well-defined interface (SecurityPlugin)
- 7 clear hook points
- TypeScript types guarantee compatibility

**2. Zero-Dependency Development**
- Plugin template generator
- Pre-wired hooks with examples
- No SDK internals knowledge needed

**3. Standard Distribution**
- npm packages (standard ecosystem)
- Semantic versioning
- Peer dependency on @uni-ai/sdk

**4. Multiple Discovery Channels**
- npm search (keyword: uni-ai-plugin)
- Plugin registry website
- GitHub topics
- Community recommendations

**5. Quality Standards**
- Verification badges
- Automated quality checks
- Documentation requirements
- Security audits

### Result: Network Effects

```
More Plugins → More Users → More Plugins
     ↑                           ↓
  Easier to Build    ←    Easier to Discover
```

**As a third-party service provider:**
- 10 minutes to build plugin
- Instant access to all Uni AI users
- No maintenance burden

**As a developer:**
- 3 minutes to add governance
- Best-of-breed approach
- No vendor lock-in

**As Uni AI SDK:**
- Becomes standard integration layer
- Network effects compound
- Enterprise AI governance standard

This is how we make it extensible: **Remove all friction from building, publishing, and discovering plugins.**
