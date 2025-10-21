/**
 * Multi-Turn Conversation Example
 *
 * Demonstrates how to maintain context across multiple AI interactions.
 * Shows different conversation patterns:
 * - Q&A with context
 * - System prompts
 * - Message history management
 *
 * Run with: tsx examples/conversations/multi-turn.ts
 */

import { generate } from '@uni-ai/sdk'
import type { Message } from '@uni-ai/sdk'

async function example1_BasicConversation() {
  console.log('Example 1: Basic Multi-Turn Conversation')
  console.log('==========================================\n')

  const messages: Message[] = [
    { role: 'user', content: 'My name is Alice and I love hiking.' },
  ]

  // First interaction
  let result = await generate({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
  })

  console.log('User: My name is Alice and I love hiking.')
  console.log('AI:', result.text)
  console.log()

  // Add AI response to conversation
  messages.push({ role: 'assistant', content: result.text })

  // Second interaction - AI should remember the name
  messages.push({ role: 'user', content: 'What is my name?' })
  result = await generate({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
  })

  console.log('User: What is my name?')
  console.log('AI:', result.text)
  console.log()

  // Third interaction - AI should remember the hobby
  messages.push({ role: 'assistant', content: result.text })
  messages.push({ role: 'user', content: 'What do I like to do?' })
  result = await generate({
    model: 'gpt-4',
    messages,
    temperature: 0.7,
  })

  console.log('User: What do I like to do?')
  console.log('AI:', result.text)
  console.log('\n---\n')
}

async function example2_SystemPrompt() {
  console.log('Example 2: Using System Prompts')
  console.log('=================================\n')

  const messages: Message[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that speaks like a pirate. Always respond in pirate speak.',
    },
    { role: 'user', content: 'What is the weather like today?' },
  ]

  const result = await generate({
    model: 'gpt-4',
    messages,
    temperature: 0.8,
  })

  console.log('System: You are a helpful assistant that speaks like a pirate.')
  console.log('User: What is the weather like today?')
  console.log('AI:', result.text)
  console.log('\n---\n')
}

async function example3_ContextManagement() {
  console.log('Example 3: Context Window Management')
  console.log('======================================\n')

  // Simulate a long conversation - in production, you'd trim old messages
  // to stay within the model's context window
  const messages: Message[] = [
    { role: 'system', content: 'You are a helpful coding assistant.' },
  ]

  const questions = [
    'What is TypeScript?',
    'How do I define an interface?',
    'Can you show me an example?',
    'What about generic types?',
  ]

  for (const question of questions) {
    messages.push({ role: 'user', content: question })

    const result = await generate({
      model: 'gpt-4',
      messages,
      temperature: 0.5,
      maxTokens: 150, // Keep responses short for this demo
    })

    console.log(`User: ${question}`)
    console.log(`AI: ${result.text}`)
    console.log()

    messages.push({ role: 'assistant', content: result.text })

    // In production, you might trim messages here:
    // if (messages.length > MAX_MESSAGES) {
    //   messages = [messages[0], ...messages.slice(-MAX_MESSAGES)]
    // }
  }

  console.log(`Total messages in conversation: ${messages.length}`)
  console.log('\n---\n')
}

async function example4_ConversationBranching() {
  console.log('Example 4: Conversation Branching')
  console.log('===================================\n')

  const baseConversation: Message[] = [
    { role: 'user', content: 'I want to build a web app.' },
  ]

  const result1 = await generate({
    model: 'gpt-4',
    messages: baseConversation,
    temperature: 0.7,
  })

  console.log('User: I want to build a web app.')
  console.log('AI:', result1.text)
  console.log()

  // Branch 1: Ask about frontend
  const branch1 = [
    ...baseConversation,
    { role: 'assistant', content: result1.text },
    { role: 'user', content: 'What frontend framework should I use?' },
  ]

  const result2 = await generate({
    model: 'gpt-4',
    messages: branch1,
    temperature: 0.7,
  })

  console.log('Branch 1 - User: What frontend framework should I use?')
  console.log('Branch 1 - AI:', result2.text)
  console.log()

  // Branch 2: Ask about backend (from same base conversation)
  const branch2 = [
    ...baseConversation,
    { role: 'assistant', content: result1.text },
    { role: 'user', content: 'What database should I use?' },
  ]

  const result3 = await generate({
    model: 'gpt-4',
    messages: branch2,
    temperature: 0.7,
  })

  console.log('Branch 2 - User: What database should I use?')
  console.log('Branch 2 - AI:', result3.text)
  console.log('\n---\n')
}

async function main() {
  console.log('🚀 Uni AI SDK - Multi-Turn Conversations\n')

  try {
    await example1_BasicConversation()
    await example2_SystemPrompt()
    await example3_ContextManagement()
    await example4_ConversationBranching()

    console.log('✅ All examples completed!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

main()
