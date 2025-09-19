import { Dataset } from '@prisma/client';
import { DatasetsRepository } from '../repositories/datasets-repository';

interface FetchDatasetsUseCaseRequest {
  userId: string;
  pagination?: { page?: number; per_page?: number; };
  order?: 'asc' | 'desc';
}

interface FetchDatasetsUseCaseResponse {
  datasets: Dataset[];
}

export class FetchDatasetsUseCase {
  constructor(private datasetsRepository: DatasetsRepository) { }

  async execute({
    userId,
    pagination,
    order
  }: FetchDatasetsUseCaseRequest): Promise<FetchDatasetsUseCaseResponse> {
    const datasets = await this.datasetsRepository.findByUserId({
      userId,
      pagination,
      order
    });
    
    return {
      datasets,
    };
  }
}