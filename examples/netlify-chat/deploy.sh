#!/bin/bash
set -e

# Deployment script for Netlify Edge Chat Example
# This script automates deployment to Netlify

echo "🚀 Deploying Netlify Edge Chat to Netlify..."
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

# Check authentication
echo "📝 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "🔐 Please authenticate with Netlify:"
    netlify login
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
    echo "   - OLLAMA_BASE_URL (optional, for local models)"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

# Deploy to Netlify
echo ""
echo "🚀 Deploying to Netlify..."
echo ""
echo "Choose deployment type:"
echo "  1) Production (--prod)"
echo "  2) Draft/Preview"
read -p "Enter choice (1 or 2): " deploy_type

if [ "$deploy_type" = "1" ]; then
    netlify deploy --prod
else
    netlify deploy
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to your Netlify dashboard: https://app.netlify.com"
echo "  2. Navigate to Site Settings → Environment Variables"
echo "  3. Add your API keys:"
echo "     - OPENAI_API_KEY"
echo "     - ANTHROPIC_API_KEY (optional)"
echo "     - GEMINI_API_KEY (optional)"
echo "     - OLLAMA_BASE_URL (optional)"
echo "  4. Redeploy if you added environment variables"
echo ""
echo "💡 Tip: Netlify Edge Functions run on Deno, so your API keys are secure!"
echo ""
