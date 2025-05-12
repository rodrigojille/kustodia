import { Request, Response } from "express";
import path from "path";

export const uploadEvidence = (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Return relative path for now
  res.json({ url: `/uploads/evidence/${req.file.filename}` });
};
