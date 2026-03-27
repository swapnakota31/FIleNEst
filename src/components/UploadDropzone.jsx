import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { HardDriveUpload, Upload } from 'lucide-react'

function UploadDropzone({ onFileSelect, isUploading = false, selectedFileName = '' }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (event) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]

    if (!file || isUploading) {
      return
    }

    await onFileSelect(file)
  }

  const handleInputChange = async (event) => {
    const file = event.target.files?.[0]

    if (!file || isUploading) {
      return
    }

    await onFileSelect(file)
    event.target.value = ''
  }

  const openFilePicker = () => {
    if (isUploading) {
      return
    }

    inputRef.current?.click()
  }

  return (
    <motion.div
      className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
      whileHover={{ y: -2 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFilePicker}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openFilePicker()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden-file-input"
        onChange={handleInputChange}
      />

      <div className="upload-dropzone-icon">
        {isUploading ? <HardDriveUpload size={20} /> : <Upload size={20} />}
      </div>

      <p className="upload-dropzone-title">
        {isUploading ? 'Uploading file...' : 'Drag and drop a file here'}
      </p>

      <p className="upload-dropzone-subtitle">
        {isUploading
          ? 'Please wait while we securely upload to Cloudinary'
          : 'or click to browse your device'}
      </p>

      {selectedFileName ? <p className="selected-file-name">Selected: {selectedFileName}</p> : null}
    </motion.div>
  )
}

export default UploadDropzone
