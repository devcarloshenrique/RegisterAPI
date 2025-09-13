import { IDataParser, ParseResult } from '../parser';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';

export class PdfParser implements IDataParser {
  readonly batchSize = 50;

  async getTotalUnits(filePath: string): Promise<number> {
    const pdf: PDFDocumentProxy = await getDocument(filePath).promise;
    const totalPages = pdf.numPages;
    await pdf.destroy();
    return totalPages;
  }
  
  async *parse(filePath: string, options?: { startUnit?: number; endUnit?: number }): AsyncIterableIterator<ParseResult> {
    const pdf = await getDocument(filePath).promise;
    const totalPages = pdf.numPages;

    const start = options?.startUnit ?? 1;
    const end = Math.min(options?.endUnit ?? totalPages, totalPages);

    try {
      for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items.map(item => ('str' in item ? item.str : '')).join(' ');

        yield { unitNumber: pageNumber, text };

        page.cleanup();
      }
    } finally {
      pdf.destroy();
    }
  }
}