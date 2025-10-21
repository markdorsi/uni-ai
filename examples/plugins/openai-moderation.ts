/**
 * OpenAI Moderation Plugin
 *
 * Content moderation using OpenAI's Moderation API.
 * Detects potentially harmful content in 7 categories.
 *
 * @example
 * ```typescript
 * import { registerPlugin } from '@uni-ai/sdk'
 * import { openaiModerationPlugin } from './plugins/openai-moderation'
 *
 * await registerPlugin(openaiModerationPlugin, {
 *   config: {
 *     apiKey: process.env.OPENAI_API_KEY,
 *     blockCategories: ['hate', 'violence'],
 *     threshold: 0.5
 *   }
 * })
 * ```
 */

import type {
  SecurityPlugin,
  PluginContext,
  ModerationResult,
} from '@uni-ai/sdk'
import { PluginPriority } from '@uni-ai/sdk'

/**
 * OpenAI Moderation Categories
 */
type ModerationCategory =
  | 'hate'
  | 'hate/threatening'
  | 'harassment'
  | 'harassment/threatening'
  | 'self-harm'
  | 'self-harm/intent'
  | 'self-harm/instructions'
  | 'sexual'
  | 'sexual/minors'
  | 'violence'
  | 'violence/graphic'

/**
 * OpenAI Moderation API Response
 */
interface OpenAIModerationResponse {
  id: string
  model: string
  results: Array<{
    flagged: boolean
    categories: Record<ModerationCategory, boolean>
    category_scores: Record<ModerationCategory, number>
  }>
}

/**
 * Plugin configuration
 */
interface OpenAIModerationConfig {
  /** OpenAI API key (required) */
  apiKey?: string

  /** Moderation model (default: 'text-moderation-latest') */
  model?: string

  /** Categories to block (if not specified, blocks all flagged) */
  blockCategories?: ModerationCategory[]

  /** Confidence threshold (0-1, default: 0.5) */
  threshold?: number

  /** Action to take when content is flagged (default: 'block') */
  action?: 'block' | 'warn' | 'allow'

  /** Custom error message */
  errorMessage?: string

  /** API endpoint (for proxies/testing) */
  endpoint?: string
}

/**
 * Create OpenAI Moderation plugin
 */
export function createOpenAIModerationPlugin(
  config?: OpenAIModerationConfig
): SecurityPlugin {
  const cfg: Required<OpenAIModerationConfig> = {
    apiKey: config?.apiKey || process.env.OPENAI_API_KEY || '',
    model: config?.model || 'text-moderation-latest',
    blockCategories: config?.blockCategories || [],
    threshold: config?.threshold || 0.5,
    action: config?.action || 'block',
    errorMessage:
      config?.errorMessage || 'Content violates moderation policies',
    endpoint: config?.endpoint || 'https://api.openai.com/v1/moderations',
  }

  return {
    metadata: {
      name: 'openai-moderation',
      version: '1.0.0',
      description: 'Content moderation using OpenAI Moderation API',
      author: 'Uni AI',
      homepage: 'https://platform.openai.com/docs/guides/moderation',
    },

    config: {
      enabled: true,
      priority: PluginPriority.NORMAL,
      ...config,
    },

    initialize() {
      if (!cfg.apiKey) {
        throw new Error(
          'OpenAI API key required for moderation plugin. ' +
            'Set OPENAI_API_KEY or pass apiKey in config.'
        )
      }
    },

    hooks: {
      async moderation(
        text: string,
        context: PluginContext
      ): Promise<ModerationResult> {
        try {
          // Call OpenAI Moderation API
          const response = await fetch(cfg.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${cfg.apiKey}`,
            },
            body: JSON.stringify({
              input: text,
              model: cfg.model,
            }),
          })

          if (!response.ok) {
            const error = await response.text()
            throw new Error(
              `OpenAI Moderation API error (${response.status}): ${error}`
            )
          }

          const data: OpenAIModerationResponse = await response.json()
          const result = data.results[0]

          // Check if flagged
          if (!result.flagged) {
            return {
              safe: true,
              categories: [],
              scores: result.category_scores as Record<string, number>,
              action: 'allow',
            }
          }

          // Get flagged categories
          const flaggedCategories = Object.entries(result.categories)
            .filter(([_, flagged]) => flagged)
            .map(([category]) => category)

          // Check category-specific blocking
          let shouldBlock = false
          let reason = cfg.errorMessage

          if (cfg.blockCategories.length > 0) {
            // Only block if specific categories are flagged
            const blockedCategories = flaggedCategories.filter((cat) =>
              cfg.blockCategories.includes(cat as ModerationCategory)
            )

            if (blockedCategories.length > 0) {
              shouldBlock = true
              reason = `Content flagged for: ${blockedCategories.join(', ')}`
            }
          } else {
            // Block all flagged content
            shouldBlock = true
            reason = `Content flagged for: ${flaggedCategories.join(', ')}`
          }

          // Check threshold
          const maxScore = Math.max(...Object.values(result.category_scores))
          if (maxScore < cfg.threshold) {
            shouldBlock = false
          }

          return {
            safe: !shouldBlock,
            categories: flaggedCategories,
            scores: result.category_scores as Record<string, number>,
            action: shouldBlock ? cfg.action : 'allow',
            reason: shouldBlock ? reason : undefined,
          }
        } catch (error) {
          console.error('OpenAI Moderation error:', error)

          // Fail open (allow request) on API errors
          return {
            safe: true,
            categories: [],
            action: 'allow',
          }
        }
      },
    },
  }
}

/**
 * Default export with environment-based configuration
 */
export const openaiModerationPlugin = createOpenAIModerationPlugin()

/**
 * Strict moderation preset (blocks more aggressively)
 */
export const strictModerationPlugin = createOpenAIModerationPlugin({
  threshold: 0.3,
  action: 'block',
  blockCategories: [
    'hate',
    'hate/threatening',
    'harassment',
    'harassment/threatening',
    'violence',
    'violence/graphic',
    'sexual/minors',
    'self-harm/intent',
    'self-harm/instructions',
  ],
})

/**
 * Permissive moderation preset (only blocks extreme content)
 */
export const permissiveModerationPlugin = createOpenAIModerationPlugin({
  threshold: 0.8,
  action: 'warn',
  blockCategories: [
    'hate/threatening',
    'harassment/threatening',
    'violence/graphic',
    'sexual/minors',
    'self-harm/instructions',
  ],
})
