import { Record } from "@prisma/client";

export interface RecordsRepository {
  create(params: { datasetId: string; data: { page: number; content: string }[] }): Promise<{ count: number }>;
  createManyChunked(datasetId: string, items: { page: number; content: string }[], chunkSize?: number): Promise<number>;
  findById(recordId: string): Promise<Record | null>;
  countByDataset(datasetId: string): Promise<number>;
}
