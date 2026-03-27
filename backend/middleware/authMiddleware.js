import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
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

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    }

    next()
  })
}
