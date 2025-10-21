#!/bin/bash
set -e

echo "📦 Publishing Uni AI SDK packages to npm (alpha tag)..."
echo ""

# Check npm authentication
if ! npm whoami &> /dev/null; then
  echo "❌ Not logged in to npm. Please run: npm login"
  exit 1
fi

echo "✅ Logged in as: $(npm whoami)"
echo ""

# Publish order: core → react → vercel → netlify

echo "1/4 Publishing @uni-ai/sdk..."
cd packages/core
OPENAI_API_KEY=sk-dummy npm run build
npm publish --access public --tag alpha
echo "✅ @uni-ai/sdk@alpha published"
cd ../..

echo ""
echo "2/4 Publishing @uni-ai/react..."
cd packages/react
npm run build
npm publish --access public --tag alpha
echo "✅ @uni-ai/react@alpha published"
cd ../..

echo ""
echo "3/4 Publishing @uni-ai/vercel..."
cd packages/vercel
npm run build
npm publish --access public --tag alpha
echo "✅ @uni-ai/vercel@alpha published"
cd ../..

echo ""
echo "4/4 Publishing @uni-ai/netlify..."
cd packages/netlify
npm run build
npm publish --access public --tag alpha
echo "✅ @uni-ai/netlify@alpha published"
cd ../..

echo ""
echo "🎉 All packages published successfully!"
echo ""
echo "Install with:"
echo "  npm install @uni-ai/sdk@alpha"
echo "  npm install @uni-ai/react@alpha"
echo "  npm install @uni-ai/vercel@alpha"
echo "  npm install @uni-ai/netlify@alpha"
echo ""
echo "View on npm:"
echo "  https://npmjs.com/package/@uni-ai/sdk"
echo "  https://npmjs.com/package/@uni-ai/react"
echo "  https://npmjs.com/package/@uni-ai/vercel"
echo "  https://npmjs.com/package/@uni-ai/netlify"
echo ""
