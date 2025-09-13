export interface ParseResult {
  unitNumber: number;
  text: any;
}

export interface IDataParser {
  readonly batchSize: number;
  getTotalUnits(filePath: string): Promise<number>;
  parse(filePath: string, options?: { startUnit?: number; endUnit?: number }): AsyncIterableIterator<ParseResult>;
}