# Examples

This document showcases all production-ready example applications built with Uni AI SDK.

## 📱 Overview

We've built 3 complete, deployment-ready applications demonstrating different use cases:

| Example | Type | Platform | Best For |
|---------|------|----------|----------|
| **[Next.js Chat](#nextjs-chat)** | Full-stack | Vercel | Modern web apps with React |
| **[Netlify Edge](#netlify-edge-chat)** | Serverless | Netlify | Global edge deployment |
| **[Express API](#express-rest-api)** | Backend | Any Node.js host | RESTful APIs and microservices |

All examples include:
- ✅ Full TypeScript support
- ✅ Strict security preset (PII detection, rate limiting)
- ✅ Multiple AI model support
- ✅ Comprehensive documentation
- ✅ One-click deployment options

---

## 🎨 Next.js Chat

**Full-stack chat application with Next.js 14 and App Router**

### Features

- 🎨 Beautiful gradient UI with CSS animations
- ⚡ Server-side API routes for secure key management
- 🔄 Real-time chat with loading states
- 🎯 Multiple AI models (GPT-4, GPT-3.5, Claude 3.5)
- 📱 Responsive design
- 🔒 Strict security built-in

### Tech Stack

- Next.js 14 (App Router)
- TypeScript
- CSS Modules
- @uni-ai/sdk

### Quick Start

```bash
cd examples/nextjs-chat
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deployment

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uni-ai/sdk/tree/main/examples/nextjs-chat)

**Manual deployment:**
```bash
npm run build
npm start
```

### Key Files

- `src/app/page.tsx` - Main chat page
- `src/app/api/chat/route.ts` - API endpoint
- `src/components/Chat.tsx` - Chat component
- `src/components/Chat.module.css` - Styling

### Screenshots

```
┌─────────────────────────────────────┐
│  Uni AI Chat                        │
│  Secure. Portable. Open.            │
├─────────────────────────────────────┤
│  Model: [GPT-4 ▼]  [Strict Security]│
├─────────────────────────────────────┤
│                                     │
│  👤 You                             │
│  ┌─────────────────────────────┐  │
│  │ Hello! How are you?         │  │
│  └─────────────────────────────┘  │
│                                     │
│  🤖 AI                              │
│  ┌─────────────────────────────┐  │
│  │ I'm doing well! How can I   │  │
│  │ help you today?             │  │
│  └─────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│  Type your message...     [Send]    │
└─────────────────────────────────────┘
```

### Use Cases

- Customer support chatbots
- Internal knowledge bases
- Educational platforms
- Personal AI assistants

### Learn More

📖 [Full Documentation](examples/nextjs-chat/README.md)

---

## 🌍 Netlify Edge Chat

**Serverless edge chat application with global deployment**

### Features

- ⚡ Edge Functions (runs globally on 100+ locations)
- 🚀 <50ms latency worldwide
- 🎨 Beautiful static frontend (HTML/CSS/JS)
- 📦 Zero build step required
- 🔄 Auto-scaling
- 🔒 Strict security built-in

### Tech Stack

- Netlify Edge Functions (Deno)
- Vanilla JavaScript
- HTML5 & CSS3
- @uni-ai/sdk

### Quick Start

```bash
cd examples/netlify-chat
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

Open [http://localhost:8888](http://localhost:8888)

### Deployment

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/uni-ai/sdk/tree/main/examples/netlify-chat)

**Manual deployment:**
```bash
netlify deploy --prod
```

### Key Files

- `public/index.html` - Frontend UI
- `public/app.js` - Client-side logic
- `public/styles.css` - Styling
- `netlify/edge-functions/chat.ts` - Edge function
- `netlify.toml` - Netlify configuration

### Edge Function

```typescript
import { generate } from '@uni-ai/sdk'

export default async (request: Request) => {
  const { messages, model } = await request.json()

  const result = await generate({
    model,
    messages,
    security: 'strict',
  })

  return new Response(JSON.stringify({
    message: { role: 'assistant', content: result.text }
  }))
}
```

### Performance

- **Latency**: <50ms globally
- **Cold Start**: ~0ms (edge is always warm)
- **Scaling**: Automatic
- **Locations**: 100+ worldwide

### Use Cases

- Global chat applications
- Low-latency AI responses
- Serverless architectures
- Cost-effective scaling

### Learn More

📖 [Full Documentation](examples/netlify-chat/README.md)

---

## 🚀 Express REST API

**Production-ready REST API with TypeScript and Express**

### Features

- 🔌 RESTful endpoints (/api/chat, /api/completion)
- 🛡️ Security middleware (Helmet, CORS)
- ❌ Comprehensive error handling
- ❤️ Health check endpoint
- 🔥 Hot reload with tsx watch
- 🐳 Docker support
- 🔒 Strict security built-in

### Tech Stack

- Express.js 4
- TypeScript 5
- @uni-ai/sdk
- tsx (hot reload)

### Quick Start

```bash
cd examples/express-api
npm install
cp .env.example .env
# Add your API keys to .env
npm run dev
```

API available at [http://localhost:3000](http://localhost:3000)

### Deployment

Multiple options available:

- **Railway**: One-click deploy
- **Render**: Automatic deploys from Git
- **Fly.io**: Global deployment
- **Docker**: Container deployment

See [deployment guide](examples/express-api#deployment) for details.

### API Endpoints

#### POST /api/chat

Chat with AI using conversation history.

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "gpt-4",
    "security": "strict"
  }'
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you?"
  },
  "usage": {
    "inputTokens": 10,
    "outputTokens": 8,
    "totalTokens": 18
  },
  "finishReason": "stop"
}
```

#### POST /api/completion

Simple text completion.

```bash
curl -X POST http://localhost:3000/api/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing",
    "model": "gpt-4"
  }'
```

#### GET /health

Health check endpoint.

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.45
}
```

### Key Files

- `src/index.ts` - Main server
- `src/routes/chat.ts` - Chat endpoint
- `src/routes/completion.ts` - Completion endpoint
- `src/middleware/error-handler.ts` - Error handling

### Use Cases

- Microservices architecture
- Backend for mobile apps
- API-first applications
- Integration with existing systems

### Learn More

📖 [Full Documentation](examples/express-api/README.md)

---

## 🔐 Security

All examples use Uni AI SDK's **strict security preset** by default:

### Built-in Protection

✅ **PII Detection** - Automatically detects and redacts:
- SSN (Social Security Numbers)
- Email addresses
- Phone numbers
- Credit card numbers
- IP addresses

✅ **Rate Limiting** - Prevents abuse:
- 20 requests/minute per user
- 100 requests/hour per user

✅ **Input Validation** - Ensures safe inputs:
- Maximum 4000 characters
- Automatic sanitization
- XSS protection

✅ **Prompt Injection Protection** - Blocks malicious inputs:
- Pattern-based detection
- Known attack signatures

### Security Example

```typescript
import { ai } from '@uni-ai/sdk'

// This will automatically detect and block PII
try {
  const result = await ai('gpt-4', 'My SSN is 123-45-6789', {
    security: 'strict'
  })
} catch (error) {
  // Error: PII detected in input
}
```

---

## 🎯 Choosing the Right Example

### Use Next.js when you want:
- ✅ Full-stack React application
- ✅ Server-side rendering
- ✅ Rich, interactive UI
- ✅ Vercel deployment

### Use Netlify Edge when you want:
- ✅ Global edge deployment
- ✅ Serverless architecture
- ✅ Static frontend
- ✅ Low latency worldwide

### Use Express API when you want:
- ✅ RESTful backend
- ✅ Microservices
- ✅ API-first architecture
- ✅ Integration with existing systems

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/uni-ai/sdk.git
cd sdk
```

### 2. Choose an Example

```bash
cd examples/nextjs-chat
# or
cd examples/netlify-chat
# or
cd examples/express-api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment

```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 5. Run Locally

```bash
npm run dev
```

### 6. Deploy

Each example includes detailed deployment instructions. Click the deploy buttons above for one-click deployment!

---

## 📊 Comparison

| Feature | Next.js | Netlify Edge | Express |
|---------|---------|--------------|---------|
| **Runtime** | Node.js | Deno Edge | Node.js |
| **Frontend** | React | Vanilla JS | N/A (API only) |
| **SSR** | ✅ Yes | ❌ No | ❌ No |
| **Global Edge** | ❌ No | ✅ Yes | ❌ No |
| **Bundle Size** | Medium | Small | Small |
| **Cold Start** | ~200ms | ~0ms | ~100ms |
| **Best For** | Full-stack apps | Global apps | APIs/Backends |
| **Complexity** | Medium | Low | Low |

---

## 🤝 Contributing

Found a bug or want to add an example? We welcome contributions!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-example`)
3. Commit your changes (`git commit -m 'Add amazing example'`)
4. Push to the branch (`git push origin feature/amazing-example`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 License

All examples are MIT licensed. See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **[Main README](README.md)** - Project overview
- **[Getting Started](GETTING_STARTED.md)** - Quick start guide
- **[Documentation](packages/core/README.md)** - API reference
- **[Changelog](CHANGELOG.md)** - Version history
- **[Status](STATUS.md)** - Project roadmap

---

<p align="center">
  <strong>Built with ❤️ using Uni AI SDK</strong>
</p>

<p align="center">
  Secure. Portable. Open.
</p>
