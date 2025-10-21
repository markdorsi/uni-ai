/**
 * Test setup file
 * Runs before all tests
 */

// Mock environment variables
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'sk-test-key'
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-ant-test-key'
