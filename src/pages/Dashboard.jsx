import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FolderOpen,
  Share2,
  Trash2,
  Sparkles,
  HardDrive,
  Eye,
  FileText,
  HardDriveUpload,
  Archive
} from 'lucide-react'
import StatsCard from '../components/StatsCard'
import FileItem from '../components/FileItem'
import UploadDropzone from '../components/UploadDropzone'
import EmptyState from '../components/EmptyState'
import { openFileInBrowser } from '../utils/fileView'
import {
  getRecentUserFiles,
  shareUserFile,
  getUserFileStats,
  softDeleteUserFile,
  uploadUserFile
} from '../services/fileService'

function Dashboard() {
  const navigate = useNavigate()
  const { user, showToast } = useOutletContext()
  const [selectedFileName, setSelectedFileName] = useState('')
  const [statsData, setStatsData] = useState({
    totalFiles: 0,
    sharedFiles: 0,
    deletedFiles: 0,
    totalStorageUsed: 0
  })
  const [recentFiles, setRecentFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

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

  const formatDate = (value) => {
    if (!value) {
      return 'N/A'
    }

    return new Date(value).toLocaleDateString()
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      const [statsResponse, recentResponse] = await Promise.all([
        getUserFileStats(),
        getRecentUserFiles()
      ])

      const statsData = statsResponse.data
      const recentData = recentResponse.data.files || []

      setStatsData({
        totalFiles: Number(statsData.totalFiles || 0),
        sharedFiles: Number(statsData.sharedFiles || 0),
        deletedFiles: Number(statsData.deletedFiles || 0),
        totalStorageUsed: Number(statsData.totalStorageUsed || 0)
      })

      setRecentFiles(recentData)
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
        return
      }

      showToast(error.response?.data?.message || 'Unable to load dashboard data', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [navigate])

  const stats = useMemo(
    () => [
      {
        label: 'Total Files',
        value: String(statsData.totalFiles),
        icon: FolderOpen,
        badge: statsData.totalFiles > 0 ? 'Active' : 'New'
      },
      {
        label: 'Shared Files',
        value: String(statsData.sharedFiles),
        icon: Share2,
        badge: statsData.sharedFiles > 0 ? 'Live' : ''
      },
      {
        label: 'Deleted Files',
        value: String(statsData.deletedFiles),
        icon: Trash2,
        badge: statsData.deletedFiles > 0 ? 'Trash' : ''
      },
      {
        label: 'Storage Used',
        value: formatBytes(statsData.totalStorageUsed),
        icon: HardDrive,
        badge: 'Cloud'
      }
    ],
    [statsData]
  )

  const handleFileUpload = async (file) => {
    if (!file) {
      return
    }

    setSelectedFileName(file.name)

    try {
      setIsUploading(true)
      await uploadUserFile(file)
      showToast('Upload successful', 'success')
      await loadDashboardData()
    } catch (error) {
      showToast(error.response?.data?.message || 'Upload failed', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      await softDeleteUserFile(fileId)
      showToast('File moved to deleted files', 'success')
      await loadDashboardData()
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to delete file', 'error')
    }
  }

  const handleShareFile = async (fileId) => {
    try {
      const response = await shareUserFile(fileId)
      const shareLink = response.data.shareToken
        ? `${window.location.origin}/share/${response.data.shareToken}`
        : normalizeShareLink(response.data.shareLink, response.data.shareToken)

      await navigator.clipboard.writeText(shareLink)
      showToast('Share link copied', 'success')
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to share file', 'error')
    }
  }

  const handleViewFile = async (filePath, fileName, fileType) => {
    try {
      await openFileInBrowser(filePath, fileName, fileType)
    } catch (error) {
      showToast(error.message || 'Unable to open file', 'error')
    }
  }

  const storageLimitBytes = 5 * 1024 * 1024 * 1024
  const storagePercent = Math.min(
    100,
    Math.round((statsData.totalStorageUsed / storageLimitBytes) * 100)
  )

  return (
    <motion.section
      className="dashboard-page"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <article className="welcome-card glass">
        <h2>
          <Sparkles size={18} /> Welcome back, {user?.name || 'User'}
        </h2>
        <p>{user?.email || 'No email available'}</p>

        <div className="storage-progress-wrap">
          <div className="storage-progress-header">
            <span>Storage usage</span>
            <span>{storagePercent}%</span>
          </div>
          <div className="storage-progress-track">
            <motion.span
              className="storage-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${storagePercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </article>

      <section className="stats-grid">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            badge={stat.badge}
            delay={index * 0.08}
          />
        ))}
      </section>

      <section className="quick-actions-grid">
        <button type="button" className="quick-action-card" onClick={() => navigate('/my-files')}>
          <FolderOpen size={16} /> My Files
        </button>
        <button
          type="button"
          className="quick-action-card"
          onClick={() => navigate('/deleted-files')}
        >
          <Archive size={16} /> Deleted Files
        </button>
        <button type="button" className="quick-action-card" onClick={() => navigate('/settings')}>
          <HardDriveUpload size={16} /> Appearance
        </button>
      </section>

      <motion.article
        className="upload-card"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <h3>Upload File</h3>
        <p>Drop any document, image, or media file to upload instantly.</p>
        <UploadDropzone
          onFileSelect={handleFileUpload}
          isUploading={isUploading}
          selectedFileName={selectedFileName}
        />
      </motion.article>

      <article className="list-card">
        <h3>Recent Files</h3>
        <div className="file-list">
          {isLoading ? <p>Loading recent files...</p> : null}

          {!isLoading && recentFiles.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No recent files yet"
              description="Upload your first file and it will appear here."
            />
          ) : null}

          {recentFiles.map((file) => (
            <FileItem
              key={file.id}
              name={file.file_name}
              size={formatBytes(file.file_size)}
              dateLabel="Uploaded"
              dateValue={formatDate(file.uploaded_at)}
              fileIcon={FileText}
              tag={file.is_shared ? 'Shared' : ''}
              actions={[
                {
                  label: 'View',
                  icon: Eye,
                  onClick: () => handleViewFile(file.file_path, file.file_name, file.file_type)
                },
                {
                  label: 'Share',
                  icon: Share2,
                  onClick: () => handleShareFile(file.id)
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  variant: 'danger',
                  onClick: () => handleDeleteFile(file.id)
                }
              ]}
            />
          ))}
        </div>
      </article>
    </motion.section>
  )
}

export default Dashboard
