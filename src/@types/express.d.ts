declare namespace Express {
  export interface Request {
    user: {
      id: string;
    };
    fileInfo?: {
      originalName?: string;
      size?: number | bigint | string;
      savedFilename?: string;
      savedPath?: string;
      mimeType?: string;
      extension?: string;
    };
  }
}