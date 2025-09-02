import { parse as CSVParser } from 'csv-parse'
import { promises as fs } from 'fs'
import { Parser } from '../parser'

export class CsvParser implements Parser {
  async parse(filePath: string): Promise<any[]> {
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' })
    return new Promise<any[]>((resolve, reject) => {
      CSVParser(fileContent, {
        columns: true,
        skip_empty_lines: true,
      }, (err, output) => {
        if (err) reject(err)
        resolve(output)
      })
    })
  }
}