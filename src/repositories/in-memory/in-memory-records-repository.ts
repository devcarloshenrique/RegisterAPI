import { Record } from "@prisma/client";
import { RecordsRepository } from "../records-repository";

export class InMemoryRecordsRepository implements RecordsRepository {
  public items: Record[] = [];  
  
  async create(params: { datasetId: string; data: { unit: number; content: string; } }): Promise<Record> {
    const records: Record = {
      id: crypto.randomUUID(),
      unit: params.data.unit,
      data: { content: params.data.content },
      created_at: new Date(),
      dataset_id: params.datasetId,
    }
    this.items.push(records)
    return records;
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