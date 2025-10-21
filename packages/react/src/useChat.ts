import { useState, useCallback, useRef } from 'react'
import { generate, type Message } from '@uni-ai/sdk'

export interface UseChatOptions {
  /**
   * The model to use for chat
   */
  model: string

  /**
   * Initial messages
   */
  initialMessages?: Message[]

  /**
   * API endpoint (for custom implementations)
   * Default: uses SDK directly
   */
  api?: string

  /**
   * Security preset
   */
  security?: 'strict' | 'moderate' | 'permissive'

  /**
   * Callback when new message is received
   */
  onResponse?: (message: Message) => void

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void

  /**
   * Callback when streaming finishes
   */
  onFinish?: (message: Message) => void
}

export interface UseChatReturn {
  /**
   * Current messages in the conversation
   */
  messages: Message[]

  /**
   * Current input value
   */
  input: string

  /**
   * Set the input value
   */
  setInput: (input: string) => void

  /**
   * Handle input change event
   */
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void

  /**
   * Handle form submit
   */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void

  /**
   * Send a message programmatically
   */
  append: (message: Message) => Promise<void>

  /**
   * Reload the last assistant message
   */
  reload: () => Promise<void>

  /**
   * Stop the current generation
   */
  stop: () => void

  /**
   * Whether currently loading
   */
  isLoading: boolean

  /**
   * Current error if any
   */
  error: Error | null
}

/**
 * React hook for managing chat conversations
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
 *     model: 'gpt-4',
 *     security: 'strict'
 *   })
 *
 *   return (
 *     <div>
 *       {messages.map((m, i) => (
 *         <div key={i}>
 *           <strong>{m.role}:</strong> {m.content}
 *         </div>
 *       ))}
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           value={input}
 *           onChange={handleInputChange}
 *           disabled={isLoading}
 *         />
 *         <button type="submit" disabled={isLoading}>
 *           Send
 *         </button>
 *       </form>
 *     </div>
 *   )
 * }
 * ```
 */
export function useChat(options: UseChatOptions): UseChatReturn {
  const { model, initialMessages = [], security, onResponse, onError, onFinish } = options

  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const append = useCallback(
    async (message: Message) => {
      try {
        setIsLoading(true)
        setError(null)

        // Add user message
        const newMessages = [...messages, message]
        setMessages(newMessages)

        // Generate response
        const result = await generate({
          model,
          messages: newMessages,
          security,
        })

        // Create assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: result.text,
        }

        // Add assistant message
        setMessages([...newMessages, assistantMessage])

        // Callbacks
        if (onResponse) {
          onResponse(assistantMessage)
        }
        if (onFinish) {
          onFinish(assistantMessage)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        if (onError) {
          onError(error)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [messages, model, security, onResponse, onError, onFinish]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() || isLoading) {
        return
      }

      const userMessage: Message = {
        role: 'user',
        content: input.trim(),
      }

      setInput('')
      append(userMessage)
    },
    [input, isLoading, append]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput((e.target as HTMLInputElement | HTMLTextAreaElement).value)
    },
    []
  )

  const reload = useCallback(async () => {
    if (messages.length === 0) {
      return
    }

    // Remove last assistant message if exists
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'assistant') {
      const messagesWithoutLast = messages.slice(0, -1)
      setMessages(messagesWithoutLast)

      // Get last user message
      const lastUserMessage = messagesWithoutLast[messagesWithoutLast.length - 1]
      if (lastUserMessage) {
        await append(lastUserMessage)
      }
    }
  }, [messages, append])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    append,
    reload,
    stop,
    isLoading,
    error,
  }
}
