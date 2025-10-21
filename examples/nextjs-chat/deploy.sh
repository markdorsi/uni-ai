#!/bin/bash
set -e

# Deployment script for Next.js Chat Example
# This script automates deployment to Vercel

echo "🚀 Deploying Next.js Chat to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check authentication
echo "📝 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please authenticate with Vercel:"
    vercel login
fi

# Navigate to example directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "📦 Installing dependencies..."
npm install

# Check for environment variables
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  No .env file found. Creating from example..."
    cp .env.example .env
    echo ""
    echo "⚙️  Please edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY (required)"
    echo "   - ANTHROPIC_API_KEY (optional)"
    echo "   - GEMINI_API_KEY (optional)"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Read environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Build the project (with dummy key if needed)
echo ""
echo "🔨 Building project..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  No OPENAI_API_KEY found, using dummy key for build..."
    OPENAI_API_KEY=sk-dummy-build-key npm run build
else
    npm run build
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "Choose deployment type:"
echo "  1) Production (--prod)"
echo "  2) Preview/Development"
read -p "Enter choice (1 or 2): " deploy_type

if [ "$deploy_type" = "1" ]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "  2. Set environment variables (if not already set):"
echo "     - OPENAI_API_KEY"
echo "     - ANTHROPIC_API_KEY (optional)"
echo "     - GEMINI_API_KEY (optional)"
echo "  3. Redeploy if you added environment variables"
echo ""
