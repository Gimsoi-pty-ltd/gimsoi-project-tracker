import multer from 'multer';
import { ValidationError } from './errors.js';

/**
 * Multer configuration for avatar uploads.
 * Uses memory storage for AppSail compatibility.
 * Limits: 2MB file size, image MIME types only.
 */

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter,
});
