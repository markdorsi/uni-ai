# CI/CD Documentation

This document describes the Continuous Integration and Continuous Deployment setup for Uni AI SDK.

## Overview

The Uni AI SDK uses GitHub Actions for automated testing, type checking, building, and bundle size verification on every push and pull request.

## GitHub Actions Workflow

Location: `.github/workflows/ci.yml`

### Jobs

#### 1. Test (`test`)
Runs the full test suite with coverage reporting.

**Steps:**
- Checkout code
- Setup Node.js 18 with npm caching
- Install dependencies with `npm ci`
- Run tests in CI mode: `npm run test:ci`
- Upload coverage to Codecov (optional)

**Environment:**
- `OPENAI_API_KEY`: Dummy key for testing
- `ANTHROPIC_API_KEY`: Dummy key for testing

**Coverage Target:** >70% (currently 78.8%)

#### 2. Type Check (`typecheck`)
Verifies TypeScript types across all packages.

**Steps:**
- Checkout code
- Setup Node.js 18 with npm caching
- Install dependencies
- Type check core package: `cd packages/core && npm run lint`
- Type check react package: `cd packages/react && npm run lint`

**Strictness:** Uses TypeScript strict mode

#### 3. Build (`build`)
Builds all packages and verifies output artifacts.

**Steps:**
- Checkout code
- Setup Node.js 18 with npm caching
- Install dependencies
- Build core package
- Build react package
- Verify artifacts exist:
  - `packages/core/dist/index.js`
  - `packages/core/dist/index.d.ts`
  - `packages/react/dist/index.js`
  - `packages/react/dist/index.d.ts`

#### 4. Bundle Size Check (`bundle-size`)
Enforces bundle size limits to maintain lightweight packages.

**Steps:**
- Checkout code
- Setup Node.js 18 with npm caching
- Install dependencies
- Build packages
- Check bundle sizes:
  - **Core limit:** 20KB (current: 11KB ✅)
  - **React limit:** 5KB (current: 1.9KB ✅)

**Enforcement:**
- Core package fails CI if >20KB
- React package warns if >5KB

## Running CI Locally

### Run all tests in CI mode
```bash
npm run test:ci
```

### Type check all packages
```bash
npm run lint
```

### Build all packages
```bash
npm run build
```

### Check bundle sizes manually
```bash
npm run build
ls -lh packages/core/dist/index.js
ls -lh packages/react/dist/index.js
```

## Scripts

### Root package.json
- `test:ci` - Run tests in CI mode (via Turbo)
- `lint` - Type check all packages (via Turbo)
- `build` - Build all packages (via Turbo)

### Core package (@uni-ai/sdk)
- `test:ci` - Run tests once with coverage
- `lint` - Type check without emitting
- `build` - Build and generate declarations

### React package (@uni-ai/react)
- `test:ci` - Run tests once (no tests yet)
- `lint` - Type check without emitting
- `build` - Build and generate declarations

## Turbo Configuration

The monorepo uses Turborepo for caching and task orchestration.

**Pipeline:**
```json
{
  "test:ci": {
    "dependsOn": ["build"],
    "outputs": ["coverage/**"]
  },
  "lint": {
    "outputs": []
  },
  "build": {
    "dependsOn": ["^build"],
    "outputs": ["dist/**"]
  }
}
```

## Coverage Reporting

Test coverage is generated during the `test:ci` run.

**Current Coverage:**
- **Overall:** 78.8%
- **Statements:** 78.8%
- **Branches:** 71.35%
- **Functions:** 84.09%

**Coverage Files:**
- `packages/core/coverage/coverage-final.json`
- `packages/core/coverage/lcov.info`

### Codecov Integration (Optional)

To enable Codecov reporting:

1. Add `CODECOV_TOKEN` secret to GitHub repository
2. Coverage will be automatically uploaded on every push/PR
3. Remove `continue-on-error: true` from the workflow if required

## Type Safety

All packages use TypeScript strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

**React Package:**
- Includes DOM types for browser APIs
- Uses `react-jsx` transform for React 18+

## Bundle Size Strategy

The Uni AI SDK prioritizes small bundle sizes:

| Package | Current | Limit | vs Vercel AI SDK |
|---------|---------|-------|------------------|
| @uni-ai/sdk | 11KB | 20KB | 186KB (83% smaller) |
| @uni-ai/react | 1.9KB | 5KB | N/A |
| **Total** | **12.9KB** | **25KB** | **186KB** |

**Tools:**
- tsup with esbuild for minification
- Tree-shaking enabled
- ESM-only for modern bundlers

## Future Enhancements

- [ ] NPM publishing workflow
- [ ] Automated version bumping (changesets)
- [ ] Performance benchmarks
- [ ] Visual regression testing
- [ ] Dependency security scanning
- [ ] Automated release notes generation

## Troubleshooting

### Tests fail with API key errors
The CI uses dummy API keys. Make sure your tests mock fetch properly.

### Type check fails locally but passes in CI
Ensure you have the latest dependencies installed:
```bash
npm ci
```

### Build artifacts missing
Run a clean build:
```bash
npm run clean
npm install
npm run build
```

### Bundle size exceeds limit
Review the recent changes and:
1. Remove unused dependencies
2. Use dynamic imports for large modules
3. Check for accidental inclusion of dev dependencies

## Status

✅ All CI jobs passing
✅ 78.8% test coverage
✅ 100% type safety
✅ Bundle sizes within limits
✅ Build time <2 minutes

---

**Last Updated:** 2025-10-20
