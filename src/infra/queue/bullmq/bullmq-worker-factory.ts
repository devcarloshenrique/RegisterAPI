import { env } from '../../../env'; 
import { Worker, QueueEvents } from 'bullmq';
import { getRedis } from '../../redis/redis-connection';

const prefix = env.QUEUE_PREFIX;

export type ProcessorFn = (job: any) => Promise<void>;

export function createWorker(queueName: string, processor: ProcessorFn) {
  const worker = new Worker(queueName, async (job) => {
    await processor(job);
  }, {
    connection: getRedis(),
    prefix,
    concurrency: env.BULLMQ_CONCURRENCY,
    lockDuration: 120000,  // cada job tem até 2min antes de expirar
    lockRenewTime: 15000,  // renova a cada 15s
  });

  const events = new QueueEvents(queueName, { connection: getRedis(), prefix });

  worker.on('failed', (job, err) => {
    console.error(`\n\n [Worker][${queueName}] Job ${job?.id} failed:`, err, '\n\n');
  });

  worker.on("completed", (job) => {
  const started = job.timestamp;       // ms desde epoch quando o job foi criado
  const finished = job.finishedOn;     // ms desde epoch quando finalizou
  const duration = (finished! - started) / 1000 ; // duração em segundos
  
  console.log(`\n\n [Worker] Job ${job.id} levou ${duration}ms \n\n`);
});

  process.on('SIGINT', async () => { await worker.close(); await events.close(); process.exit(0); });
  process.on('SIGTERM', async () => { await worker.close(); await events.close(); process.exit(0); });

  return { worker, events };
}
