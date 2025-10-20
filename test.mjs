import { ai } from './packages/core/dist/index.js'

console.log('🚀 Testing Uni AI SDK...\n')

try {
  console.log('Test 1: Simple generation')
  console.log('-------------------------')
  const text = await ai('gpt-4', 'Say hello in 3 different languages')
  console.log('✅ Response:', text)
  console.log()

  console.log('Test 2: Streaming')
  console.log('-------------------------')
  process.stdout.write('✅ Response: ')
  for await (const chunk of ai.stream('gpt-4', 'Count from 1 to 5')) {
    process.stdout.write(chunk)
  }
  console.log('\n')

  console.log('Test 3: With security')
  console.log('-------------------------')
  const secureText = await ai('gpt-4', 'What is 2+2?', { security: 'strict' })
  console.log('✅ Response:', secureText)
  console.log()

  console.log('✨ All tests passed!')
} catch (error) {
  console.error('❌ Error:', error.message)
  if (error.message.includes('API key')) {
    console.log('\n💡 Tip: Set your OpenAI API key:')
    console.log('   export OPENAI_API_KEY=sk-...')
  }
}
