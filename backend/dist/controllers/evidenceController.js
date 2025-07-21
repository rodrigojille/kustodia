"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEvidence = void 0;
const uploadEvidence = (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    // Return relative path for now
    res.json({ url: `/uploads/evidence/${req.file.filename}` });
};
exports.uploadEvidence = uploadEvidence;
