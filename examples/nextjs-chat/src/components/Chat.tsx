'use client'

import { useState, useCallback, useRef } from 'react'
import type { Message } from '@uni-ai/sdk'
import styles from './Chat.module.css'

export default function Chat() {
  const [model, setModel] = useState<
    'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-5-sonnet' | 'gemini-2.0-flash' | 'gemini-pro' | 'llama3.2'
  >('gpt-4')
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'You are a helpful assistant. Be concise and friendly.',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() || isLoading) return

      const userMessage: Message = {
        role: 'user',
        content: input.trim(),
      }

      try {
        setIsLoading(true)
        setError(null)
        setInput('')

        // Add user message
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)

        // Call API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: newMessages,
            model,
            security: 'strict',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get response')
        }

        const data = await response.json()

        // Add assistant message
        setMessages([...newMessages, data.message])
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        console.error('Chat error:', error)
      } finally {
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, model]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value)
    },
    []
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <label htmlFor="model-select" className={styles.label}>
          Model:
        </label>
        <select
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value as any)}
          className={styles.select}
          disabled={isLoading}
        >
          <option value="gpt-4">GPT-4 (OpenAI)</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
          <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
          <option value="gemini-2.0-flash">Gemini 2.0 Flash (Google)</option>
          <option value="gemini-pro">Gemini Pro (Google)</option>
          <option value="llama3.2">Llama 3.2 (Ollama - Local)</option>
        </select>
        <span className={styles.badge}>Strict Security</span>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      <div className={styles.messages}>
        {messages
          .filter((m) => m.role !== 'system')
          .map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div className={styles.messageRole}>
                {message.role === 'user' ? '👤 You' : '🤖 AI'}
              </div>
              <div className={styles.messageContent}>
                {typeof message.content === 'string'
                  ? message.content
                  : JSON.stringify(message.content)}
              </div>
            </div>
          ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageRole}>🤖 AI</div>
            <div className={styles.messageContent}>
              <div className={styles.loadingDots}>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className={styles.input}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className={styles.button}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
