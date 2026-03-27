import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Download, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSharedFileByToken } from '../services/fileService'
import { FILES_API_BASE_URL } from '../config/api'

function SharedFilePage() {
  const { token } = useParams()
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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
        const response = await getSharedFileByToken(token)
        setFile(response.data.file)
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load shared file')
      } finally {
        setIsLoading(false)
      }
    }

    loadSharedFile()
  }, [token])

  const handleDownload = () => {
    window.open(`${FILES_API_BASE_URL}/public/download/${token}`, '_blank')
  }

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

        {!isLoading && error ? <p className="form-message error">{error}</p> : null}

        {!isLoading && !error && file ? (
          <section className="shared-file-card">
            <h3 className="auth-title">
              <FileText size={18} /> {file.file_name}
            </h3>
            <p className="auth-subtitle">Size: {formatBytes(file.file_size)}</p>
            <p className="auth-subtitle">
              Uploaded: {new Date(file.uploaded_at).toLocaleDateString()}
            </p>

            <button type="button" className="primary-button" onClick={handleDownload}>
              <Download size={16} /> Download
            </button>
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

export default SharedFilePage
