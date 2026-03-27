import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import TextInput from '../components/TextInput'
import { signupUser } from '../services/authService'

function SignupPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setMessage('')
    setMessageType('')

    if (!fullName || !email || !password || !confirmPassword) {
      setMessageType('error')
      setMessage('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setMessageType('error')
      setMessage('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)

      await signupUser({
        name: fullName,
        email,
        password
      })

      setMessageType('success')
      setMessage('Account created successfully. Redirecting to login...')
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 1000)
    } catch (error) {
      setMessageType('error')
      setMessage(error.response?.data?.message || 'Unable to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout title="Sign Up" subtitle="Create your FileNest account in a minute.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextInput
          id="signup-name"
          name="fullName"
          label="Full Name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Your full name"
          icon={UserRound}
        />

        <TextInput
          id="signup-email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          icon={Mail}
        />

        <TextInput
          id="signup-password"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
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

        <TextInput
          id="signup-confirm-password"
          name="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Re-enter your password"
          icon={LockKeyhole}
          rightSlot={
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <button type="submit" className="primary-button">
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>

        {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}
      </form>

      <p className="auth-footer-text">
        Already have an account?{' '}
        <Link to="/login" className="text-link">
          Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default SignupPage
