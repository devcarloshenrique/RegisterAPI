import { Prisma, Dataset } from "@prisma/client";

export interface DatasetsRepository {
  findById(id: string): Promise<Dataset | null>;
  updateMetadata(id: string, metadata: any): Promise<Dataset>
  create(data: Prisma.DatasetCreateInput): Promise<Dataset>;
}