import { prisma } from '../../lib/prisma'
import { RecordsRepository } from '../records-repository';
import { Record } from '@prisma/client'

export class PrismaRecordsRepository implements RecordsRepository {
  create(params: { datasetId: string; data: { unit: number; content: string; }[]; }): Promise<{ count: number; }> {
    throw new Error('Method not implemented.');
  }

  async findById(recordId: string): Promise<Record | null> {
    return prisma.record.findUnique({
      where: { id: recordId },
    });
  }

  async createManyChunked(datasetId: string, items: { unit: number; content: string }[], chunkSize = 1000): Promise<number> {
    let total = 0;
    for (let i = 0; i < items.length; i += chunkSize) {
      const slice = items.slice(i, i + chunkSize);

      const res = await prisma.record.createMany({
        data: slice.map((data) => ({
          dataset_id: datasetId,
          unit: data.unit,
          data: data.content,
        })),
        skipDuplicates: false,
      });
      total += res.count;
    }
    return total;
  }

  async countByDataset(datasetId: string): Promise<number> {
    return prisma.record.count({
      where: { dataset_id: datasetId },
    });
  }
}