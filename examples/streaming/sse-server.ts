/**
 * Server-Sent Events (SSE) Streaming Example
 *
 * Demonstrates how to stream AI responses to a web client using SSE.
 * This works with any platform (Node.js, Netlify, Vercel, etc.)
 *
 * Run with: tsx examples/streaming/sse-server.ts
 * Then open: http://localhost:3000
 */

import http from 'http'
import { ai } from '@uni-ai/sdk'

const server = http.createServer(async (req, res) => {
  // CORS headers for browser access
  const setCORSHeaders = () => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }

  setCORSHeaders()

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // Serve a simple HTML client
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Uni AI Streaming Demo</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; }
    #prompt { width: 100%; padding: 10px; font-size: 16px; }
    button { padding: 10px 20px; font-size: 16px; cursor: pointer; margin-top: 10px; }
    #output { margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px; min-height: 100px; white-space: pre-wrap; }
    .loading { color: #666; font-style: italic; }
  </style>
</head>
<body>
  <h1>🚀 Uni AI Streaming Demo</h1>
  <input type="text" id="prompt" placeholder="Enter your prompt..." value="Write a short story about a robot learning to paint">
  <button onclick="streamResponse()">Stream Response</button>
  <div id="output"></div>

  <script>
    async function streamResponse() {
      const prompt = document.getElementById('prompt').value
      const output = document.getElementById('output')
      output.innerHTML = '<span class="loading">Streaming...</span>'
      output.textContent = ''

      const eventSource = new EventSource('/stream?prompt=' + encodeURIComponent(prompt))

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close()
          return
        }
        output.textContent += event.data
      }

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error)
        eventSource.close()
        output.innerHTML = '<span style="color: red;">Error occurred. Check console.</span>'
      }
    }
  </script>
</body>
</html>
    `)
    return
  }

  // SSE streaming endpoint
  if (req.url?.startsWith('/stream')) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    const prompt = url.searchParams.get('prompt') || 'Hello!'

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    try {
      // Stream the AI response
      for await (const chunk of ai.stream('gpt-4', prompt, {
        temperature: 0.7,
        maxTokens: 500,
      })) {
        // Send SSE formatted data
        res.write(`data: ${chunk}\n\n`)
      }

      // Send completion signal
      res.write('data: [DONE]\n\n')
      res.end()
    } catch (error) {
      console.error('Streaming error:', error)
      res.write(`data: Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\n`)
      res.end()
    }
    return
  }

  // 404
  res.writeHead(404)
  res.end('Not Found')
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`🚀 SSE Streaming Server running on http://localhost:${PORT}`)
  console.log(`Open http://localhost:${PORT} in your browser`)
})
