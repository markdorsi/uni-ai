/**
 * Simple CLI Chatbot Example
 *
 * A basic interactive chatbot that demonstrates:
 * - Multi-turn conversations
 * - Streaming responses
 * - User input handling
 *
 * Run with: tsx examples/chatbot/simple-cli.ts
 */

import * as readline from 'readline'
import { ai } from '@uni-ai/sdk'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []

async function chat() {
  console.log('🤖 Uni AI Chatbot')
  console.log('Type your messages (or "exit" to quit)\n')

  const askQuestion = () => {
    rl.question('You: ', async (userInput) => {
      if (userInput.toLowerCase() === 'exit') {
        console.log('\nGoodbye! 👋')
        rl.close()
        return
      }

      // Add user message to history
      conversationHistory.push({
        role: 'user',
        content: userInput,
      })

      // Stream the AI response
      process.stdout.write('AI: ')
      let fullResponse = ''

      try {
        for await (const chunk of ai.stream('gpt-4', conversationHistory, {
          temperature: 0.7,
          security: 'moderate',
        })) {
          process.stdout.write(chunk)
          fullResponse += chunk
        }

        console.log('\n')

        // Add assistant response to history
        conversationHistory.push({
          role: 'assistant',
          content: fullResponse,
        })
      } catch (error) {
        console.error('\n❌ Error:', error instanceof Error ? error.message : error)
      }

      askQuestion()
    })
  }

  askQuestion()
}

chat()
