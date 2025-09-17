import { Dataset, Prisma, Record } from "@prisma/client";
import { DatasetMetadata, DatasetsRepository } from "../datasets-repository";
import { randomUUID } from "crypto";

export class InMemoryDatasetsRepository implements DatasetsRepository {
  public items: Dataset[] = [];

  findById(datasetId: string): Promise<Dataset | null> {
    throw new Error("Method not implemented.");
  }
  findByIdWithRecords(datasetId: string): Promise<(Dataset & { records: Record[]; }) | null> {
    throw new Error("Method not implemented.");
  }
  findByUserId(userId: string): Promise<Dataset[]> {
    throw new Error("Method not implemented.");
  }
  async create(data: Prisma.DatasetCreateInput): Promise<Dataset> {    

    const dataset: Dataset = {
      id: randomUUID(),
      name: data.name,
      metadata: data.metadata as Prisma.JsonObject,
      user_id: data.user.connect?.id as string,
      created_at: new Date(),
    } 

    this.items.push(dataset);
    return dataset;
  }
  getMetadata(datasetId: string): Promise<DatasetMetadata> {
    throw new Error("Method not implemented.");
  }
  setMetadata(datasetId: string, patch: Partial<DatasetMetadata>): Promise<Dataset> {
    throw new Error("Method not implemented.");
  }
  setProgress(datasetId: string, progress: number, extra?: Partial<DatasetMetadata>): Promise<void> {
    throw new Error("Method not implemented.");
  }
  markProcessing(datasetId: string): Promise<Dataset> {
    throw new Error("Method not implemented.");
  }
  markCompleted(datasetId: string, params?: { recordsCount?: number; progressTo?: number; }): Promise<Dataset> {
    throw new Error("Method not implemented.");
  }
  markFailed(datasetId: string, err: unknown): Promise<Dataset> {
    throw new Error("Method not implemented.");
  }
  getProgress(datasetId: string): Promise<number> {
    throw new Error("Method not implemented.");
  }
}