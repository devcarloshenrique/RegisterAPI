export interface Parser<T> {
  parse(filePath: string, options?: { startPage?: number; endPage?: number }): AsyncIterableIterator<T>;
}