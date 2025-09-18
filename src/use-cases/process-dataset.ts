import { IDataParser, ParseResult } from "../infra/parsers/parser";
import { DatasetMetadata, DatasetsRepository } from "../repositories/datasets-repository";
import { RecordsRepository } from "../repositories/records-repository";
import { DatasetNotFound } from "./erros/dataset-not-found";

interface ProcessDatasetUseCaseRequest {
  datasetId: string;
  filePath: string;
  mimeType: string;
}

interface ProcessDatasetUseCaseResponse {
  status: 'completed' | 'failed' | 'already_completed';
  message: string;
  datasetId: string;
}

export class ProcessDatasetUseCase {
  constructor(
    private datasetsRepository: DatasetsRepository,
    private recordsRepository: RecordsRepository,
    private parser: IDataParser,
  ) { }

  async execute({
    datasetId,
    filePath,
  }: ProcessDatasetUseCaseRequest): Promise<ProcessDatasetUseCaseResponse> {
    try {
      const { totalUnits, lastProcessedUnit } = await this.initializeProcessing(datasetId, filePath);

      if (lastProcessedUnit >= totalUnits) {
        return {
          status: 'already_completed',
          message: 'Dataset is already fully processed.',
          datasetId,
        };
      }
      
      // The parser now manages the continuous reading of pages.
      const unitIterator = this.parser.parse(filePath, { startUnit: lastProcessedUnit + 1 });
      let chunkBatch: ParseResult[] = [];

      // The "for await...of" loop consumes the iterator page by page
      for await (const unitData of unitIterator) {
        chunkBatch.push(unitData);

      // When the batch reaches the desired size, save it to the database
        if (chunkBatch.length >= this.parser.batchSize) {
          await this.processChunkBatch(datasetId, chunkBatch, totalUnits);
          chunkBatch = [];
        }
      }

      await this.finalizeProcessing(datasetId, chunkBatch, totalUnits);

      return {
        status: 'completed',
        message: 'Dataset processed successfully',
        datasetId,
      }

    } catch (err) {
      await this.datasetsRepository.markFailed(datasetId, err);
      throw err;
    }
  }

  private async initializeProcessing(datasetId: string, filePath: string): Promise<{ totalUnits: number , lastProcessedUnit: number}> {
    const dataset = await this.datasetsRepository.findById(datasetId);

    if (!dataset) {
      throw new DatasetNotFound()
    }

    const processedUnits = (dataset.metadata as DatasetMetadata).progress || 0;    
    const totalUnits = (dataset.metadata as DatasetMetadata).totalUnits || await this.parser.getTotalUnits(filePath);

    if(processedUnits < totalUnits) {
      await this.datasetsRepository.markProcessing(datasetId);
    }

    return { totalUnits, lastProcessedUnit: processedUnits };
  }

  private async processChunkBatch(datasetId: string, chunk: ParseResult[], totalUnits: number) {
    await this.recordsRepository.createManyChunked(
      datasetId,
      chunk.map((c) => ({
        unit: c.unitNumber,
        content: c.text,
      }))
    )

    const lastProcessedUnit = chunk[chunk.length - 1].unitNumber;
    await this.datasetsRepository.setProgress(datasetId, lastProcessedUnit, { totalUnits });
  }

  private async finalizeProcessing(datasetId: string, chunkBatch: ParseResult[], totalUnits: number) {
    if (chunkBatch.length > 0) {
      await this.processChunkBatch(datasetId, chunkBatch, totalUnits)
    }

    const totalInsertedRecords = await this.recordsRepository.countByDataset(datasetId);
    await this.datasetsRepository.markCompleted(datasetId, {
      recordsCount: totalInsertedRecords,
      progressTo: totalUnits,
    });
  }
}