# Uni AI SDK Documentation

Professional documentation site built with VitePress.

## 🚀 Deploy

### One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/markdorsi/uni-ai/tree/main/docs&project-name=uni-ai-docs&repository-name=uni-ai-docs)

### One-Click Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/markdorsi/uni-ai&base=docs)

### Manual Deployment

```bash
# Clone the repository
git clone https://github.com/markdorsi/uni-ai.git
cd uni-ai/docs

# Install dependencies
npm install

# Build for production
npm run build

# Deploy using the script
./deploy.sh
```

## 📦 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation Structure

```
docs/
├── .vitepress/
│   └── config.ts          # VitePress configuration
├── guide/
│   ├── what-is-uni-ai.md
│   ├── getting-started.md
│   ├── quick-start.md
│   └── security.md
├── api/
│   └── core.md            # Core SDK API reference
├── examples/
│   └── index.md           # Examples showcase
├── index.md               # Landing page
├── changelog.md
└── contributing.md
```

## 🛠️ Technologies

- VitePress 1.6.4
- Vue 3.5.22
- TypeScript
- Markdown

## 📖 Features

- ✅ Responsive design
- ✅ Dark/light themes
- ✅ Built-in search
- ✅ Sidebar navigation
- ✅ Code syntax highlighting
- ✅ SEO optimized
- ✅ Fast builds (~2 seconds)

## 🌐 Live Site

Once deployed, the documentation will be available at your Vercel/Netlify URL.

## 📝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## 📄 License

MIT
