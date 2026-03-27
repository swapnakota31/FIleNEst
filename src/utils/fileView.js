import { getApiOrigin } from '../config/api'

export const openFileInBrowser = async (filePath, fileName = 'file', fileType = '') => {
  if (!filePath) {
    throw new Error('File path is missing')
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(filePath)
  const lowerName = String(fileName || '').toLowerCase()
  const lowerPath = String(filePath || '').toLowerCase()
  const isPdf =
    String(fileType || '').toLowerCase() === 'application/pdf' ||
    lowerName.endsWith('.pdf') ||
    lowerPath.endsWith('.pdf')
  const isCloudinaryUrl = /res\.cloudinary\.com/i.test(String(filePath || ''))

  const buildCloudinaryPdfPreviewUrl = (url) => {
    if (!/\/upload\//.test(url)) {
      return url
    }

    const withPreviewTransform = url.replace('/upload/', '/upload/pg_1,f_jpg,q_auto/')

    if (/\.pdf(\?|$)/i.test(withPreviewTransform)) {
      return withPreviewTransform.replace(/\.pdf(\?|$)/i, '.jpg$1')
    }

    return withPreviewTransform
  }
  try {
    // For absolute URLs (Cloudinary and others), open directly.
    if (isAbsoluteUrl) {
      const previewUrl = isCloudinaryUrl && isPdf ? buildCloudinaryPdfPreviewUrl(filePath) : filePath
      const opened = window.open(previewUrl, '_blank', 'noopener,noreferrer')
      if (!opened) {
        throw new Error('Popup blocked. Please allow popups and try again.')
      }

      return
    }

    const backendBaseUrl = getApiOrigin()
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`
    const sourceUrl = `${backendBaseUrl}${normalizedPath}`
    const token = localStorage.getItem('token')

    const headers = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(sourceUrl, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.')
      }

      throw new Error(`Unable to preview file (${response.status})`)
    }

    const blob = await response.blob()
    const blobType = blob.type || String(fileType || '') || 'application/octet-stream'
    const typedBlob = new Blob([blob], { type: blobType })
    const blobUrl = window.URL.createObjectURL(typedBlob)

    const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer')

    if (!opened) {
      window.URL.revokeObjectURL(blobUrl)
      throw new Error('Popup blocked. Please allow popups and try again.')
    }

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl)
    }, 60 * 1000)
  } catch (error) {
    throw error
  }
}
