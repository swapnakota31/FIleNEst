import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'filenest', // Folder name in Cloudinary
    resource_type: 'auto', // Auto-detect file type (image, video, raw, etc.)
    public_id: (req, file) => {
      // Generate unique public_id using timestamp + original filename
      const timestamp = Date.now()
      const fileName = file.originalname.split('.')[0].replace(/\s+/g, '_')
      return `${timestamp}-${fileName}`
    }
  }
})

// Create multer instance with Cloudinary storage
const upload = multer({ storage })

export default upload
