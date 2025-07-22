import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { sanitizeFileName } from '../utils/sanitize-filenama';

export const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req: Request, file, cb) => {
    try {
      const timestamp = Date.now();
      const cleanedName = sanitizeFileName(file.originalname);
      const ext = path.extname(cleanedName);
      const filename = `${timestamp}-${cleanedName}`;
      
      req.fileInfo = {
        originalName: file.originalname,
        savedFilename: filename,
        savedPath: path.join('uploads/', filename),
        mimeType: file.mimetype,
        extension: ext
      };
      
      cb(null, filename);
    } catch (error) {
      cb(error as Error, '');
    }
  }
});

export const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['.csv', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowed.includes(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'));
  }
  cb(null, true);
};

export const limits = { fileSize: 50 * 1024 * 1024 }; // 50MB
