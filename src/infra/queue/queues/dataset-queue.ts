import { BullMQQueueAdapter } from '../bullmq/bullmq-queue-adapter';

export const datasetQueue = new BullMQQueueAdapter('datasets');
