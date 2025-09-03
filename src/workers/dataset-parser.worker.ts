import { createWorker } from '../infra/queue/bullmq/bullmq-worker-factory';
import { JobNames, JobName } from '../infra/queue/bullmq/bullmq-queue-adapter';
import { makeParser } from '../infra/parsers/factories/make-parser';
import { PrismaDatasetsRepository } from '../repositories/prisma/prisma-datasets-repository';
import { PrismaRecordsRepository } from '../repositories/prisma/prisma-records-repository';

const QUEUE_NAME = 'datasets';

async function processor(job: { name: JobName; data: any }) {    
  if (job.name !== JobNames.DATASET_PARSE) return;

  const prismaDatasetsRepository = new PrismaDatasetsRepository();
  const prismaRecordsRepository = new PrismaRecordsRepository();

  const { datasetId, filePath, mimeType } = job.data;

  // Marca status PROCESSING
  await prismaDatasetsRepository.updateMetadata(
    datasetId,
    { status: 'PROCESSING', startedAt: new Date() },
  );

  // Processa arquivo
  const parser = makeParser(mimeType);
  const records = await parser.parse(filePath);

  // Persiste records
  await prismaRecordsRepository.create({
    data: records,
    dataset_id: datasetId
  });

  // Marca COMPLETED
  await prismaDatasetsRepository.updateMetadata(
    datasetId,
    { status: 'COMPLETED', completedAt: new Date(), recordsCount: records.length },
  );
}

// Inicializa worker
createWorker(QUEUE_NAME, processor);
