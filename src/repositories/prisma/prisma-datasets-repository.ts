import { prisma } from "../../lib/prisma";
import { Prisma, Dataset } from "@prisma/client";
import { DatasetsRepository } from "../datasets-repository";

export class PrismaDatasetsRepository implements DatasetsRepository {
  async findById(id: string) {
    return prisma.dataset.findUnique({
      where: { id },
    });
  }

  async findByIdWithRecords(id: string) {
    return prisma.dataset.findUnique({
      where: { id },
      include: { records: true }
    });
  }

  async listByUserId(userId: string) {
    return prisma.dataset.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  async updateMetadata(id: string, metadata: any) {
    const dataset = await prisma.dataset.update({
      where: { id },
      data: {
        metadata: {
          ...metadata
        }
      }
    })
    return dataset
  }

  async create(data: Prisma.DatasetCreateInput): Promise<Dataset> {
    const dataset = await prisma.dataset.create({
      data,
    });

    return dataset
  }
}
