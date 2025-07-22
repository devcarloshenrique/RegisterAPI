import { Record } from '@prisma/client'
import { RecordsRepository } from '../repositories/records-repository'
import { DatasetsRepository } from '../repositories/datasets-repository'
import { parse } from 'csv-parse'
import { promises as fs } from 'fs'

interface ProcessCsvUseCaseRequest {
  datasetId: string
  filePath: string
  metadata: {
    filename: string
    size: string
    fileType: string
    path: string
    [key: string]: any
  }
}

interface ProcessCsvUseCaseResponse {
  record: Record
}

export class ProcessCsvUseCase {
  constructor(
    private recordsRepository: RecordsRepository,
    private datasetsRepository: DatasetsRepository
  ) {}

  async execute({
    datasetId,
    filePath,
    metadata
  }: ProcessCsvUseCaseRequest): Promise<ProcessCsvUseCaseResponse> {
    const fileContent = await fs.readFile(filePath, { encoding: 'utf8' })

    const records = await new Promise<any[]>((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      }, (err, output) => {
        if (err) reject(err)
        resolve(output)
      })
    })

    const structuredData = {
      records,
      metadata: {
        ...metadata,
        totalRows: records.length,
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