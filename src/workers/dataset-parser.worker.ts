import { JobName, JobNames } from "../infra/queue/bullmq/bullmq-queue-adapter";
import { makeProcessDatasetUseCase } from "../use-cases/factories/make-process-dataset-use-case";
import { createWorker } from "../infra/queue/bullmq/bullmq-worker-factory";

const QUEUE_NAME = "datasets";

export async function processor(job: { name: JobName; data: any }) {
  if (job.name !== JobNames.DATASET_PARSE) return;

  const { datasetId, filePath, mimeType } = job.data;
  const processDatasetUseCase = makeProcessDatasetUseCase(mimeType);

  try {
    await processDatasetUseCase.execute({
      datasetId,
      filePath,
      mimeType,
    });

  } catch (err) {
    console.error(`[Worker][${QUEUE_NAME}] Failed job:`, err);
    throw err;
  }
}

createWorker(QUEUE_NAME, processor);