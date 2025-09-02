import { makeParser } from "../infra/parsers/factories/make-parser";
import { DatasetsRepository } from "../repositories/datasets-repository";
import { Dataset, Record } from "@prisma/client";
import { RecordsRepository } from "../repositories/records-repository";

interface UploadAndParseDatasetUseCaseRequest {
  userId: string;
  file: Express.Multer.File;
}

interface UploadAndParseDatasetUseCaseResponse {
  dataset: Dataset & { records: Record[] } | null;
}

interface UploadAndParseDatasetUseCaseResponse {
  dataset: Dataset & { records: Record[] } | null;
}

export class UploadAndParseDatasetUseCase {
  constructor(
    private datasetsRepository: DatasetsRepository,
    private recordsRepository: RecordsRepository
  ) { }

  async execute({
    userId,
    file
  }: UploadAndParseDatasetUseCaseRequest): Promise<UploadAndParseDatasetUseCaseResponse> {  
    const dataset = await this.datasetsRepository.create({
      name: file.originalname,
      metadata: { 
        path: file.path,
        mimetype: file.mimetype,
        status: 'peding',
        progress: 0
      },
      user: {
        connect: {
          id: userId
        }
      }
    })

    const parser = makeParser(file.mimetype);
    const parsedData = await parser.parse(file.path);

    const records = await this.recordsRepository.create({
      data: parsedData,
      dataset_id: dataset.id
    })
    
    const datasetWithRecords = await this.datasetsRepository.findByIdWithRecords(dataset.id);

    return {
      dataset: datasetWithRecords
    }
  }
}

