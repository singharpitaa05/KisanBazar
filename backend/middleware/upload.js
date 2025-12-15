// UPLOAD MIDDLEWARE

import multer from 'multer';
import { HTTP_STATUS } from '../utils/constants.js';

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Middleware for single image upload
export const uploadSingle = upload.single('image');

// Middleware for multiple images upload (max 5)
export const uploadMultiple = upload.array('images', 5);

// Middleware for profile photo upload
export const uploadProfilePhoto = upload.single('profilePhoto');

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'File size is too large. Maximum size is 5MB.'
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Too many files. Maximum is 5 images.'
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Unexpected field in file upload.'
      });
    }
    
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    // Other errors
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: err.message || 'File upload failed'
    });
  }
  
  next();
};