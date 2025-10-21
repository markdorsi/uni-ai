import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Uni AI Chat',
  description: 'Chat with AI using Uni AI SDK',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
