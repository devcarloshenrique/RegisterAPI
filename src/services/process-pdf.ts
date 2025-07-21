import { Record } from '@prisma/client'
import { RecordsRepository } from '../repositories/records-repository'
import { DatasetsRepository } from '../repositories/datasets-repository'
import PDFParser from 'pdf-parse'
import { promises as fs } from 'fs'

interface ProcessPDFUseCaseRequest {
  datasetId: string
  filePath: string
  metadata: {
    filename: string
    size: string
    fileType: string
    path: string
  }
}

interface ProcessPDFUseCaseResponse {
  record: Record
}

export class ProcessPDFUseCase {
  constructor(
    private recordsRepository: RecordsRepository,
    private datasetsRepository: DatasetsRepository
  ) {}

  async execute({ 
    datasetId, 
    filePath,
    metadata 
  }: ProcessPDFUseCaseRequest): Promise<ProcessPDFUseCaseResponse> {
    const dataBuffer = await fs.readFile(filePath)
    const pdfData = await PDFParser(dataBuffer)

    const structuredData = {
      sentences: pdfData.text
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/\s+/g, ' ')
        .match(/[^.!?]+[.!?]+/g) || [],
      metadata: {
        ...metadata,
        pages: pdfData.numpages,
        info: pdfData.info,
        version: pdfData.version,
        processedAt: new Date()
      }
    }

    const record = await this.recordsRepository.create({
      dataset_id: datasetId, 
      data: structuredData
    })

    await this.datasetsRepository.updateMetadata(datasetId, {
      ...metadata,
      totalRecords: { increment: 1 },
      lastUpdated: new Date()
    })

    return { record }
  }
}