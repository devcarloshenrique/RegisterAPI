import { PrismaDatasetsRepository } from "../repositories/prisma/prisma-datasets-repository";
import { PrismaRecordsRepository } from "../repositories/prisma/prisma-records-repository";
import { createWorker } from "../infra/queue/bullmq/bullmq-worker-factory";
import { JobName, JobNames } from "../infra/queue/bullmq/bullmq-queue-adapter";
import { makeParser } from "../infra/parsers/factories/make-parser";

const QUEUE_NAME = "datasets";
const RECORDS_BATCH_SIZE = 50;

async function processor(job: { name: JobName; data: any }) {
  if (job.name !== JobNames.DATASET_PARSE) return;

  const { datasetId, filePath, mimeType } = job.data;
  const parser = makeParser(mimeType);

  const prismaDatasetsRepository = new PrismaDatasetsRepository();
  const prismaRecordsRepository = new PrismaRecordsRepository();

  try {
    await prismaDatasetsRepository.markProcessing(datasetId);

    const totalUnits = await parser.getTotalUnits(filePath);
    let lastProcessedUnit = await prismaDatasetsRepository.getProgress(datasetId);

    const startPage = lastProcessedUnit + 1;

    if (startPage > totalUnits) {
      console.log(`[Worker][${QUEUE_NAME}] Dataset ${datasetId} was already complete.`);
      return;
    }

    // The parser now manages the continuous reading of pages.
    const pageIterator = parser.parse(filePath, { startPage });

    let chunkBatch = [];

    // The "for await...of" loop consumes the iterator page by page
    for await (const pageData of pageIterator) {
      chunkBatch.push(pageData);

      // When the batch reaches the desired size, save it to the database
      if (chunkBatch.length >= RECORDS_BATCH_SIZE) {
        await prismaRecordsRepository.createManyChunked(
          datasetId,
          chunkBatch.map((c) => ({
            page: c.pageNumber,
            content: c.text,
          }))
        );

        // Update checkpoint and clear the batch
        lastProcessedUnit = pageData.pageNumber; // Get the number of the last page processed in the batch
        await prismaDatasetsRepository.setProgress(datasetId, lastProcessedUnit, { totalUnits });
        chunkBatch = [];
      }
    }

    // Save the final batch (if the total number of pages is not a multiple of RECORDS_BATCH_SIZE)
    if (chunkBatch.length > 0) {
      await prismaRecordsRepository.createManyChunked(
        datasetId,
        chunkBatch.map((c) => ({
          page: c.pageNumber,
          content: c.text,
        }))
      );
      // Update the final checkpoint with the last processed page
      lastProcessedUnit = chunkBatch[chunkBatch.length - 1].pageNumber;
      await prismaDatasetsRepository.setProgress(datasetId, lastProcessedUnit, { totalUnits });
    }

    // Completed
    const totalInserted = await prismaRecordsRepository.countByDataset(datasetId);
    await prismaDatasetsRepository.markCompleted(datasetId, {
      recordsCount: totalInserted,
      progressTo: totalUnits,
    });
  } catch (err) {
    console.error(`[Worker][${QUEUE_NAME}] Failed job:`, err);
    await prismaDatasetsRepository.markFailed(datasetId, err);
    throw err;
  }
}

createWorker(QUEUE_NAME, processor);