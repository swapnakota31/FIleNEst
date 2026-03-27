import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Copy } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import TextInput from '../components/TextInput'
import { forgotPassword } from '../services/authService'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [resetLink, setResetLink] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setMessage('')
    setMessageType('')
    setResetLink('')

    if (!email) {
      setMessageType('error')
      setMessage('Please enter your email')
      return
    }

    try {
      setIsLoading(true)
      const response = await forgotPassword(email)
      const data = response.data

      setMessageType('success')
      setMessage(data.message || 'Reset link has been generated')
      setResetLink(data.resetLink || '')
      setEmail('')
    } catch (error) {
      setMessageType('error')
      setMessage(error.response?.data?.message || 'Unable to process request')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetLink)
    setMessage('Reset link copied to clipboard!')
    setMessageType('success')
    setTimeout(() => {
      setMessage('')
    }, 2000)
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we will generate a reset link."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <TextInput
          id="forgot-email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          icon={Mail}
        />

        <button type="submit" className="primary-button">
          {isLoading ? 'Generating...' : 'Generate Reset Link'}
        </button>

        {message ? <p className={`form-message ${messageType}`}>{message}</p> : null}

        {resetLink && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f0f8ff',
            border: '1px solid #0099ff',
            borderRadius: '6px',
            wordBreak: 'break-all'
          }}>
            <p style={{ marginBottom: '8px', fontSize: '14px', color: '#333' }}>
              Reset Link (for testing):
            </p>
            <p style={{ marginBottom: '12px', fontSize: '13px', color: '#0099ff', fontFamily: 'monospace' }}>
              {resetLink}
            </p>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#0099ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              <Copy size={14} /> Copy Link
            </button>
          </div>
        )}
      </form>

      <p className="auth-footer-text">
        <Link to="/login" className="text-link">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default ForgotPasswordPage
