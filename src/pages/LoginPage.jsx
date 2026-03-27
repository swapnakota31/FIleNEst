import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import TextInput from '../components/TextInput'
import { loginUser } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setMessage('')
    setMessageType('')

    if (!email || !password) {
      setMessageType('error')
      setMessage('Please enter email and password')
      return
    }

    try {
      setIsLoading(true)

      const response = await loginUser({ email, password })
      const data = response.data

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setMessageType('success')
      setMessage(`Welcome ${data.user.name}`)
      navigate('/dashboard')
    } catch (error) {
      setMessageType('error')
      setMessage(error.response?.data?.message || 'Unable to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Login" subtitle="Welcome back. Please sign in to continue.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextInput
          id="login-email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          icon={Mail}
        />

        <TextInput
          id="login-password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          icon={LockKeyhole}
          rightSlot={
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="form-row-end">
          <Link to="/forgot-password" className="text-link">
            Forgot Password?
          </Link>
        </div>

        <button type="submit" className="primary-button">
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}
      </form>

      <p className="auth-footer-text">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-link">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
