import { Request, Response } from 'express';
import { parseCSV } from './csv-parser';
import { parsePDF } from './pdf-parse';

const parserMap: Record<string, (req: Request, res: Response) => Promise<any>> = {
  '.csv': parseCSV,
  '.pdf': parsePDF,
};

export async function processFileByType(req: Request, res: Response): Promise<void> {
  try {
    const { dataset } = res.locals.dataset;

    if (!dataset || !dataset.metadata) {
      res.status(400).json({ success: false, message: 'Dataset metadata missing' });
      return;
    }

    const fileType = dataset.metadata.fileType;

    const parser = parserMap[fileType.toLowerCase()];

    if (!parser) {
      res.status(415).json({
        success: false,
        message: `Unsupported file type: ${fileType}`,
        supportedTypes: Object.keys(parserMap)
      });
      return;
    }

    const result = await parser(req, res);

    if (!res.headersSent) {
      res.status(200).json(result);
    }

  } catch (error: any) {
    console.error('File processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while processing file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}