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

// Public routes for shared file access (expiry validation happens in controller)
router.get('/public/:token', getSharedFile)
router.get('/public/download/:token', downloadSharedFile)

router.use(authenticateToken)

router.post('/upload', upload.single('file'), uploadFile)
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
