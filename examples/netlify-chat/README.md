# Netlify Edge Chat Example

A beautiful, serverless chat application built with Netlify Edge Functions and Uni AI SDK, demonstrating edge computing with AI.

## Features

- ✅ **Edge Computing** - Runs on Netlify's global edge network
- ✅ **Beautiful UI** - Modern gradient design with animations
- ✅ **Multiple AI Models** - Switch between GPT-4, GPT-3.5, and Claude
- ✅ **Zero Backend Setup** - Serverless edge functions
- ✅ **Strict Security** - PII detection, rate limiting, validation
- ✅ **Static Frontend** - Pure HTML/CSS/JavaScript
- ✅ **Global Performance** - Low latency worldwide
- ✅ **One-Click Deploy** - Deploy to Netlify in seconds

## Tech Stack

- **Edge Runtime**: Netlify Edge Functions (Deno)
- **AI SDK**: @uni-ai/sdk
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Deployment**: Netlify
- **Security**: Strict preset (built-in)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key (required)
- An Anthropic API key (optional, for Claude models)
- Netlify account (for deployment)

### Local Development

1. **Navigate to the example directory**:
   ```bash
   cd examples/netlify-chat
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

4. **Run locally with Netlify CLI**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:8888](http://localhost:8888)

## Project Structure

```
netlify-chat/
├── netlify/
│   └── edge-functions/
│       └── chat.ts              # Edge function for chat API
├── public/
│   ├── index.html               # Main HTML page
│   ├── styles.css               # Styling
│   └── app.js                   # Client-side JavaScript
├── .env.example                 # Environment variables template
├── netlify.toml                 # Netlify configuration
├── package.json                 # Dependencies
└── README.md                    # This file
```

## How It Works

### Edge Function (`netlify/edge-functions/chat.ts`)

The edge function handles chat requests on Netlify's global network:

```typescript
import { generate } from '@uni-ai/sdk'

export default async (request: Request) => {
  const { messages, model, security } = await request.json()

  const result = await generate({
    model,
    messages,
    security: 'strict', // Enables all security features
  })

  return new Response(JSON.stringify({
    message: { role: 'assistant', content: result.text },
    usage: result.usage,
  }))
}
```

**Benefits of Edge Functions:**
- ⚡ Low latency - Runs close to users worldwide
- 🌍 Global distribution - Deployed to 100+ locations
- 💰 Cost-effective - Pay per request
- 🔒 Secure - No server to manage

### Frontend (`public/app.js`)

The client-side JavaScript handles UI and API calls:

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ messages, model, security: 'strict' }),
})

const data = await response.json()
// Display assistant's response
```

## Deployment

### Deploy to Netlify (One-Click)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Netlify chat example"
   git push
   ```

2. **Import to Netlify**:
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository
   - Select the `examples/netlify-chat` directory

3. **Configure environment variables**:
   - In Netlify dashboard, go to Site settings → Environment variables
   - Add:
     - `OPENAI_API_KEY` = your OpenAI key
     - `ANTHROPIC_API_KEY` = your Anthropic key (optional)

4. **Deploy**:
   - Click "Deploy site"
   - Your app will be live at `https://your-site.netlify.app`

### Deploy with Netlify CLI

```bash
# Login to Netlify
npm run deploy

# Or deploy to production
netlify deploy --prod
```

Follow the prompts to create a new site or link to an existing one.

## Available Models

| Model | Provider | Best For |
|-------|----------|----------|
| `gpt-4` | OpenAI | Complex reasoning, high quality |
| `gpt-3.5-turbo` | OpenAI | Fast, cost-effective |
| `claude-3-5-sonnet` | Anthropic | Analysis, long context |

## Security Features

This app uses Uni AI SDK's **strict** security preset:

### Rate Limiting
- 20 requests/minute per user
- 100 requests/hour per user
- Prevents abuse and controls costs

### PII Detection
Automatically detects and redacts:
- SSN (Social Security Numbers)
- Email addresses
- Phone numbers
- Credit card numbers
- IP addresses

### Input Validation
- Maximum input length: 4000 characters
- Automatic sanitization
- XSS protection

### Prompt Injection Protection
- Pattern-based detection
- Blocks malicious inputs

## Customization

### Change the System Prompt

Edit `public/app.js`:

```javascript
let messages = [
  {
    role: 'system',
    content: 'Your custom system prompt here',
  },
]
```

### Add More Models

Edit `public/index.html`:

```html
<select id="model-select" class="model-select">
  <option value="gpt-4">GPT-4</option>
  <option value="your-model">Your Model</option>
</select>
```

### Customize Styling

All styles are in `public/styles.css`. The design uses:
- CSS gradients for modern look
- CSS animations for smooth interactions
- Flexbox for layout
- CSS custom properties for easy theming

### Change Security Level

Edit `netlify/edge-functions/chat.ts`:

```typescript
const result = await generate({
  model,
  messages,
  security: 'moderate', // or 'permissive'
})
```

## Performance

### Edge Network Benefits

- **Global CDN**: Deployed to 100+ edge locations
- **Low Latency**: <50ms response time worldwide
- **Auto-scaling**: Handles traffic spikes automatically
- **Zero Cold Starts**: Always ready to respond

### Optimization Tips

1. **Use GPT-3.5 Turbo** for faster responses
2. **Limit max tokens** to reduce latency
3. **Implement caching** for common queries
4. **Use streaming** for real-time responses (future enhancement)

## Monitoring

### View Logs

```bash
netlify functions:log chat
```

### View Analytics

- Netlify Dashboard → Analytics
- See request counts, response times, errors

## Troubleshooting

### "API key not found" error

Make sure you've:
1. Added API keys in Netlify dashboard (Site settings → Environment variables)
2. Redeployed the site after adding keys

### Edge function not working

Check:
- `netlify.toml` configuration is correct
- Edge function is in `netlify/edge-functions/` directory
- Function file exports default function

### CORS errors

Edge functions automatically handle CORS. If you see CORS errors:
- Check the request is going to `/api/chat`
- Verify the function is deployed

### Slow responses

- Use a faster model (gpt-3.5-turbo)
- Reduce maxTokens parameter
- Check your network connection

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | Anthropic API key (for Claude) |

## Testing Locally

### Test the edge function directly:

```bash
curl -X POST http://localhost:8888/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "gpt-4",
    "security": "strict"
  }'
```

### Test PII detection:

```bash
curl -X POST http://localhost:8888/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "My SSN is 123-45-6789"}
    ],
    "model": "gpt-4"
  }'
```

Should return 400 error with PII detection message.

## Advanced Features

### Add Streaming (Future)

Netlify Edge Functions support streaming responses:

```typescript
const encoder = new TextEncoder()
const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of ai.stream(model, prompt)) {
      controller.enqueue(encoder.encode(chunk))
    }
    controller.close()
  },
})

return new Response(stream, {
  headers: { 'Content-Type': 'text/event-stream' },
})
```

### Add User Authentication

Integrate with Netlify Identity:

```javascript
import { NetlifyIdentity } from '@netlify/identity-widget'

// Require authentication
if (!context.clientContext.user) {
  return new Response('Unauthorized', { status: 401 })
}
```

### Add Database

Use Netlify's database or external services:

```typescript
import { createClient } from '@supabase/supabase-js'

// Store conversation history
await supabase.from('conversations').insert({ messages })
```

## Benefits of Netlify Edge

### vs Traditional Servers
- ✅ No server management
- ✅ Auto-scaling
- ✅ Global distribution
- ✅ Pay per request
- ✅ Zero cold starts

### vs Serverless Functions
- ✅ Faster (runs on edge, not centralized)
- ✅ Lower latency
- ✅ Better user experience
- ✅ More cost-effective at scale

## Learn More

- [Netlify Edge Functions Docs](https://docs.netlify.com/edge-functions/overview/)
- [Uni AI SDK Documentation](https://uni-ai.dev)
- [Deno Documentation](https://deno.land/manual)

## License

MIT

---

**Built with [Uni AI SDK](https://github.com/uni-ai/sdk)** - Secure. Portable. Open.

**Deployed on Netlify Edge** - Fast. Global. Serverless.
