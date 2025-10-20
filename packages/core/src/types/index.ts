import type { z } from 'zod'

/**
 * Message roles
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

/**
 * Message content types
 */
export type MessageContent =
  | string
  | Array<TextContent | ImageContent>

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image'
  image: string | URL
}

/**
 * Message structure
 */
export interface Message {
  role: MessageRole
  content: MessageContent
  name?: string
  toolCallId?: string
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
  inputTokens: number
  outputTokens: number
  totalTokens: number
}

/**
 * Generation options
 */
export interface GenerateOptions {
  model: string
  messages?: Message[]
  prompt?: string

  // Generation parameters
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stopSequences?: string[]

  // Tools
  tools?: Record<string, Tool>
  toolChoice?: ToolChoice
  maxSteps?: number

  // Security
  security?: SecurityPreset | SecurityConfig

  // Streaming
  stream?: boolean

  // Callbacks
  onToken?: (token: string) => void
  onFinish?: (result: GenerateResult) => void
  onError?: (error: Error) => void
}

/**
 * Security presets
 */
export type SecurityPreset = 'strict' | 'moderate' | 'permissive'

/**
 * Security configuration
 */
export interface SecurityConfig {
  preset?: SecurityPreset

  inputValidation?: {
    maxPromptLength?: number
    maxMessagesLength?: number
    sanitizeInputs?: boolean
    blockedPatterns?: RegExp[]
  }

  rateLimiting?: {
    maxRequestsPerMinute?: number
    maxRequestsPerHour?: number
    userId?: string
  }

  moderation?: {
    enabled?: boolean
    provider?: 'openai'
    threshold?: 'low' | 'medium' | 'high'
    onViolation?: 'block' | 'warn' | 'log'
  }

  piiDetection?: {
    enabled?: boolean
    redact?: boolean
  }
}

/**
 * Tool definition
 */
export interface Tool<
  TParameters extends z.ZodTypeAny = z.ZodTypeAny,
  TResult = unknown
> {
  description: string
  parameters: TParameters
  execute: (args: z.infer<TParameters>) => Promise<TResult> | TResult
}

/**
 * Tool choice
 */
export type ToolChoice =
  | 'auto'
  | 'required'
  | 'none'
  | { type: 'tool'; name: string }

/**
 * Tool call
 */
export interface ToolCall {
  id: string
  name: string
  arguments: unknown
}

/**
 * Tool result
 */
export interface ToolResult {
  id: string
  name: string
  result: unknown
  error?: Error
}

/**
 * Generation result
 */
export interface GenerateResult {
  text: string
  usage: TokenUsage
  finishReason: 'stop' | 'length' | 'content-filter' | 'tool-calls'
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
}

/**
 * Stream chunk types
 */
export type StreamChunk =
  | TextDeltaChunk
  | ToolCallChunk
  | ToolResultChunk
  | ErrorChunk
  | FinishChunk

export interface TextDeltaChunk {
  type: 'text-delta'
  textDelta: string
}

export interface ToolCallChunk {
  type: 'tool-call'
  toolCallId: string
  toolName: string
  arguments: unknown
}

export interface ToolResultChunk {
  type: 'tool-result'
  toolCallId: string
  toolName: string
  result: unknown
}

export interface ErrorChunk {
  type: 'error'
  error: Error
}

export interface FinishChunk {
  type: 'finish'
  usage: TokenUsage
  finishReason: GenerateResult['finishReason']
}

/**
 * Language model provider interface
 */
export interface LanguageModelProvider {
  id: string
  name: string

  generateText(options: GenerateOptions): Promise<GenerateResult>
  streamText(options: GenerateOptions): AsyncIterable<StreamChunk>
}

/**
 * Provider factory
 */
export interface ProviderFactory {
  (options?: ProviderOptions): LanguageModelProvider
}

/**
 * Provider options
 */
export interface ProviderOptions {
  apiKey?: string
  baseURL?: string
}
