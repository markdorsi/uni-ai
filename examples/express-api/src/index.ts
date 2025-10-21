import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import chatRouter from './routes/chat.js'
import completionRouter from './routes/completion.js'
import { errorHandler } from './middleware/error-handler.js'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  })
)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API routes
app.use('/api/chat', chatRouter)
app.use('/api/completion', completionRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`)
  console.log(`📚 API documentation:`)
  console.log(`   POST /api/chat - Chat with AI`)
  console.log(`   POST /api/completion - Text completion`)
  console.log(`   GET  /health - Health check`)
})

export default app
