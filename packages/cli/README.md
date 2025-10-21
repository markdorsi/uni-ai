# create-uni-ai-app

The easiest way to create a new Uni AI application.

## Usage

### Interactive Mode (Recommended)

```bash
npx create-uni-ai-app
```

This will start an interactive wizard that guides you through:
1. Choosing a project name
2. Selecting a template
3. Picking your AI model
4. Optionally configuring your API key

### With Arguments

```bash
npx create-uni-ai-app my-app
```

### With Template

```bash
npx create-uni-ai-app my-app --template nextjs
```

## Templates

| Template | Description | Best For |
|----------|-------------|----------|
| **nextjs** | Full-stack chat with Next.js 14 | Modern web apps with React |
| **express** | RESTful API with TypeScript | Backend APIs and microservices |
| **netlify** | Serverless edge chat | Global edge deployment |

## Options

```bash
npx create-uni-ai-app [project-name] [options]
```

**Options:**
- `-t, --template <template>` - Template to use (nextjs, express, netlify)
- `--skip-install` - Skip npm install
- `--skip-git` - Skip git initialization
- `-h, --help` - Display help
- `-V, --version` - Display version

## Examples

### Create Next.js Chat App

```bash
npx create-uni-ai-app my-chat --template nextjs
cd my-chat
npm run dev
```

### Create Express API

```bash
npx create-uni-ai-app my-api --template express
cd my-api
npm run dev
```

### Create Netlify Edge App

```bash
npx create-uni-ai-app my-edge --template netlify
cd my-edge
npm run dev
```

### Skip Installation

```bash
npx create-uni-ai-app my-app --skip-install
cd my-app
npm install
npm run dev
```

## What Gets Created

When you run `create-uni-ai-app`, it:

1. ✅ Creates a new directory with your project name
2. ✅ Copies the selected template
3. ✅ Configures your API key (if provided)
4. ✅ Installs dependencies (unless --skip-install)
5. ✅ Initializes git repository (unless --skip-git)
6. ✅ Shows you next steps

## After Creation

```bash
cd your-project-name

# If you didn't provide an API key during setup
echo "OPENAI_API_KEY=sk-..." >> .env

# Start development server
npm run dev
```

## Requirements

- Node.js 18 or higher
- npm, yarn, or pnpm

## Templates Details

### Next.js Template

Creates a full-stack chat application with:
- Next.js 14 App Router
- Server-side API routes
- Beautiful gradient UI
- TypeScript support
- CSS Modules

**Structure:**
```
my-app/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── components/
│       └── Chat.tsx
├── package.json
└── .env
```

### Express Template

Creates a RESTful API server with:
- Express.js 4
- TypeScript
- Security middleware
- Health checks
- Hot reload

**Structure:**
```
my-api/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── chat.ts
│   │   └── completion.ts
│   └── middleware/
│       └── error-handler.ts
├── package.json
└── .env
```

### Netlify Template

Creates a serverless edge app with:
- Netlify Edge Functions
- Static HTML/CSS/JS frontend
- Global deployment
- Zero cold starts

**Structure:**
```
my-edge/
├── netlify/
│   └── edge-functions/
│       └── chat.ts
├── public/
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── netlify.toml
└── .env
```

## Troubleshooting

### "command not found: npx"

Make sure you have Node.js and npm installed:
```bash
node --version
npm --version
```

### Permission denied

On macOS/Linux, you might need to use:
```bash
sudo npx create-uni-ai-app my-app
```

### API key not working

Make sure your `.env` file has the correct key:
```bash
# For OpenAI models (GPT-4, GPT-3.5)
OPENAI_API_KEY=sk-...

# For Anthropic models (Claude)
ANTHROPIC_API_KEY=sk-ant-...
```

## Learn More

- [Uni AI SDK Documentation](https://github.com/uni-ai/sdk)
- [Getting Started Guide](https://github.com/uni-ai/sdk/blob/main/GETTING_STARTED.md)
- [Examples](https://github.com/uni-ai/sdk/blob/main/EXAMPLES.md)
- [API Reference](https://github.com/uni-ai/sdk/tree/main/packages/core)

## License

MIT

---

**Built with [Uni AI SDK](https://github.com/uni-ai/sdk)** - Secure. Portable. Open.
