import { Dataset } from '@prisma/client';
import { PrismaDatasetsRepository } from "../repositories/prisma/prisma-datasets-repository";

interface ListDatasetsUseCaseRequest {
  userId: string;
}

interface ListDatasetsUseCaseResponse {
  datasets: Dataset[];
}

export class ListDatasetsUseCase {
  constructor(private datasetsRepository: PrismaDatasetsRepository) {}

  async execute({
    userId
  }: ListDatasetsUseCaseRequest): Promise<ListDatasetsUseCaseResponse> {
    const datasets = await this.datasetsRepository.findByUserId(userId);

    if (datasets.length === 0) {
      throw new Error('Datasets not found for this user')
    }

    return {
      datasets,
    };
  }
}