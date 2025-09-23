import { Record } from "@prisma/client";

export interface RecordData {
  unit?: number;
  content?: string;
}

export interface RecordsRepository {
  create(params: { datasetId: string; data: { unit: number; content: string }}): Promise<Record>;
  createManyChunked(datasetId: string, items: RecordData[], chunkSize?: number): Promise<number>;  
  findById(recordId: string): Promise<Record | null>;
  searchMany(data: {datasetId: string, query: string}): Promise<Record[]>;
  countByDataset(datasetId: string): Promise<number>;
}
