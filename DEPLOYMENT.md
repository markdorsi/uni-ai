# Deployment Guide

This guide covers deploying the Uni AI SDK examples to various platforms.

## 📦 Examples Overview

| Example | Best For | Deploy To | Live Demo |
|---------|----------|-----------|-----------|
| **Next.js Chat** | Full-stack web apps | Vercel | [Coming Soon] |
| **Netlify Edge** | Global edge deployment | Netlify | [Coming Soon] |
| **Express API** | Backend services | Railway/Render | [Coming Soon] |

---

## 🚀 Quick Deploy

### Next.js Chat → Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markdorsi/uni-ai/tree/main/examples/nextjs-chat&env=OPENAI_API_KEY&envDescription=OpenAI%20API%20key%20for%20GPT%20models&project-name=uni-ai-chat&repository-name=uni-ai-chat&root-directory=examples/nextjs-chat)

**Steps:**
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Add your `OPENAI_API_KEY` environment variable
4. Click "Deploy"
5. Wait ~2 minutes for the build to complete
6. Your chat app is live! 🎉

**Environment Variables:**
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `ANTHROPIC_API_KEY` (optional) - Your Anthropic API key for Claude

---

### Netlify Edge → Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/markdorsi/uni-ai&base=examples/netlify-chat)

**Steps:**
1. Click the "Deploy to Netlify" button above
2. Connect your GitHub account
3. Click "Connect to GitHub"
4. After deployment, go to Site Settings → Environment Variables
5. Add your `OPENAI_API_KEY`
6. Trigger a redeploy
7. Your edge chat is live globally! 🌍

**Environment Variables:**
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `ANTHROPIC_API_KEY` (optional) - Your Anthropic API key for Claude

**Features:**
- Runs on 100+ global edge locations
- <50ms latency worldwide
- Zero cold starts
- Deno runtime

---

### Express API → Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/uni-ai-express-api?referralCode=uni-ai)

**Steps:**
1. Click the "Deploy on Railway" button above
2. Sign in to Railway
3. Add your `OPENAI_API_KEY` environment variable
4. Click "Deploy"
5. Railway will assign you a public URL
6. Your API is live! 🚂

**Environment Variables:**
- `OPENAI_API_KEY` (required) - Your OpenAI API key
- `ANTHROPIC_API_KEY` (optional) - Your Anthropic API key for Claude
- `PORT` (auto-set by Railway) - Port for the server

**API Endpoints:**
- `GET /health` - Health check
- `POST /api/chat` - Chat completions
- `POST /api/completion` - Text completions

---

## 🛠️ Manual Deployment

### Prerequisites

All examples require:
- Node.js 18+ installed
- Git installed
- An OpenAI API key (get one at [platform.openai.com](https://platform.openai.com))
- Optional: Anthropic API key for Claude models

### Next.js Chat (Manual)

```bash
# 1. Clone and navigate
git clone https://github.com/markdorsi/uni-ai.git
cd uni-ai

# 2. Install root dependencies and build packages
npm install
npm run build

# 3. Navigate to example
cd examples/nextjs-chat

# 4. Install example dependencies
npm install

# 5. Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 6. Run development server
npm run dev

# 7. Open http://localhost:3000
```

**Deploy to Vercel CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd examples/nextjs-chat
vercel

# Follow the prompts and add environment variables
```

---

### Netlify Edge Chat (Manual)

```bash
# 1. Clone and navigate
git clone https://github.com/markdorsi/uni-ai.git
cd uni-ai

# 2. Install root dependencies and build packages
npm install
npm run build

# 3. Navigate to example
cd examples/netlify-chat

# 4. Install Netlify CLI
npm install -g netlify-cli

# 5. Install example dependencies
npm install

# 6. Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 7. Run development server
netlify dev

# 8. Open http://localhost:8888
```

**Deploy to Netlify CLI:**

```bash
# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Add environment variables in Netlify UI
# Site Settings → Environment Variables
```

---

### Express API (Manual)

```bash
# 1. Clone and navigate
git clone https://github.com/markdorsi/uni-ai.git
cd uni-ai

# 2. Install root dependencies and build packages
npm install
npm run build

# 3. Navigate to example
cd examples/express-api

# 4. Install example dependencies
npm install

# 5. Create .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 6. Run development server
npm run dev

# 7. Open http://localhost:3001
```

**Deploy to Railway CLI:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set OPENAI_API_KEY=sk-...

# Deploy
railway up
```

**Deploy to Render:**

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set build command: `cd ../.. && npm install && npm run build && cd examples/express-api && npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables: `OPENAI_API_KEY`
6. Click "Create Web Service"

**Deploy to Fly.io:**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
cd examples/express-api
fly launch

# Set secrets
fly secrets set OPENAI_API_KEY=sk-...

# Deploy
fly deploy
```

---

## 🔒 Security Best Practices

### Environment Variables

**Never commit API keys to Git!**

✅ **Do:**
- Use environment variables for all API keys
- Add `.env` to `.gitignore`
- Use platform-specific secret management
- Rotate keys regularly

❌ **Don't:**
- Hardcode API keys in source code
- Commit `.env` files
- Share keys in public repositories
- Use production keys in development

### Example `.env` file:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic (optional)
ANTHROPIC_API_KEY=sk-ant-...

# Server (optional, usually auto-set)
PORT=3000
```

---

## 📊 Platform Comparison

| Feature | Vercel | Netlify | Railway | Render | Fly.io |
|---------|--------|---------|---------|--------|--------|
| **Free Tier** | ✅ Generous | ✅ Generous | ✅ $5/month | ✅ Limited | ✅ Limited |
| **Edge Computing** | ✅ Yes | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **Global CDN** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Auto SSL** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Git Integration** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Build Time** | ~2 min | ~2 min | ~3 min | ~3 min | ~2 min |
| **Cold Starts** | Very low | Zero (edge) | Low | Medium | Very low |
| **Best For** | Next.js | Edge/Static | APIs | APIs | Global APIs |

---

## 🐛 Troubleshooting

### Build Failures

**Issue:** Build fails with "Cannot find module '@uni-ai/sdk'"

**Solution:** The build process needs to build the monorepo packages first. Use the build commands specified in this guide that include:
```bash
cd ../.. && npm install && npm run build && cd examples/[example-name]
```

---

**Issue:** "OPENAI_API_KEY is not defined"

**Solution:**
1. Check environment variables are set in platform dashboard
2. For local dev, ensure `.env` file exists with valid key
3. Trigger a redeploy after adding environment variables

---

**Issue:** "Module not found: Can't resolve '@uni-ai/react'"

**Solution:** The React package needs to be built. Run:
```bash
cd packages/react && npm run build
```

---

### Deployment Issues

**Issue:** Vercel deployment times out

**Solution:**
- Use `root-directory=examples/[example-name]` in deploy button
- Or manually set root directory in Vercel project settings

---

**Issue:** Netlify Edge Function fails

**Solution:**
1. Check that `@uni-ai/sdk` is built
2. Verify environment variables are set
3. Check Netlify function logs for specific errors

---

**Issue:** Railway deployment shows "Application failed to respond"

**Solution:**
1. Ensure `PORT` environment variable is not set (Railway sets it automatically)
2. Check that start command is `npm start`
3. Verify API key is set correctly

---

## 📚 Next Steps

After deploying:

1. **Test Your Deployment**
   - Send a test message to your chat app
   - Try different AI models
   - Verify security features work

2. **Monitor Usage**
   - Check OpenAI/Anthropic usage dashboards
   - Set up billing alerts
   - Monitor rate limits

3. **Customize**
   - Modify the UI to match your brand
   - Add custom security rules
   - Integrate with your backend

4. **Scale**
   - Add caching with Redis
   - Implement user authentication
   - Add analytics and monitoring

---

## 🤝 Get Help

- **Issues:** [GitHub Issues](https://github.com/markdorsi/uni-ai/issues)
- **Documentation:** [Main README](./README.md)
- **Examples:** [examples/](./examples/)

---

**Built with Uni AI SDK** - Secure. Portable. Open.
