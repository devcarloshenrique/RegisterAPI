import { Request, Response } from 'express';
import { ListDatasetsUseCase } from '../../../services/list-datasets';
import { PrismaDatasetsRepository } from '../../../repositories/prisma/prisma-datasets-repository';

export async function listDatasets(req: Request, res: Response) {
  try {
    const datasetsRepository = new PrismaDatasetsRepository();
    const listDatasetsUseCase = new ListDatasetsUseCase(datasetsRepository);

    const { datasets } = await listDatasetsUseCase.execute({
      userId: req.user.id
    });

    return res.status(200).json({ datasets });
  } catch (err) {    
    if (err instanceof Error) {
      return res.status(404).json({ error: err.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}