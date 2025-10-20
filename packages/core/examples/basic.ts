/**
 * Basic example of using Uni AI SDK
 * Run with: tsx examples/basic.ts
 */

import { ai } from '../src/index.js'

async function main() {
  console.log('🚀 Uni AI SDK - Basic Example\n')

  // Example 1: Simple text generation
  console.log('Example 1: Simple text generation')
  console.log('-----------------------------------')
  try {
    const text = await ai('gpt-4', 'Explain quantum computing in one sentence')
    console.log('Response:', text)
    console.log()
  } catch (error) {
    console.error('Error:', error)
  }

  // Example 2: Streaming
  console.log('Example 2: Streaming response')
  console.log('-----------------------------------')
  try {
    process.stdout.write('Response: ')
    for await (const chunk of ai.stream('gpt-4', 'Write a haiku about AI')) {
      process.stdout.write(chunk)
    }
    console.log('\n')
  } catch (error) {
    console.error('Error:', error)
  }

  // Example 3: With security
  console.log('Example 3: With strict security')
  console.log('-----------------------------------')
  try {
    const text = await ai(
      'gpt-4',
      'What is 2+2?',
      { security: 'strict' }
    )
    console.log('Response:', text)
    console.log()
  } catch (error) {
    console.error('Error:', error)
  }

  // Example 4: Temperature control
  console.log('Example 4: Creative writing (high temperature)')
  console.log('-----------------------------------')
  try {
    const text = await ai(
      'gpt-4',
      'Write a creative opening line for a sci-fi novel',
      { temperature: 0.9 }
    )
    console.log('Response:', text)
    console.log()
  } catch (error) {
    console.error('Error:', error)
  }

  console.log('✅ All examples completed!')
}

main()
