import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullMQQueueAdapter } from '../bullmq/bullmq-queue-adapter';

export function makeBullBoardRouter(path: string, queues: BullMQQueueAdapter[]) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(path);

  createBullBoard({
    queues: queues.map(q => new BullMQAdapter(q.getQueue())),
    serverAdapter,
  });

  return serverAdapter.getRouter();
}
