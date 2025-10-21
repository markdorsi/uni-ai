# Testing Guide

Comprehensive guide for writing and running tests in Uni AI SDK.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm run test:coverage

# Run with UI
npm test -- --ui
```

## Test Structure

### Test Files Location

Tests are colocated with source files using the `.test.ts` suffix:

```
src/
├── ai.ts
├── ai.test.ts          # Tests for ai.ts
├── providers/
│   ├── openai.ts
│   └── openai.test.ts  # Tests for openai.ts
└── security/
    ├── pii.ts
    └── pii.test.ts     # Tests for pii.ts
```

### Test Setup Files

- `src/test/setup.ts` - Global test setup, runs before all tests
- `src/test/mocks.ts` - Shared mock utilities and helpers
- `vitest.config.ts` - Vitest configuration

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { functionToTest } from './module.js'

describe('functionToTest()', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks()
  })

  it('should do something specific', () => {
    const result = functionToTest('input')
    expect(result).toBe('expected')
  })

  it('should handle edge cases', () => {
    expect(() => functionToTest('')).toThrow('Invalid input')
  })
})
```

### Mocking fetch Requests

Use the `mockFetch` utility from `src/test/mocks.ts`:

```typescript
import { mockFetch, createMockResponse, createMockOpenAIResponse } from '../test/mocks.js'

describe('API calls', () => {
  let unmockFetch: () => void

  beforeEach(() => {
    unmockFetch = mockFetch(
      createMockResponse(createMockOpenAIResponse('Test response'))
    )
  })

  afterEach(() => {
    unmockFetch()
  })

  it('should call API', async () => {
    const result = await myApiFunction()
    expect(global.fetch).toHaveBeenCalledOnce()
    expect(result).toBe('Test response')
  })
})
```

### Testing Streaming

For streaming responses, create a ReadableStream:

```typescript
it('should stream text chunks', async () => {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const chunks = ['Hello', ' ', 'world']
      for (const chunk of chunks) {
        const data = `data: ${JSON.stringify({
          choices: [{ delta: { content: chunk } }],
        })}\n\n`
        controller.enqueue(encoder.encode(data))
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  const unmockFetch = mockFetch(
    new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  )

  const chunks: string[] = []
  for await (const chunk of streamFunction()) {
    chunks.push(chunk)
  }

  expect(chunks).toEqual(['Hello', ' ', 'world'])
  unmockFetch()
})
```

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction()
  expect(result).toBeDefined()
})

it('should handle async errors', async () => {
  await expect(asyncFunction()).rejects.toThrow('Error message')
})
```

### Testing with Time

Use Vitest's fake timers for time-based tests:

```typescript
import { vi, beforeEach } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

it('should reset after timeout', () => {
  const limiter = new RateLimiter({ maxRequestsPerMinute: 2 })

  limiter.checkLimit('user1')
  limiter.checkLimit('user1')

  // Should fail
  expect(() => limiter.checkLimit('user1')).toThrow()

  // Advance time by 60 seconds
  vi.advanceTimersByTime(60 * 1000)

  // Should work again
  expect(() => limiter.checkLimit('user1')).not.toThrow()
})
```

## Test Patterns

### Pattern 1: Arrange-Act-Assert

```typescript
it('should calculate correctly', () => {
  // Arrange
  const input = 5
  const expected = 10

  // Act
  const result = double(input)

  // Assert
  expect(result).toBe(expected)
})
```

### Pattern 2: Table-Driven Tests

```typescript
describe('validation', () => {
  const testCases = [
    { input: 'valid@email.com', expected: true },
    { input: 'invalid', expected: false },
    { input: '', expected: false },
  ]

  testCases.forEach(({ input, expected }) => {
    it(`should validate "${input}" as ${expected}`, () => {
      expect(isValidEmail(input)).toBe(expected)
    })
  })
})
```

### Pattern 3: Error Testing

```typescript
it('should throw on invalid input', () => {
  expect(() => validate('')).toThrow('Input required')
  expect(() => validate('too-long'.repeat(1000))).toThrow(/length/)
})

it('should handle API errors', async () => {
  unmockFetch()
  unmockFetch = mockFetch(
    new Response(JSON.stringify({ error: { message: 'API Error' } }), {
      status: 500,
    })
  )

  await expect(apiCall()).rejects.toThrow('API Error')
})
```

## Coverage Guidelines

### Target Coverage

- **Overall**: 70%+
- **Core modules** (ai.ts, generate.ts): 90%+
- **Security modules**: 90%+
- **Providers**: 80%+
- **Utilities**: 70%+

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Configuration

See `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/**',
    'dist/**',
    '**/*.test.ts',
    'examples/**',
  ],
  thresholds: {
    lines: 50,
    functions: 50,
    branches: 50,
    statements: 50,
  },
}
```

## Best Practices

### DO

✅ Test one thing per test
✅ Use descriptive test names
✅ Test edge cases and error conditions
✅ Mock external dependencies (APIs, databases)
✅ Keep tests fast (<100ms each)
✅ Clean up after tests (unmock, clear timers)
✅ Use type-safe mocks

### DON'T

❌ Test implementation details
❌ Make tests depend on each other
❌ Use real API calls in tests
❌ Leave console.log in tests
❌ Skip cleanup in afterEach
❌ Test multiple things in one test

## Common Issues

### Issue: Tests timeout

**Solution**: Increase timeout or check for infinite loops

```typescript
it('slow test', { timeout: 10000 }, async () => {
  await slowOperation()
})
```

### Issue: Fetch not mocked

**Solution**: Ensure setup runs and unmock in cleanup

```typescript
beforeEach(() => {
  unmockFetch = mockFetch(mockResponse)
})

afterEach(() => {
  unmockFetch()  // Don't forget this!
})
```

### Issue: Flaky tests

**Solution**: Use fake timers and ensure proper cleanup

```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.clearAllMocks()
})
```

## Test Organization

### Small Tests

Test individual functions in isolation:

```typescript
describe('calculateTotal()', () => {
  it('should sum numbers', () => {
    expect(calculateTotal([1, 2, 3])).toBe(6)
  })
})
```

### Integration Tests

Test how components work together:

```typescript
describe('ai() integration', () => {
  it('should generate text with security checks', async () => {
    const result = await ai('gpt-4', 'test', { security: 'strict' })
    expect(result).toBeTypeOf('string')
    // Verifies: provider registry, security middleware, API call
  })
})
```

### End-to-End Tests

Test complete user workflows (in examples):

```typescript
describe('complete chat flow', () => {
  it('should handle multi-turn conversation', async () => {
    const messages = []
    messages.push({ role: 'user', content: 'Hello' })

    const response1 = await generate({ model: 'gpt-4', messages })
    messages.push({ role: 'assistant', content: response1.text })
    messages.push({ role: 'user', content: 'How are you?' })

    const response2 = await generate({ model: 'gpt-4', messages })
    expect(response2.text).toBeDefined()
  })
})
```

## Debugging Tests

### Run specific test file

```bash
npm test -- src/ai.test.ts
```

### Run specific test

```bash
npm test -- -t "should generate text"
```

### Debug with console

```typescript
it('debug test', () => {
  console.log('Debug info:', value)
  expect(value).toBe(expected)
})
```

### Use Vitest UI

```bash
npm test -- --ui
```

Opens a browser UI for debugging tests interactively.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Example Tests](./src/ai.test.ts)

---

**Keep tests simple, fast, and focused!**
