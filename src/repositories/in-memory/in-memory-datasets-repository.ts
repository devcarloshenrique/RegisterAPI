import { Dataset, Prisma, Record } from "@prisma/client";
import { DatasetMetadata, DatasetsRepository, FindDatasetWithRecordsParams, FindUserDatasetsParams } from "../datasets-repository";
import { randomUUID } from "crypto";
import { InMemoryRecordsRepository } from "./in-memory-records-repository";

export class InMemoryDatasetsRepository implements DatasetsRepository {
  public items: Dataset[] = [];
  public recordsRepository: InMemoryRecordsRepository

  constructor(recordsRepository: InMemoryRecordsRepository) {
    this.recordsRepository = recordsRepository;
  }
    
  async findById(datasetId: string): Promise<Dataset | null> {
    return this.items.find(item => item.id === datasetId) || null;
  }
  
  async findByIdWithRecords(data: FindDatasetWithRecordsParams): Promise<(Dataset & { records: Record[]; }) | null> {
    let records = this.recordsRepository.items.filter(item => item.dataset_id === data.datasetId);
    
    if(data.pagination?.page || data.pagination?.per_page){      
      let page = data.pagination?.page || 1
      let per_page = data.pagination?.per_page || 20

      records = records.slice(
        (page - 1) * per_page,
        (page - 1) * per_page + per_page
      )
    }

    if(data.order == 'asc')
      records = records.sort((a, b) => a.unit - b.unit)

    if(data.order == 'desc')
      records = records.sort((a, b) => b.unit - a.unit)

    const dataset = this.items.find(item => item.id === data.datasetId && item.user_id === data.userId);
    if (dataset)
      return { ...dataset, records };
    
    return null    
  }
  
  async findByUserId(data: FindUserDatasetsParams): Promise<Dataset[]> {
    return await this.items.filter(item => item.user_id === data.userId);
  }

  async create(data: Prisma.DatasetCreateInput): Promise<Dataset> {    
    const datasets: Dataset = {
      id: randomUUID(),
      name: data.name,
      metadata: data.metadata as Prisma.JsonObject,
      user_id: data.user.connect?.id as string,
      created_at: new Date(),
    } 

    this.items.push(datasets);
    return datasets;
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