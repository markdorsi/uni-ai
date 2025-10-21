#!/bin/bash
set -e

# Deployment script for Uni AI Documentation Site
# Deploys to Vercel or Netlify

echo "🚀 Deploying Uni AI Documentation..."
echo ""

# Navigate to docs directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building documentation site..."
npm run build

echo ""
echo "Choose deployment platform:"
echo "  1) Vercel"
echo "  2) Netlify"
read -p "Enter choice (1 or 2): " platform

if [ "$platform" = "1" ]; then
  # Vercel deployment
  if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
  fi

  echo "🔐 Authenticating with Vercel..."
  if ! vercel whoami &> /dev/null; then
    vercel login
  fi

  echo "🚀 Deploying to Vercel..."
  vercel --prod

elif [ "$platform" = "2" ]; then
  # Netlify deployment
  if ! command -v netlify &> /dev/null; then
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
  fi

  echo "🔐 Authenticating with Netlify..."
  if ! netlify status &> /dev/null; then
    netlify login
  fi

  echo "🚀 Deploying to Netlify..."
  netlify deploy --prod --dir=.vitepress/dist

else
  echo "Invalid choice"
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
