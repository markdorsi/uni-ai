import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Uni AI SDK',
  description: 'Secure. Portable. Open. The AI SDK that works everywhere.',

  ignoreDeadLinks: true,  // Temporary: some pages not yet created

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'Uni AI SDK' }],
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/core' },
      { text: 'Examples', link: '/examples/' },
      {
        text: 'v0.1.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Contributing', link: '/contributing' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is Uni AI?', link: '/guide/what-is-uni-ai' },
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'AI Providers', link: '/guide/providers' },
            { text: 'Security', link: '/guide/security' },
            { text: 'Streaming', link: '/guide/streaming' },
            { text: 'Error Handling', link: '/guide/error-handling' },
          ]
        },
        {
          text: 'Platforms',
          items: [
            { text: 'Vercel', link: '/guide/platforms/vercel' },
            { text: 'Netlify', link: '/guide/platforms/netlify' },
            { text: 'Node.js', link: '/guide/platforms/nodejs' },
            { text: 'Edge Runtime', link: '/guide/platforms/edge' },
          ]
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Custom Providers', link: '/guide/custom-providers' },
            { text: 'Rate Limiting', link: '/guide/rate-limiting' },
            { text: 'PII Detection', link: '/guide/pii-detection' },
            { text: 'Best Practices', link: '/guide/best-practices' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Core SDK', link: '/api/core' },
            { text: 'React Hooks', link: '/api/react' },
            { text: 'Vercel Adapter', link: '/api/vercel' },
            { text: 'Netlify Adapter', link: '/api/netlify' },
          ]
        },
        {
          text: 'Types',
          items: [
            { text: 'Messages', link: '/api/types/messages' },
            { text: 'Security', link: '/api/types/security' },
            { text: 'Providers', link: '/api/types/providers' },
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Next.js Chat', link: '/examples/nextjs-chat' },
            { text: 'Netlify Edge Chat', link: '/examples/netlify-chat' },
            { text: 'Express API', link: '/examples/express-api' },
          ]
        },
        {
          text: 'Tutorials',
          items: [
            { text: 'Building a Chat App', link: '/examples/tutorial-chat' },
            { text: 'Securing Your API', link: '/examples/tutorial-security' },
            { text: 'Deploying to Production', link: '/examples/tutorial-deploy' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/markdorsi/uni-ai' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Uni AI SDK'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/markdorsi/uni-ai/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    }
  }
})
