import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import config from './config/config.js'
import authRoutes from './routes/authRoutes.js'
import fileRoutes from './routes/fileRoutes.js'
import "./config/db.js";

// Initialize Express app
const app = express()

// Respect reverse-proxy headers in deployed environments.
app.set('trust proxy', true)

// Middleware
app.use(cors())
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
})
