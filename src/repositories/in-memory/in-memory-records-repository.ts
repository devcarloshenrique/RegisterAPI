import { Record } from "@prisma/client";
import { RecordsRepository } from "../records-repository";

export class InMemoryRecordsRepository implements RecordsRepository {
  create(params: { datasetId: string; data: { unit: number; content: string; }[]; }): Promise<{ count: number; }> {
    throw new Error("Method not implemented.");
  }
  createManyChunked(datasetId: string, items: { unit: number; content: string; }[], chunkSize?: number): Promise<number> {
    throw new Error("Method not implemented.");
  }
  findById(recordId: string): Promise<Record | null> {
    throw new Error("Method not implemented.");
  }
  countByDataset(datasetId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
}