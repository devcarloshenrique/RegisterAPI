import { Prisma, Dataset, Record } from "@prisma/client";

export type DatasetStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface DatasetMetadata {
  path?: string;
  mimetype?: string;
  status?: DatasetStatus;
  progress?: number;
  totalUnits?: number;
  recordsCount?: number;
  startedAt?: string;
  completedAt?: string;
  lastError?: { message: string; at: string };
}

export interface FindUserDatasetsParams {
  userId: string;
  pagination?: {
    page?: number;
    per_page?: number;
  };
  order?: 'asc' | 'desc';
}

export interface FindDatasetWithRecordsParams extends FindUserDatasetsParams {
  datasetId: string;
}

export interface DatasetsRepository {
  findById(datasetId: string): Promise<Dataset | null>;
  findByIdWithRecords(data: FindDatasetWithRecordsParams): Promise<(Dataset & { records: Record[] }) | null>;
  findByUserId(data: FindUserDatasetsParams): Promise<Dataset[]>
  create(data: Prisma.DatasetCreateInput): Promise<Dataset>;

  getMetadata(datasetId: string): Promise<DatasetMetadata>;
  setMetadata(datasetId: string, patch: Partial<DatasetMetadata>): Promise<Dataset>;
  setProgress(datasetId: string, progress: number, extra?: Partial<DatasetMetadata>): Promise<void>;
  markProcessing(datasetId: string): Promise<Dataset>;
  markCompleted(datasetId: string, params?: { recordsCount?: number; progressTo?: number }): Promise<Dataset>;
  markFailed(datasetId: string, err: unknown): Promise<Dataset>;
  getProgress(datasetId: string): Promise<number>;
}
