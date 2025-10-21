export interface Template {
  id: string
  name: string
  description: string
  emoji: string
}

export function getTemplates(): Template[] {
  return [
    {
      id: 'nextjs',
      name: 'Next.js Chat',
      description: 'Full-stack chat app with App Router',
      emoji: '⚛️',
    },
    {
      id: 'express',
      name: 'Express API',
      description: 'RESTful API with TypeScript',
      emoji: '🚀',
    },
    {
      id: 'netlify',
      name: 'Netlify Edge',
      description: 'Serverless edge chat application',
      emoji: '🌍',
    },
  ]
}

export function getTemplate(id: string): Template | undefined {
  return getTemplates().find((t) => t.id === id)
}
