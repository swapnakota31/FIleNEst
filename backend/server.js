import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import config from './config/config.js'
import authRoutes from './routes/authRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import "./config/db.js";

const parseAllowedOrigins = () => {
  const configuredOrigins = String(
    process.env.CORS_ORIGIN || process.env.FRONTEND_URL || ''
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (configuredOrigins.length === 0) {
    return ['http://localhost:5173']
  }

  return configuredOrigins
}

const allowedOrigins = parseAllowedOrigins()

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) {
    return true
  }

  let requestUrl

  try {
    requestUrl = new URL(origin)
  } catch {
    return false
  }

  return allowedOrigins.some((allowedOrigin) => {
    if (!allowedOrigin.includes('*')) {
      return false
    }

    // Supports patterns like https://*.vercel.app
    const escaped = allowedOrigin
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
    const pattern = new RegExp(`^${escaped}$`, 'i')
    const normalizedRequestOrigin = `${requestUrl.protocol}//${requestUrl.host}`

    return pattern.test(normalizedRequestOrigin)
  })
}

// Initialize Express app
const app = express()

// Respect reverse-proxy headers in deployed environments.
app.set('trust proxy', true)

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server tools and non-browser requests with no Origin header.
      if (!origin) {
        return callback(null, true)
      }

      if (isAllowedOrigin(origin)) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
)
app.use(express.json())

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'FileNest backend is running',
    testEndpoint: '/api/test'
  })
})

// Test route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    message: 'Backend is running'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/files', fileRoutes)

// Start server
app.listen(config.port, () => {
  console.log(`FileNest Backend Server running on port ${config.port}`)
  console.log(`Environment: ${config.nodeEnv}`)
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`)
})
