#!/bin/bash
set -e

echo "📦 Publishing Uni AI SDK packages to npm (latest tag)..."
echo ""
echo "⚠️  WARNING: This will publish as @latest (production)"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled."
  exit 0
fi

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
npm publish --access public
echo "✅ @uni-ai/sdk published"
cd ../..

echo ""
echo "2/4 Publishing @uni-ai/react..."
cd packages/react
npm run build
npm publish --access public
echo "✅ @uni-ai/react published"
cd ../..

echo ""
echo "3/4 Publishing @uni-ai/vercel..."
cd packages/vercel
npm run build
npm publish --access public
echo "✅ @uni-ai/vercel published"
cd ../..

echo ""
echo "4/4 Publishing @uni-ai/netlify..."
cd packages/netlify
npm run build
npm publish --access public
echo "✅ @uni-ai/netlify published"
cd ../..

echo ""
echo "🎉 All packages published successfully!"
echo ""
echo "Install with:"
echo "  npm install @uni-ai/sdk"
echo "  npm install @uni-ai/react"
echo "  npm install @uni-ai/vercel"
echo "  npm install @uni-ai/netlify"
echo ""
