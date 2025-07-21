import express, { NextFunction, Request, Response } from 'express'
import { usersRoutes } from './http/controllers/users/routes'
import { datasetsRoutes } from './http/controllers/datasets/routes'
import { env } from './env'

const app = express()

app.use(express.json());

(async () => {
  const userRoutes = await usersRoutes()
  app.use(userRoutes);

  const datasetRoutes = await datasetsRoutes()
  app.use(datasetRoutes);

})()

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
   if (err instanceof Error) {
    return res.status(409).json({ error: err.message });
  }

  if (env.NODE_ENV !== 'production') {
    console.error(err)
  }

  return res.status(500).json({
    message: 'Internal server error',
    status: 500
  })
})

export { app }