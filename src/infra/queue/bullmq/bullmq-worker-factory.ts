import { env } from '../../../env'; 
import { Worker, QueueEvents } from 'bullmq';
import { getRedis } from '../../redis/redis-connection';

const prefix = env.QUEUE_PREFIX;

export type ProcessorFn = (job: any) => Promise<void>;

setInterval(() => {
  const used = process.memoryUsage();
  console.log(`[Memory Usage - ${new Date().toISOString()}]`, {
    rss: Math.round(used.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(used.external / 1024 / 1024) + 'MB',
    arrayBuffers: Math.round(used.arrayBuffers / 1024 / 1024) + 'MB',
  });
}, 30000);

export function createWorker(queueName: string, processor: ProcessorFn) {
  const worker = new Worker(queueName, async (job) => {
    await processor(job);
  }, {
    connection: getRedis(),
    prefix,
    concurrency: env.BULLMQ_CONCURRENCY,
    lockDuration: 30000,
    lockRenewTime: 15000,
  });

  const events = new QueueEvents(queueName, { connection: getRedis(), prefix });

  worker.on('failed', (job, err) => {
    console.error(`\n\n [Worker][${queueName}] Job ${job?.id} failed:`, err, '\n\n');
  });

  worker.on("completed", (job) => {
  const started = job.timestamp;       
  const finished = job.finishedOn;     
  const duration = (finished! - started) / 1000 ; // duration in seconds
  
  console.log(`\n\n [Worker] Job ${job.id} levou ${duration}ms \n\n`);
});

  process.on('SIGINT', async () => { await worker.close(); await events.close(); process.exit(0); });
  process.on('SIGTERM', async () => { await worker.close(); await events.close(); process.exit(0); });

  return { worker, events };
}
