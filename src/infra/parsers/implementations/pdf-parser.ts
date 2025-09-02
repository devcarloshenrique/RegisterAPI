import PDFParser from 'pdf-parse'
import { promises as fs } from 'fs'
import { Parser } from '../parser'
import path from 'path'

type PdfChunk = { chunkId: string; page: number; text: string }

const PAGE_DELIM = '<<<__PAGE_BREAK__>>>'           // separador garantido entre páginas
const CHUNK_SIZE = 900                               // ajuste conforme necessário
const CHUNK_OVERLAP = 150                            // overlap para manter contexto entre chunks

function normalizeText(s: string): string {
  return s.replace(/(\r\n|\n|\r)/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
}

function chunkText(text: string, maxChars = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = []
  if (!text) return chunks

  let start = 0
  const len = text.length

  while (start < len) {
    let end = Math.min(start + maxChars, len)

    // evite cortar no meio da palavra/sentença: retrocede até um espaço/pontuação razoável
    if (end < len) {
      const bestBreak = Math.max(
        text.lastIndexOf('. ', end),
        text.lastIndexOf('? ', end),
        text.lastIndexOf('! ', end),
        text.lastIndexOf(' ', end)
      )
      if (bestBreak > start + Math.floor(maxChars * 0.6)) {
        end = bestBreak + 1
      }
    }

    const piece = text.slice(start, end).trim()
    if (piece.length) chunks.push(piece)

    if (end === len) break
    start = Math.max(0, end - overlap)
  }

  return chunks
}

export class PdfParser implements Parser {
  async parse(filePath: string): Promise<PdfChunk[]> {
    const fileContent = await fs.readFile(filePath)
    const fileId = path.basename(filePath, path.extname(filePath))

    // Usa pagerender para inserir um delimitador entre páginas
    const pdfData = await PDFParser(fileContent, {
      pagerender: (pageData: any) =>
        pageData.getTextContent().then((tc: any) => {
          const text = tc.items.map((it: any) => it.str).join(' ')
          // adiciona o delimitador ao fim de cada página
          return `${text}\n${PAGE_DELIM}\n`
        }),
    })

    // Quebra confiável por página
    const rawPages = pdfData.text.split(PAGE_DELIM).map(p => normalizeText(p)).filter(Boolean)

    // Transforma páginas em chunks menores
    const result: PdfChunk[] = []
    rawPages.forEach((pageText, i) => {
      const pageNumber = i + 1
      const parts = chunkText(pageText)
      parts.forEach((part, j) => {
        result.push({
          chunkId: `${fileId}_page${pageNumber}_chunk${j + 1}`,
          page: pageNumber,
          text: part,
        })
      })
    })

    return result
  }
}
