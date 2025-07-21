import { Prisma, Dataset } from "@prisma/client";

export interface DatasetsRepository {
  findById(id: string): Promise<Dataset | null>;
  create(data: Prisma.DatasetCreateInput): Promise<Dataset>;
}