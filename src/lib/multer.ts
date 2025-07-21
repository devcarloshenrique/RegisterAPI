import multer from 'multer';
import path from 'path';
import { Request } from 'express';

export const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req: Request, file, cb) => {
    try {
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/\s+/g, '_');
      const ext = path.extname(sanitizedName);
      const filename = `${timestamp}-${sanitizedName}`;
      
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

export const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB