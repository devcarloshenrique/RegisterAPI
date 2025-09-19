import { Dataset } from '@prisma/client';
import { DatasetsRepository } from '../repositories/datasets-repository';
import { DatasetNotFound } from './erros/dataset-not-found';

interface FetchDatasetsUseCaseRequest {
  userId: string;
}

interface FetchDatasetsUseCaseResponse {
  datasets: Dataset[];
}

export class FetchDatasetsUseCase {
  constructor(private datasetsRepository: DatasetsRepository) { }

  async execute({
    userId
  }: FetchDatasetsUseCaseRequest): Promise<FetchDatasetsUseCaseResponse> {
    const datasets = await this.datasetsRepository.findByUserId(userId);
    
    return {
      datasets,
    };
  }
}