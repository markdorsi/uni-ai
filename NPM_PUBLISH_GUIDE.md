# NPM Publishing Guide

This guide explains how to publish Uni AI SDK packages to npm.

## Prerequisites

1. **npm account**: Create one at https://npmjs.com
2. **Organization**: Create `@uni-ai` organization on npm (or use your own scope)
3. **Authentication**: Log in via CLI

```bash
npm login
```

## Package Overview

Packages ready to publish:

| Package | Version | Size | Description |
|---------|---------|------|-------------|
| `@uni-ai/sdk` | 0.1.0 | 11KB | Core SDK |
| `@uni-ai/react` | 0.1.0 | 1.9KB | React hooks |
| `@uni-ai/vercel` | 0.1.0 | 4.6KB | Vercel adapter |
| `@uni-ai/netlify` | 0.1.0 | 5.0KB | Netlify adapter |

## Publishing Order

**Important**: Publish in this order due to dependencies:

1. **@uni-ai/sdk** (core - no dependencies)
2. **@uni-ai/react** (depends on core)
3. **@uni-ai/vercel** (depends on core)
4. **@uni-ai/netlify** (depends on core)

## Step-by-Step Publishing

### 1. Publish Core SDK

```bash
cd packages/core

# Build
OPENAI_API_KEY=sk-dummy npm run build

# Verify package contents
npm pack --dry-run

# Test locally first (optional)
npm pack
npm install -g ./uni-ai-sdk-0.1.0.tgz

# Publish as alpha
npm publish --access public --tag alpha

# Or publish as latest (when ready)
npm publish --access public
```

### 2. Update React Package

Before publishing React, update its dependency:

```bash
cd packages/react

# Edit package.json - change:
# "@uni-ai/sdk": "file:../core"
# to:
# "@uni-ai/sdk": "^0.1.0"
```

Then publish:

```bash
# Install published core
npm install

# Build
npm run build

# Publish
npm publish --access public --tag alpha
```

### 3. Publish Vercel Adapter

```bash
cd packages/vercel

# Update package.json dependency
# "@uni-ai/sdk": "file:../core" → "@uni-ai/sdk": "^0.1.0"

# Install and build
npm install
npm run build

# Publish
npm publish --access public --tag alpha
```

### 4. Publish Netlify Adapter

```bash
cd packages/netlify

# Update package.json dependency
# "@uni-ai/sdk": "file:../core" → "@uni-ai/sdk": "^0.1.0"

# Install and build
npm install
npm run build

# Publish
npm publish --access public --tag alpha
```

## Automated Publishing Script

Or use the automation script:

```bash
# Publish all packages as alpha
./publish-alpha.sh

# Publish all packages as latest
./publish-latest.sh
```

## Publishing Checklist

Before publishing:

- [ ] All tests pass (`npm test`)
- [ ] All builds succeed (`npm run build`)
- [ ] Package versions updated
- [ ] CHANGELOG.md updated
- [ ] README.md accurate
- [ ] Repository URLs correct
- [ ] License file included (MIT)
- [ ] No sensitive data in package

## Version Tags

### Alpha Release

For early testing:

```bash
npm publish --access public --tag alpha
```

Users install with:

```bash
npm install @uni-ai/sdk@alpha
```

### Beta Release

For wider testing:

```bash
npm publish --access public --tag beta
```

### Latest Release

For production:

```bash
npm publish --access public
```

## Verify Published Packages

After publishing:

```bash
# View on npm
npm view @uni-ai/sdk

# Test installation
mkdir test-install
cd test-install
npm init -y
npm install @uni-ai/sdk@alpha

# Test usage
cat > test.js << 'EOF'
import { ai } from '@uni-ai/sdk'
console.log('Installed successfully!')
EOF

node test.js
```

## Updating Packages

For future updates:

1. Update version in `package.json`:
   - Patch: `0.1.0` → `0.1.1`
   - Minor: `0.1.0` → `0.2.0`
   - Major: `0.1.0` → `1.0.0`

2. Update CHANGELOG.md

3. Commit changes

4. Publish with new version

## Unpublishing (Emergency)

If you need to unpublish:

```bash
# Unpublish specific version (within 72 hours)
npm unpublish @uni-ai/sdk@0.1.0

# Unpublish entire package (use with caution!)
npm unpublish @uni-ai/sdk --force
```

**Note**: Unpublishing is discouraged. Use `npm deprecate` instead:

```bash
npm deprecate @uni-ai/sdk@0.1.0 "Please upgrade to 0.1.1"
```

## GitHub Actions (Automated)

The repository includes a GitHub Actions workflow for automated publishing:

**.github/workflows/publish.yml** - Publishes on git tag

To use:

```bash
# Create and push tag
git tag v0.1.0
git push origin v0.1.0

# GitHub Actions will automatically publish
```

## Troubleshooting

### "Package name already exists"

If `@uni-ai/sdk` is taken:
- Use your own scope: `@yourname/uni-ai-sdk`
- Or request the package name from npm support

### "Forbidden: insufficient access"

Make sure you're logged in:

```bash
npm whoami
npm login
```

### "Cannot publish over existing version"

Update the version number in package.json:

```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.0 → 0.2.0
npm version major  # 0.1.0 → 1.0.0
```

### Build fails

Make sure all dependencies are installed:

```bash
# From repo root
npm install

# Build individual package
cd packages/core
npm install
npm run build
```

## Post-Publishing

After successful publishing:

1. Update documentation with install instructions
2. Update README badges
3. Announce on GitHub, Twitter, etc.
4. Monitor npm downloads and issues

## Next Steps

After publishing:

- [ ] Update all README files with `npm install` instructions
- [ ] Update documentation site
- [ ] Create GitHub release
- [ ] Announce launch
- [ ] Monitor for issues

## Support

- **npm docs**: https://docs.npmjs.com/
- **Scope packages**: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages
- **Publishing**: https://docs.npmjs.com/cli/v8/commands/npm-publish
