# Week 2 Action Plan
**Dates**: Oct 21-27, 2025
**Goal**: Testing + Anthropic + React

---

## Daily Breakdown

### Monday (Day 1): Testing Infrastructure

**Morning (4 hours)**
- [ ] Install Vitest and testing dependencies
- [ ] Create test setup files
- [ ] Write first test (ai() function basic test)
- [ ] Set up test coverage reporting

**Afternoon (4 hours)**
- [ ] Write security middleware tests
  - [ ] Rate limiting tests
  - [ ] PII detection tests
  - [ ] Input validation tests
- [ ] Write provider tests (mock OpenAI)
- [ ] Achieve >50% coverage

**Deliverable**: Test suite passing with >50% coverage

---

### Tuesday (Day 2): Fix TypeScript + More Tests

**Morning (4 hours)**
- [ ] Fix TypeScript declaration generation
- [ ] Enable `dts: true` in tsup.config
- [ ] Verify `.d.ts` files export correctly
- [ ] Test types in consumer project

**Afternoon (4 hours)**
- [ ] Complete security test coverage (>80%)
- [ ] Add integration tests for ai() function
- [ ] Add streaming tests
- [ ] Document testing patterns

**Deliverable**: TypeScript declarations working + >70% coverage

---

### Wednesday (Day 3): Anthropic Provider

**Morning (4 hours)**
- [ ] Create `packages/core/src/providers/anthropic.ts`
- [ ] Implement `createAnthropic()` function
- [ ] Add blocking text generation
- [ ] Add streaming support

**Afternoon (4 hours)**
- [ ] Register Anthropic models in registry
  - [ ] claude-3-5-sonnet-20241022
  - [ ] claude-3-opus-20240229
- [ ] Write Anthropic provider tests
- [ ] Test with real API (if you have key)
- [ ] Update documentation

**Deliverable**: Anthropic provider working with tests

---

### Thursday (Day 4): React Package - Setup

**Morning (4 hours)**
- [ ] Create `packages/react/` directory
- [ ] Set up package.json, tsconfig
- [ ] Install React dependencies
- [ ] Create basic structure

**Afternoon (4 hours)**
- [ ] Implement `useChat()` hook (basic version)
  - [ ] Message state management
  - [ ] Input handling
  - [ ] Submit handler
- [ ] Write hook tests (React Testing Library)

**Deliverable**: Basic useChat() hook working

---

### Friday (Day 5): React Package - Complete

**Morning (4 hours)**
- [ ] Add loading states to useChat()
- [ ] Add error handling
- [ ] Add streaming support
- [ ] Add abort/cancel functionality

**Afternoon (4 hours)**
- [ ] Implement `useCompletion()` hook
- [ ] Create pre-built `<Chat>` component
- [ ] Write component tests
- [ ] Create example React app

**Deliverable**: @uni-ai/react package complete

---

### Saturday/Sunday: Documentation & Polish

**Saturday (4 hours)**
- [ ] Update main README with new features
- [ ] Write React package README
- [ ] Create React examples
- [ ] Update GETTING_STARTED guide

**Sunday (4 hours)**
- [ ] Set up CI/CD (GitHub Actions)
  - [ ] Run tests on PR
  - [ ] Check bundle size
  - [ ] Type checking
- [ ] Create GitHub repository
- [ ] Push code
- [ ] Create first release draft

**Deliverable**: Week 2 complete, ready for Week 3

---

## Success Criteria

By end of Week 2, you should have:

✅ **Test suite** with >70% coverage
✅ **TypeScript declarations** working
✅ **Anthropic provider** functional
✅ **React package** with useChat() and <Chat>
✅ **CI/CD** running
✅ **GitHub repo** public
✅ **Documentation** updated

---

## Code Snippets for Quick Copy-Paste

### Setting up Vitest

```bash
cd packages/core
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Basic Test Example

```typescript
// packages/core/src/ai.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ai } from './ai'

describe('ai()', () => {
  it('should generate text', async () => {
    // Mock the OpenAI provider
    // ... test code
  })
})
```

### React Package Structure

```
packages/react/
├── src/
│   ├── index.ts
│   ├── useChat.ts
│   ├── useCompletion.ts
│   ├── useStream.ts
│   └── components/
│       └── Chat.tsx
├── package.json
└── tsconfig.json
```

---

## Time Budget

| Task | Estimated | Priority |
|------|-----------|----------|
| Testing setup | 8h | P0 |
| TypeScript fix | 4h | P0 |
| More tests | 8h | P0 |
| Anthropic provider | 8h | P0 |
| React package | 16h | P0 |
| Documentation | 4h | P1 |
| CI/CD setup | 4h | P1 |
| **Total** | **52h** | ~40h work week |

---

## Blockers & Risks

### Potential Blockers
1. **Anthropic API access** - Need API key for testing
   - Mitigation: Use mocks if no key available

2. **React testing complexity** - Hooks are tricky to test
   - Mitigation: Use React Testing Library patterns

3. **Time constraints** - Ambitious for 1 week
   - Mitigation: Focus on P0 items, defer P1

### Risk Management
- **Daily check-ins** - Review progress each evening
- **Scope flexibility** - Can push React to Week 3 if needed
- **Quality over speed** - Don't rush tests

---

## Notes & Tips

### Testing Best Practices
- Mock external APIs (don't hit real OpenAI in tests)
- Test error cases, not just happy path
- Use fixtures for test data
- Keep tests fast (<100ms each)

### React Hook Tips
- Use `useReducer` for complex state
- Memoize callbacks with `useCallback`
- Handle cleanup (abort streams on unmount)
- Make SSR-compatible (check for `window`)

### CI/CD Tips
- Cache node_modules for speed
- Run tests in parallel
- Fail fast on type errors
- Report bundle size changes

---

## End of Week Review Questions

1. Can someone install and use the SDK easily?
2. Are all core features tested?
3. Does it work with both OpenAI and Anthropic?
4. Can React developers use it with a simple hook?
5. Is the code quality high enough for public release?

If you can answer "yes" to all 5, you're ready for Week 3!

---

**Let's build! 🚀**
