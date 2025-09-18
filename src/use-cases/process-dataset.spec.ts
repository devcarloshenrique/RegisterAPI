import { describe, it, vi, beforeEach, expect } from "vitest";
import { ProcessDatasetUseCase } from "./process-dataset";
import { DatasetsRepository } from "../repositories/datasets-repository";
import { RecordsRepository } from "../repositories/records-repository";
import { IDataParser, ParseResult } from "../infra/parsers/parser";
import { Dataset } from "@prisma/client";
import { DatasetNotFound } from "./erros/dataset-not-found";

async function* createAsyncIterator(items: ParseResult[]): AsyncGenerator<ParseResult> {
  for (const item of items) {
    yield item
  }
}

describe('Process Dataset Use Case', () => {
  let datasetsRepository: DatasetsRepository
  let recordsRepository: RecordsRepository
  let parser: IDataParser

  beforeEach(() => {
    datasetsRepository = {
      findById: vi.fn(),
      getProgress: vi.fn(),
      markProcessing: vi.fn(),
      setProgress: vi.fn(),
      markCompleted: vi.fn(),
      markFailed: vi.fn(),
    } as unknown as DatasetsRepository

    recordsRepository = {
      createManyChunked: vi.fn(),
      countByDataset: vi.fn(),
    } as unknown as RecordsRepository

    parser = {
      parse: vi.fn(),
      getTotalUnits: vi.fn(),
      batchSize: 2,
    }
  })

  it('should process the dataset correctly', async () => {
    let sut = new ProcessDatasetUseCase(datasetsRepository, recordsRepository, parser)
    const datasetId = 'dataset-1'
    const totalUnits = 5
    const mockDataset = {
      id: datasetId,
      metadata: { progress: 0 }
    } as unknown as Dataset

    vi.spyOn(datasetsRepository, 'findById').mockResolvedValue(mockDataset)
    vi.spyOn(datasetsRepository, 'markProcessing').mockResolvedValue(mockDataset)
    vi.spyOn(parser, 'getTotalUnits').mockResolvedValue(totalUnits)
    vi.spyOn(datasetsRepository, 'getProgress').mockResolvedValue(0)

    const parsedData: ParseResult[] = Array.from(
      { length: totalUnits }, (_, i) => ({
        unitNumber: i + 1,
        text: `Content of unit ${i + 1}`,
      })
    )
    vi.spyOn(parser, 'parse').mockReturnValue(createAsyncIterator(parsedData))
    vi.spyOn(recordsRepository, 'countByDataset').mockResolvedValue(totalUnits)

    const data = await sut.execute({
      datasetId,
      filePath: 'fake/path.pdf',
      mimeType: 'application/pdf',
    })

    expect(datasetsRepository.markProcessing).toHaveBeenCalledWith(datasetId)
    expect(parser.parse).toHaveBeenCalledWith('fake/path.pdf', { startUnit: 1 })

    // With batchSize=2 and totalUnits=5, createManyChunked must be called 3 times
    expect(recordsRepository.createManyChunked).toHaveBeenCalledTimes(3)

    // Checking the contents of each saved batch
    expect(recordsRepository.createManyChunked).toHaveBeenNthCalledWith(1, datasetId, [
      { unit: 1, content: 'Content of unit 1' },
      { unit: 2, content: 'Content of unit 2' },
    ])
    expect(recordsRepository.createManyChunked).toHaveBeenNthCalledWith(2, datasetId, [
      { unit: 3, content: 'Content of unit 3' },
      { unit: 4, content: 'Content of unit 4' },
    ])
    expect(recordsRepository.createManyChunked).toHaveBeenNthCalledWith(3, datasetId, [
      { unit: 5, content: 'Content of unit 5' },
    ])

    // Checking for progress updates
    expect(datasetsRepository.setProgress).toHaveBeenCalledTimes(3)
    expect(datasetsRepository.setProgress).toHaveBeenNthCalledWith(1, datasetId, 2, { totalUnits })
    expect(datasetsRepository.setProgress).toHaveBeenNthCalledWith(2, datasetId, 4, { totalUnits })
    expect(datasetsRepository.setProgress).toHaveBeenNthCalledWith(3, datasetId, 5, { totalUnits })

    // Checking for completion
    expect(datasetsRepository.markCompleted).toHaveBeenCalledWith(datasetId, {
      recordsCount: totalUnits,
      progressTo: totalUnits,
    })

    expect(datasetsRepository.markFailed).not.toHaveBeenCalled()

    expect(data.status).toBe('completed')
    expect(data.message).toBe('Dataset processed successfully')
  })

  it('should throw an error if the dataset is not found', async () => {
    let sut = new ProcessDatasetUseCase(datasetsRepository, recordsRepository, parser)
    const datasetId = 'non-existent-dataset'

    vi.spyOn(datasetsRepository, 'findById').mockResolvedValue(null)

    await expect(sut.execute({
      datasetId,
      filePath: 'fake/path.pdf',
      mimeType: 'application/pdf',
    })).rejects.toThrow(DatasetNotFound)

    expect(datasetsRepository.markFailed).toHaveBeenCalled()
    expect(datasetsRepository.markProcessing).not.toHaveBeenCalled()
    expect(datasetsRepository.markCompleted).not.toHaveBeenCalled()
    expect(parser.parse).not.toHaveBeenCalled()
    expect(parser.getTotalUnits).not.toHaveBeenCalled()
  })

  it('should exit early if the dataset is already fully processed', async () => {
    let sut = new ProcessDatasetUseCase(datasetsRepository, recordsRepository, parser)
    const datasetId = 'dataset-1'
    const totalUnits = 100
    const mockDataset = {
      id: datasetId,
      metadata: {
        progress: totalUnits,
        totalUnits
      }
    } as unknown as Dataset

    vi.spyOn(datasetsRepository, 'findById').mockResolvedValue(mockDataset)

    const result = await sut.execute({
      datasetId,
      filePath: 'fake/path.pdf',
      mimeType: 'application/pdf',
    })

    expect(parser.getTotalUnits).not.toHaveBeenCalled()
    expect(datasetsRepository.markProcessing).not.toHaveBeenCalled()
    expect(parser.parse).not.toHaveBeenCalled()
    expect(recordsRepository.createManyChunked).not.toHaveBeenCalled()

    expect(result.status).toBe('already_completed');
    expect(result.message).toBe('Dataset is already fully processed.');
  })

  it('should mark the dataset as failed if the parser throws an error during iteration', async () => {
    const sut = new ProcessDatasetUseCase(datasetsRepository, recordsRepository, parser);
    const datasetId = 'dataset-1';
    const totalUnits = 5;
    const mockDataset = {
      id: datasetId,
      metadata: { progress: 0 }
    } as unknown as Dataset
    const parsingError = new Error('Unexpected token in file');

    vi.spyOn(datasetsRepository, 'findById').mockResolvedValue(mockDataset);
    vi.spyOn(parser, 'getTotalUnits').mockResolvedValue(totalUnits);

    async function* failingIterator(): AsyncGenerator<ParseResult> {
      yield { unitNumber: 1, text: 'Content 1' };
      throw parsingError;
    }
    vi.spyOn(parser, 'parse').mockReturnValue(failingIterator());

    await expect(sut.execute({
      datasetId,
      filePath: 'fake/path.pdf',
      mimeType: 'application/pdf',
    })).rejects.toThrow(parsingError);

    expect(datasetsRepository.markFailed).toHaveBeenCalledWith(datasetId, parsingError);
    expect(datasetsRepository.markCompleted).not.toHaveBeenCalled();
  })

  it('should mark the dataset as failed if saving a chunk to the database fails', async () => {
    const sut = new ProcessDatasetUseCase(datasetsRepository, recordsRepository, parser);
    const datasetId = 'dataset-1';
    const totalUnits = 5;
    const mockDataset = {
      id: datasetId,
      metadata: { progress: 0 }
    } as unknown as Dataset
    const dbError = new Error('Database connection failed');

    vi.spyOn(datasetsRepository, 'findById').mockResolvedValue(mockDataset);
    vi.spyOn(datasetsRepository, 'getProgress').mockResolvedValue(0);
    vi.spyOn(parser, 'getTotalUnits').mockResolvedValue(totalUnits);
    const parsedData: ParseResult[] = Array.from(
      { length: totalUnits }, (_, i) => ({
        unitNumber: i + 1,
        text: `Content of unit ${i + 1}`,
      })
    )

    vi.spyOn(parser, 'parse').mockReturnValue(createAsyncIterator(parsedData));
    vi.spyOn(recordsRepository, 'createManyChunked').mockRejectedValue(dbError);

    await expect(sut.execute({
      datasetId,
      filePath: 'fake/path.pdf',
      mimeType: 'application/pdf',
    })).rejects.toThrow(dbError);

    expect(datasetsRepository.markFailed).toHaveBeenCalledWith(datasetId, dbError);
    expect(datasetsRepository.markCompleted).not.toHaveBeenCalled();
  });
})