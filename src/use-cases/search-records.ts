import { Record } from "@prisma/client";
import { RecordsRepository } from "../repositories/records-repository";

interface SearchRecordsUseCaseRequest {
  datasetId: string;
  query: string;
}

interface SearchRecordsUseCaseResponse {
  records: Record[];
}

export class SearchRecordsUseCase {
  constructor(private recordsRepository: RecordsRepository) { }
  
  async execute({
    datasetId,
    query,
  }: SearchRecordsUseCaseRequest): Promise<SearchRecordsUseCaseResponse> {
    
    const records = await this.recordsRepository.searchMany({datasetId, query})

    return {
      records,
    }
  }
}