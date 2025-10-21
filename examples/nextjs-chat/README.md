# Next.js Chat Example

A modern chat application built with Next.js 14 and Uni AI SDK, demonstrating how to build AI-powered conversational interfaces with security built-in.

## 🚀 Deploy

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markdorsi/uni-ai/tree/main/examples/nextjs-chat&env=OPENAI_API_KEY,ANTHROPIC_API_KEY,GEMINI_API_KEY&envDescription=API%20keys%20for%20AI%20providers&project-name=uni-ai-nextjs-chat&repository-name=uni-ai-nextjs-chat)

Click the button above to deploy to Vercel in one click! (~3 minutes)

### CLI Deploy

Use the provided deployment script:

```bash
cd examples/nextjs-chat
./deploy.sh
```

The script will guide you through authentication, building, and deploying.

### Manual Deploy

See the [Live Deployment Guide](../../LIVE_DEPLOYMENT.md) for detailed instructions.

## Features

- ✅ **Multiple AI Models** - Switch between GPT-4, GPT-3.5 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash, Gemini Pro, and Llama 3.2
- ✅ **4 AI Providers** - OpenAI, Anthropic, Google Gemini, and Ollama (local)
- ✅ **Strict Security** - Built-in PII detection, rate limiting, and input validation
- ✅ **Server-Side API Keys** - API keys stay secure on the server
- ✅ **Platform Adapter** - Uses @uni-ai/vercel for simplified deployment
- ✅ **Edge Runtime** - Optimized for Vercel Edge Functions
- ✅ **Modern UI** - Beautiful gradient design with animations
- ✅ **Real-time Chat** - Instant responses with loading states
- ✅ **Type-Safe** - Full TypeScript support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI SDK**: @uni-ai/sdk + @uni-ai/react
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Security**: Strict preset (PII detection, rate limiting, validation)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key (required)
- An Anthropic API key (optional, for Claude models)

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/uni-ai/sdk
   cd sdk/examples/nextjs-chat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your API keys:
   ```bash
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...  # Optional
   ```

4. **Build the project** (optional, for production):
   ```bash
   OPENAI_API_KEY=sk-dummy npm run build
   ```
   Note: A dummy key is needed for build. The actual key is only used at runtime.

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nextjs-chat/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # API endpoint for chat
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── globals.css            # Global styles
│   └── components/
│       ├── Chat.tsx               # Main chat component
│       └── Chat.module.css        # Chat styles
├── .env.example                   # Environment variables template
├── next.config.js                 # Next.js configuration
├── package.json                   # Dependencies
└── tsconfig.json                  # TypeScript configuration
```

## How It Works

### API Route (`src/app/api/chat/route.ts`)

The API route handles chat requests server-side:

```typescript
import { generate } from '@uni-ai/sdk'

export async function POST(req: NextRequest) {
  const { messages, model, security } = await req.json()

  const result = await generate({
    model,
    messages,
    security: 'strict', // Enables all security features
  })

  return NextResponse.json({
    message: {
      role: 'assistant',
      content: result.text,
    },
  })
}
```

**Security Features Enabled:**
- ✅ PII Detection (SSN, email, phone, credit card, IP)
- ✅ Rate Limiting (20 requests/minute per user)
- ✅ Input Validation (max 4000 chars, sanitization)
- ✅ Prompt Injection Protection

### Chat Component (`src/components/Chat.tsx`)

The client-side chat component:

```typescript
const handleSubmit = async (e) => {
  // Add user message
  setMessages([...messages, userMessage])

  // Call API
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, model, security: 'strict' }),
  })

  // Add assistant response
  const data = await response.json()
  setMessages([...messages, userMessage, data.message])
}
```

## Available Models

The example supports three AI models:

| Model | Provider | Description |
|-------|----------|-------------|
| **GPT-4** | OpenAI | Most capable, best for complex tasks |
| **GPT-3.5 Turbo** | OpenAI | Fast and cost-effective |
| **Claude 3.5 Sonnet** | Anthropic | Excellent reasoning and analysis |

## Security Presets

This example uses the **strict** security preset:

```typescript
{
  rateLimiting: {
    maxRequestsPerMinute: 20,
    maxRequestsPerHour: 100,
  },
  piiDetection: {
    enabled: true,
    action: 'redact', // Automatically redacts PII
  },
  inputValidation: {
    maxLength: 4000,
    sanitize: true,
  },
  promptInjection: {
    enabled: true,
    action: 'block',
  },
}
```

You can customize security in the API route or choose different presets:
- `'strict'` - Production-grade security (recommended)
- `'moderate'` - Balanced approach
- `'permissive'` - Development/testing only

## Customization

### Change the System Message

Edit `src/components/Chat.tsx`:

```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    role: 'system',
    content: 'Your custom system prompt here',
  },
])
```

### Add More Models

1. Update the model type:
   ```typescript
   const [model, setModel] = useState<'gpt-4' | 'your-model'>('gpt-4')
   ```

2. Add to the select dropdown:
   ```tsx
   <option value="your-model">Your Model</option>
   ```

3. Ensure the model is supported by Uni AI SDK

### Customize Styling

All styles are in `src/components/Chat.module.css`. The design uses:
- CSS Grid and Flexbox for layout
- CSS animations for smooth interactions
- CSS variables for easy theming
- Gradient backgrounds

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Add environment variables:
     - `OPENAI_API_KEY`
     - `ANTHROPIC_API_KEY` (optional)

3. **Deploy**:
   Click "Deploy" and your app will be live!

### Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Add environment variables** in Netlify dashboard

## Troubleshooting

### "API key not found" error

Make sure you've:
1. Created a `.env` file
2. Added your API keys
3. Restarted the development server

### Models not working

Check that:
- Your API key is valid
- You have credits/quota available
- The model name is correct

### Type errors

Run type check:
```bash
npm run lint
```

## Learn More

- [Uni AI SDK Documentation](https://uni-ai.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## License

MIT

---

**Built with [Uni AI SDK](https://github.com/uni-ai/sdk)** - Secure. Portable. Open.
