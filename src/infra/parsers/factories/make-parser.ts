import { Parser } from "../parser";
import { CsvParser } from "../implementations/csv-parser";
import { PdfParser } from "../implementations/pdf-parser";

export function makeParser(fileType: string): Parser { 
  switch (fileType.toLocaleLowerCase()) {
    case 'text/csv':
        return new CsvParser();
    case 'application/pdf':
        return new PdfParser();
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}