import { Request, Response } from 'express'
import { ProcessPDFUseCase } from '../../services/process-pdf'
import { PrismaRecordsRepository } from '../../repositories/prisma/prisma-records-repository'
import { PrismaDatasetsRepository } from '../../repositories/prisma/prisma-datasets-repository'
import { promises as fs } from 'fs'

export async function parsePDF(req: Request, res: Response) {
  try {
    const { dataset } = res.locals.dataset

    const recordsRepository = new PrismaRecordsRepository()
    const datasetsRepository = new PrismaDatasetsRepository()
    const processPDFUseCase = new ProcessPDFUseCase(recordsRepository, datasetsRepository)

    const { record } = await processPDFUseCase.execute({
      datasetId: dataset.id,
      filePath: dataset.metadata.path,
      metadata: dataset.metadata
    })

    return res.status(201).json({
      success: true,
      message: 'PDF processado e estruturado em JSON com sucesso.',
      recordId: record.id,
      recordData: record.data,
    })

  } catch (error) {
    return res.status(500).json({
      error: 'Error processing PDF',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    if (res.locals.dataset?.metadata?.path) {
      await fs.unlink(res.locals.dataset.metadata.path)
        .catch(console.error)
    }
  }
}