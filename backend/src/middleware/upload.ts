import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Storage config: save files to /uploads, keep original name, restrict file types if needed
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// File filter (optional: restrict to pdf, png, jpg, etc)
function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  // Accept any file, or restrict by mimetype if you want
  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
