import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import TextInput from '../components/TextInput'
import { resetPassword } from '../services/authService'

function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
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

    if (!newPassword || !confirmPassword) {
      setMessageType('error')
      setMessage('Please fill in all password fields')
      return
    }

    if (newPassword.length < 6) {
      setMessageType('error')
      setMessage('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setMessageType('error')
      setMessage('Passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      const response = await resetPassword(token, newPassword)
      const data = response.data

      setMessageType('success')
      setMessage('Password reset successfully! Redirecting to login...')

      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      setMessageType('error')
      setMessage(error.response?.data?.message || 'Error resetting password. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password to reset your account."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <TextInput
            id="new-password"
            name="new-password"
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
            icon={Lock}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '40px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              fontSize: '13px'
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <TextInput
            id="confirm-password"
            name="confirm-password"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            icon={Lock}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '40px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              fontSize: '13px'
            }}
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button type="submit" className="primary-button" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>

        {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}
      </form>

      <p className="auth-footer-text">
        <Link to="/login" className="text-link">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default ResetPasswordPage
