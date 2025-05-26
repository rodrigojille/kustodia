import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads/evidence');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({ storage });

// POST /api/evidence/upload
// Extend Express Request type for multer
import { Request } from 'express';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

router.post('/upload', upload.single('evidence'), (req: MulterRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  // Return relative path for now
  res.json({ url: `/uploads/evidence/${req.file.filename}` });
});

export default router;
