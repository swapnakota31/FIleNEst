import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ExternalLink, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSharedFileByToken } from '../services/fileService'

function ShareFile() {
  const { token } = useParams()
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState('')

  const formatBytes = (bytes) => {
    const size = Number(bytes || 0)

    if (size < 1024) {
      return `${size} B`
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`
    }

    if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`
    }

    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  useEffect(() => {
    const loadSharedFile = async () => {
      try {
        setIsLoading(true)
        setStatus('')
        const response = await getSharedFileByToken(token)
        setFile(response.data.file)
      } catch (apiError) {
        const code = apiError.response?.status

        if (code === 410) {
          setStatus('expired')
        } else if (code === 404) {
          setStatus('invalid')
        } else {
          setStatus('invalid')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadSharedFile()
  }, [token])

  return (
    <main className="auth-shell">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <header className="auth-header">
          <h1 className="app-name">FileNest</h1>
          <p className="app-subtitle">Shared File</p>
        </header>

        {isLoading ? <p className="auth-subtitle">Loading shared file...</p> : null}

        {!isLoading && status === 'expired' ? (
          <p className="form-message error">This share link has expired</p>
        ) : null}

        {!isLoading && status === 'invalid' ? (
          <p className="form-message error">Invalid or broken link</p>
        ) : null}

        {!isLoading && !status && file ? (
          <section className="shared-file-card">
            <h3 className="auth-title">
              <FileText size={18} /> {file.file_name}
            </h3>
            <p className="auth-subtitle">Type: {file.file_type || 'Unknown'}</p>
            <p className="auth-subtitle">Size: {formatBytes(file.file_size)}</p>
            <p className="auth-subtitle">
              Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
            </p>
            <p className="auth-subtitle">
              Expiry:{' '}
              {file.share_expiry
                ? new Date(file.share_expiry).toLocaleString()
                : 'No expiry'}
            </p>

            <a
              className="primary-button"
              href={file.file_path}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={16} /> View / Open File
            </a>
          </section>
        ) : null}

        <p className="auth-footer-text">
          <Link to="/login" className="text-link">
            Back to FileNest
          </Link>
        </p>
      </motion.div>
    </main>
  )
}

export default ShareFile
