# Enterprise AI Governance Platform Integrations

This guide shows how to integrate enterprise AI governance platforms like Daxa.ai, Securiti, IBM Guardium, and others with Uni AI SDK.

## Overview

These platforms provide:
- **Data Classification**: Detect PII, PHI, confidential data
- **Policy Enforcement**: Business-aware guardrails
- **Compliance Monitoring**: GDPR, HIPAA, SOC2, PCI-DSS
- **Access Control**: Identity-based permissions
- **Audit Trails**: Complete lineage and logging
- **AI Model Governance**: Model risk management

## Integration Points

| Platform Feature | Plugin Hook | Purpose |
|-----------------|-------------|---------|
| Data Classification | `piiDetection` | Detect sensitive data in prompts |
| Policy Guardrails | `validation` | Enforce business rules |
| Access Control | `beforeValidation` | Check user permissions |
| Compliance Checks | `moderation` | Verify regulatory compliance |
| Audit Logging | `afterSecurity` | Record all interactions |
| Incident Response | `onSecurityError` | Handle policy violations |

---

## 1. Daxa.ai Integration

### Features
- TwinGuard architecture with SafeConnectors
- Data classification and discovery
- Business-aware policy guardrails
- Real-time compliance monitoring
- Privacy-first (data never leaves your cloud)

### Example Plugin

```typescript
import type { SecurityPlugin, PluginContext } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

interface DaxaConfig {
  apiKey: string
  endpoint?: string
  enforcementMode?: 'block' | 'warn' | 'audit'
  policies?: string[]
}

export function createDaxaPlugin(config: DaxaConfig): SecurityPlugin {
  return {
    metadata: {
      name: 'daxa-ai',
      version: '1.0.0',
      description: 'Daxa.ai AI security and compliance',
      homepage: 'https://daxa.ai',
    },

    config: {
      enabled: true,
      priority: PluginPriority.HIGH,
    },

    hooks: {
      // Check access permissions before processing
      async beforeValidation(context) {
        const response = await fetch(`${config.endpoint}/api/v1/check-access`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: context.userId,
            model: context.options.model,
            operation: 'generate',
          }),
        })

        const { allowed, reason } = await response.json()

        if (!allowed) {
          throw new Error(`Access denied: ${reason}`)
        }

        return context.options
      },

      // Classify data and detect sensitive information
      async piiDetection(text, context) {
        const response = await fetch(`${config.endpoint}/api/v1/classify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            userId: context.userId,
            policies: config.policies,
          }),
        })

        const data = await response.json()

        // data.classifications: [{ type: 'PII', category: 'SSN', start: 10, end: 20, confidence: 0.98 }]
        const entities = data.classifications.map((c: any) => ({
          type: c.category,
          text: text.substring(c.start, c.end),
          start: c.start,
          end: c.end,
          confidence: c.confidence,
        }))

        // Redact based on enforcement mode
        let redacted = text
        const patterns: string[] = []

        if (config.enforcementMode === 'block') {
          for (const entity of entities) {
            redacted = redacted.replace(
              entity.text,
              `[${entity.type}-REDACTED]`
            )
            patterns.push(entity.type)
          }
        }

        return {
          detected: entities.length > 0,
          patterns: [...new Set(patterns)],
          redacted,
          entities,
        }
      },

      // Enforce policy guardrails
      async moderation(text, context) {
        const response = await fetch(`${config.endpoint}/api/v1/policy-check`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            userId: context.userId,
            policies: config.policies,
          }),
        })

        const data = await response.json()

        // data.violations: [{ policy: 'PCI-DSS', severity: 'high', reason: '...' }]
        const violations = data.violations || []

        if (violations.length > 0 && config.enforcementMode === 'block') {
          return {
            safe: false,
            categories: violations.map((v: any) => v.policy),
            action: 'block',
            reason: violations[0].reason,
          }
        }

        return {
          safe: violations.length === 0,
          categories: violations.map((v: any) => v.policy),
          action: violations.length > 0 ? 'warn' : 'allow',
        }
      },

      // Audit all interactions
      async afterSecurity(context, results) {
        await fetch(`${config.endpoint}/api/v1/audit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            userId: context.userId,
            model: context.options.model,
            securityChecks: results,
            status: 'passed',
          }),
        })
      },

      // Log security violations
      async onSecurityError(error, context) {
        await fetch(`${config.endpoint}/api/v1/audit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            userId: context.userId,
            model: context.options.model,
            error: error.message,
            status: 'failed',
          }),
        })
      },
    },
  }
}

// Usage
const daxaPlugin = createDaxaPlugin({
  apiKey: process.env.DAXA_API_KEY!,
  endpoint: 'https://api.daxa.ai',
  enforcementMode: 'block',
  policies: ['PCI-DSS', 'HIPAA', 'GDPR'],
})
```

---

## 2. Securiti AI Integration

### Features
- Data Security Posture Management (DSPM)
- Privacy engineering
- AI/ML governance
- Compliance automation (50+ regulations)
- Data discovery and classification

### Example Plugin

```typescript
import type { SecurityPlugin } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

interface SecuritiConfig {
  apiKey: string
  tenantId: string
  endpoint?: string
  regulations?: string[]
}

export function createSecuritiPlugin(config: SecuritiConfig): SecurityPlugin {
  return {
    metadata: {
      name: 'securiti-ai',
      version: '1.0.0',
      description: 'Securiti AI governance and compliance',
      homepage: 'https://securiti.ai',
    },

    config: {
      enabled: true,
      priority: PluginPriority.HIGH,
    },

    hooks: {
      async validation(context) {
        // Check for regulated data patterns
        const response = await fetch(
          `${config.endpoint || 'https://api.securiti.ai'}/v1/scan`,
          {
            method: 'POST',
            headers: {
              'X-API-Key': config.apiKey,
              'X-Tenant-Id': config.tenantId,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: context.options.prompt,
              regulations: config.regulations,
              scanType: 'realtime',
            }),
          }
        )

        const { violations, risk_score } = await response.json()

        if (violations.length > 0) {
          return {
            valid: false,
            error: `Regulatory violations detected: ${violations.map((v: any) => v.regulation).join(', ')}`,
            metadata: { violations, risk_score },
          }
        }

        return {
          valid: true,
          metadata: { risk_score },
        }
      },

      async piiDetection(text, context) {
        const response = await fetch(
          `${config.endpoint || 'https://api.securiti.ai'}/v1/classify`,
          {
            method: 'POST',
            headers: {
              'X-API-Key': config.apiKey,
              'X-Tenant-Id': config.tenantId,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              classifiers: ['PII', 'PHI', 'PCI', 'CONFIDENTIAL'],
            }),
          }
        )

        const { entities } = await response.json()

        // Auto-redact detected sensitive data
        let redacted = text
        const patterns: string[] = []

        for (const entity of entities) {
          redacted = redacted.replace(
            text.substring(entity.start, entity.end),
            `[${entity.type}-REDACTED]`
          )
          patterns.push(entity.type)
        }

        return {
          detected: entities.length > 0,
          patterns: [...new Set(patterns)],
          redacted,
          entities,
        }
      },
    },
  }
}
```

---

## 3. IBM Guardium AI Security Integration

### Features
- AI model risk management
- Data lineage tracking
- Policy enforcement
- Unified security and governance
- Integration with watsonx.governance

### Example Plugin

```typescript
import type { SecurityPlugin } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

interface GuardiumConfig {
  apiKey: string
  instanceId: string
  endpoint?: string
  riskThreshold?: number
}

export function createGuardiumPlugin(config: GuardiumConfig): SecurityPlugin {
  return {
    metadata: {
      name: 'ibm-guardium',
      version: '1.0.0',
      description: 'IBM Guardium AI Security',
      homepage: 'https://www.ibm.com/guardium',
    },

    config: {
      enabled: true,
      priority: PluginPriority.HIGH,
    },

    hooks: {
      async beforeValidation(context) {
        // Check model risk score
        const response = await fetch(
          `${config.endpoint || 'https://api.guardium.ibm.com'}/v1/models/${context.options.model}/risk`,
          {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'X-Instance-ID': config.instanceId,
            },
          }
        )

        const { risk_score, risk_factors } = await response.json()

        if (risk_score > (config.riskThreshold || 0.7)) {
          throw new Error(
            `Model risk score (${risk_score}) exceeds threshold. Factors: ${risk_factors.join(', ')}`
          )
        }

        // Attach model metadata
        context.metadata.guardium = {
          risk_score,
          risk_factors,
        }

        return context.options
      },

      async afterSecurity(context, results) {
        // Record lineage and audit trail
        await fetch(
          `${config.endpoint || 'https://api.guardium.ibm.com'}/v1/audit`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'X-Instance-ID': config.instanceId,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              timestamp: new Date().toISOString(),
              user: context.userId,
              model: context.options.model,
              risk_score: context.metadata.guardium?.risk_score,
              security_results: results,
              status: 'passed',
            }),
          }
        )
      },
    },
  }
}
```

---

## 4. Microsoft Purview Integration

### Features
- Unified data governance
- Sensitivity labeling
- Data loss prevention (DLP)
- Compliance management
- AI data security

### Example Plugin

```typescript
import type { SecurityPlugin } from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

interface PurviewConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  endpoint?: string
}

export function createPurviewPlugin(config: PurviewConfig): SecurityPlugin {
  let accessToken: string | null = null

  async function getAccessToken() {
    if (accessToken) return accessToken

    const response = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          scope: 'https://purview.azure.net/.default',
          grant_type: 'client_credentials',
        }),
      }
    )

    const { access_token } = await response.json()
    accessToken = access_token
    return accessToken
  }

  return {
    metadata: {
      name: 'microsoft-purview',
      version: '1.0.0',
      description: 'Microsoft Purview data governance',
      homepage: 'https://www.microsoft.com/purview',
    },

    config: {
      enabled: true,
      priority: PluginPriority.HIGH,
    },

    hooks: {
      async piiDetection(text, context) {
        const token = await getAccessToken()

        // Use Purview's sensitivity labeling API
        const response = await fetch(
          `${config.endpoint || 'https://api.purview.azure.com'}/catalog/api/atlas/v2/entity/classification`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              classificationTypes: ['PII', 'Confidential', 'Highly Confidential'],
            }),
          }
        )

        const { classifications } = await response.json()

        const patterns = classifications.map((c: any) => c.typeName)
        let redacted = text

        // Apply DLP policies
        for (const classification of classifications) {
          if (classification.severity === 'High') {
            redacted = redacted.replace(
              classification.value,
              `[${classification.typeName}-REDACTED]`
            )
          }
        }

        return {
          detected: classifications.length > 0,
          patterns: [...new Set(patterns)],
          redacted,
          entities: classifications,
        }
      },
    },
  }
}
```

---

## 5. Multi-Platform Integration Example

Combine multiple enterprise platforms:

```typescript
import { registerPlugin, ai } from '@uni-ai/sdk'
import { createDaxaPlugin } from './daxa-plugin'
import { createSecuritiPlugin } from './securiti-plugin'
import { createGuardiumPlugin } from './guardium-plugin'

// Register all enterprise governance platforms
await registerPlugin(
  createDaxaPlugin({
    apiKey: process.env.DAXA_API_KEY!,
    enforcementMode: 'block',
    policies: ['HIPAA', 'GDPR'],
  })
)

await registerPlugin(
  createSecuritiPlugin({
    apiKey: process.env.SECURITI_API_KEY!,
    tenantId: process.env.SECURITI_TENANT_ID!,
    regulations: ['HIPAA', 'GDPR', 'CCPA'],
  })
)

await registerPlugin(
  createGuardiumPlugin({
    apiKey: process.env.GUARDIUM_API_KEY!,
    instanceId: process.env.GUARDIUM_INSTANCE_ID!,
    riskThreshold: 0.6,
  })
)

// Use SDK normally - all platforms enforce policies
try {
  const response = await ai(
    'gpt-4',
    'Analyze this patient data: ...',
    { security: 'strict' }
  )
  console.log(response)
} catch (error) {
  // Unified error handling across all platforms
  console.error('Compliance violation:', error.message)
}
```

---

## Platform Comparison

| Platform | Best For | Key Strength | Integration Complexity |
|----------|----------|--------------|----------------------|
| **Daxa.ai** | Regulated industries | Privacy-first, TwinGuard | Medium |
| **Securiti** | Multi-regulation compliance | 50+ regulations, DSPM | Medium-High |
| **IBM Guardium** | Enterprise AI governance | Model risk, watsonx integration | High |
| **Microsoft Purview** | Microsoft ecosystem | Azure integration, DLP | Medium |
| **Holistic AI** | AI fairness & bias | ML model governance | Medium |
| **Cranium** | US government | Compliance automation | Medium |

---

## Benefits of Plugin Architecture

1. **Vendor Flexibility**: Switch or combine platforms without code changes
2. **Gradual Adoption**: Start with one platform, add more over time
3. **Cost Optimization**: Use different platforms for different use cases
4. **Best-of-Breed**: Combine strengths of multiple platforms
5. **Future-Proof**: Add new platforms as they emerge
6. **Unified Interface**: One SDK, multiple governance layers

---

## Next Steps

1. **Choose Platform(s)**: Based on your regulatory requirements
2. **Get API Credentials**: Sign up and obtain API keys
3. **Implement Plugin**: Use examples above as templates
4. **Test Policies**: Verify compliance rules work correctly
5. **Deploy**: Register plugins in production
6. **Monitor**: Track compliance metrics and violations

---

## Resources

- **Daxa.ai**: https://daxa.ai/product
- **Securiti**: https://securiti.ai/products/ai-security-governance/
- **IBM Guardium**: https://www.ibm.com/guardium
- **Microsoft Purview**: https://www.microsoft.com/security/business/microsoft-purview
- **Holistic AI**: https://www.holisticai.com
- **Gartner AI TRiSM**: Market guide for AI Trust, Risk and Security Management

---

## Support

For plugin development assistance:
- Read: [PLUGIN_DEVELOPMENT.md](../../packages/core/PLUGIN_DEVELOPMENT.md)
- Examples: [examples/plugins/](.)
- Issues: https://github.com/markdorsi/uni-ai/issues
