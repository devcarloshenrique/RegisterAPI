import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { storage, fileFilter, limits } from '../../lib/multer';

export const fileUpload = (req: Request, res: Response, next: NextFunction) => {
  const upload = multer({
    storage,
    limits,
    fileFilter
  }).single('file');

  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({ 
            success: false, 
            message: 'File too large (max 50MB allowed)' 
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ 
            success: false, 
            message: 'Only CSV and PDF files are allowed' 
          });
        }
      }
      return res.status(500).json({ 
        success: false, 
        message: 'File upload failed',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (!req.file || !req.fileInfo) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file was uploaded' 
      });
    }

    req.fileInfo.size = req.file.size;
    next();
  });
};