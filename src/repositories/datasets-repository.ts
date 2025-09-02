import { Prisma, Dataset, Record } from "@prisma/client";

export interface DatasetsRepository {
  findById(id: string): Promise<Dataset | null>;
  findByIdWithRecords(id: string): Promise<(Dataset & { records: Record[] }) | null>;
  listByUserId(userId: string): Promise<Dataset[]>;
  updateMetadata(id: string, metadata: any): Promise<Dataset>
  create(data: Prisma.DatasetCreateInput): Promise<Dataset>;
}