export interface Parser {
  parse(filePath: string): Promise<any[]>;
}