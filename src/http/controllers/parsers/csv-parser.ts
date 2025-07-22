import { Request, Response } from 'express'
import { ProcessCsvUseCase } from '../../../services/process-csv'
import { PrismaRecordsRepository } from '../../../repositories/prisma/prisma-records-repository'
import { PrismaDatasetsRepository } from '../../../repositories/prisma/prisma-datasets-repository'
import { promises as fs } from 'fs'

export async function parseCSV(req: Request, res: Response) {
  try {
    const { dataset } = res.locals.dataset

    const recordsRepository = new PrismaRecordsRepository()
    const datasetsRepository = new PrismaDatasetsRepository()
    const processCsvUseCase = new ProcessCsvUseCase(
      recordsRepository,
      datasetsRepository
    )

    const { record } = await processCsvUseCase.execute({
      datasetId: dataset.id,
      filePath: dataset.metadata.path,
      metadata: dataset.metadata
    })

    return res.status(201).json({
      success: true,
      message: 'CSV successfully processed and structured as JSON',
      recordId: record.id,
      recordData: record.data,
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Error processing CSV file',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  } finally {
    if (res.locals.dataset?.metadata?.path) {
      await fs.unlink(res.locals.dataset.metadata.path)
        .catch(err => console.error('Failed to delete temporary file:', err))
    }
  }
}