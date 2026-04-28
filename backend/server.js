import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import postsRouter from './routes/posts.js'
import uploadRouter from './routes/upload.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 3000

// Parse CORS origins from env
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true)
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`))
    }
  },
  credentials: true,
}))

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes
app.use('/api/posts', postsRouter)
app.use('/api/upload', uploadRouter)

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[Adeen API] Running on port ${PORT}`)
})

export default app
