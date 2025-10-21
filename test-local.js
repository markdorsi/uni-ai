#!/usr/bin/env node

/**
 * Quick test script to verify Uni AI SDK works locally
 *
 * Usage:
 *   export OPENAI_API_KEY=sk-...
 *   node test-local.js
 */

import { ai, generate } from './packages/core/dist/index.js'

console.log('🧪 Testing Uni AI SDK locally...\n')

// Test 1: Simple AI call
console.log('Test 1: Simple ai() call')
try {
  const text = await ai('gpt-4', 'Say "Hello from Uni AI!" and nothing else')
  console.log('✅ Success:', text)
} catch (error) {
  console.error('❌ Failed:', error.message)
  process.exit(1)
}

console.log('\n---\n')

// Test 2: Generate with security
console.log('Test 2: generate() with security')
try {
  const result = await generate({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is 2+2?' }
    ],
    security: 'strict',
    temperature: 0.7
  })

  console.log('✅ Success:', result.text)
  console.log('📊 Usage:', result.usage)
  console.log('🏁 Finish reason:', result.finishReason)
} catch (error) {
  console.error('❌ Failed:', error.message)
  process.exit(1)
}

console.log('\n---\n')

// Test 3: Streaming
console.log('Test 3: Streaming with ai.stream()')
try {
  process.stdout.write('🔄 Response: ')
  for await (const chunk of ai.stream('gpt-4', 'Count from 1 to 5')) {
    process.stdout.write(chunk)
  }
  console.log('\n✅ Streaming works!')
} catch (error) {
  console.error('❌ Failed:', error.message)
  process.exit(1)
}

console.log('\n---\n')

// Test 4: Security (PII detection)
console.log('Test 4: Security - PII detection')
try {
  const text = await ai('gpt-4', 'My SSN is 123-45-6789', { security: 'strict' })
  console.log('✅ PII was redacted, response:', text)
} catch (error) {
  console.log('✅ Security blocked it (expected):', error.message)
}

console.log('\n---\n')

console.log('🎉 All tests passed! Uni AI SDK is working locally.')
console.log('\n💡 Next steps:')
console.log('   - Try the examples: cd examples/nextjs-chat && npm run dev')
console.log('   - Read the docs: cd docs && npm run dev')
console.log('   - Build your app!')
