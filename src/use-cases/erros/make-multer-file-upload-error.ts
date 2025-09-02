import { MulterError } from 'multer';
import { MulterFileUploadError } from './multer-file-upload-error';
import { MAX_SIZE_IN_MB } from '../../infra/upload/multer';

export class MulterErrorFactory extends Error {
  static create(error: MulterError | MulterFileUploadError): MulterFileUploadError {
    if(error instanceof MulterFileUploadError) 
        return error
      
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return new MulterFileUploadError(`File size exceeds the limit of ${MAX_SIZE_IN_MB}MB.`);
      case 'LIMIT_FILE_COUNT':
        return new MulterFileUploadError('Too many files.');
      case 'LIMIT_UNEXPECTED_FILE':
        return new MulterFileUploadError('Unexpected file.');
      case 'LIMIT_FIELD_KEY':
        return new MulterFileUploadError('Field name too long.');
      case 'LIMIT_FIELD_VALUE':
        return new MulterFileUploadError('Field value too long.');
      case 'LIMIT_FIELD_COUNT':
        return new MulterFileUploadError('Too many fields.');
      case 'LIMIT_PART_COUNT':
        return new MulterFileUploadError('Too many parts.');
      default:
        return new MulterFileUploadError('File upload failed.');
    }
  }
}
