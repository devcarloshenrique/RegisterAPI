import { DatasetsRepository } from "../repositories/datasets-repository";
import { Dataset } from "@prisma/client";

import { JobQueue, JobNames, BullMQQueueAdapter } from "../infra/queue/bullmq/bullmq-queue-adapter";

interface UploadAndParseDatasetUseCaseRequest {
  userId: string;
  file: Express.Multer.File;
}

interface UploadAndParseDatasetUseCaseResponse {
  dataset: Dataset;
}

export class UploadAndParseDatasetUseCase {
  private queue: JobQueue;

  constructor(
    private datasetsRepository: DatasetsRepository,
  ) { 
    this.queue = new BullMQQueueAdapter('datasets'); 
  }

  async execute({
    userId,
    file
  }: UploadAndParseDatasetUseCaseRequest): Promise<UploadAndParseDatasetUseCaseResponse> {        

    const dataset = await this.datasetsRepository.create({
      name: file.originalname,
      metadata: { 
        path: file.path,
        mimetype: file.mimetype,
        status: 'PENDING',
        progress: 0
      },
      user: {
        connect: {
          id: userId
        }
      }
    })

    await this.queue.add<{
      datasetId: string;
      filePath: string;
      mimeType: string;
      uploadedByUserId: string;
    }>(JobNames.DATASET_PARSE, {
      datasetId: dataset.id,
      filePath: file.path,
      mimeType: file.mimetype,
      uploadedByUserId: userId
    }, { 
      jobId: `dataset:${dataset.id}`, 
    });

    return {
      dataset
    }
  }
}
