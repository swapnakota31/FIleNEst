import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trash2, Undo2, FileText, Archive } from 'lucide-react'
import FileItem from '../components/FileItem'
import EmptyState from '../components/EmptyState'
import {
  getDeletedUserFiles,
  permanentlyDeleteUserFile,
  restoreUserFile
} from '../services/fileService'

function DeletedFiles() {
  const navigate = useNavigate()
  const { showToast } = useOutletContext()
  const [deletedFiles, setDeletedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

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

  const formatDate = (value) => {
    if (!value) {
      return 'N/A'
    }

    return new Date(value).toLocaleDateString()
  }

  const loadDeletedFiles = async () => {
    try {
      setIsLoading(true)
      const response = await getDeletedUserFiles()
      setDeletedFiles(response.data.files || [])
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
        return
      }

      const errorMessage = error.response?.data?.message || 'Unable to load deleted files'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDeletedFiles()
  }, [])

  const handleRestore = async (fileId) => {
    try {
      await restoreUserFile(fileId)
      setMessage('File restored successfully')
      showToast('File restored successfully', 'success')
      await loadDeletedFiles()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to restore file'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    }
  }

  const handlePermanentDelete = async (fileId) => {
    try {
      await permanentlyDeleteUserFile(fileId)
      setMessage('File permanently deleted')
      showToast('File permanently deleted', 'success')
      await loadDeletedFiles()
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Unable to permanently delete file'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    }
  }

  return (
    <motion.section
      className="dashboard-page"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <article className="list-card">
        <h3>
          <Archive size={18} /> Deleted Files
        </h3>
        {message ? <p className="form-message success">{message}</p> : null}

        <div className="file-list">
          {isLoading ? <p>Loading deleted files...</p> : null}

          {!isLoading && deletedFiles.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No deleted files"
              description="Files moved to trash will appear here."
            />
          ) : null}

          {deletedFiles.map((file) => (
            <FileItem
              key={file.id}
              name={file.file_name}
              size={formatBytes(file.file_size)}
              dateLabel="Deleted"
              dateValue={formatDate(file.deleted_at)}
              fileIcon={FileText}
              actions={[
                {
                  label: 'Restore',
                  icon: Undo2,
                  variant: 'success',
                  onClick: () => handleRestore(file.id)
                },
                {
                  label: 'Delete Permanently',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: () => handlePermanentDelete(file.id)
                }
              ]}
            />
          ))}
        </div>
      </article>
    </motion.section>
  )
}

export default DeletedFiles
