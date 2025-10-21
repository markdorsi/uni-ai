# Express API Example

A production-ready REST API built with Express and Uni AI SDK, demonstrating how to build secure AI-powered APIs with TypeScript.

## 🚀 Deploy

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/uni-ai-express-api?referralCode=uni-ai)

Click the button above to deploy to Railway in one click! (~4 minutes)

**Alternative Platforms:**
- [Render](https://render.com/deploy?repo=https://github.com/markdorsi/uni-ai/tree/main/examples/express-api) - Alternative backend platform
- [Fly.io](https://fly.io/docs/hands-on/install-flyctl/) - Global edge deployment

### CLI Deploy

Use the provided deployment script:

```bash
cd examples/express-api
./deploy.sh
```

The script will guide you through authentication, building, and deploying to Railway.

### Manual Deploy

See the [Live Deployment Guide](../../LIVE_DEPLOYMENT.md) for detailed instructions on deploying to Railway, Render, or Fly.io.

## Features

- ✅ **RESTful API Design** - Clean, intuitive endpoints
- ✅ **Multiple AI Models** - GPT-4, GPT-3.5 Turbo, Claude 3.5 Sonnet, Gemini 2.0 Flash, Gemini Pro, Llama 3.2
- ✅ **4 AI Providers** - OpenAI, Anthropic, Google Gemini, and Ollama (local)
- ✅ **TypeScript** - Full type safety
- ✅ **Security Built-In** - Helmet, CORS, rate limiting, PII detection
- ✅ **Error Handling** - Comprehensive error middleware
- ✅ **Multiple Endpoints** - Chat and completion endpoints
- ✅ **Health Checks** - Monitoring and uptime tracking
- ✅ **Hot Reload** - Development mode with tsx watch
- ✅ **Production Ready** - Deploy to Railway, Render, or Fly.io

## Tech Stack

- **Framework**: Express.js 4
- **AI SDK**: @uni-ai/sdk
- **Language**: TypeScript 5
- **Security**: Helmet, CORS
- **Dev Tools**: tsx (hot reload)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenAI API key (required)
- An Anthropic API key (optional, for Claude models)

### Installation

1. **Navigate to the example directory**:
   ```bash
   cd examples/express-api
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
   PORT=3000
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...  # Optional
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Run in development mode** (with hot reload):
   ```bash
   npm run dev
   ```

5. **Test the API**:
   ```bash
   curl http://localhost:3000/health
   ```

## API Endpoints

### Health Check

**GET** `/health`

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "uptime": 123.45
}
```

### Chat Endpoint

**POST** `/api/chat`

Chat with AI using conversation history.

**Request Body:**
```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant" },
    { "role": "user", "content": "Hello!" }
  ],
  "model": "gpt-4",
  "security": "strict",
  "temperature": 0.7,
  "maxTokens": 1000
}
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "Hello! How can I help you today?"
  },
  "usage": {
    "inputTokens": 20,
    "outputTokens": 10,
    "totalTokens": 30
  },
  "finishReason": "stop",
  "model": "gpt-4"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "What is 2+2?"}
    ],
    "model": "gpt-4",
    "security": "strict"
  }'
```

### Completion Endpoint

**POST** `/api/completion`

Simple text completion.

**Request Body:**
```json
{
  "prompt": "Write a haiku about coding",
  "model": "gpt-4",
  "security": "strict",
  "temperature": 0.7,
  "maxTokens": 500
}
```

**Response:**
```json
{
  "completion": "Lines of code flow free\nLogic dances gracefully\nBugs flee, peace remains",
  "model": "gpt-4",
  "prompt": "Write a haiku about coding"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing in one sentence",
    "model": "gpt-4"
  }'
```

## Project Structure

```
express-api/
├── src/
│   ├── index.ts                  # Main server entry point
│   ├── middleware/
│   │   └── error-handler.ts      # Error handling middleware
│   └── routes/
│       ├── chat.ts               # Chat endpoint
│       └── completion.ts         # Completion endpoint
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Available Models

The API supports multiple AI models:

| Model | Provider | Best For |
|-------|----------|----------|
| `gpt-4` | OpenAI | Complex reasoning, high quality |
| `gpt-4-turbo` | OpenAI | Fast, cost-effective |
| `gpt-3.5-turbo` | OpenAI | Quick responses, lower cost |
| `claude-3-5-sonnet` | Anthropic | Analysis, long context |
| `claude-3-opus` | Anthropic | Highest quality |
| `claude-3-haiku` | Anthropic | Speed and efficiency |

## Security Features

This API uses Uni AI SDK's **strict** security preset by default:

### Rate Limiting
- 20 requests/minute per user
- 100 requests/hour per user

### PII Detection
- Automatically detects and redacts:
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

### Additional Security
- **Helmet**: Sets secure HTTP headers
- **CORS**: Configurable origin restrictions
- **JSON limit**: 10MB max payload
- **Error masking**: Hides sensitive errors in production

## Security Presets

You can customize security level in requests:

```json
{
  "security": "strict"    // Recommended for production
  "security": "moderate"  // Balanced approach
  "security": "permissive" // Development only
}
```

## Error Handling

The API returns appropriate HTTP status codes:

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error, PII detected) |
| 404 | Not Found |
| 429 | Rate Limit Exceeded |
| 500 | Internal Server Error |

**Error Response Format:**
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Development

### Run with hot reload:
```bash
npm run dev
```

### Type check:
```bash
npm run lint
```

### Build for production:
```bash
npm run build
```

### Run production build:
```bash
npm start
```

## Deployment

### Deploy to Railway

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize project**:
   ```bash
   railway init
   ```

4. **Add environment variables**:
   ```bash
   railway variables set OPENAI_API_KEY=sk-...
   railway variables set ANTHROPIC_API_KEY=sk-ant-...
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

### Deploy to Render

1. **Create `render.yaml`**:
   ```yaml
   services:
     - type: web
       name: uni-ai-api
       env: node
       buildCommand: npm install && npm run build
       startCommand: npm start
       envVars:
         - key: OPENAI_API_KEY
           sync: false
         - key: ANTHROPIC_API_KEY
           sync: false
   ```

2. **Push to GitHub** and connect to Render

3. **Add environment variables** in Render dashboard

### Deploy to Fly.io

1. **Install Fly CLI** and login

2. **Initialize**:
   ```bash
   fly launch
   ```

3. **Set secrets**:
   ```bash
   fly secrets set OPENAI_API_KEY=sk-...
   fly secrets set ANTHROPIC_API_KEY=sk-ant-...
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t uni-ai-api .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  uni-ai-api
```

## Testing with curl

### Health check:
```bash
curl http://localhost:3000/health
```

### Chat:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Tell me a joke"}
    ],
    "model": "gpt-4"
  }'
```

### Completion:
```bash
curl -X POST http://localhost:3000/api/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "The best programming language is",
    "model": "gpt-4",
    "maxTokens": 100
  }'
```

### Test PII detection:
```bash
curl -X POST http://localhost:3000/api/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "My SSN is 123-45-6789",
    "model": "gpt-4"
  }'
```

Should return 400 error with PII detection message.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `ANTHROPIC_API_KEY` | No | - | Anthropic API key |
| `CORS_ORIGIN` | No | * | Allowed CORS origins |

## Troubleshooting

### "API key not found" error

Make sure you've:
1. Created a `.env` file
2. Added your API keys
3. Restarted the server

### Port already in use

Change the port in `.env`:
```bash
PORT=3001
```

### CORS errors

Update `CORS_ORIGIN` in `.env`:
```bash
CORS_ORIGIN=https://your-frontend.com
```

## Learn More

- [Uni AI SDK Documentation](https://uni-ai.dev)
- [Express.js Documentation](https://expressjs.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## License

MIT

---

**Built with [Uni AI SDK](https://github.com/uni-ai/sdk)** - Secure. Portable. Open.
