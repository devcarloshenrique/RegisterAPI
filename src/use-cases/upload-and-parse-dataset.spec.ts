import { describe, it, vi, beforeEach, expect} from "vitest";
import { UploadAndParseDatasetUseCase } from "./upload-and-parse-dataset";
import { InMemoryDatasetsRepository } from "../repositories/in-memory/in-memory-datasets-repository";
import { JobQueue } from "../infra/queue/bullmq/bullmq-queue-adapter";

const jobQueueMock: JobQueue = {
  add: vi.fn(),
};

vi.mock('../infra/queue/bullmq/bullmq-queue-adapter', () => {
  return {
    BullMQQueueAdapter: vi.fn(() => jobQueueMock),
    JobNames: { DATASET_PARSE: 'dataset:parse' }
  }
});

describe('Upload and Parse Dataset Use Case', () => {
  let datasetsRepository: InMemoryDatasetsRepository
  let sut: UploadAndParseDatasetUseCase

  beforeEach(() => {
    datasetsRepository = new InMemoryDatasetsRepository()
    sut = new UploadAndParseDatasetUseCase(datasetsRepository)
  })

  it('should create a dataset and add a parsing job to the queue', async () => {         
    const userId = 'user-1';
    const file = {
      fieldname: 'file',
      originalname: 'file.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      destination: 'C:\\Users\\RegisterAPI\\uploads',
      filename: '286df7b96eb9d729c3a3-file.pdf',
      path: 'C:\\Users\\RegisterAPI\\uploads\\286df7b96eb9d729c3a3-file.pdf',
      size: 33311066
    } as Express.Multer.File;
    
    const { dataset } = await sut.execute({
      userId,
      file
    })

    // 1. Check the return and whether the ID was created
    expect(dataset.id).toEqual(expect.any(String));
    expect(dataset.name).toBe('file.pdf');
        
    // 2. Check dataset saved to the in-memory repository
    expect(datasetsRepository.items).toHaveLength(1);
    expect(datasetsRepository.items[0].name).toBe('file.pdf');
    expect(datasetsRepository.items[0].user_id).toBe('user-1');

    // 3. Check whether the queue was called correctly
    expect(jobQueueMock.add).toHaveBeenCalledOnce();
    expect(jobQueueMock.add).toHaveBeenCalledWith(
      'dataset:parse',
      {
        datasetId: dataset.id,
        filePath: file.path,
        mimeType: file.mimetype,
        uploadedByUserId: userId,
      },
      { jobId: `dataset:${dataset.id}` }
    );
  })
})