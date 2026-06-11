import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME)
console.log("API Key:", process.env.CLOUDINARY_API_KEY)
console.log("Secret Exists:", !!process.env.CLOUDINARY_API_SECRET)

export default cloudinary
