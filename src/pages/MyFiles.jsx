import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  ArrowUpDown,
  Eye,
  Share2,
  Trash2,
  FileText,
  Image,
  FileSpreadsheet,
  FileVideo,
  Archive,
  Sparkles
} from 'lucide-react'
import FileItem from '../components/FileItem'
import ShareModal from '../components/ShareModal'
import EmptyState from '../components/EmptyState'
import { openFileInBrowser } from '../utils/fileView'
import {
  getUserFiles,
  shareUserFile,
  unshareUserFile,
  softDeleteUserFile
} from '../services/fileService'

function MyFiles() {
  const navigate = useNavigate()
  const { showToast } = useOutletContext()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filesData, setFilesData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isShareLoading, setIsShareLoading] = useState(false)
  const [shareResult, setShareResult] = useState(null)
  const [shareError, setShareError] = useState('')

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

  const loadFiles = async () => {
    try {
      setIsLoading(true)
      const response = await getUserFiles()
      setFilesData(response.data.files || [])
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
        return
      }

      const errorMessage = error.response?.data?.message || 'Unable to load files'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const getFileIcon = (fileName) => {
    const lower = fileName.toLowerCase()

    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      return Image
    }

    if (lower.endsWith('.xlsx') || lower.endsWith('.csv')) {
      return FileSpreadsheet
    }

    if (lower.endsWith('.mp4') || lower.endsWith('.mov')) {
      return FileVideo
    }

    return FileText
  }

  const files = useMemo(() => {
    let filtered = filesData.filter((file) =>
      file.file_name.toLowerCase().includes(search.toLowerCase())
    )

    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.file_name.localeCompare(b.file_name))
    }

    if (sortBy === 'oldest') {
      filtered = [...filtered].sort(
        (a, b) => new Date(a.uploaded_at) - new Date(b.uploaded_at)
      )
    }

    if (sortBy === 'newest') {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at)
      )
    }

    return filtered
  }, [filesData, search, sortBy])

  const normalizeShareLink = (rawLink, shareToken = '') => {
    const cleanLink = String(rawLink || '').trim()

    if (/^https?:\/\//i.test(cleanLink)) {
      return cleanLink
    }

    if (cleanLink.startsWith('/')) {
      return `${window.location.origin}${cleanLink}`
    }

    if (cleanLink) {
      if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(cleanLink)) {
        return `http://${cleanLink}`
      }

      if (/^[\w.-]+\.[a-z]{2,}(:\d+)?(\/|$)/i.test(cleanLink)) {
        return `https://${cleanLink}`
      }

      return `${window.location.origin}/${cleanLink.replace(/^\/+/, '')}`
    }

    if (shareToken) {
      return `${window.location.origin}/share/${shareToken}`
    }

    return ''
  }

  const handleDelete = async (fileId) => {
    try {
      await softDeleteUserFile(fileId)
      setMessage('File moved to deleted files')
      showToast('File moved to deleted files', 'success')
      await loadFiles()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to delete file'
      setMessage(errorMessage)
      showToast(errorMessage, 'error')
    }
  }

  const handleShare = async (fileId) => {
    const file = filesData.find((entry) => entry.id === fileId)

    if (!file) {
      return
    }

    setSelectedFile(file)
    setShareResult(null)
    setShareError('')
    setIsShareModalOpen(true)
  }

  const handleCreateShareLink = async (expiryOption) => {
    if (!selectedFile) {
      return
    }

    try {
      setIsShareLoading(true)
      setShareError('')
      const response = await shareUserFile(selectedFile.id, expiryOption)
      const safeLink = response.data.shareToken
        ? `${window.location.origin}/share/${response.data.shareToken}`
        : normalizeShareLink(response.data.shareLink, response.data.shareToken)

      setShareResult({
        shareLink: safeLink,
        shareExpiry: response.data.shareExpiry
      })
      showToast('Share link generated', 'success')
      await loadFiles()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to share file'
      setShareError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsShareLoading(false)
    }
  }

  const handleUnshare = async () => {
    if (!selectedFile) {
      return
    }

    try {
      setIsShareLoading(true)
      setShareError('')
      await unshareUserFile(selectedFile.id)
      setShareResult(null)
      setMessage('File unshared successfully')
      showToast('File unshared', 'success')
      await loadFiles()
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to unshare file'
      setShareError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsShareLoading(false)
    }
  }

  const closeShareModal = () => {
    setIsShareModalOpen(false)
    setSelectedFile(null)
    setShareResult(null)
    setShareError('')
  }

  const handleViewFile = async (filePath, fileName, fileType) => {
    try {
      await openFileInBrowser(filePath, fileName, fileType)
    } catch (error) {
      showToast(error.message || 'Unable to open file', 'error')
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
          <Sparkles size={18} /> My Files
        </h3>
        {message ? <p className="form-message success">{message}</p> : null}

        <div className="list-toolbar">
          <div className="toolbar-field">
            <Search size={16} className="toolbar-icon" />
            <input
              type="text"
              className="toolbar-input"
              placeholder="Search files"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="toolbar-field sort-field">
            <ArrowUpDown size={16} className="toolbar-icon" />
            <select
              className="toolbar-select"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
        </div>

        <div className="file-list">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton-file-card" />
              ))
            : null}

          {!isLoading && filesData.length === 0 ? (
            <EmptyState
              icon={Archive}
              title="No files uploaded yet"
              description="Use the dashboard upload area to add files to your workspace."
            />
          ) : null}

          {!isLoading && filesData.length > 0 && files.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description="Try another keyword or sort option."
            />
          ) : null}

          {files.map((file) => (
            <FileItem
              key={file.id}
              name={file.file_name}
              size={formatBytes(file.file_size)}
              dateLabel="Uploaded"
              dateValue={formatDate(file.uploaded_at)}
              fileIcon={getFileIcon(file.file_name)}
              actions={[
                {
                  label: 'View',
                  icon: Eye,
                  onClick: () => handleViewFile(file.file_path, file.file_name, file.file_type)
                },
                {
                  label: 'Share',
                  icon: Share2,
                  onClick: () => handleShare(file.id)
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: () => handleDelete(file.id)
                }
              ]}
            />
          ))}
        </div>
      </article>

      <ShareModal
        file={selectedFile}
        isOpen={isShareModalOpen}
        isLoading={isShareLoading}
        onClose={closeShareModal}
        onShare={handleCreateShareLink}
        onUnshare={handleUnshare}
        onCopySuccess={() => showToast('Share link copied', 'success')}
        shareResult={shareResult}
        shareError={shareError}
      />
    </motion.section>
  )
}

export default MyFiles
