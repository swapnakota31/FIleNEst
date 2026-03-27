import crypto from 'crypto'
import db from '../config/db.js'
import cloudinary from '../config/cloudinary.js'

export const uploadFile = (req, res) => {
  const userId = req.user.userId

  if (!req.file) {
    return res.status(400).json({ message: 'File is required' })
  }

  // Extract Cloudinary data from multer-storage-cloudinary
  // req.file.path is the secure_url from Cloudinary
  // req.file.filename is the public_id set in middleware
  const insertQuery = `
    INSERT INTO files (
      user_id,
      file_name,
      stored_name,
      file_path,
      file_type,
      file_size
    ) VALUES (?, ?, ?, ?, ?, ?)
  `

  const values = [
    userId,
    req.file.originalname,
    req.file.filename, // public_id from Cloudinary
    req.file.path, // secure_url from Cloudinary
    req.file.mimetype,
    req.file.size
  ]

  db.query(insertQuery, values, (error, result) => {
    if (error) {
      return res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }

    return res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: result.insertId,
        fileName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size
      }
    })
  })
}

export const getFiles = (req, res) => {
  const userId = req.user.userId

  const query = `
    SELECT *
    FROM files
    WHERE user_id = ? AND is_deleted = FALSE
    ORDER BY uploaded_at DESC
  `

  db.query(query, [userId], (error, files) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }

    return res.status(200).json({ files })
  })
}

export const getRecentFiles = (req, res) => {
  const userId = req.user.userId

  const query = `
    SELECT *
    FROM files
    WHERE user_id = ? AND is_deleted = FALSE
    ORDER BY uploaded_at DESC
    LIMIT 5
  `

  db.query(query, [userId], (error, files) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }

    return res.status(200).json({ files })
  })
}

export const softDeleteFile = (req, res) => {
  const userId = req.user.userId
  const fileId = req.params.id

  const findQuery = 'SELECT * FROM files WHERE id = ? LIMIT 1'

  db.query(findQuery, [fileId], (findError, files) => {
    if (findError) {
      return res.status(500).json({ message: 'Server error', error: findError.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' })
    }

    const file = files[0]

    if (file.user_id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to modify this file' })
    }

    const updateQuery = `
      UPDATE files
      SET is_deleted = TRUE,
          deleted_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `

    db.query(updateQuery, [fileId], (updateError) => {
      if (updateError) {
        return res.status(500).json({ message: 'Server error', error: updateError.message })
      }

      return res.status(200).json({ message: 'File moved to deleted files' })
    })
  })
}

export const getDeletedFiles = (req, res) => {
  const userId = req.user.userId

  const query = `
    SELECT *
    FROM files
    WHERE user_id = ? AND is_deleted = TRUE
    ORDER BY deleted_at DESC
  `

  db.query(query, [userId], (error, files) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }

    return res.status(200).json({ files })
  })
}

export const restoreFile = (req, res) => {
  const userId = req.user.userId
  const fileId = req.params.id

  const findQuery = 'SELECT * FROM files WHERE id = ? LIMIT 1'

  db.query(findQuery, [fileId], (findError, files) => {
    if (findError) {
      return res.status(500).json({ message: 'Server error', error: findError.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' })
    }

    const file = files[0]

    if (file.user_id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to modify this file' })
    }

    const updateQuery = `
      UPDATE files
      SET is_deleted = FALSE,
          deleted_at = NULL
      WHERE id = ?
    `

    db.query(updateQuery, [fileId], (updateError) => {
      if (updateError) {
        return res.status(500).json({ message: 'Server error', error: updateError.message })
      }

      return res.status(200).json({ message: 'File restored successfully' })
    })
  })
}

export const permanentlyDeleteFile = (req, res) => {
  const userId = req.user.userId
  const fileId = req.params.id

  const findQuery = 'SELECT * FROM files WHERE id = ? LIMIT 1'

  db.query(findQuery, [fileId], (findError, files) => {
    if (findError) {
      return res.status(500).json({ message: 'Server error', error: findError.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' })
    }

    const file = files[0]

    if (file.user_id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to modify this file' })
    }

    // Delete file from Cloudinary using stored_name (public_id)
    cloudinary.uploader.destroy(file.stored_name, (destroyError, destroyResult) => {
      if (destroyError) {
        console.error('Cloudinary deletion error:', destroyError)
        // Continue with DB deletion even if Cloudinary deletion fails
      }

      // Delete file record from database
      const deleteQuery = 'DELETE FROM files WHERE id = ?'

      db.query(deleteQuery, [fileId], (deleteError) => {
        if (deleteError) {
          return res.status(500).json({ message: 'Server error', error: deleteError.message })
        }

        return res.status(200).json({ message: 'File permanently deleted' })
      })
    })
  })
}

export const getFileStats = (req, res) => {
  const userId = req.user.userId

  const statsQuery = `
    SELECT
      SUM(CASE WHEN is_deleted = FALSE THEN 1 ELSE 0 END) AS totalFiles,
      SUM(CASE WHEN is_deleted = TRUE THEN 1 ELSE 0 END) AS deletedFiles,
      SUM(CASE WHEN is_shared = TRUE THEN 1 ELSE 0 END) AS sharedFiles,
      SUM(CASE WHEN is_deleted = FALSE THEN file_size ELSE 0 END) AS totalStorageUsed
    FROM files
    WHERE user_id = ?
  `

  db.query(statsQuery, [userId], (statsError, rows) => {
    if (statsError) {
      return res.status(500).json({ message: 'Server error', error: statsError.message })
    }

    const stats = rows[0] || {}

    return res.status(200).json({
      totalFiles: Number(stats.totalFiles || 0),
      deletedFiles: Number(stats.deletedFiles || 0),
      sharedFiles: Number(stats.sharedFiles || 0),
      totalStorageUsed: Number(stats.totalStorageUsed || 0)
    })
  })
}

export const shareFile = (req, res) => {
  const userId = req.user.userId
  const fileId = req.params.id
  const expiryOption = req.body?.expiryOption || 'none'

  const findQuery = 'SELECT * FROM files WHERE id = ? LIMIT 1'

  db.query(findQuery, [fileId], (findError, files) => {
    if (findError) {
      return res.status(500).json({ message: 'Server error', error: findError.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' })
    }

    const file = files[0]

    if (file.user_id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to share this file' })
    }

    const shareToken = crypto.randomBytes(24).toString('hex')
    let shareExpiry = null

    if (expiryOption === '1hour') {
      shareExpiry = new Date(Date.now() + 60 * 60 * 1000)
    } else if (expiryOption === '1day') {
      shareExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
    } else if (expiryOption === '7days') {
      shareExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    } else if (expiryOption !== 'none') {
      return res.status(400).json({
        message: 'Invalid expiry option. Use 1hour, 1day, 7days, or none'
      })
    }

    const updateQuery =
      'UPDATE files SET is_shared = TRUE, share_token = ?, share_expiry = ? WHERE id = ?'

    db.query(updateQuery, [shareToken, shareExpiry, fileId], (updateError) => {
      if (updateError) {
        return res.status(500).json({ message: 'Server error', error: updateError.message })
      }

      let frontendUrl = String(process.env.FRONTEND_URL || 'http://localhost:5173').trim()

      if (!/^https?:\/\//i.test(frontendUrl)) {
        if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(frontendUrl)) {
          frontendUrl = `http://${frontendUrl}`
        } else {
          frontendUrl = `https://${frontendUrl}`
        }
      }

      frontendUrl = frontendUrl.replace(/\/+$/, '')

      return res.status(200).json({
        message: 'File shared successfully',
        shareToken,
        shareLink: `${frontendUrl}/share/${shareToken}`,
        shareExpiry
      })
    })
  })
}

export const unshareFile = (req, res) => {
  const userId = req.user.userId
  const fileId = req.params.id

  const findQuery = 'SELECT * FROM files WHERE id = ? LIMIT 1'

  db.query(findQuery, [fileId], (findError, files) => {
    if (findError) {
      return res.status(500).json({ message: 'Server error', error: findError.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' })
    }

    const file = files[0]

    if (file.user_id !== userId) {
      return res.status(403).json({ message: 'You are not allowed to unshare this file' })
    }

    const updateQuery =
      'UPDATE files SET is_shared = FALSE, share_token = NULL, share_expiry = NULL WHERE id = ?'

    db.query(updateQuery, [fileId], (updateError) => {
      if (updateError) {
        return res.status(500).json({ message: 'Server error', error: updateError.message })
      }

      return res.status(200).json({ message: 'File unshared successfully' })
    })
  })
}

export const getSharedFile = (req, res) => {
  const token = req.params.token

  const query = `
    SELECT id, file_name, file_type, file_size, uploaded_at, file_path, share_expiry
    FROM files
    WHERE share_token = ? AND is_shared = TRUE AND is_deleted = FALSE
    LIMIT 1
  `

  db.query(query, [token], (error, files) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'Shared file not found' })
    }

    const file = files[0]

    if (file.share_expiry && new Date() > new Date(file.share_expiry)) {
      return res.status(410).json({ message: 'This share link has expired' })
    }

    return res.status(200).json({
      message: 'Shared file fetched successfully',
      file: {
        file_name: file.file_name,
        file_path: file.file_path,
        file_type: file.file_type,
        file_size: file.file_size,
        uploaded_at: file.uploaded_at,
        share_expiry: file.share_expiry
      }
    })
  })
}

export const downloadSharedFile = (req, res) => {
  const token = req.params.token

  const query = `
    SELECT file_name, file_path, share_expiry
    FROM files
    WHERE share_token = ? AND is_shared = TRUE AND is_deleted = FALSE
    LIMIT 1
  `

  db.query(query, [token], (error, files) => {
    if (error) {
      return res.status(500).json({ message: 'Server error', error: error.message })
    }

    if (files.length === 0) {
      return res.status(404).json({ message: 'Shared file not found' })
    }

    const file = files[0]

    if (file.share_expiry && new Date() > new Date(file.share_expiry)) {
      return res.status(410).json({ message: 'This share link has expired' })
    }

    // Redirect to Cloudinary secure_url for download
    // The file_path already contains the secure Cloudinary URL
    return res.redirect(file.file_path)
  })
}
