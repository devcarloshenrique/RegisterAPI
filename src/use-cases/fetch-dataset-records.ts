import { Dataset, Record } from "@prisma/client";
import { DatasetsRepository } from "../repositories/datasets-repository";

interface FetchDatasetRecordsUseCaseRequest {
  userId: string;
  datasetId: string;
  pagination?: { page?: number; per_page?: number; };
  order?: 'asc' | 'desc';
}

interface FetchDatasetRecordsUseCaseResponse {
  dataset: Dataset & { records: Record[] } | null;
}

export class FetchDatasetRecordsUseCase {
  constructor(private datasetsRepository: DatasetsRepository) { }

  async execute({
    userId,
    datasetId,
    pagination,
    order
  }: FetchDatasetRecordsUseCaseRequest): Promise<FetchDatasetRecordsUseCaseResponse> {
    const datasetExists = await this.datasetsRepository.findById(datasetId);

    if (!datasetExists || datasetExists.user_id !== userId) {
      return {
        dataset: null
      }
    }

    const dataset = await this.datasetsRepository.findByIdWithRecords({
      userId,
      datasetId,
      pagination,
      order
    });

    return {
      dataset
    }    
  }
}