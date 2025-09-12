import express from 'express'
import { swaggerSpec, swaggerUi } from './docs/swagger'
import { createMainRouter } from './http/routes'
import { errorHandler } from './http/middlewares/error-handler'
import { allQueues } from './infra/queue/queues'
import { makeBullBoardRouter } from './infra/queue/monitor/make-bull-board-router'

async function bootstrap() {
  const app = express()  
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const bullBoardRouter = makeBullBoardRouter('/admin/queues', allQueues);
  app.use('/admin/queues', bullBoardRouter);

  app.use('/api', await createMainRouter());
  app.use(errorHandler)
  
  return { app }
}

export { bootstrap }