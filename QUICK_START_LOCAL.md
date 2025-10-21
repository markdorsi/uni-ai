# Quick Start - Using Uni AI SDK Locally

This guide shows you how to use Uni AI SDK locally before it's published to npm.

## Prerequisites

- Node.js 18+ installed
- At least one AI provider API key

## Method 1: Test Script (Fastest - 1 minute)

```bash
# 1. Set your API key
export OPENAI_API_KEY=sk-your-key-here

# 2. Run the test script
node test-local.js
```

This will test all core features and confirm everything works.

## Method 2: Use the Examples (Recommended)

The examples are already configured to use the local packages:

### Next.js Chat App

```bash
cd examples/nextjs-chat
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
# Open http://localhost:3000
```

### Netlify Edge Chat

```bash
cd examples/netlify-chat
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
# Open http://localhost:8888
```

### Express API

```bash
cd examples/express-api
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
# API runs on http://localhost:3000
```

## Method 3: Create Your Own Project

### Using Direct Import

```bash
# Create a new directory
mkdir my-ai-app
cd my-ai-app

# Initialize
npm init -y

# Add "type": "module" to package.json
cat package.json | jq '. + {"type": "module"}' > package.json.tmp && mv package.json.tmp package.json

# Create your app
cat > index.js << 'EOF'
import { ai } from '../packages/core/dist/index.js'

const text = await ai('gpt-4', 'Explain quantum computing')
console.log(text)
EOF

# Run it
export OPENAI_API_KEY=sk-your-key-here
node index.js
```

### Using npm link

```bash
# In the uni-ai repo
cd packages/core
npm link

# In your project
mkdir my-ai-app
cd my-ai-app
npm init -y
npm link @uni-ai/sdk

# Create your app
cat > index.js << 'EOF'
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Hello!')
console.log(text)
EOF

# Run it
export OPENAI_API_KEY=sk-your-key-here
node index.js
```

## Method 4: Using file: Protocol in package.json

```bash
mkdir my-ai-app
cd my-ai-app
npm init -y

# Add local dependency
npm install ../uni-ai/packages/core

# Your package.json will have:
# "dependencies": {
#   "@uni-ai/sdk": "file:../uni-ai/packages/core"
# }

# Now use it normally
cat > index.js << 'EOF'
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Hello!')
console.log(text)
EOF

# Run it
export OPENAI_API_KEY=sk-your-key-here
node index.js
```

## Quick Examples

### Simple Text Generation

```javascript
import { ai } from './packages/core/dist/index.js'

const text = await ai('gpt-4', 'Explain TypeScript')
console.log(text)
```

### With Security

```javascript
import { ai } from './packages/core/dist/index.js'

const text = await ai('gpt-4', userInput, {
  security: 'strict'
})
console.log(text)
```

### Streaming

```javascript
import { ai } from './packages/core/dist/index.js'

for await (const chunk of ai.stream('gpt-4', 'Tell me a story')) {
  process.stdout.write(chunk)
}
```

### Advanced Usage

```javascript
import { generate } from './packages/core/dist/index.js'

const result = await generate({
  model: 'gpt-4',
  messages: [
    { role: 'system', content: 'You are a helpful assistant' },
    { role: 'user', content: 'Hello!' }
  ],
  temperature: 0.7,
  maxTokens: 500,
  security: 'strict'
})

console.log(result.text)
console.log(result.usage)
```

### Multiple Providers

```javascript
import { ai } from './packages/core/dist/index.js'

// OpenAI
const gpt = await ai('gpt-4', 'Hello')

// Anthropic
const claude = await ai('claude-3-5-sonnet', 'Hello')

// Google Gemini
const gemini = await ai('gemini-2.0-flash', 'Hello')

// Ollama (local)
const llama = await ai('llama3.2', 'Hello')
```

## Environment Variables

Create a `.env` file:

```bash
# Required (at least one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Optional
OLLAMA_BASE_URL=http://localhost:11434
```

Load it:

```javascript
import 'dotenv/config'
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Hello')
```

## Troubleshooting

### "Cannot find module"

Make sure you're using the correct path:
- Direct import: `'./packages/core/dist/index.js'`
- npm link: `'@uni-ai/sdk'`
- file: reference: Install with `npm install ../uni-ai/packages/core`

### "API key not found"

Make sure you've set the environment variable:
```bash
export OPENAI_API_KEY=sk-your-key-here
```

Or use a `.env` file with `dotenv`.

### TypeScript errors

If using TypeScript, make sure your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## Next Steps

- 📖 Read the full docs: `cd docs && npm run dev`
- 💻 Try the examples: `cd examples/nextjs-chat`
- 🚀 Build something awesome!

## When Published to NPM

Once published, you'll be able to install normally:

```bash
npm install @uni-ai/sdk
```

And use it the same way:

```javascript
import { ai } from '@uni-ai/sdk'

const text = await ai('gpt-4', 'Hello!')
console.log(text)
```
