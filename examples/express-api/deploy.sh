#!/bin/bash
set -e

# Deployment script for Express API Example
# This script automates deployment to Railway

echo "🚀 Deploying Express API to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check authentication
echo "📝 Checking Railway authentication..."
if ! railway whoami &> /dev/null; then
    echo "🔐 Please authenticate with Railway:"
    railway login
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
    echo "   - PORT (optional, default: 3000)"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Check if project is linked
echo ""
if [ ! -f .railway ]; then
    echo "🔗 No Railway project linked. Initializing..."
    railway init
fi

# Build the project (if needed)
echo ""
echo "🔨 Building project..."
npm run build || echo "No build step required"

# Deploy to Railway
echo ""
echo "🚀 Deploying to Railway..."
railway up

# Set environment variables
echo ""
echo "⚙️  Setting environment variables..."
if [ -f .env ]; then
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue

        # Remove quotes from value
        value=$(echo $value | sed -e 's/^"//' -e 's/"$//')

        echo "Setting $key..."
        railway variables set "$key=$value" || echo "⚠️  Could not set $key (may need to set manually)"
    done < .env
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Getting deployment URL..."
railway open

echo ""
echo "🎉 Your API is now live!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to your Railway dashboard: https://railway.app/dashboard"
echo "  2. Verify environment variables are set correctly"
echo "  3. Check deployment logs for any issues"
echo "  4. Test your API endpoints:"
echo "     - GET  /health (health check)"
echo "     - POST /api/chat (chat endpoint)"
echo "     - POST /api/completion (completion endpoint)"
echo ""
echo "💡 Tip: Use 'railway logs' to view real-time logs"
echo ""
