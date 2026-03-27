import db from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// Auth base route handler
export const authBase = (req, res) => {
  res.status(200).json({
    message: 'Auth API is running',
    endpoints: ['/signup', '/login', '/forgot-password', '/reset-password/:token', '/profile']
  })
}

// Login handler
export const login = (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const loginQuery = 'SELECT * FROM users WHERE email = ?'

  db.query(loginQuery, [email], (loginError, users) => {
    if (loginError) {
      return res.status(500).json({
        message: 'Server error',
        error: loginError.message
      })
    }

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = users[0]

    bcrypt.compare(password, user.password, (compareError, isMatch) => {
      if (compareError) {
        return res.status(500).json({
          message: 'Server error',
          error: compareError.message
        })
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' })
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({
          message: 'Server error',
          error: 'JWT_SECRET is not set'
        })
      }

      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      })
    })
  })
}

// Signup handler
export const signup = (req, res) => {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Name, email and password are required'
    })
  }

  const checkUserQuery = 'SELECT * FROM users WHERE email = ?'

  db.query(checkUserQuery, [email], (checkError, users) => {
    if (checkError) {
      return res.status(500).json({
        message: 'Server error',
        error: checkError.message
      })
    }

    if (users.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already registered'
      })
    }

    const insertUserQuery =
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'

    bcrypt.hash(password, 10, (hashError, hashedPassword) => {
      if (hashError) {
        return res.status(500).json({
          message: 'Server error',
          error: hashError.message
        })
      }

      db.query(insertUserQuery, [name, email, hashedPassword], (insertError, result) => {
        if (insertError) {
          return res.status(500).json({
            message: 'Server error',
            error: insertError.message
          })
        }

        return res.status(201).json({
          status: 'success',
          message: 'User registered successfully',
          userId: result.insertId
        })
      })
    })
  })
}

// Forgot password handler
export const forgotPassword = (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({
      status: 'error',
      message: 'Email is required'
    })
  }

  const findUserQuery = 'SELECT * FROM users WHERE email = ?'

  db.query(findUserQuery, [email], (findError, users) => {
    if (findError) {
      return res.status(500).json({
        status: 'error',
        message: 'Database error while checking email',
        error: findError.message
      })
    }

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Email not found'
      })
    }

    // Generate a secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    // Set expiry time to 1 hour from now
    const expiryTime = new Date()
    expiryTime.setHours(expiryTime.getHours() + 1)

    // Update user with reset token and expiry
    const updateTokenQuery = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?'

    db.query(updateTokenQuery, [resetToken, expiryTime, email], (updateError) => {
      if (updateError) {
        return res.status(500).json({
          status: 'error',
          message: 'Error generating reset token',
          error: updateError.message
        })
      }

      // Build reset link for frontend (deployment-safe)
      let frontendUrl = String(process.env.FRONTEND_URL || 'http://localhost:5173').trim()

      if (!/^https?:\/\//i.test(frontendUrl)) {
        frontendUrl = `https://${frontendUrl}`
      }

      frontendUrl = frontendUrl.replace(/\/+$/, '')
      const resetLink = `${frontendUrl}/reset-password/${resetToken}`

      return res.status(200).json({
        status: 'success',
        message: 'Reset password link generated',
        resetLink: resetLink,
        note: 'In production, this link would be sent via email'
      })
    })
  })
}

// Reset password handler
export const resetPassword = (req, res) => {
  const { token } = req.params
  const { newPassword } = req.body

  if (!token || !newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'Token and new password are required'
    })
  }

  // Find user with valid reset token
  const findTokenQuery = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()'

  db.query(findTokenQuery, [token], (findError, users) => {
    if (findError) {
      return res.status(500).json({
        status: 'error',
        message: 'Database error',
        error: findError.message
      })
    }

    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired reset token'
      })
    }

    const user = users[0]

    // Hash new password
    bcrypt.hash(newPassword, 10, (hashError, hashedPassword) => {
      if (hashError) {
        return res.status(500).json({
          status: 'error',
          message: 'Error hashing password',
          error: hashError.message
        })
      }

      // Update password and clear reset token
      const updatePasswordQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?'

      db.query(updatePasswordQuery, [hashedPassword, user.id], (updateError) => {
        if (updateError) {
          return res.status(500).json({
            status: 'error',
            message: 'Error updating password',
            error: updateError.message
          })
        }

        return res.status(200).json({
          status: 'success',
          message: 'Password reset successfully. You can now login with your new password.'
        })
      })
    })
  })
}

// Logout handler
export const logout = (req, res) => {
  res.status(200).json({
    message: 'Logout endpoint',
    status: 'success'
  })
}

// Profile handler (protected with Bearer token)
export const profile = (req, res) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' })
  }

  const token = authHeader.split(' ')[1]

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: 'Server error',
      error: 'JWT_SECRET is not set'
    })
  }

  jwt.verify(token, process.env.JWT_SECRET, (verifyError, decoded) => {
    if (verifyError) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    const profileQuery =
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1'

    db.query(profileQuery, [decoded.userId], (profileError, users) => {
      if (profileError) {
        return res.status(500).json({
          message: 'Server error',
          error: profileError.message
        })
      }

      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' })
      }

      return res.status(200).json({
        message: 'Profile fetched successfully',
        user: users[0]
      })
    })
  })
}
