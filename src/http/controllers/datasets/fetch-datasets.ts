import { Request, Response } from 'express';
import { makeFetchDatasetUseCase } from '../../../use-cases/factories/make-fetch-dataset-use-case';
import z from 'zod';

const fetchDatasetsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1).optional(),
  per_page: z.coerce.number().min(1).max(100).default(20).optional(),
  order: z.enum(['asc', 'desc']).default('desc').optional(),
});

export async function fetchDatasets(req: Request, res: Response) {
  try {
    const userId = req.user.id as string;

    const { page, per_page, order } = fetchDatasetsQuerySchema.parse(req.query);

    const listDatasetsUseCase = makeFetchDatasetUseCase();

    const { datasets } = await listDatasetsUseCase.execute({
      userId,
      pagination: {
        page,
        per_page,
      },
      order,
    });

    return res.status(200).json({
      datasets
    });
  } catch (err) {
    throw err
  }
}