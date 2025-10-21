# Live Deployment Guide

This guide walks you through deploying all three Uni AI SDK examples to production hosting platforms. By the end, you'll have live demo URLs to share!

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Deploy (One-Click)](#quick-deploy-one-click)
- [Manual Deployment](#manual-deployment)
  - [1. Next.js Chat → Vercel](#1-nextjs-chat--vercel)
  - [2. Netlify Edge Chat → Netlify](#2-netlify-edge-chat--netlify)
  - [3. Express API → Railway](#3-express-api--railway)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

### Required
- ✅ GitHub account (for one-click deploys)
- ✅ At least one AI provider API key:
  - OpenAI API key ([get one here](https://platform.openai.com/api-keys))
  - Anthropic API key ([get one here](https://console.anthropic.com/))
  - Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

### Optional
- 📦 Node.js 18+ (for CLI deployments)
- 🔧 Git (for CLI deployments)

---

## Quick Deploy (One-Click)

The fastest way to deploy is using one-click deploy buttons. No CLI required!

### 1. Next.js Chat → Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markdorsi/uni-ai/tree/main/examples/nextjs-chat&env=OPENAI_API_KEY,ANTHROPIC_API_KEY,GEMINI_API_KEY&envDescription=API%20keys%20for%20AI%20providers&project-name=uni-ai-nextjs-chat&repository-name=uni-ai-nextjs-chat)

**Steps:**
1. Click the button above
2. Sign in to Vercel (or create account)
3. Enter your API keys when prompted
4. Click "Deploy"
5. Wait ~2 minutes for deployment
6. Get your live URL: `https://your-project.vercel.app`

**Time:** ~3 minutes

---

### 2. Netlify Edge Chat → Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/markdorsi/uni-ai&base=examples/netlify-chat)

**Steps:**
1. Click the button above
2. Sign in to Netlify (or create account)
3. Click "Connect to GitHub"
4. Authorize Netlify
5. Click "Deploy site"
6. After deployment, go to Site Settings → Environment Variables
7. Add your API keys (see [Environment Variables](#environment-variables))
8. Trigger a redeploy
9. Get your live URL: `https://your-site.netlify.app`

**Time:** ~5 minutes

---

### 3. Express API → Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/markdorsi/uni-ai/tree/main/examples/express-api)

**Steps:**
1. Click the button above
2. Sign in to Railway (or create account)
3. Click "Deploy Now"
4. Add environment variables when prompted
5. Wait for deployment
6. Get your live URL from the Railway dashboard

**Time:** ~4 minutes

---

## Manual Deployment

For more control, deploy using the CLI tools and deployment scripts provided.

### 1. Next.js Chat → Vercel

**Option A: Using Deployment Script (Recommended)**

```bash
cd examples/nextjs-chat
./deploy.sh
```

The script will:
- ✅ Check for Vercel CLI (install if missing)
- ✅ Authenticate with Vercel
- ✅ Install dependencies
- ✅ Build the project
- ✅ Deploy to Vercel
- ✅ Provide next steps

**Option B: Manual Steps**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Authenticate
vercel login

# 3. Navigate to example
cd examples/nextjs-chat

# 4. Install dependencies
npm install

# 5. Create .env file
cp .env.example .env
# Edit .env and add your API keys

# 6. Build project
OPENAI_API_KEY=sk-dummy npm run build

# 7. Deploy
vercel --prod
```

**Setting Environment Variables:**

After deployment:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `OPENAI_API_KEY` (required)
   - `ANTHROPIC_API_KEY` (optional)
   - `GEMINI_API_KEY` (optional)
5. Redeploy: `vercel --prod`

**Expected Output:**
```
✅ Production: https://uni-ai-nextjs-chat.vercel.app [2m 14s]
```

---

### 2. Netlify Edge Chat → Netlify

**Option A: Using Deployment Script (Recommended)**

```bash
cd examples/netlify-chat
./deploy.sh
```

The script will:
- ✅ Check for Netlify CLI (install if missing)
- ✅ Authenticate with Netlify
- ✅ Install dependencies
- ✅ Build the project
- ✅ Deploy to Netlify
- ✅ Provide next steps

**Option B: Manual Steps**

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Authenticate
netlify login

# 3. Navigate to example
cd examples/netlify-chat

# 4. Install dependencies
npm install

# 5. Create .env file
cp .env.example .env
# Edit .env and add your API keys

# 6. Build project
npm run build

# 7. Deploy
netlify deploy --prod
```

**Setting Environment Variables:**

After deployment:
1. Go to [app.netlify.com](https://app.netlify.com)
2. Select your site
3. Go to Site Settings → Environment Variables
4. Add:
   - `OPENAI_API_KEY` (required)
   - `ANTHROPIC_API_KEY` (optional)
   - `GEMINI_API_KEY` (optional)
   - `OLLAMA_BASE_URL` (optional, for local Ollama)
5. Trigger redeploy: Deploys → Trigger deploy → Deploy site

**Expected Output:**
```
✅ Deploy is live!
   https://uni-ai-netlify-chat.netlify.app
```

---

### 3. Express API → Railway

**Option A: Using Deployment Script (Recommended)**

```bash
cd examples/express-api
./deploy.sh
```

The script will:
- ✅ Check for Railway CLI (install if missing)
- ✅ Authenticate with Railway
- ✅ Install dependencies
- ✅ Initialize Railway project
- ✅ Deploy to Railway
- ✅ Set environment variables
- ✅ Provide API URL

**Option B: Manual Steps**

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Authenticate
railway login

# 3. Navigate to example
cd examples/express-api

# 4. Install dependencies
npm install

# 5. Create .env file
cp .env.example .env
# Edit .env and add your API keys

# 6. Initialize Railway project
railway init

# 7. Deploy
railway up

# 8. Set environment variables
railway variables set OPENAI_API_KEY=sk-...
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set GEMINI_API_KEY=...

# 9. Get deployment URL
railway open
```

**Expected Output:**
```
✅ Deployment successful!
   https://uni-ai-express-api.up.railway.app
```

---

## Environment Variables

All examples require environment variables for AI provider API keys.

### Required Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `OPENAI_API_KEY` | OpenAI API key | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

### Optional Variables

| Variable | Description | Where to get | Default |
|----------|-------------|--------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude models | [console.anthropic.com](https://console.anthropic.com/) | None |
| `GEMINI_API_KEY` | Google Gemini API key | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | None |
| `GOOGLE_API_KEY` | Alternative to GEMINI_API_KEY | Same as above | None |
| `OLLAMA_BASE_URL` | Ollama instance URL (for local models) | Your Ollama server | `http://localhost:11434` |
| `PORT` | Server port (Express API only) | - | `3000` |

### API Key Format

Make sure your API keys follow the correct format:

- **OpenAI**: `sk-...` (starts with `sk-`)
- **Anthropic**: `sk-ant-...` (starts with `sk-ant-`)
- **Gemini**: Any string (no specific format)

### Security Best Practices

✅ **DO:**
- Store API keys in platform environment variables
- Use different API keys for development and production
- Rotate API keys regularly
- Use usage limits on API keys

❌ **DON'T:**
- Commit `.env` files to Git
- Share API keys publicly
- Use personal API keys in shared projects
- Hardcode API keys in source code

---

## Post-Deployment

After deploying, verify everything works:

### 1. Test the Deployment

**Next.js Chat:**
```bash
# Open in browser
open https://your-project.vercel.app

# Test the chat interface
# 1. Select a model (GPT-4, Claude, Gemini)
# 2. Type a message
# 3. Verify you get a response
```

**Netlify Edge Chat:**
```bash
# Open in browser
open https://your-site.netlify.app

# Test the chat interface
# Same as Next.js Chat
```

**Express API:**
```bash
# Health check
curl https://your-api.railway.app/health

# Test chat endpoint
curl -X POST https://your-api.railway.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gpt-4"
  }'

# Test completion endpoint
curl -X POST https://your-api.railway.app/api/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Say hello!",
    "model": "gpt-4"
  }'
```

### 2. Monitor Usage

**Vercel:**
- Dashboard: [vercel.com/dashboard](https://vercel.com/dashboard)
- View: Analytics, Logs, Deployments
- Limits: Check usage against plan limits

**Netlify:**
- Dashboard: [app.netlify.com](https://app.netlify.com)
- View: Functions, Deploys, Analytics
- Limits: Check bandwidth and function invocations

**Railway:**
- Dashboard: [railway.app/dashboard](https://railway.app/dashboard)
- View: Metrics, Logs, Deployments
- Limits: Check usage against plan limits

### 3. Set Up Custom Domain (Optional)

All platforms support custom domains:

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records
4. Enable HTTPS (automatic)

**Netlify:**
1. Go to Site Settings → Domain management
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

**Railway:**
1. Go to Project Settings
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic)

---

## Troubleshooting

### Common Issues

#### ❌ "API key not found" error

**Symptoms:** Application shows error about missing API key

**Solution:**
1. Verify environment variable is set in platform dashboard
2. Check variable name matches exactly (case-sensitive)
3. Redeploy after adding variables
4. Check deployment logs for confirmation

#### ❌ Build fails with "Module not found"

**Symptoms:** Deployment fails during build step

**Solution:**
```bash
# For monorepo examples, build from root:
cd ../../
npm install
npm run build

# Then deploy the specific example
cd examples/nextjs-chat
vercel --prod
```

#### ❌ "Rate limit exceeded" error

**Symptoms:** API returns 429 status code

**Solution:**
- This is the built-in security working correctly
- Wait 1 minute and try again
- For production: Consider adjusting rate limits in code
- For development: Use `'permissive'` security preset

#### ❌ Edge Function timeout

**Symptoms:** Request takes >10s and times out

**Solution:**
- Netlify Edge Functions: 10s limit (hard limit)
- Vercel Edge Functions: 25s limit on free plan
- Railway: No timeout on hobby plan
- Consider using streaming for longer responses

#### ❌ CORS errors in Express API

**Symptoms:** Browser shows CORS policy error

**Solution:**
```typescript
// Update CORS configuration in src/index.ts
app.use(cors({
  origin: ['https://your-frontend.com'],
  credentials: true
}))
```

#### ❌ Environment variables not loading

**Symptoms:** Variables undefined in application

**Solution:**
1. **Vercel**: Variables must be set per environment (Production, Preview, Development)
2. **Netlify**: Variables must be set for both Build and Functions
3. **Railway**: Use `railway variables set` command
4. Always redeploy after setting variables

### Platform-Specific Issues

#### Vercel

**Build Command Issues:**
```bash
# If build fails in monorepo, use:
cd ../../ && npm install && npm run build && cd examples/nextjs-chat && npm run build
```

**Function Size Limit:**
- Free plan: 50MB limit
- Pro plan: 250MB limit
- Solution: Optimize dependencies or upgrade plan

#### Netlify

**Edge Function Cold Starts:**
- First request may be slow (~2s)
- Subsequent requests are fast (<100ms)
- No solution needed (expected behavior)

**Build Plugin Issues:**
```bash
# Clear cache and rebuild:
netlify build --clear-cache
```

#### Railway

**Port Configuration:**
```typescript
// Railway automatically sets PORT variable
const PORT = process.env.PORT || 3000
app.listen(PORT)
```

**Database Connection:**
```bash
# Railway provides DATABASE_URL automatically if you add a database
railway variables
```

### Getting Help

If you're still stuck:

1. **Check deployment logs:**
   - Vercel: Dashboard → Deployments → View Logs
   - Netlify: Dashboard → Deploys → Deploy log
   - Railway: Dashboard → Deployments → Logs

2. **Platform documentation:**
   - [Vercel Docs](https://vercel.com/docs)
   - [Netlify Docs](https://docs.netlify.com)
   - [Railway Docs](https://docs.railway.app)

3. **Uni AI SDK issues:**
   - [GitHub Issues](https://github.com/markdorsi/uni-ai/issues)
   - Include: Platform, error message, deployment logs

---

## Platform Comparison

Quick comparison to help you choose:

| Feature | Vercel | Netlify | Railway |
|---------|--------|---------|---------|
| **Best For** | Next.js apps | Edge functions | APIs & backends |
| **Free Tier** | ✅ Generous | ✅ Good | ✅ Starter plan |
| **Edge Network** | ✅ Yes | ✅ Yes | ❌ No |
| **Deployment Speed** | ⚡ Fast (2min) | ⚡ Fast (2min) | 🐌 Slower (3-5min) |
| **Custom Domains** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Auto HTTPS** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Environment Variables** | ✅ Per env | ✅ Global | ✅ Per service |
| **Build Minutes** | 6000/month | 300/month | Unlimited |
| **Bandwidth** | 100GB/month | 100GB/month | Unlimited |
| **Function Timeout** | 10s (hobby)<br>60s (pro) | 10s (edge)<br>26s (functions) | No limit |

**Recommendation:**
- **Next.js Chat** → Vercel (native Next.js support)
- **Netlify Edge Chat** → Netlify (edge functions optimized)
- **Express API** → Railway (backend-first platform)

---

## Next Steps

After successfully deploying:

1. ✅ **Share your demos!**
   - Add URLs to your portfolio
   - Share on social media
   - Include in documentation

2. ✅ **Monitor and optimize:**
   - Set up error tracking
   - Monitor API costs
   - Optimize bundle sizes

3. ✅ **Customize:**
   - Add your branding
   - Customize system prompts
   - Add authentication

4. ✅ **Scale:**
   - Upgrade hosting plans as needed
   - Add Redis for rate limiting
   - Set up monitoring/alerts

---

## Deployment Checklist

Use this checklist to ensure successful deployment:

### Before Deployment

- [ ] Have at least one AI provider API key
- [ ] Tested locally (`npm run dev`)
- [ ] Reviewed security settings
- [ ] Prepared environment variables
- [ ] Reviewed pricing/limits for platform

### During Deployment

- [ ] Chose deployment platform
- [ ] Ran deployment script or clicked deploy button
- [ ] Added environment variables
- [ ] Waited for build to complete
- [ ] Noted the deployment URL

### After Deployment

- [ ] Tested all features work
- [ ] Verified environment variables loaded
- [ ] Checked deployment logs for errors
- [ ] Set up custom domain (optional)
- [ ] Enabled analytics/monitoring
- [ ] Documented the live URL

---

**🎉 Congratulations!** Your Uni AI SDK examples are now live!

For more information, see:
- [Main README](README.md)
- [Getting Started Guide](GETTING_STARTED.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Security Best Practices](packages/core/README.md#security)

---

**Built with [Uni AI SDK](https://github.com/markdorsi/uni-ai)** - Secure. Portable. Open.
