import { useState, useCallback, useRef } from 'react'
import { ai } from '@uni-ai/sdk'

export interface UseCompletionOptions {
  /**
   * The model to use
   */
  model: string

  /**
   * Initial completion value
   */
  initialCompletion?: string

  /**
   * Initial input value
   */
  initialInput?: string

  /**
   * Security preset
   */
  security?: 'strict' | 'moderate' | 'permissive'

  /**
   * Callback when completion is received
   */
  onResponse?: (completion: string) => void

  /**
   * Callback when error occurs
   */
  onError?: (error: Error) => void

  /**
   * Callback when generation finishes
   */
  onFinish?: (completion: string) => void
}

export interface UseCompletionReturn {
  /**
   * Current completion text
   */
  completion: string

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
   * Generate completion programmatically
   */
  complete: (prompt: string) => Promise<void>

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
 * React hook for text completion
 *
 * @example
 * ```tsx
 * function CompletionComponent() {
 *   const {
 *     completion,
 *     input,
 *     handleInputChange,
 *     handleSubmit,
 *     isLoading
 *   } = useCompletion({
 *     model: 'gpt-4'
 *   })
 *
 *   return (
 *     <div>
 *       <form onSubmit={handleSubmit}>
 *         <input
 *           value={input}
 *           onChange={handleInputChange}
 *           placeholder="Enter a prompt..."
 *           disabled={isLoading}
 *         />
 *         <button type="submit" disabled={isLoading}>
 *           Generate
 *         </button>
 *       </form>
 *       {completion && (
 *         <div>
 *           <h3>Completion:</h3>
 *           <p>{completion}</p>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useCompletion(options: UseCompletionOptions): UseCompletionReturn {
  const {
    model,
    initialCompletion = '',
    initialInput = '',
    security,
    onResponse,
    onError,
    onFinish,
  } = options

  const [completion, setCompletion] = useState(initialCompletion)
  const [input, setInput] = useState(initialInput)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const complete = useCallback(
    async (prompt: string) => {
      try {
        setIsLoading(true)
        setError(null)
        setCompletion('')

        // Generate completion
        const result = await ai(model, prompt, { security })

        setCompletion(result)

        // Callbacks
        if (onResponse) {
          onResponse(result)
        }
        if (onFinish) {
          onFinish(result)
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
    [model, security, onResponse, onError, onFinish]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() || isLoading) {
        return
      }

      complete(input)
    },
    [input, isLoading, complete]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value)
    },
    []
  )

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }, [])

  return {
    completion,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    complete,
    stop,
    isLoading,
    error,
  }
}
