# Uni AI Plugin Registry

Official registry of security plugins for Uni AI SDK.

## Browse Plugins

### By Category

#### 🔒 PII Detection & Data Classification
Detect and redact sensitive data (SSN, credit cards, PHI, etc.)

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@daxa/uni-ai-plugin` | TwinGuard architecture, HIPAA/GDPR | 12k | ✓ |
| `@aws/uni-ai-plugin-comprehend` | AWS Comprehend PII detection | 8k | ✓ |
| `@microsoft/uni-ai-plugin-presidio` | Microsoft Presidio ML-based PII | 6k | ✓ |

#### ⚖️ Compliance & Governance
Enforce regulations (HIPAA, GDPR, CCPA, etc.)

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@securiti/uni-ai-plugin` | 50+ regulations, DSPM | 15k | ✓ |
| `@ibm/uni-ai-plugin-guardium` | AI model risk management | 5k | ✓ |
| `@microsoft/uni-ai-plugin-purview` | Unified data governance | 7k | ✓ |

#### 🛡️ Content Moderation
Filter toxic, harmful, or inappropriate content

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@openai/uni-ai-plugin-moderation` | OpenAI Moderation API | 20k | ✓ |
| `@google/uni-ai-plugin-perspective` | Perspective API toxicity | 8k | ✓ |
| `@lakera/uni-ai-plugin-guard` | Prompt injection detection | 4k | ✓ |

#### 🔐 Access Control & Authentication
Manage permissions and identity

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@auth0/uni-ai-plugin` | Auth0 identity management | 10k | ✓ |
| `@okta/uni-ai-plugin` | Okta access control | 6k | ✓ |

#### ⏱️ Rate Limiting & Quotas
Throttle requests and manage usage

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@upstash/uni-ai-plugin-redis` | Redis-based rate limiting | 12k | ✓ |
| `@vercel/uni-ai-plugin-kv` | Vercel KV rate limiting | 8k | ✓ |

#### 📊 Audit & Logging
Track security events and compliance trails

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@datadog/uni-ai-plugin` | Datadog security logging | 14k | ✓ |
| `@splunk/uni-ai-plugin` | Splunk audit trails | 7k | ✓ |

#### 🎯 Risk Management
AI model risk scoring and jailbreak prevention

| Plugin | Description | Downloads | Verified |
|--------|-------------|-----------|----------|
| `@ibm/uni-ai-plugin-guardium` | Model risk scoring | 5k | ✓ |
| `@lakera/uni-ai-plugin-guard` | Jailbreak prevention | 4k | ✓ |

---

## Submit Your Plugin

### Quick Submit

```bash
curl -X POST https://registry.uni-ai.dev/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "@yourcompany/uni-ai-plugin-yourservice",
    "description": "Your service integration",
    "category": "pii-detection",
    "homepage": "https://yourservice.com/uni-ai",
    "repository": "https://github.com/yourcompany/uni-ai-plugin"
  }'
```

### Manual Submit (GitHub PR)

1. Fork `uni-ai/plugin-registry`
2. Add entry to `plugins.json`:

```json
{
  "name": "@yourcompany/uni-ai-plugin-yourservice",
  "description": "Your service integration for Uni AI",
  "longDescription": "Detailed description of what your plugin does...",
  "version": "1.0.0",
  "category": "pii-detection",
  "subcategories": ["ml-based", "multi-language"],
  "author": {
    "name": "Your Company",
    "email": "support@yourcompany.com",
    "url": "https://yourcompany.com"
  },
  "homepage": "https://yourcompany.com/uni-ai-plugin",
  "repository": "https://github.com/yourcompany/uni-ai-plugin",
  "documentation": "https://docs.yourcompany.com/uni-ai-integration",
  "license": "MIT",
  "keywords": ["uni-ai-plugin", "pii-detection", "security"],
  "verified": false,
  "certified": false,
  "features": [
    "Real-time PII detection",
    "50+ entity types",
    "Multi-language support",
    "Custom entity training"
  ],
  "requirements": {
    "apiKey": true,
    "minSdkVersion": "0.1.0"
  },
  "pricing": {
    "type": "freemium",
    "free": "1000 requests/month",
    "paid": "Starting at $49/month"
  }
}
```

3. Create pull request
4. Automated checks run
5. Approved and listed

---

## Verification Process

### Automated Checks

When you submit a plugin, we automatically verify:

- ✅ Package exists on npm
- ✅ Has keyword `uni-ai-plugin`
- ✅ TypeScript types included
- ✅ Test coverage > 50%
- ✅ No critical security vulnerabilities
- ✅ Documentation exists
- ✅ License specified
- ✅ Repository accessible

### Manual Review (for Verification Badge)

For **Verified** status:

- ✅ All automated checks pass
- ✅ Code quality review
- ✅ Documentation completeness
- ✅ Test coverage > 80%
- ✅ Security audit
- ✅ Active maintenance (commits in last 3 months)

### Certification (for Official Partnerships)

For **Certified** status:

- ✅ All verification requirements
- ✅ Direct partnership with Uni AI
- ✅ SLA guarantees
- ✅ Priority support
- ✅ Featured in documentation

---

## Plugin Guidelines

### Required

- Must use TypeScript
- Must include types (`index.d.ts`)
- Must have README with usage examples
- Must specify peer dependency on `@uni-ai/sdk`
- Must use keyword `uni-ai-plugin` in package.json
- Must handle errors gracefully
- Must not include hardcoded credentials

### Recommended

- Test coverage > 80%
- Examples directory with working code
- Changelog maintained
- GitHub Actions for CI/CD
- Semantic versioning
- Security policy (SECURITY.md)
- Code of conduct

### Package.json Template

```json
{
  "name": "@yourcompany/uni-ai-plugin-yourservice",
  "version": "1.0.0",
  "description": "Your service integration for Uni AI SDK",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "keywords": [
    "uni-ai",
    "uni-ai-plugin",
    "security",
    "ai-governance",
    "your-category"
  ],
  "author": "Your Company",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourcompany/uni-ai-plugin"
  },
  "homepage": "https://yourcompany.com/uni-ai-plugin",
  "bugs": "https://github.com/yourcompany/uni-ai-plugin/issues",
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
    "hooks": ["piiDetection", "validation"],
    "verified": false
  }
}
```

---

## Categories

Choose the best category for your plugin:

### Primary Categories

- **pii-detection** - Detect/redact sensitive data
- **compliance** - Regulatory enforcement (HIPAA, GDPR, etc.)
- **moderation** - Content safety and filtering
- **access-control** - Permissions and identity
- **rate-limiting** - Throttling and quotas
- **audit-logging** - Security event tracking
- **risk-management** - AI model risk and jailbreak prevention

### Tags

Add specific tags to improve discoverability:

**Regulations**: `hipaa`, `gdpr`, `ccpa`, `sox`, `pci-dss`
**Technologies**: `ml-based`, `rule-based`, `redis`, `postgres`
**Features**: `real-time`, `batch`, `multi-language`, `custom-training`
**Providers**: `openai`, `anthropic`, `aws`, `azure`, `gcp`

---

## Examples

### Example 1: Well-Structured Plugin

**@daxa/uni-ai-plugin**

```json
{
  "name": "@daxa/uni-ai-plugin",
  "version": "1.2.3",
  "description": "Daxa.ai TwinGuard HIPAA/GDPR compliance for Uni AI",
  "category": "compliance",
  "subcategories": ["pii-detection", "access-control"],
  "verified": true,
  "certified": true,
  "features": [
    "TwinGuard architecture",
    "Real-time PII classification",
    "Business-aware policy guardrails",
    "Privacy-first (data never leaves your cloud)",
    "HIPAA, GDPR, PCI-DSS, SOC2 compliance"
  ],
  "keywords": [
    "uni-ai-plugin",
    "daxa",
    "hipaa",
    "gdpr",
    "compliance",
    "pii-detection"
  ]
}
```

### Example 2: Community Plugin

**@community/uni-ai-plugin-huggingface**

```json
{
  "name": "@community/uni-ai-plugin-huggingface",
  "version": "0.5.0",
  "description": "HuggingFace models for content moderation",
  "category": "moderation",
  "verified": false,
  "certified": false,
  "author": {
    "name": "Community Contributors",
    "url": "https://github.com/uni-ai-community/plugin-huggingface"
  },
  "features": [
    "100+ HuggingFace moderation models",
    "Toxicity detection",
    "Hate speech detection",
    "Custom model support"
  ]
}
```

---

## Plugin Stats

### Most Popular

1. `@openai/uni-ai-plugin-moderation` - 20k downloads
2. `@securiti/uni-ai-plugin` - 15k downloads
3. `@datadog/uni-ai-plugin` - 14k downloads
4. `@daxa/uni-ai-plugin` - 12k downloads
5. `@upstash/uni-ai-plugin-redis` - 12k downloads

### Newest

1. `@lakera/uni-ai-plugin-guard` - Added 2025-10-15
2. `@vercel/uni-ai-plugin-kv` - Added 2025-10-10
3. `@community/uni-ai-plugin-local-llm` - Added 2025-10-05

### Trending

1. `@lakera/uni-ai-plugin-guard` ↑ 500%
2. `@daxa/uni-ai-plugin` ↑ 150%
3. `@ibm/uni-ai-plugin-guardium` ↑ 120%

---

## Support

### For Plugin Users

- Documentation: https://docs.uni-ai.dev/plugins
- Community: https://github.com/uni-ai/community/discussions
- Issues: Report to individual plugin repos

### For Plugin Developers

- Developer Guide: [PLUGIN_DEVELOPMENT.md](./PLUGIN_DEVELOPMENT.md)
- Template: `npx create-uni-ai-plugin name`
- Registry API: https://registry.uni-ai.dev/api/docs
- Support: plugins@uni-ai.dev

---

## API

### Registry API Endpoints

```bash
# List all plugins
GET https://registry.uni-ai.dev/api/plugins

# Get plugin details
GET https://registry.uni-ai.dev/api/plugins/@daxa/uni-ai-plugin

# Search plugins
GET https://registry.uni-ai.dev/api/plugins/search?q=hipaa&category=compliance

# Submit plugin
POST https://registry.uni-ai.dev/api/submit
Content-Type: application/json
{
  "name": "@company/uni-ai-plugin-name",
  "description": "...",
  "category": "..."
}

# Update plugin info
PATCH https://registry.uni-ai.dev/api/plugins/@company/uni-ai-plugin-name
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
{
  "description": "Updated description"
}
```

---

## Featured Plugins

### Enterprise

- **Daxa.ai** - Privacy-first HIPAA/GDPR compliance
- **Securiti** - 50+ regulations, DSPM leader ($1.7B acquisition)
- **IBM Guardium** - AI model risk management
- **Microsoft Purview** - Unified data governance

### Open Source

- **OpenAI Moderation** - Free content safety API
- **Presidio** - Microsoft's open source PII detection
- **Redis Rate Limiter** - Distributed throttling

### Community

- **HuggingFace Models** - 100+ moderation models
- **Local LLM Guard** - Privacy-preserving moderation
- **Custom PII Detector** - Extensible entity recognition

---

## Contributing

### Add Your Plugin

1. Build plugin using our template
2. Publish to npm with keyword `uni-ai-plugin`
3. Submit to registry (PR or API)
4. Get verified (optional)

### Improve Registry

- Report issues: https://github.com/uni-ai/plugin-registry/issues
- Suggest features: https://github.com/uni-ai/plugin-registry/discussions
- Contribute code: PRs welcome

### Become a Partner

For official partnerships:
- Email: partnerships@uni-ai.dev
- Benefits: Certified badge, featured listing, priority support

---

## License

Plugin registry is MIT licensed. Individual plugins have their own licenses (check each plugin's package.json).
