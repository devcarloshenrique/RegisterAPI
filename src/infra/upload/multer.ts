import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';

import { sanitizeFileName } from '../../utils/sanitize-filenama';
import { MulterFileUploadError } from '../../use-cases/erros/multer-file-upload-error';

const uploadFolder = path.resolve(__dirname, '..','..','..', 'uploads');

export const MAX_SIZE_IN_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_SIZE_IN_MB = MAX_SIZE_IN_BYTES / (1024 * 1024);

const ALLOWED_MIMES = [
  'text/csv',
  'application/pdf',
];

export const uploadConfig = {
  directory: uploadFolder,
  limits: {
    fileSize: MAX_SIZE_IN_BYTES,
  },
  storage: multer.diskStorage({
    destination: uploadFolder,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const cleanedName = sanitizeFileName(file.originalname);
      const fileName = `${fileHash}-${cleanedName}`;

      callback(null, fileName);
    },
  }),
  fileFilter: (request: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      callback(null, true);
    } else {
      const allowedTypes = ALLOWED_MIMES.map(mime => mime.split('/')[1]).join(', ');
      callback(new MulterFileUploadError(
        `Tipo de arquivo inválido. Apenas os seguintes tipos são permitidos: ${allowedTypes.toUpperCase()}`
      ));
    }
  },
};