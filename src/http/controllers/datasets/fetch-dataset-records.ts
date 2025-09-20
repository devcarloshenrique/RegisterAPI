import { Request, Response } from 'express';
import z from "zod"
import { makeFetchDatasetRecordsUseCase } from '../../../use-cases/factories/make-fetch-dataset-records-use-case';

const bodySchemaFetchDatasetRecords = z.object({
  datasetId: z.string().uuid(),
  page: z.coerce.number().min(1).default(1).optional(),
  per_page: z.coerce.number().min(1).max(100).default(20).optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
})

export async function fetchDatasetRecords(req: Request, res: Response) {
  try {
    const { datasetId, page, per_page, order } = bodySchemaFetchDatasetRecords.parse(req.params)

    const fetchDatasetUseCase = makeFetchDatasetRecordsUseCase()

    const { dataset } = await fetchDatasetUseCase.execute({
      userId: req.user.id,
      datasetId,
      pagination: {
        page,
        per_page,
      },
      order,
    })

    return res.status(200).json({
      dataset
    })

  } catch (err) {
    throw err
  }
}