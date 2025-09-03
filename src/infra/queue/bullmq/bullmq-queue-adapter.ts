import { env } from '../../../env'; 
import { Queue } from 'bullmq';
import { getRedis } from '../../redis/redis-connection';

export const JobNames = {
  DATASET_PARSE: 'dataset.parse',
} as const;

export type JobName = (typeof JobNames)[keyof typeof JobNames];

export interface JobQueue {
  add<T>(name: JobName, payload: T, opts?: { delayMs?: number; jobId?: string }): Promise<void>;
}

export class BullMQQueueAdapter implements JobQueue {
  private queue: Queue;

  constructor(queueName: string) {
    this.queue = new Queue(queueName, {
      connection: getRedis(),
      prefix: env.QUEUE_PREFIX,
    });
  }

  async add<T>(name: JobName, payload: T, opts?: { delayMs?: number; jobId?: string }) {
    await this.queue.add(name, payload as any, {
      jobId: opts?.jobId,
      removeOnComplete: 1000,
      removeOnFail: 5000,
      delay: opts?.delayMs,
      attempts: env.BULLMQ_ATTEMPTS,
      backoff: { type: 'fixed', delay: env.BULLMQ_BACKOFF_MS },
    });
  }
}
