import express from 'express'
import {
  authBase,
  login,
  signup,
  forgotPassword,
  resetPassword,
  logout,
  profile
} from '../controllers/authController.js'

const router = express.Router()

// Authentication routes
router.get('/', authBase)
router.get('/profile', profile)
router.post('/login', login)
router.post('/signup', signup)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)
router.post('/logout', logout)

export default router
