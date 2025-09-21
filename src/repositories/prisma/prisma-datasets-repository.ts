import { prisma } from "../../lib/prisma";
import { Prisma, Dataset, Record } from "@prisma/client";
import { deepMerge } from "../../utils/deep-merge";
import { DatasetsRepository, DatasetMetadata, FindUserDatasetsParams, FindDatasetWithRecordsParams } from "../datasets-repository";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { InvalidParameterError } from "../../use-cases/erros/invalid-parameter-error";

export class PrismaDatasetsRepository implements DatasetsRepository {
  async findById(datasetId: string): Promise<Dataset | null> {
    return prisma.dataset.findUnique({
      where: { id: datasetId },
    });
  }

  async findByIdWithRecords(data: FindDatasetWithRecordsParams): Promise<(Dataset & { records: Record[] }) | null> {
    const pagination = () => {
      const page = data.pagination?.page || 1;
      const per_page = data.pagination?.per_page || 20;
      if (data.pagination?.page || data.pagination?.per_page) {
        return {
          take: per_page,
          skip: (page - 1) * per_page,
        }
      }
      return undefined;
    }

    try {
      const dataset = await prisma.dataset.findUnique({
        where: { id: data.datasetId },
        include: {
          records: {
            orderBy: {
              unit: data.order == 'desc' ? 'desc' : 'asc',
            },
            ...pagination()
          }
        },
      });

      return dataset

    } catch (err) {
      if (err instanceof PrismaClientValidationError) {
        throw new InvalidParameterError();
      }
      throw err
    }
  }

  async findByUserId(data: FindUserDatasetsParams): Promise<Dataset[]> {
    const pagination = () => {
      const page = data.pagination?.page || 1;
      const per_page = data.pagination?.per_page || 20;
      if (data.pagination?.page || data.pagination?.per_page) {
        return {
          take: per_page,
          skip: (page - 1) * per_page,
        }
      }
      return undefined;
    }

    try {
      const datasets = await prisma.dataset.findMany({
        where: {
          user_id: data.userId,
        },
        orderBy: {
          ['created_at']: data.order || 'desc',
        },
        ...pagination(),
      });

      return datasets;
    } catch (err) {
      if (err instanceof PrismaClientValidationError) {
        throw new InvalidParameterError();
      }
      throw err
    }
  }

  async create(data: Prisma.DatasetCreateInput): Promise<Dataset> {
    let defaultMetadata: DatasetMetadata = { status: 'PENDING', progress: 0 };

    const mergedMetadata = deepMerge(
      defaultMetadata,
      data.metadata as DatasetMetadata
    )

    return prisma.dataset.create({
      data: {
        ...data,
        metadata: mergedMetadata as Prisma.InputJsonValue
      }
    })
  }

  async getMetadata(datasetId: string): Promise<DatasetMetadata> {
    const row = await prisma.dataset.findUnique({
      where: { id: datasetId },
      select: { metadata: true },
    });
    return (row?.metadata as DatasetMetadata) ?? {};
  }

  async setMetadata(datasetId: string, patch: Partial<DatasetMetadata>): Promise<Dataset> {
    return prisma.$transaction(async (tx) => {
      const current = await tx.dataset.findUnique({
        where: { id: datasetId },
        select: { metadata: true },
      });
      const currentMeta = (current?.metadata as DatasetMetadata) ?? {};
      const merged = deepMerge(currentMeta, patch);

      return tx.dataset.update({
        where: { id: datasetId },
        data: { metadata: merged as Prisma.InputJsonValue },
      });
    });
  }

  async setProgress(datasetId: string, progress: number, extra?: Partial<DatasetMetadata>) {
    await this.setMetadata(datasetId, { progress, ...(extra ?? {}) });
  }

  async markProcessing(datasetId: string): Promise<Dataset> {
    return await this.setMetadata(datasetId, {
      status: 'PROCESSING',
      startedAt: new Date().toISOString(),
    });
  }

  async markCompleted(datasetId: string, params?: { recordsCount?: number; progressTo?: number }): Promise<Dataset> {
    return await this.setMetadata(datasetId, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      ...(typeof params?.recordsCount === 'number' ? { recordsCount: params.recordsCount } : {}),
      ...(typeof params?.progressTo === 'number' ? { progress: params.progressTo } : {}),
    });
  }

  async markFailed(datasetId: string, err: unknown): Promise<Dataset> {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error';
    return await this.setMetadata(datasetId, {
      status: 'FAILED',
      lastError: { message, at: new Date().toISOString() },
    });
  }

  async getProgress(datasetId: string): Promise<number> {
    const meta = await this.getMetadata(datasetId);
    return typeof meta.progress === 'number' ? meta.progress : 0;
  }
}
