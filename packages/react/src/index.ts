/**
 * @uni-ai/react
 *
 * React hooks and components for Uni AI SDK
 */

export { useChat, type UseChatOptions, type UseChatReturn } from './useChat.js'
export {
  useCompletion,
  type UseCompletionOptions,
  type UseCompletionReturn,
} from './useCompletion.js'

// Re-export types from core SDK for convenience
export type { Message, MessageRole, GenerateResult, TokenUsage } from '@uni-ai/sdk'
