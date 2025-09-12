import { Parser } from '../parser';
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';

interface PdfPageData {
  pageNumber: number;
  text: string;
}

export interface DataParser<T> {
  parse(filePath: string, options?: { startPage?: number; endPage?: number }): AsyncIterableIterator<T>;
  getTotalUnits(filePath: string): Promise<number>;
}

export class PdfParser implements Parser<PdfPageData> {
  async getTotalUnits(filePath: string): Promise<number> {
    const pdf: PDFDocumentProxy = await getDocument(filePath).promise;
    const totalPages = pdf.numPages;
    await pdf.destroy();
    return totalPages;
  }

  async *parse(filePath: string, options?: { startPage?: number; endPage?: number }): AsyncIterableIterator<PdfPageData> {
    const pdf = await getDocument(filePath).promise;
    const totalPages = pdf.numPages;

    const start = options?.startPage ?? 1;
    const end = Math.min(options?.endPage ?? totalPages, totalPages);

    try {
      for (let pageNumber = start; pageNumber <= end; pageNumber++) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = content.items.map(item => ('str' in item ? item.str : '')).join(' ');

        yield { pageNumber, text };

        page.cleanup();
      }
    } finally {
      pdf.destroy();
    }
  }
}