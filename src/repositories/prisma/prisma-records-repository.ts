import { prisma } from '../../lib/prisma'
import { RecordsRepository } from '../records-repository';
import { Record } from '@prisma/client'

export class PrismaRecordsRepository implements RecordsRepository {
  async create(params: { datasetId: string; data: { page: number; content: string }[] }): Promise<{ count: number }> {
    const records = params.data.map(item => ({
      ...item,
      dataset_id: params.datasetId,
    }));

    const res = await prisma.record.createMany({
      data: records,
      skipDuplicates: true,
    });

    return { count: res.count };
  }

  async findById(recordId: string): Promise<Record | null> {
    return prisma.record.findUnique({
      where: { id: recordId },
    });
  }

  async createManyChunked(datasetId: string, items: { page: number; content: string }[], chunkSize = 1000): Promise<number> {
    let total = 0;
    for (let i = 0; i < items.length; i += chunkSize) {
      const slice = items.slice(i, i + chunkSize);

      const res = await prisma.record.createMany({
        data: slice.map((data) => ({
          dataset_id: datasetId,
          data,
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