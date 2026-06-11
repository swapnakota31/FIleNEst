import express from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { authenticateToken } from '../middleware/authMiddleware.js'
import {
  uploadFile,
  getFiles,
  getRecentFiles,
  softDeleteFile,
  getDeletedFiles,
  restoreFile,
  permanentlyDeleteFile,
  getFileStats,
  shareFile,
  unshareFile,
  getSharedFile,
  downloadSharedFile
} from '../controllers/fileController.js'

const router = express.Router()

const logCloudinaryUpload = (req, res, next) => {
  console.log('Cloudinary upload operation starting', {
    route: req.originalUrl,
    method: req.method
  })

  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Cloudinary upload error:', err)
      console.dir(err, { depth: null })
      console.error(JSON.stringify(err, null, 2))
      return res.status(500).json({ message: 'Upload failed', error: err.message })
    }

    console.log('Cloudinary upload operation completed', {
      file: req.file
    })
    next()
  })
}

// Public routes for shared file access (expiry validation happens in controller)
router.get('/public/:token', getSharedFile)
router.get('/public/download/:token', downloadSharedFile)

router.use(authenticateToken)

router.post('/upload', logCloudinaryUpload, uploadFile)
router.get('/', getFiles)
router.get('/recent', getRecentFiles)
router.put('/share/:id', shareFile)
router.put('/unshare/:id', unshareFile)
router.put('/delete/:id', softDeleteFile)
router.get('/deleted', getDeletedFiles)
router.put('/restore/:id', restoreFile)
router.delete('/permanent/:id', permanentlyDeleteFile)
router.get('/stats', getFileStats)

export default router
