import express from 'express'
import { swaggerSpec, swaggerUi } from './docs/swagger'
import { createMainRouter } from './http/routes'
import { errorHandler } from './http/middlewares/error-handler'

async function bootstrap() {
  const app = express()  
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use('/api', await createMainRouter());
  app.use(errorHandler)
  
  return { app }
}

export { bootstrap }