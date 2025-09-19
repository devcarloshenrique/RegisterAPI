import { Request, Response } from 'express';
import { makeFetchDatasetUseCase } from '../../../use-cases/factories/make-fetch-dataset-use-case';

export async function fetchDatasets(req: Request, res: Response) {
  try {
    const listDatasetsUseCase = makeFetchDatasetUseCase();

    const { datasets } = await listDatasetsUseCase.execute({
      userId: req.user.id as string
    });

    return res.status(200).json({
      datasets
    });
  } catch (err) {
    throw err
  }
}