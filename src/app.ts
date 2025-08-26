import express from 'express'
import { swaggerSpec, swaggerUi } from './docs/swagger'
import { createMainRouter } from './http/routes'
import { errorHandler } from './http/middlewares/error-handler'

const app = express()

app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

(async () => {
  const apiRouter = await createMainRouter();
  app.use('/api', apiRouter);
  
  app.use(errorHandler)
})();

export { app }
