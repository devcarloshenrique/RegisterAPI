import { Request, Response, NextFunction } from 'express';

export const fileMetadata = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file || !req.fileInfo) {
      throw new Error('File not available');
    }
    
    const sizeInKB = `${(Number(req.fileInfo.size) / 1024).toFixed(2)} KB`;

    res.locals.fileMetadata = {
      originalName: req.fileInfo.savedFilename?.split('-')[1],
      filename: req.fileInfo.savedFilename,
      path: req.fileInfo.savedPath,
      size: sizeInKB,
      fileType: req.fileInfo.extension,
      uploadDate: new Date().toISOString()
    };
    
    next();
  } catch (err) {        
    return res.status(500).json({
      success: false,
      message: 'Error processing file metadata',
      error: process.env.NODE_ENV === 'dev' ? err : undefined
    });
  }
};