import { parse } from 'csv-parse';
import * as fs from 'fs';
import { IDataParser, ParseResult } from '../parser';

export class CsvParser implements IDataParser { 

  readonly batchSize = 100;

  async getTotalUnits(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      let rowCount = 0;
      fs.createReadStream(filePath)
        .pipe(parse({ bom: true, relax_quotes: true, escape: '\\' }))
        .on('data', () => {
          rowCount++;
        })
        .on('end', () => {
          resolve(rowCount);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async *parse(filePath: string, options?: { startUnit?: number; endUnit?: number }): AsyncIterableIterator<ParseResult> {
    const startRow = options?.startUnit ?? 1;
    const endRow = options?.endUnit ?? Infinity;
    let currentRowNumber = 0;

    const stream = fs.createReadStream(filePath).pipe(parse({
      columns: true,
      bom: true,
      relax_quotes: true,
      escape: '\\',
    }));

    for await (const rowDataAsJson of stream) {
      currentRowNumber++;
      if (currentRowNumber < startRow) continue;
      if (currentRowNumber > endRow) break;

      yield {
        unitNumber: currentRowNumber,
        text: { ...rowDataAsJson},
      };
    }
  }
}